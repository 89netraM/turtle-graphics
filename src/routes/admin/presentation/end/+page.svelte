<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";

  let { data } = $props();

  // Handle keyboard navigation
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      // Go back to last challenge's submissions
      if (data.challenges.length > 0) {
        const lastChallengeId = data.challenges[data.challenges.length - 1].id;
        goto(resolve("/admin/presentation/[challengeId]/submissions", { challengeId: lastChallengeId }));
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeyPress} />

<div class="end-slide"></div>

<style>
  .end-slide {
    width: 100vw;
    height: 100vh;
    background: #000000;
  }
</style>
