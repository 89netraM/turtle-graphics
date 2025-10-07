<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<style>
  :root {
    --editor-background: #212121;
    --ui-background: #1f1f1f;
    --keyword: #569cd6;
    --text: #ffffff;
    --link: #ffae00;
    --link-active: #ffae00;
  }

  :global {
    html,
    body {
      margin: 0;
      width: 100dvw;
      min-height: 100dvh;
      background-color: var(--editor-background);
      color: var(--text);
    }

    * {
      box-sizing: border-box;
    }

    a {
      color: var(--link);

      &:active {
        color: var(--link-active);
      }
    }
  }
</style>
