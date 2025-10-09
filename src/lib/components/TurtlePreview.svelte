<script lang="ts">
  import { render as turtleRender, type TurtleAction } from "$lib/turtle-graphics";
  import { onDestroy, onMount } from "svelte";
  import { devicePixelRatio } from "svelte/reactivity/window";

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
    canvas.width = canvasRect.width * (devicePixelRatio.current ?? 1);
    canvas.height = canvasRect.height * (devicePixelRatio.current ?? 1);
    turtleRender({ width, height, scale: canvas.width / width, drawTurtle }, ctx, actions, distance);
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
