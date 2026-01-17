<script lang="ts">
  import { goto } from "$app/navigation";
  import TurtlePreview from "$lib/components/TurtlePreview.svelte";
  import { JsWorker } from "$lib/jsWorker/JsWorker";
  import type { TurtleAction } from "$lib/turtle-graphics/TurtleAction";
  import { page } from "$app/state";
  import { SvelteMap } from "svelte/reactivity";
  import { resolve } from "$app/paths";

  let { data } = $props();

  // Calculate optimal number of columns for grid layout
  const gridColumns = $derived(Math.ceil(Math.sqrt(data.submissions.length)) || 1);

  // State for all submission actions
  let submissionActions = $state<Map<string, ReadonlyArray<TurtleAction>>>(new Map());

  // Shared animation distance for synchronized playback
  const animationSpeed = 100; // Units per second
  let animationDistance = $state(0);
  let previousTime = 0;
  let animationFrameId: number | null = null;

  // Convert all submission codes to actions
  $effect(() => {
    const workers: JsWorker[] = [];

    data.submissions.forEach((submission) => {
      const jsWorker = JsWorker.create(submission.code);
      workers.push(jsWorker);

      jsWorker.getActions().then((actions) => {
        submissionActions.set(submission.username, actions);
        submissionActions = new SvelteMap(submissionActions); // Trigger reactivity
      });
    });

    return () => {
      workers.forEach((worker) => worker.dispose());
    };
  });

  // Start animation on mount
  $effect(() => {
    previousTime = performance.now();
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  });

  function animate(time: DOMHighResTimeStamp) {
    const deltaTime = time - previousTime;
    previousTime = time;
    animationDistance += (animationSpeed * deltaTime) / 1000;
    animationFrameId = requestAnimationFrame(animate);
  }

  // Handle keyboard navigation
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();

      // Find current challenge index
      const currentIndex = data.challenges.findIndex((c) => c.id === page.params.challengeId);

      // Navigate to next challenge if not last
      if (currentIndex >= 0 && currentIndex < data.challenges.length - 1) {
        const nextChallengeId = data.challenges[currentIndex + 1].id;
        goto(resolve("/admin/presentation/[challengeId]", { challengeId: nextChallengeId }));
      } else {
        // If last challenge, go to end slide
        goto(resolve("/admin/presentation/end"));
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      // Go back to current challenge display
      goto(resolve("/admin/presentation/[challengeId]", { challengeId: page.params.challengeId! }));
    }
  }
</script>

<svelte:window on:keydown={handleKeyPress} />

<div class="submissions-display">
  <div class="submissions-grid" style="grid-template-columns: repeat({gridColumns}, 1fr);">
    {#each data.submissions as submission (submission.username)}
      <div class="submission-card">
        <h3>{submission.username}</h3>
        <div class="preview-container">
          {#if submissionActions.has(submission.username)}
            <TurtlePreview
              width={640}
              height={360}
              actions={submissionActions.get(submission.username) ?? []}
              distance={animationDistance}
              drawTurtle={true}
            />
          {:else}
            <div class="loading">Loading...</div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
  {#if data.submissions.length === 0}
    <p class="no-submissions">No submissions yet</p>
  {/if}
</div>

<style>
  .submissions-display {
    width: 100vw;
    height: 100vh;
    background: var(--editor-background);
    padding: 0.5rem;
    box-sizing: border-box;
    overflow: auto;
  }

  .submissions-grid {
    display: grid;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    height: 100%;
  }

  .submission-card {
    aspect-ratio: 16 / 9;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    overflow: hidden;
  }

  h3 {
    font-size: 1.5rem;
    margin: 0;
    padding-top: 0.5rem;
    color: var(--link);
    flex-shrink: 0;
  }

  .preview-container {
    flex: 1;
    container-type: size;
    aspect-ratio: 16 / 9;

    :global(> canvas) {
      width: 100cqw;
      border: 2px solid var(--edge);
    }
  }

  .loading {
    color: var(--text-dim);
    font-size: 1.2rem;
  }

  .no-submissions {
    text-align: center;
    font-size: 2rem;
    color: var(--text-dim);
    margin-top: 4rem;
  }
</style>
