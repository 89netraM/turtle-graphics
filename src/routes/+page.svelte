<script lang="ts">
  import TurtlePreview from "$lib/components/TurtlePreview.svelte";
  import { onMount } from "svelte";

  const animationSpeed = 100;

  let { data } = $props();

  let animationDistance = $state(0);

  onMount(() => {
    let previousTime: DOMHighResTimeStamp | null = null;
    let animationId = requestAnimationFrame(animate);

    function animate(time: DOMHighResTimeStamp) {
      if (previousTime != null) {
        const deltaTime = time - previousTime;
        animationDistance += (animationSpeed * deltaTime) / 1000;
      }
      previousTime = time;
      animationId = requestAnimationFrame(animate);
    }
    return () => {
      cancelAnimationFrame(animationId);
    };
  });
</script>

<main>
  <section class="turtle-demo">
    <h1>Welcome to <span class="turtle-code">Turtle Code</span></h1>
    <p>
      Unleash your creativity through code! Join us in an exciting journey of programming where you'll bring a virtual
      turtle to life.
    </p>

    <div
      onclickcapture={() => (animationDistance = 0)}
      onkeydowncapture={(e) => e.key === " " && ((animationDistance = 0), e.preventDefault())}
      role="button"
      tabindex="0"
    >
      <TurtlePreview actions={data.actions} width={640} height={360} distance={animationDistance} drawTurtle={true} />
    </div>
  </section>

  <section class="dark-challenge">
    <h2>Code in the Dark Challenge!</h2>
    <p class="challenge-description">
      Think you can code without seeing the result? In this unique challenge, you'll write your turtle commands blind
      and only see your masterpiece when you're done! Will your geometric creation match what's in your mind?
    </p>
    <div class="feature-list">
      <div>
        <span class="icon">🎯</span>
        <span>Code without preview</span>
      </div>
      <div>
        <span class="icon">🎨</span>
        <span>Reveal your artwork at the end</span>
      </div>
      <div>
        <span class="icon">🏆</span>
        <span>Compare with others</span>
      </div>
    </div>
    <div class="challenge-preview">
      <div class="mystery-box">
        <p>???</p>
        <span>Your creation awaits!</span>
      </div>
    </div>
  </section>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding-block-end: 2rem;

    section {
      max-width: 80ch;

      h1,
      h2,
      p {
        padding-inline: 10%;
      }

      h1 {
        font-size: 4rem;
        text-align: center;
      }

      .turtle-code {
        color: var(--link);
      }
    }

    section.turtle-demo {
      > div {
        width: 100%;
        container-type: size;
        aspect-ratio: 16 / 9;

        :global(> *) {
          border: 2px solid var(--edge);
        }
      }
    }

    section.dark-challenge {
      display: grid;
      grid-template-areas:
        "header header"
        "paragraph paragraph"
        "features  mystery";
      grid-template-rows: auto auto auto;
      grid-template-columns: 1fr 1fr;

      h2 {
        grid-area: header;
        font-size: 3rem;
        text-align: center;
      }

      p {
        grid-area: paragraph;
        margin-block-start: 0;
      }

      .feature-list {
        grid-area: features;
        align-self: center;
        display: flex;
        flex-direction: column;
        gap: 1rem;

        > div {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 1.1rem;

          > .icon {
            font-size: 1.5rem;
          }
        }
      }

      .mystery-box {
        grid-area: mystery;
        background: #2c2c2c;
        border: 2px dashed #4a4a4a;
        border-radius: 0.5rem;
        height: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        cursor: default;
        user-select: none;
        transition: border-color 0.3s ease;

        > p {
          font-size: 4rem;
          margin: 0;
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }

        > span {
          position: absolute;
          bottom: 1rem;
          font-size: 0.9rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: color 0.3s ease;
        }

        &:hover {
          border-color: var(--link);

          > p {
            opacity: 0.75;
          }

          > span {
            color: var(--link);
          }
        }
      }
    }
  }
</style>
