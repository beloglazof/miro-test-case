<script>
  import { createEventDispatcher } from "svelte";
  import { writable, get } from "svelte/store";

  const emailsStore = writable([]);

  export function getEmails() {
    return get(emailsStore);
  }

  export function replaceEmails(newEmails) {
    emailsStore.set(newEmails);
  }

  export function onEmailsChange(cb) {
    emailsStore.subscribe(cb);
  }

  let inputValue;

  function handleInput(value) {
    let trimmedValue;
    if (value) {
      trimmedValue = value.trim();
    } else if (inputValue) {
      trimmedValue = inputValue.trim();
    } else {
      return;
    }

    addEmail(trimmedValue);
  }

  function addEmail(email) {
    const validEmail = email.includes("@");

    if (email) {
      emailsStore.update(emails => [
        ...emails,
        { value: email, valid: validEmail }
      ]);

      inputValue = "";
    }
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
        if (!inputValue.length) {
          removeLastEmail();
        }
        break;
      default:
        break;
    }
  }

  function getClipboardData(event) {
    if (event.clipboardData) {
      return event.clipboardData.getData("text/plain");
    }

    return "";
  }

  function handlePaste(event) {
    const data = getClipboardData(event);
    data.split(",").map(handleInput);
  }

  function setFocusOnInput(event) {
    event.target.lastElementChild.focus();
  }

  let initialPlaceholder = "Enter email adresses...";
  let processPlaceholder = "add more people...";
  $: placeholder =
    $emailsStore.length > 0 ? processPlaceholder : initialPlaceholder;
</script>

<style>
  .email-chip {
    display: inline-flex;
    padding-left: 10px;
    padding-right: 8px;
    margin-right: 8px;
    margin-bottom: 4px;
  }

  .email-valid {
    border-radius: 100px;
    background-color: rgba(102, 153, 255, 0.2);
  }
  .email-invalid {
    border-bottom: 1px dashed #d92929;
  }

  .delete-email-button {
    margin-left: 8px;
    cursor: pointer;
  }
  .input-wrapper {
    max-height: 96px;
    height: 80px;
    overflow-y: auto;
    background-color: #fff;
    border: 1px solid #c3c2cf;
    border-radius: 4px;
    padding: 7px;
    font-size: 14px;
    line-height: 24px;
  }
  .emails-input {
    display: inline-flex;
    max-width: 100%;
    flex-grow: 1;
    font-family: "Open Sans", sans-serif;
    font-size: 14px;
    line-height: 24px;
    border: none;
  }
  .emails-input:focus {
    outline: none;
  }
</style>

<div class="input-wrapper" on:click={setFocusOnInput}>
  {#if $emailsStore.length > 0}
    {#each $emailsStore as email, i}
      <span
        class="email-chip"
        class:email-valid={email.valid}
        class:email-invalid={!email.valid}>
        {email.value}
        <span
          class="delete-email-button"
          role="button"
          on:click={() => removeEmail(email.value)}>
          ×
        </span>
      </span>
    {/each}
  {/if}
  <input
    class="emails-input"
    type="email"
    {placeholder}
    bind:value={inputValue}
    on:keydown={handleKeyDown}
    on:blur={() => handleInput()}
    on:paste|preventDefault={handlePaste} />

</div>
