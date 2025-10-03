<script lang="ts">
  import { render as turtleRender, type TurtleAction } from "$lib/turtle-graphics";
  import { onDestroy, onMount } from "svelte";

  let {
    actions,
    width,
    height,
    distance = Number.POSITIVE_INFINITY,
    drawTurtle = false,
  }: {
    actions: ReadonlyArray<TurtleAction>;
    width: number;
    height: number;
    distance?: number;
    drawTurtle?: boolean;
  } = $props();

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let resizeObserver: ResizeObserver;

  onMount(() => {
    ctx = canvas.getContext("2d")!;
    resizeObserver = new ResizeObserver(() => render(distance));
    resizeObserver.observe(canvas);
    render(distance);
  });

  $effect(() => {
    render(distance);
  });

  function render(distance: number) {
    const canvasRect = canvas.getBoundingClientRect();
    canvas.width = canvasRect.width;
    canvas.height = canvasRect.height;
    turtleRender({ width, height, scale: canvasRect.width / width, drawTurtle }, ctx, actions, distance);
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
