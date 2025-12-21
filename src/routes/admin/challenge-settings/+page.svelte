<script lang="ts">
  import { onMount } from "svelte";

  let { data, form } = $props();

  let localStartTime = $state("");
  let localEndTime = $state("");
  let currentTime = $state(new Date());
  let statusMessage = $state("");
  let playgroundStatus = $state("");
  let challengeStatus = $state("");

  // Update current time every second for countdown
  onMount(() => {
    const interval = setInterval(() => {
      currentTime = new Date();
    }, 1000);

    return () => clearInterval(interval);
  });

  // Convert times to local datetime format for inputs
  $effect(() => {
    if (data.startTime) {
      localStartTime = new Date(data.startTime.getTime() - new Date().getTimezoneOffset() * 60 * 1000)
        .toISOString()
        .slice(0, 16);
    } else {
      localStartTime = "";
    }

    if (data.endTime) {
      localEndTime = new Date(data.endTime.getTime() - new Date().getTimezoneOffset() * 60 * 1000)
        .toISOString()
        .slice(0, 16);
    } else {
      localEndTime = "";
    }
  });

  // Calculate status messages
  $effect(() => {
    if (!data.startTime || !data.endTime) {
      statusMessage = "No challenge timespan set";
      playgroundStatus = "OPEN";
      challengeStatus = "OPEN";
    } else {
      if (currentTime < data.startTime) {
        // Before challenge starts
        const diff = data.startTime.getTime() - currentTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60))
          .toString()
          .padStart(2, "0");
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          .toString()
          .padStart(2, "0");
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
          .toString()
          .padStart(2, "0");
        statusMessage = `Challenges will open in ${hours}h ${minutes}m ${seconds}s`;
        playgroundStatus = "OPEN";
        challengeStatus = "CLOSED";
      } else if (currentTime >= data.startTime && currentTime < data.endTime) {
        // During challenge period
        const diff = data.endTime.getTime() - currentTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60))
          .toString()
          .padStart(2, "0");
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          .toString()
          .padStart(2, "0");
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
          .toString()
          .padStart(2, "0");
        statusMessage = `Challenges will close in ${hours}h ${minutes}m ${seconds}s`;
        playgroundStatus = "CLOSED";
        challengeStatus = "OPEN";
      } else {
        // After challenge ends
        statusMessage = "Challenges have ended";
        playgroundStatus = "OPEN";
        challengeStatus = "READ-ONLY";
      }
    }
  });
</script>

<main>
  <h1>Challenge Settings</h1>

  <section class="status">
    <h2>Current Status</h2>
    <p class="status-message">
      {statusMessage}
    </p>
    <div class="status-details">
      <p>
        Playground: <strong class:open={playgroundStatus === "OPEN"} class:closed={playgroundStatus === "CLOSED"}
          >{playgroundStatus}</strong
        >
      </p>
      <p>
        Challenges: <strong
          class:open={challengeStatus === "OPEN"}
          class:closed={challengeStatus === "CLOSED"}
          class:readonly={challengeStatus === "READ-ONLY"}>{challengeStatus}</strong
        >
      </p>
    </div>
    {#if data.startTime && data.endTime}
      <p class="timespan-info">
        Start: {data.startTime.toLocaleString()}<br />
        End: {data.endTime.toLocaleString()}
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
        <span>Challenge Start Time:</span>
        <input type="datetime-local" name="startTime" bind:value={localStartTime} required />
      </label>

      <label>
        <span>Challenge End Time:</span>
        <input type="datetime-local" name="endTime" bind:value={localEndTime} required />
      </label>

      <div class="buttons">
        <button type="submit" disabled={!localStartTime || !localEndTime}> Set Challenge Timespan </button>
        <button type="submit" formnovalidate class="secondary" name="clear" value="true">
          Clear (No Challenges)
        </button>
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
    font-variant-numeric: tabular-nums;
    margin: 0.5rem 0;
  }

  .status-details {
    margin: 1rem 0;
    display: flex;
    gap: 2rem;

    p {
      margin: 0.25rem 0;
    }

    strong {
      &.open {
        color: #2e7d32;
      }

      &.closed {
        color: var(--error-text, #d32f2f);
      }

      &.readonly {
        color: #f57c00;
      }
    }
  }

  .timespan-info {
    margin: 1rem 0 0;
    color: var(--text-secondary, #666);
    font-size: 0.9rem;
    line-height: 1.6;
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
