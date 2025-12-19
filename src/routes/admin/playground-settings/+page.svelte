<script lang="ts">
  import { onMount } from "svelte";

  let { data, form } = $props();

  let localDateTime = $state("");
  let currentTime = $state(new Date());
  let statusMessage = $state("");

  // Update current time every second for countdown
  onMount(() => {
    const interval = setInterval(() => {
      currentTime = new Date();
    }, 1000);

    return () => clearInterval(interval);
  });

  // Convert closeTime to local datetime format for input
  $effect(() => {
    if (data.closeTime) {
      const date = new Date(data.closeTime);
      localDateTime = date.toISOString().slice(0, 16);
    } else {
      localDateTime = "";
    }
  });

  // Calculate status message
  $effect(() => {
    if (!data.closeTime) {
      statusMessage = "Playground is always open";
    } else {
      const closeDate = new Date(data.closeTime);
      if (currentTime >= closeDate) {
        statusMessage = "Playground is currently CLOSED";
      } else {
        const diff = closeDate.getTime() - currentTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        statusMessage = `Playground will close in ${hours}h ${minutes}m ${seconds}s`;
      }
    }
  });
</script>

<main>
  <h1>Playground Settings</h1>

  <section class="status">
    <h2>Current Status</h2>
    <p class="status-message" class:closed={data.closeTime && currentTime >= new Date(data.closeTime)}>
      {statusMessage}
    </p>
    {#if data.closeTime}
      <p class="close-time">
        Scheduled close time: {new Date(data.closeTime).toLocaleString()}
      </p>
    {/if}
  </section>

  <section class="settings">
    <h2>Update Settings</h2>

    {#if form?.error}
      <p class="error">{form.error}</p>
    {/if}

    {#if form?.success}
      <p class="success">Settings updated successfully!</p>
    {/if}

    <form method="POST">
      <label>
        <span>Close Time:</span>
        <input type="datetime-local" name="closeTime" bind:value={localDateTime} required />
      </label>
      <div class="buttons">
        <button type="submit" disabled={!localDateTime}>Set Close Time</button>
        <button type="submit" formnovalidate class="secondary" name="clear">Clear (Always Open)</button>
      </div>
    </form>
  </section>
</main>

<style>
  main {
    padding: 2rem;
    max-width: 800px;
  }

  h1 {
    margin-bottom: 2rem;
  }

  section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 8px;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }

  .status-message {
    font-size: 1.125rem;
    font-weight: 500;
    margin: 0.5rem 0;

    &.closed {
      color: var(--error-text, #d32f2f);
      font-weight: 700;
    }
  }

  .close-time {
    margin: 0.5rem 0;
    color: var(--text-secondary, #666);
    font-size: 0.9rem;
  }

  .error {
    color: var(--error-text, #d32f2f);
    margin-bottom: 1rem;
    padding: 0.75rem;
    background-color: #ffebee;
    border-radius: 4px;
  }

  .success {
    color: #2e7d32;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background-color: #e8f5e9;
    border-radius: 4px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    span {
      font-weight: 500;
    }

    input {
      padding: 0.5rem;
      font-size: 1rem;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 4px;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  .buttons {
    display: flex;
    gap: 1rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      opacity: 0.9;
    }

    &.secondary {
      background-color: #f5f5f5;
      color: #333;
      border: 1px solid var(--border-color, #ddd);
    }
  }
</style>
