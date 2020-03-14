<script>
  import { emails } from "./emailsStore";
  let inputValue;

  let initialPlaceholder = "Enter email adresses...";
  let processPlaceholder = "add more people...";
  $: placeholder = $emails.length > 0 ? processPlaceholder : initialPlaceholder;

  function handleInputValue() {
    const email = inputValue.trim();
    const validEmail = email.includes("@");

    if (email) {
      emails.update(emails => [...emails, { value: email, valid: validEmail }]);
      inputValue = "";
    }
  }

  function handleRemove(email) {
    emails.update(emails => emails.filter(e => e.value !== email));
  }

  function handleKeyDown(event) {
    if (["Enter", "Tab", ","].includes(event.key)) {
      event.preventDefault();
      handleInputValue();
    }
  }
</script>

<style>
  .email-chip {
    display: inline-flex;
    padding-left: 10px;
    padding-right: 8px;
    margin-right: 8px;
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
    display: flex;
    align-items: center;
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
    min-height: 40px;
    font-family: "Open Sans", sans-serif;
    font-size: 14px;
    line-height: 24px;
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
      <span
        class="email-chip"
        class:email-valid={email.valid}
        class:email-invalid={!email.valid}>
        {email.value}
        <span
          class="delete-email-button"
          role="button"
          on:click={() => handleRemove(email.value)}>
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
    on:blur={handleInputValue} />
</div>
