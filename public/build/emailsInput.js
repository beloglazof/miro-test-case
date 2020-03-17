
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var EmailsInput = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function self(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src/EmailsInput.svelte generated by Svelte v3.19.2 */
    const file = "src/EmailsInput.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[20] = i;
    	return child_ctx;
    }

    // (156:2) {#if $emailsStore.length > 0}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*$emailsStore*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$emailsStore, removeEmail*/ 36) {
    				each_value = /*$emailsStore*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(156:2) {#if $emailsStore.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (157:4) {#each $emailsStore as email, i}
    function create_each_block(ctx) {
    	let span1;
    	let t0_value = /*email*/ ctx[18].value + "";
    	let t0;
    	let t1;
    	let span0;
    	let t3;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[15](/*email*/ ctx[18], ...args);
    	}

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span0 = element("span");
    			span0.textContent = "✕";
    			t3 = space();
    			attr_dev(span0, "class", "delete-email-button svelte-gqanwv");
    			attr_dev(span0, "role", "button");
    			add_location(span0, file, 162, 8, 3626);
    			attr_dev(span1, "class", "email-chip svelte-gqanwv");
    			toggle_class(span1, "email-valid", /*email*/ ctx[18].valid);
    			toggle_class(span1, "email-invalid", !/*email*/ ctx[18].valid);
    			add_location(span1, file, 157, 6, 3479);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			append_dev(span1, t0);
    			append_dev(span1, t1);
    			append_dev(span1, span0);
    			append_dev(span1, t3);
    			dispose = listen_dev(span0, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$emailsStore*/ 4 && t0_value !== (t0_value = /*email*/ ctx[18].value + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$emailsStore*/ 4) {
    				toggle_class(span1, "email-valid", /*email*/ ctx[18].valid);
    			}

    			if (dirty & /*$emailsStore*/ 4) {
    				toggle_class(span1, "email-invalid", !/*email*/ ctx[18].valid);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(157:4) {#each $emailsStore as email, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let t;
    	let input;
    	let dispose;
    	let if_block = /*$emailsStore*/ ctx[2].length > 0 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			input = element("input");
    			attr_dev(input, "class", "emails-input svelte-gqanwv");
    			attr_dev(input, "type", "email");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			add_location(input, file, 171, 2, 3811);
    			attr_dev(div, "class", "input-wrapper svelte-gqanwv");
    			add_location(div, file, 154, 0, 3344);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);
    			append_dev(div, input);
    			set_input_value(input, /*inputValue*/ ctx[0]);

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[16]),
    				listen_dev(input, "keydown", /*handleKeyDown*/ ctx[6], false, false, false),
    				listen_dev(input, "blur", /*blur_handler*/ ctx[17], false, false, false),
    				listen_dev(input, "paste", prevent_default(/*handlePaste*/ ctx[7]), false, true, false),
    				listen_dev(div, "click", self(setFocusOnInput), false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$emailsStore*/ ctx[2].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*placeholder*/ 2) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			}

    			if (dirty & /*inputValue*/ 1 && input.value !== /*inputValue*/ ctx[0]) {
    				set_input_value(input, /*inputValue*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function validateEmail(value) {
    	// general email regex from RFC 5322
    	const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    	const valid = emailRegEx.test(value);
    	const email = { value, valid };
    	return email;
    }

    function getClipboardData(event) {
    	if (event.clipboardData) {
    		return event.clipboardData.getData("text/plain");
    	}

    	return "";
    }

    function setFocusOnInput(event) {
    	event.target.lastElementChild.focus();
    }

    function instance($$self, $$props, $$invalidate) {
    	let $emailsStore;
    	const emailsStore = writable([]);
    	validate_store(emailsStore, "emailsStore");
    	component_subscribe($$self, emailsStore, value => $$invalidate(2, $emailsStore = value));

    	function getEmails() {
    		return get_store_value(emailsStore);
    	}

    	function replaceEmails(newEmails = []) {
    		const validatedEmails = newEmails.map(validateEmail);
    		emailsStore.set(validatedEmails);
    	}

    	function onEmailsChange(cb) {
    		emailsStore.subscribe(cb);
    	}

    	let inputValue;

    	function handleInput(value) {
    		let trimmedValue;

    		if (value) {
    			trimmedValue = value.trim();
    		} else if (inputValue) {
    			trimmedValue = inputValue.trim();
    			$$invalidate(0, inputValue = "");
    		} else {
    			return;
    		}

    		addEmail(trimmedValue);
    	}

    	function addEmail(email) {
    		if (!email) {
    			return;
    		}

    		const validatedEmail = validateEmail(email);
    		emailsStore.update(emails => [...emails, validatedEmail]);
    	}

    	function removeEmail(email) {
    		emailsStore.update(emails => emails.filter(e => e.value !== email));
    	}

    	function removeLastEmail() {
    		emailsStore.update(emails => {
    			const emailsCopy = [...emails];
    			emailsCopy.pop();
    			return emailsCopy;
    		});
    	}

    	function handleKeyDown(event) {
    		switch (event.key) {
    			case "Tab":
    			case ",":
    				handleInput();
    				break;
    			case "Enter":
    				event.preventDefault();
    				handleInput();
    				break;
    			case "Backspace":
    				if (!inputValue || inputValue.length === 0) {
    					removeLastEmail();
    				}
    				break;
    		}
    	}

    	function handlePaste(event) {
    		const data = getClipboardData(event);
    		data.split(",").map(handleInput);
    	}

    	let initialPlaceholder = "Enter email adresses...";
    	let processPlaceholder = "add more people...";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EmailsInput> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EmailsInput", $$slots, []);
    	const click_handler = email => removeEmail(email.value);

    	function input_input_handler() {
    		inputValue = this.value;
    		$$invalidate(0, inputValue);
    	}

    	const blur_handler = () => handleInput();

    	$$self.$capture_state = () => ({
    		writable,
    		get: get_store_value,
    		emailsStore,
    		getEmails,
    		replaceEmails,
    		onEmailsChange,
    		inputValue,
    		handleInput,
    		validateEmail,
    		addEmail,
    		removeEmail,
    		removeLastEmail,
    		handleKeyDown,
    		getClipboardData,
    		handlePaste,
    		setFocusOnInput,
    		initialPlaceholder,
    		processPlaceholder,
    		placeholder,
    		$emailsStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("inputValue" in $$props) $$invalidate(0, inputValue = $$props.inputValue);
    		if ("initialPlaceholder" in $$props) $$invalidate(13, initialPlaceholder = $$props.initialPlaceholder);
    		if ("processPlaceholder" in $$props) $$invalidate(14, processPlaceholder = $$props.processPlaceholder);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    	};

    	let placeholder;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$emailsStore*/ 4) {
    			 $$invalidate(1, placeholder = $emailsStore.length > 0
    			? processPlaceholder
    			: initialPlaceholder);
    		}
    	};

    	return [
    		inputValue,
    		placeholder,
    		$emailsStore,
    		emailsStore,
    		handleInput,
    		removeEmail,
    		handleKeyDown,
    		handlePaste,
    		getEmails,
    		replaceEmails,
    		onEmailsChange,
    		addEmail,
    		removeLastEmail,
    		initialPlaceholder,
    		processPlaceholder,
    		click_handler,
    		input_input_handler,
    		blur_handler
    	];
    }

    class EmailsInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			getEmails: 8,
    			replaceEmails: 9,
    			onEmailsChange: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EmailsInput",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get getEmails() {
    		return this.$$.ctx[8];
    	}

    	set getEmails(value) {
    		throw new Error("<EmailsInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replaceEmails() {
    		return this.$$.ctx[9];
    	}

    	set replaceEmails(value) {
    		throw new Error("<EmailsInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onEmailsChange() {
    		return this.$$.ctx[10];
    	}

    	set onEmailsChange(value) {
    		throw new Error("<EmailsInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    return EmailsInput;

}());
//# sourceMappingURL=emailsInput.js.map
