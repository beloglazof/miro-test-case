<script>
  let inputValue;
  let emails = [];

  let initialPlaceholder = "Enter email adresses...";
  let processPlaceholder = "add more people...";
  $: placeholder = emails.length > 0 ? processPlaceholder : initialPlaceholder;

  function handleInputValue() {
    const email = inputValue.trim();

    if (email) {
      emails = [...emails, email];
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

<div>
  {#if emails.length > 0}
    {#each emails as email, i}
      <span>
        {email}
        <span>×</span>
      </span>
    {/each}
  {/if}
  <input
    type="email"
    {placeholder}
    bind:value={inputValue}
    on:keydown={handleKeyDown}
    on:blur={handleInputValue} />
</div>
