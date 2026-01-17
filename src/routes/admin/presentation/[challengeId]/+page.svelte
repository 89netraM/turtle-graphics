<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";

  let { data } = $props();

  // Find the current challenge
  const currentChallenge = data.challenges.find((c) => c.id === page.params.challengeId);

  // Handle keyboard navigation
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goto(resolve("/admin/presentation/[challengeId]/submissions", { challengeId: page.params.challengeId! }));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      // Find current challenge index
      const currentIndex = data.challenges.findIndex((c) => c.id === page.params.challengeId);

      if (currentIndex > 0) {
        // Go to previous challenge's submissions
        const prevChallengeId = data.challenges[currentIndex - 1].id;
        goto(resolve("/admin/presentation/[challengeId]/submissions", { challengeId: prevChallengeId }));
      } else {
        // First challenge, go back to title
        goto(resolve("/admin/presentation"));
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeyPress} />

<div class="challenge-display">
  {#if currentChallenge}
    <h1>{currentChallenge.title}</h1>
    <div class="image-container">
      <img src={currentChallenge.imageUrl} alt={currentChallenge.title} />
    </div>
  {:else}
    <p>Challenge not found</p>
  {/if}
</div>

<style>
  .challenge-display {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #1a1a1a;
    color: white;
    padding: 2rem;
    box-sizing: border-box;
  }

  h1 {
    font-size: 4rem;
    margin-bottom: 3rem;
    text-align: center;
  }

  .image-container {
    max-width: 80%;
    max-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border: 2px solid #444;
    border-radius: 8px;
  }

  p {
    font-size: 2rem;
    color: #888;
  }
</style>
