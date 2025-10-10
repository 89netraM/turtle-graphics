<script lang="ts">
  let { data, form } = $props();
</script>

{#if data.isSignedIn}
  <main>
    <p>Are you supposed to be here?</p>
  </main>
{:else}
  <form id="sign-in" method="POST">
    <p class="error">
      {#if form?.error != null}
        {form.error}
      {:else}
        &nbsp;
      {/if}
    </p>
    <p>
      <label>
        <span>Password:</span>
        <input type="password" placeholder="Password" required name="password" />
      </label>
    </p>
    <p>
      <button type="submit">Sign in</button>
    </p>
  </form>
{/if}

<style>
  main {
    width: 100cqw;
    height: 100cqh;
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    flex-wrap: wrap;
  }

  #sign-in {
    width: 100cqw;
    height: 100cqh;
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1em;

    p {
      margin: 0;

      &.error {
        color: var(--error-text);
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
      }

      button {
        float: inline-end;
      }
    }
  }
</style>
