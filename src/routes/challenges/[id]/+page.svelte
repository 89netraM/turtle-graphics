<script lang="ts">
  import ChallengeCard from "$lib/components/ChallengeCard.svelte";
  import Editor from "$lib/components/Editor.svelte";
  import SubmissionStatusBar from "$lib/components/SubmissionStatusBar.svelte";
  import AuthModal from "$lib/components/AuthModal.svelte";
  import PinDisplayModal from "$lib/components/PinDisplayModal.svelte";
  import { getChallengeJavascriptStore } from "$lib/stores/challengeJavascript.js";
  import { getSubmissionState, markAsSubmitted, markAsModified, updateFromDB } from "$lib/stores/submissionState.js";
  import { onMount } from "svelte";
  import { invalidateAll } from "$app/navigation";
  import TurtlePreview from "$lib/components/TurtlePreview.svelte";
  import type { TurtleAction } from "$lib/turtle-graphics";
  import { JsWorker } from "$lib/jsWorker";

  let { data } = $props();

  const animationSpeed = 100;

  let javascript = $derived(getChallengeJavascriptStore(data.activeChallenge.id));
  let submissionState = $derived(getSubmissionState(data.activeChallenge.id));
  let currentTime = $state(new Date());
  let isReadonly = $derived(data.challengeTimespan != null && data.challengeTimespan.endTime < currentTime);

  // Auth modal state
  let showAuthModal = $state(false);
  let showPinModal = $state(false);
  let newPin = $state("");
  let newGroupName = $state("");

  // Submission state
  let isSubmitting = $state(false);
  let isLoadingFromDB = $state(false);
  let lastKnownCode = $state($javascript);

  // Animation state
  let actions: ReadonlyArray<TurtleAction> = $state([]);
  let animationDistance = $state(Number.POSITIVE_INFINITY);
  let animationId: number | null = null;

  // Track code changes for modification detection
  $effect(() => {
    const currentCode = $javascript;
    if (currentCode !== lastKnownCode) {
      lastKnownCode = currentCode;
      // Check if different from last submitted code
      const state = $submissionState;
      if (state.lastSubmittedCode !== null && state.lastSubmittedCode !== currentCode) {
        markAsModified(data.activeChallenge.id);
      }
    }
  });

  $effect(() => {
    if (isReadonly) {
      const jsWorker = JsWorker.create($javascript);
      jsWorker.getActions().then((a) => {
        actions = a;

        animationDistance = Number.POSITIVE_INFINITY;
        if (animationId != null) {
          cancelAnimationFrame(animationId);
        }
      });

      return () => jsWorker.dispose();
    }
  });

  // Load submission from DB on mount if available and not modified
  onMount(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    // Set up readonly timeout
    if (data.challengeTimespan != null && currentTime < data.challengeTimespan.endTime) {
      const msToEnd = data.challengeTimespan.endTime.getTime() - currentTime.getTime();
      timeoutId = setTimeout(() => {
        currentTime = new Date();
      }, msToEnd);
    }

    // Auto-load from DB if we have a submission and local state is not modified
    if (data.submission && $submissionState.status !== "Modified") {
      javascript.set(data.submission.code);
      updateFromDB(data.activeChallenge.id, data.submission.code, data.submission.submittedAt);
    }

    // Check for pending submit after auth
    const pendingSubmitKey = `pendingSubmit-${data.activeChallenge.id}`;
    const hasPendingSubmit = localStorage.getItem(pendingSubmitKey);

    if (hasPendingSubmit && data.user) {
      // Clear the flag
      localStorage.removeItem(pendingSubmitKey);
      // Auto-submit
      handleSubmit();
    }

    return () => {
      // Clear timeout on unmount
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  });

  async function handleSubmit() {
    // Check if user is logged in
    if (!data.user) {
      // Set flag to submit after auth
      localStorage.setItem(`pendingSubmit-${data.activeChallenge.id}`, "true");
      showAuthModal = true;
      return;
    }

    isSubmitting = true;

    try {
      const response = await fetch(`/challenges/${data.activeChallenge.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: $javascript }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        markAsSubmitted(data.activeChallenge.id, $javascript);
        await invalidateAll();
      } else {
        alert(result.error || "Failed to submit");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit code");
    } finally {
      isSubmitting = false;
    }
  }

  async function handleLoadFromDB() {
    if (!data.user) {
      return;
    }

    isLoadingFromDB = true;

    try {
      const response = await fetch(`/challenges/${data.activeChallenge.id}/load`, {
        method: "GET",
      });

      const result = await response.json();

      if (response.ok && result.success && result.submission) {
        javascript.set(result.submission.code);
        updateFromDB(data.activeChallenge.id, result.submission.code, new Date(result.submission.submittedAt));
      } else {
        alert(result.error || "Failed to load submission");
      }
    } catch (error) {
      console.error("Load error:", error);
      alert("Failed to load submission");
    } finally {
      isLoadingFromDB = false;
    }
  }

  function handleAuthSuccess(pin?: string, groupName?: string) {
    // If PIN is provided, show the PIN modal
    if (pin && groupName) {
      newPin = pin;
      newGroupName = groupName;
      showPinModal = true;
    } else {
      // Just login, reload the page
      window.location.reload();
    }
  }

  function onPlayAnimationClick() {
    animationDistance = 0;
    animationId = requestAnimationFrame(animate);
  }

  let previousTime: DOMHighResTimeStamp | null = null;
  function animate(time: DOMHighResTimeStamp) {
    if (previousTime != null) {
      const deltaTime = time - previousTime;
      animationDistance += (animationSpeed * deltaTime) / 1000;
    }
    previousTime = time;
    animationId = requestAnimationFrame(animate);
  }
</script>

<article>
  <nav>
    {#each data.challenges as challenge (challenge.id)}
      <ChallengeCard {...challenge} />
    {/each}
  </nav>
  <div id="editor">
    <Editor bind:text={$javascript} readonly={isReadonly} />
  </div>
  <div id="preview" class:readonly={isReadonly}>
    <div class="container">
      <img src={data.activeChallenge.imageUrl} alt={data.activeChallenge.title} />
    </div>
    {#if isReadonly}
      <div class="container">
        <TurtlePreview width={640} height={360} {actions} drawTurtle={true} distance={animationDistance} />
      </div>
      <button onclick={onPlayAnimationClick}>Animate Turtle</button>
    {/if}
  </div>
  <div id="status-bar">
    <SubmissionStatusBar
      status={$submissionState.status}
      lastSubmittedAt={$submissionState.lastSubmittedAt}
      onSubmit={handleSubmit}
      onLoadFromDB={handleLoadFromDB}
      {isSubmitting}
      isLoading={isLoadingFromDB}
      {isReadonly}
    />
  </div>
</article>

<AuthModal isOpen={showAuthModal} onClose={() => (showAuthModal = false)} onSuccess={handleAuthSuccess} />

<PinDisplayModal
  isOpen={showPinModal}
  pin={newPin}
  groupName={newGroupName}
  onClose={() => {
    showPinModal = false;
    window.location.reload();
  }}
/>

<style>
  article {
    display: grid;
    width: 100cqw;
    height: 100cqh;
    grid-template-areas:
      "nav editor template"
      "nav status status";
    grid-template-rows: 1fr auto;
    grid-template-columns: 15cqw 1fr 1fr;
    overflow: hidden;

    nav {
      grid-area: nav;
      overflow: hidden auto;
      background-color: var(--ui-background);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: start;
      padding: 0.5rem 1rem;
      gap: 1rem;
    }

    #editor {
      grid-area: editor;
      container-type: size;
    }

    #preview {
      grid-area: template;
      padding-block: 0.5rem;
      display: grid;
      grid-template-rows: 1fr 1fr auto;
      justify-content: stretch;
      align-items: stretch;
      gap: 0.5rem;

      .container {
        container-type: size;
        display: flex;
        justify-content: center;
        align-items: center;

        &:first-of-type {
          margin-block-end: 0.25rem;
          grid-row: span 3;
        }
        &:last-of-type {
          margin-block-start: 0.25rem;
        }

        img,
        :global(> canvas) {
          max-width: 100cqw;
          max-height: 100cqh;
          aspect-ratio: 640 / 360;
          border: 2px solid var(--edge);
        }
      }

      button {
        justify-self: center;
      }
    }

    #preview.readonly .container:first-of-type {
      grid-row: unset;
    }

    #status-bar {
      grid-area: status;
      padding: 1rem;
      background-color: var(--ui-background);
      border-top: 2px solid var(--edge);
    }
  }
</style>
