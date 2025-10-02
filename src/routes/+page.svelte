<script>
  import TurtlePreview from "$lib/components/TurtlePreview.svelte";
</script>

<TurtlePreview
  actions={[
    { action: "pen-down", color: "#bada55" },
    { action: "rotate", angle: -Math.PI / 4 },
    { action: "forward", distance: 600 },
    { action: "rotate", angle: Math.PI / 2 },
    { action: "forward", distance: 25 },
    { action: "pen-up" },
    { action: "forward", distance: 25 },
    { action: "pen-down", color: "#bada55" },
    { action: "forward", distance: 25 },
    { action: "rotate", angle: Math.PI / 2 },
    { action: "forward", distance: 600 },
    { action: "rotate", angle: -Math.PI / 2 },
    { action: "forward", distance: 600 },
    { action: "rotate", angle: Math.PI / 2 },
  ]}
  width={640}
  height={360}
/>
