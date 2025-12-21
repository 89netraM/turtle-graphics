<script lang="ts">
  interface Props {
    challengeEndTime?: Date | null;
  }

  let { challengeEndTime = null }: Props = $props();
</script>

<div class="closed-container">
  <div class="closed-content">
    <h1>Playground Closed</h1>
    <p>The playground is currently closed during the challenge period.</p>
    {#if challengeEndTime}
      <p class="info">
        Playground will reopen when challenges end at:<br />
        <strong>{challengeEndTime.toLocaleString()}</strong>
      </p>
    {/if}
    <p class="info">Check out the challenges while you wait!</p>
  </div>
</div>

<style>
  .closed-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    padding: 2rem;
  }

  .closed-content {
    text-align: center;
    max-width: 600px;
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }

  p {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .info {
    font-size: 1rem;
    opacity: 0.8;
    margin-top: 2rem;
  }
</style>
