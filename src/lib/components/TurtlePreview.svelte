<script lang="ts">
  import { render as turtleRender, type TurtleAction } from "$lib/turtle-graphics";
  import { onDestroy, onMount } from "svelte";

  let { actions, width, height }: { actions: ReadonlyArray<TurtleAction>; width: number; height: number } = $props();

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let resizeObserver: ResizeObserver;

  onMount(() => {
    ctx = canvas.getContext("2d")!;
    resizeObserver = new ResizeObserver(() => render());
    resizeObserver.observe(canvas);
    render();
  });

  function render() {
    const canvasRect = canvas.getBoundingClientRect();
    canvas.width = canvasRect.width;
    canvas.height = canvasRect.height;
    turtleRender({ width, height, scale: canvasRect.width / width }, ctx, actions);
  }

  onDestroy(() => {
    resizeObserver?.disconnect();
  });
</script>

<canvas bind:this={canvas} style:aspect-ratio={`${width} / ${height}`}></canvas>

<style>
  canvas {
    width: 100cqw;
  }
</style>
