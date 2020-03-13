<script>
  import { emails } from "./emailsStore";
  let inputValue;

  let initialPlaceholder = "Enter email adresses...";
  let processPlaceholder = "add more people...";
  $: placeholder = $emails.length > 0 ? processPlaceholder : initialPlaceholder;

  function handleInputValue() {
    const email = inputValue.trim();

    if (email) {
      emails.update(emails => [...emails, email]);
      inputValue = "";
    }
  }

  function handleKeyDown(event) {
    if (["Enter", "Tab", ","].includes(event.key)) {
      event.preventDefault();
      handleInputValue();
    }
  }
</script>

<style>
  .input-wrapper {
    display: flex;
    align-items: center;
    background-color: #fff;
    border: 1px solid #c3c2cf;
    border-radius: 4px;
    padding: 7px;
  }
  .emails-input {
    display: inline-flex;
    max-width: 100%;
    flex-grow: 1;
    min-height: 40px;
    font-size: 14px;
    line-height: 24px;
    font-family: 'Open Sans', sans-serif;
    border: none;
  }
  .emails-input:focus {
    outline: none;
  }
</style>

<svelte:options tag="emails-input" />
<div class="input-wrapper">
  {#if $emails.length > 0}
    {#each $emails as email, i}
      <span>
        {email}
        <span>×</span>
      </span>
    {/each}
  {/if}
  <input
    class="emails-input"
    type="email"
    {placeholder}
    bind:value={inputValue}
    on:keydown={handleKeyDown}
    on:blur={handleInputValue} />
</div>
