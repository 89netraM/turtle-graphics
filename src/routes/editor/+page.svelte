<script lang="ts">
  import Editor from "$lib/components/Editor.svelte";
  import TurtlePreview from "$lib/components/TurtlePreview.svelte";
  import { JsWorker } from "$lib/jsWorker";
  import type { TurtleAction } from "$lib/turtle-graphics";

  let javascript = $state(`rotate(Math.PI / 4);
penDown("#09cdda");
forward(50);
penUp();
`);
  let actions: ReadonlyArray<TurtleAction> = $state([]);

  $effect(() => {
    const jsWorker = JsWorker.create(javascript);
    jsWorker.getActions().then((a) => (actions = a));
    return () => jsWorker.dispose();
  });
</script>

<div>
  <main>
    <Editor bind:text={javascript} />
  </main>
  <aside>
    <TurtlePreview width={640} height={360} {actions} drawTurtle={true} />
  </aside>
</div>

<style>
  div {
    display: grid;
    height: 99.5cqh;
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
    }
  }
</style>
