<script lang="ts">
  import ChallengeCard from "$lib/components/ChallengeCard.svelte";

  let { data } = $props();
</script>

<article>
  <h1>Challenges</h1>

  <div class="challenges">
    {#each data.challenges as challenge (challenge.id)}
      <ChallengeCard {...challenge} />
    {:else}
      <p>No challenges available</p>
    {/each}
  </div>
</article>

<style>
  article {
    margin-inline: 2rem;

    .challenges {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      gap: 2rem;

      :global(> .challenge-card) {
        width: 30cqw;
      }
    }
  }
</style>
