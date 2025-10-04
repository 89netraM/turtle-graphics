<script lang="ts">
  import TurtlePreview from "$lib/components/TurtlePreview.svelte";
  import { onMount } from "svelte";

  let distance = $state(0);

  onMount(() => {
    let running = true;
    let previousFrameTime: DOMHighResTimeStamp | null = null;
    let animationFrameId = requestAnimationFrame(animate);

    function animate(time: DOMHighResTimeStamp) {
      if (!running) {
        return;
      }

      if (previousFrameTime != null) {
        distance += (time - previousFrameTime) * 0.1;
      }

      previousFrameTime = time;
      animationFrameId = requestAnimationFrame(animate);
    }
    return () => {
      running = false;
      cancelAnimationFrame(animationFrameId);
    };
  });
</script>

<TurtlePreview
  actions={[
    { action: "pen-down", color: "#bada55" },
    { action: "forward", distance: 50 },
    { action: "rotate", angle: Math.PI / 2 },
    { action: "forward", distance: 25 },
    { action: "rotate", angle: Math.PI / 8 },
    { action: "forward", distance: -500 },
    { action: "rotate", angle: -Math.PI / 2 },
    { action: "forward", distance: 25 },
  ]}
  width={640}
  height={360}
  {distance}
  drawTurtle={true}
/>
