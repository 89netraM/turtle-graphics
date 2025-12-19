<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";

  let { data, children } = $props();
</script>

{#if data.isSignedIn}
  <div id="admin">
    <nav>
      <h1>Admin Pages</h1>
      <ul>
        <li><a href={resolve("/admin")} aria-current={page.url.pathname === "/admin"}>Admin</a></li>
        <li>
          <a
            href={resolve("/admin/playground-settings")}
            aria-current={page.url.pathname === "/admin/playground-settings"}>Playground Settings</a
          >
        </li>
      </ul>
    </nav>
    <main>
      {@render children()}
    </main>
  </div>
{:else}
  {@render children()}
{/if}

<style>
  #admin {
    min-height: 100cqh;
    display: grid;
    grid-template-areas: "nav main";
    grid-template-columns: auto 1fr;

    nav {
      grid-area: nav;
      width: 25ch;
      background-color: var(--ui-background);
      padding: 1rem;
      padding-inline-end: 0.5rem;

      h1 {
        margin: 0;
      }

      ul {
        list-style: none;
        padding: 0;
        margin-block: 0.5rem;

        li {
          a {
            color: var(--text);

            &[aria-current="true"] {
              color: var(--link);
            }
          }
        }
      }
    }

    main {
      grid-area: main;
      container-type: size;
    }
  }
</style>
