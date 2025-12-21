<script lang="ts">
  import { resolve } from "$app/paths";
  import type { ChallengeInfo } from "$lib/ChallengeInfo";

  interface Props extends ChallengeInfo {
    state?: "CLOSED" | "NOT_YET_OPEN" | "OPEN" | "READ_ONLY";
  }

  let { id, name, image, state }: Props = $props();
</script>

<a class="challenge-card" href={resolve(`/challenges/${id}`)}>
  {#if state === "OPEN"}
    <span class="badge badge-open">Open</span>
  {:else if state === "READ_ONLY"}
    <span class="badge badge-readonly">Read-Only</span>
  {/if}
  <img src={image} alt={name} />
  <span class="name">{name}</span>
</a>

<style>
  a {
    display: block;
    position: relative;
    z-index: 0;
    border-radius: 1rem;
    box-shadow: 0 0.25rem 0.5rem #000000;
    transition: box-shadow 0.25s ease-out;
    container-type: scroll-state;

    &:hover {
      box-shadow: 0 0.5rem 1rem #000000;
    }

    img {
      width: 100%;
    }

    .name {
      display: block;
      position: absolute;
      left: 2cqmin;
      right: 2cqmin;
      bottom: 1cqmin;
    }

    .badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      z-index: 1;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

      &.badge-open {
        background-color: #4caf50;
        color: white;
      }

      &.badge-readonly {
        background-color: #ff9800;
        color: white;
      }
    }
  }
</style>
