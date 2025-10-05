<script lang="ts">
  import type { Pathname } from "$app/types";
  import {
    DocumentationText,
    DocumentationTextCode,
    DocumentationTextLink,
    DocumentationTextPlain,
    getJsWorkerTypings,
  } from "$lib/jsWorker";
  import { onMount } from "svelte";

  const functions = getJsWorkerTypings();

  onMount(async () => {
    const monaco = (await import("$lib/monaco")).default;
    // Invoke colorize to load CSS styles
    monaco.editor.colorize("", "", {}).then(
      () => {},
      () => {},
    );
  });
</script>

<h1>Documentation</h1>

{#each functions as func (func.name)}
  <h2>Function <code>{func.name}</code></h2>
  <pre data-lang="text/typescript" class="vs"><span class="mtk1">&nbsp;&nbsp;</span><span class="mtk1">{func.name}</span
    ><span class="mtk1">(</span>{#each func.parameters as param, i (param.name)}<span class="mtk1">{param.name}</span
      ><span class="mtk1">:&nbsp;</span><span class="mtk6">{param.type}</span>{#if i < func.parameters.length - 1}<span
          class="mtk1">,&nbsp;</span
        >{/if}{/each}<span class="mtk1">)</span><span class="mtk1">:&nbsp;</span><span class="mtk6"
      >{func.returnType}</span
    >
  </pre>
  <p>{@render content(func.description)}</p>
  <ol>
    {#each func.parameters as param (param.name)}
      <li>
        <p>
          <code class="vs">
            <span class="mtk1">{param.name}</span><span class="mtk1">:&nbsp;</span><span class="mtk6">{param.type}</span
            >
          </code>
        </p>
        <p>{@render content(param.description)}</p>
      </li>
    {/each}
  </ol>
  <p><strong>Returns</strong>: <code class="vs"><span class="mtk6">{func.returnType}</span></code></p>
{/each}

{#snippet content(contentParts: ReadonlyArray<DocumentationText>)}
  {#each contentParts as part, i (i)}
    {#if part instanceof DocumentationTextPlain}
      <span>{part.text}</span>
    {:else if part instanceof DocumentationTextCode}
      <code>{part.text}</code>
    {:else if part instanceof DocumentationTextLink}
      <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
      <a rel="external" href={part.url as Pathname}>{@render content(part.content)}</a>
    {/if}
  {/each}
{/snippet}
