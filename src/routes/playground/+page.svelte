<script lang="ts">
  import Editor from "$lib/components/Editor.svelte";
  import TurtlePreview from "$lib/components/TurtlePreview.svelte";
  import { JsWorker } from "$lib/jsWorker";
  import { playgroundJavascript } from "$lib/stores/playgroundJavascript";
  import type { TurtleAction } from "$lib/turtle-graphics";

  const animationSpeed = 100;

  let actions: ReadonlyArray<TurtleAction> = $state([]);
  let animationDistance = $state(Number.POSITIVE_INFINITY);
  let animationId: number | null = null;

  $effect(() => {
    const jsWorker = JsWorker.create($playgroundJavascript);
    jsWorker.getActions().then((a) => (actions = a));

    animationDistance = Number.POSITIVE_INFINITY;
    if (animationId != null) {
      cancelAnimationFrame(animationId);
    }

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
</script>

<div>
  <main>
    <Editor bind:text={$playgroundJavascript} />
  </main>
  <aside>
    <TurtlePreview width={640} height={360} {actions} drawTurtle={true} distance={animationDistance} />
    <button onclick={onPlayAnimationClick}>Animate Turtle</button>
  </aside>
</div>

<style>
  div {
    display: grid;
    height: 100cqh;
    width: 100cqw;
    grid-template-areas: "editor preview";
    grid-template-columns: 1fr 1fr;

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
