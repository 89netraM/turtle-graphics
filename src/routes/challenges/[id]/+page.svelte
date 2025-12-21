<script lang="ts">
  import ChallengeCard from "$lib/components/ChallengeCard.svelte";
  import Editor from "$lib/components/Editor.svelte";
  import { getChallengeJavascriptStore } from "$lib/stores/challengeJavascript.js";
  import { onMount } from "svelte";

  let { data } = $props();

  let javascript = $derived(getChallengeJavascriptStore(data.activeChallenge.id));
  let currentTime = $state(new Date());

  onMount(() => {
    if (data.challengeTimespan == null || data.challengeTimespan.endTime < currentTime) {
      return;
    }
    const msToEnd = data.challengeTimespan.endTime.getTime() - currentTime.getTime();
    const timeoutId = setTimeout(() => {
      currentTime = new Date();
    }, msToEnd);
    return () => clearTimeout(timeoutId);
  });
</script>

<article>
  <nav>
    {#each data.challenges as challenge (challenge.id)}
      <ChallengeCard {...challenge} />
    {/each}
  </nav>
  <div id="editor">
    <Editor
      bind:text={$javascript}
      readonly={data.challengeTimespan != null && data.challengeTimespan.endTime < currentTime}
    />
  </div>
  <img src={data.activeChallenge.image} alt={data.activeChallenge.name} />
</article>

<style>
  article {
    display: grid;
    width: 100cqw;
    height: 100cqh;
    grid-template-areas: "nav editor template";
    grid-template-rows: 1fr;
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
  }
</style>
