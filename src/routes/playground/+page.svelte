<script lang="ts">
  import { onMount } from "svelte";
  import Editor from "$lib/components/Editor.svelte";
  import TurtlePreview from "$lib/components/TurtlePreview.svelte";
  import PlaygroundClosed from "$lib/components/PlaygroundClosed.svelte";
  import { JsWorker } from "$lib/jsWorker";
  import { playgroundJavascript } from "$lib/stores/playgroundJavascript";
  import type { TurtleAction } from "$lib/turtle-graphics";

  let { data } = $props();

  const animationSpeed = 100;

  let actions: ReadonlyArray<TurtleAction> = $state([]);
  let animationDistance = $state(Number.POSITIVE_INFINITY);
  let animationId: number | null = null;
  let currentTime = $state(new Date());

  $effect(() => {
    const jsWorker = JsWorker.create($playgroundJavascript);
    jsWorker.getActions().then((a) => {
      actions = a;

      animationDistance = Number.POSITIVE_INFINITY;
      if (animationId != null) {
        cancelAnimationFrame(animationId);
      }
    });

    return () => jsWorker.dispose();
  });

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

  // Client-side timer to check if playground should reopen (challenge ends)
  onMount(() => {
    if (data.challengeTimespan == null) {
      return;
    }
    if (currentTime < data.challengeTimespan.startTime) {
      const msToStart = data.challengeTimespan.startTime.getTime() - currentTime.getTime();
      let timeoutId = setTimeout(() => {
        currentTime = new Date();
        const msToEnd = data.challengeTimespan!.endTime.getTime() - currentTime.getTime();
        timeoutId = setTimeout(() => {
          currentTime = new Date();
        }, msToEnd);
      }, msToStart);
      return () => clearTimeout(timeoutId);
    } else if (currentTime < data.challengeTimespan.endTime) {
      const msToEnd = data.challengeTimespan.endTime.getTime() - currentTime.getTime();
      const timeoutId = setTimeout(() => {
        currentTime = new Date();
      }, msToEnd);
      return () => clearTimeout(timeoutId);
    }
  });
</script>

{#if data.challengeTimespan != null && data.challengeTimespan.startTime < currentTime && currentTime < data.challengeTimespan.endTime}
  <div class="closed-wrapper">
    <PlaygroundClosed challengeEndTime={data.challengeTimespan.endTime} />
  </div>
{:else}
  <div class="playground">
    <main>
      <Editor bind:text={$playgroundJavascript} />
    </main>
    <aside>
      <TurtlePreview width={640} height={360} {actions} drawTurtle={true} distance={animationDistance} />
      <button onclick={onPlayAnimationClick}>Animate Turtle</button>
    </aside>
  </div>
{/if}

<style>
  .closed-wrapper {
    height: 100cqh;
    width: 100cqw;
    grid-column: span 2;
  }

  .playground {
    display: grid;
    height: 100cqh;
    width: 100cqw;
    grid-template-areas: "editor preview";
    grid-template-columns: 1fr 1fr;
    overflow: hidden;

    main {
      container-type: size;
      grid-area: editor;
    }

    aside {
      container-type: size;
      grid-area: preview;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      :global(> canvas) {
        border: 2px solid var(--edge);
      }

      button {
        margin-block-start: 1em;
      }
    }
  }
</style>
