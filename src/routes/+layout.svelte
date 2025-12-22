<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import favicon from "$lib/assets/favicon.svg";
  import ProfileMenu from "$lib/components/ProfileMenu.svelte";
  import AuthModal from "$lib/components/AuthModal.svelte";
  import PinDisplayModal from "$lib/components/PinDisplayModal.svelte";
  import "@fontsource/barlow/latin-400.css";
  import "@fontsource/barlow-condensed/latin-400.css";
  import "@fontsource/barlow-condensed/latin-600.css";

  let { children, data } = $props();

  let showAuthModal = $state(false);
  let showPinModal = $state(false);
  let newPin = $state("");
  let newGroupName = $state("");

  function handleSignIn() {
    showAuthModal = true;
  }

  function handleAuthSuccess(pin?: string, groupName?: string) {
    if (pin && groupName) {
      newPin = pin;
      newGroupName = groupName;
      showPinModal = true;
    } else {
      window.location.reload();
    }
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<nav>
  <h1><a href={resolve("/")} aria-current={page.url.pathname === "/"}>Turtle Code</a></h1>
  <p><a href={resolve("/challenges")} aria-current={page.url.pathname.startsWith("/challenges")}>Challenges</a></p>
  <p><a href={resolve("/playground")} aria-current={page.url.pathname === "/playground"}>Playground</a></p>
  <p><a href={resolve("/documentation")} aria-current={page.url.pathname === "/documentation"}>Documentation</a></p>
  <ProfileMenu username={data.user?.username ?? null} pin={data.user?.pin ?? null} onSignIn={handleSignIn} />
</nav>

<main>
  {@render children?.()}
</main>

<AuthModal isOpen={showAuthModal} onClose={() => (showAuthModal = false)} onSuccess={handleAuthSuccess} />

<PinDisplayModal
  isOpen={showPinModal}
  pin={newPin}
  groupName={newGroupName}
  onClose={() => {
    showPinModal = false;
    window.location.reload();
  }}
/>

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
    z-index: 10;

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
