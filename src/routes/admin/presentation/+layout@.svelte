<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div class="fullscreen-layout">
  {@render children()}
</div>

<style>
  .fullscreen-layout {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    overflow: hidden;
  }
</style>
