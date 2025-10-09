<script lang="ts">
  import { resolve } from "$app/paths";
  import type { ChallengeInfo } from "$lib/ChallengeInfo";

  let { id, name, image }: ChallengeInfo = $props();
</script>

<a class="challenge-card" href={resolve(`/challenges/${id}`)}>
  <img src={image} alt={name} />
  <span>{name}</span>
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

    span {
      display: block;
      position: absolute;
      left: 2cqmin;
      right: 2cqmin;
      bottom: 1cqmin;
    }
  }
</style>
