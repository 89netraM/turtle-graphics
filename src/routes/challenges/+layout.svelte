<script lang="ts">
  import ChallengesNotOpen from "$lib/components/ChallengesNotOpen.svelte";
  import { onMount } from "svelte";

  let { children, data } = $props();

  let currentTime = $state(new Date());

  onMount(() => {
    if (data.challengeTimespan == null || data.challengeTimespan.startTime < currentTime) {
      return;
    }
    const msToStart = data.challengeTimespan.startTime.getTime() - currentTime.getTime();
    let timeoutId = setTimeout(() => {
      currentTime = new Date();
      const msToEnd = data.challengeTimespan!.endTime.getTime() - currentTime.getTime();
      timeoutId = setTimeout(() => {
        currentTime = new Date();
      }, msToEnd);
    }, msToStart);
    return () => clearTimeout(timeoutId);
  });
</script>

{#if data.challengeTimespan == null || data.challengeTimespan.startTime < currentTime}
  <div class="challenges-layout">
    {#if data.challengeTimespan != null && data.challengeTimespan.endTime < currentTime}
      <div class="read-only-notice">The challenge period has ended. Submissions are now read-only.</div>
    {/if}
    <div class="challenges">
      {@render children?.()}
    </div>
  </div>
{:else}
  <ChallengesNotOpen startTime={data.challengeTimespan.startTime} />
{/if}

<style>
  .challenges-layout {
    display: grid;
    height: 100cqh;
    grid-template-areas: "notice" "challenges";
    grid-template-rows: auto 1fr;
  }

  .read-only-notice {
    background-color: #fffae6;
    border-block-end: 1px solid #ffecb3;
    padding: 1rem 2rem;
    color: #665c00;
    grid-area: notice;
  }

  .challenges {
    container-type: size;
    grid-area: challenges;
  }
</style>
