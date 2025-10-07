<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import favicon from "$lib/assets/favicon.svg";
  import "@fontsource/barlow/latin-400.css";
  import "@fontsource/barlow-condensed/latin-600.css";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<nav>
  <h1><a href={resolve("/")} aria-current={page.url.pathname === "/"}>Turtle Code</a></h1>
  <p><a href={resolve("/editor")} aria-current={page.url.pathname === "/editor"}>Editor</a></p>
  <p><a href={resolve("/documentation")} aria-current={page.url.pathname === "/documentation"}>Documentation</a></p>
</nav>

<main>
  {@render children?.()}
</main>

<style>
  :global(#body) {
    display: grid;
    width: 100%;
    height: 100dvh;
    grid-template-areas: "nav" "main";
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr;
    overflow: hidden auto;
  }

  nav {
    grid-area: nav;
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 1rem;
    background-color: var(--ui-background);
    padding: 0.5rem 1rem;
    position: sticky;
    top: 0;

    h1,
    p {
      margin: 0;
    }
    a {
      color: var(--text);
      font-family: "Barlow Condensed", sans-serif;
      font-weight: 600;
      text-decoration: none;
      border-block-end-width: 0.15rem;
      border-block-end-style: solid;
      border-block-end-color: transparent;
      transition: border-block-end-color 0.1s linear;

      &:hover {
        border-block-end-color: var(--text);
      }

      &[aria-current="true"] {
        border-block-end-color: var(--link);
      }
    }
  }

  main {
    grid-area: main;
    container-type: size;
  }
</style>
