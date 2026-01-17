<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import TurtlePreview from "$lib/components/TurtlePreview.svelte";
  import type { TurtleAction } from "$lib/turtle-graphics/TurtleAction";

  let { data } = $props();

  // Predefined turtle paths for decoration
  const squarePath: ReadonlyArray<TurtleAction> = [
    { action: "forward", distance: 90 },
    { action: "pen-down", color: "#ffae00" },
    ...Array.from({ length: 36 }, () => [
      { action: "forward", distance: 100 } as TurtleAction,
      { action: "rotate", angle: 90 } as TurtleAction,
    ]).flat(),
  ];

  const spiralPath: ReadonlyArray<TurtleAction> = [
    { action: "forward", distance: 180 },
    { action: "pen-down", color: "#569cd6" },
    ...Array.from({ length: 36 }, (_, i) => [
      { action: "forward", distance: i * 2 } as TurtleAction,
      { action: "rotate", angle: 10 } as TurtleAction,
    ]).flat(),
  ];

  const starPath: ReadonlyArray<TurtleAction> = [
    { action: "forward", distance: 90 },
    { action: "pen-down", color: "#ffae00" },
    ...Array.from({ length: 12 }, () => [
      { action: "forward", distance: 40 } as TurtleAction,
      { action: "rotate", angle: -Math.PI / 6 } as TurtleAction,
    ]).flat(),
  ];

  // Animation state
  const animationSpeed = 50;
  let animationDistance = $state(0);
  let previousTime = 0;
  let animationFrameId: number | null = null;

  $effect(() => {
    previousTime = performance.now();
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  });

  function animate(time: DOMHighResTimeStamp) {
    const deltaTime = time - previousTime;
    previousTime = time;
    animationDistance += (animationSpeed * deltaTime) / 1000;
    animationFrameId = requestAnimationFrame(animate);
  }

  // Handle keyboard navigation to first challenge
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (data.challenges.length > 0) {
        goto(resolve("/admin/presentation/[challengeId]", { challengeId: data.challenges[0].id }));
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeyPress} />

<div class="title-slide">
  <div class="turtle-bg">
    <div class="turtle turtle-1">
      <TurtlePreview
        drawTurtle={true}
        width={640}
        height={360}
        actions={squarePath}
        distance={animationDistance + 90}
      />
    </div>
    <div class="turtle turtle-2">
      <TurtlePreview
        drawTurtle={true}
        width={640}
        height={360}
        actions={spiralPath}
        distance={animationDistance + 180}
      />
    </div>
    <div class="turtle turtle-3">
      <TurtlePreview drawTurtle={true} width={640} height={360} actions={starPath} distance={animationDistance + 90} />
    </div>
  </div>
  <div class="content">
    <h1>Turtle Graphics</h1>
    <h2>Challenge Submissions</h2>
  </div>
</div>

<style>
  .title-slide {
    width: 100vw;
    height: 100vh;
    background: var(--editor-background);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .turtle-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .turtle {
    position: absolute;
    container-type: size;
    aspect-ratio: 16 / 9;

    :global(> canvas) {
      width: 100cqw;
    }
  }

  .turtle-1 {
    top: 5vh;
    left: 5vw;
    width: 30vw;
  }

  .turtle-2 {
    bottom: 10vh;
    right: 10vw;
    width: 35vw;
  }

  .turtle-3 {
    top: 20vh;
    right: 5vw;
    width: 25vw;
  }

  .content {
    position: relative;
    z-index: 1;
    text-align: center;
    color: var(--text);
  }

  h1 {
    font-size: 6rem;
    margin: 0;
    font-weight: 700;
    animation: fadeInDown 1s ease-out;
  }

  h2 {
    font-size: 3rem;
    margin: 1rem 0 3rem;
    font-weight: 300;
    color: var(--link);
    animation: fadeInUp 1s ease-out 0.3s both;
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
