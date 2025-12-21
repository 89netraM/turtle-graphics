<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    startTime: Date;
  }

  let { startTime }: Props = $props();

  let countdown = $state("");
  let currentTime = $state(new Date());

  // Update countdown every second
  onMount(() => {
    const interval = setInterval(() => {
      currentTime = new Date();
    }, 1000);

    return () => clearInterval(interval);
  });

  // Calculate countdown
  $effect(() => {
    const diff = startTime.getTime() - currentTime.getTime();

    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        .toString()
        .padStart(2, "0");
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        .toString()
        .padStart(2, "0");

      if (days > 0) {
        countdown = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else {
        countdown = `${hours}h ${minutes}m ${seconds}s`;
      }
    } else {
      countdown = "";
    }
  });
</script>

<div class="not-open-container">
  <div class="not-open-content">
    <h1>Challenges Opening Soon</h1>
    <p>The challenges will open in:</p>
    {#if countdown}
      <p class="countdown">{countdown}</p>
    {/if}
    {#if startTime}
      <p class="info">
        Opening at: <strong>{startTime.toLocaleString()}</strong>
      </p>
    {/if}
    <p class="info">Try the playground while you wait!</p>
  </div>
</div>

<style>
  .not-open-container {
    width: 100%;
    min-height: 50vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .not-open-content {
    text-align: center;
    max-width: 600px;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }

  p {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .countdown {
    font-size: 2rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #2e7d32;
    margin: 1.5rem 0;
  }

  .info {
    font-size: 1rem;
    opacity: 0.8;
    margin-top: 1.5rem;

    strong {
      font-weight: 600;
      opacity: 1;
    }
  }
</style>
