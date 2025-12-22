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

  let { data } = $props();

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

  // Load submission from DB on mount if available and not modified
  onMount(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    // Set up readonly timeout
    if (data.challengeTimespan != null && data.challengeTimespan.endTime < currentTime) {
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
  <img src={data.activeChallenge.imageUrl} alt={data.activeChallenge.title} />
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

    img {
      grid-area: template;
      align-self: center;
      justify-self: stretch;
      min-width: 0;
      min-height: 0;
      object-fit: contain;
      object-position: center center;
      border: 2px solid var(--edge);
    }

    #status-bar {
      grid-area: status;
      padding: 1rem;
      background-color: var(--ui-background);
      border-top: 2px solid var(--edge);
    }
  }
</style>
