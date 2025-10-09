<script lang="ts">
  import type { Pathname } from "$app/types";
  import {
    DocumentationText,
    DocumentationTextCode,
    DocumentationTextLink,
    DocumentationTextPlain,
    getJsWorkerTypings,
  } from "$lib/jsWorker";

  const functions = getJsWorkerTypings();
</script>

<article>
  <h1>Documentation</h1>

  <p>The turtle starts with the pen up at the bottom center of a 640 by 360 rectangle.</p>

  {#each functions as func (func.name)}
    <h2>Function <code>{func.name}</code></h2>
    <pre data-lang="text/typescript" class="vs"><span class="mtk1">&nbsp;&nbsp;</span><span class="mtk1"
        >{func.name}</span
      ><span class="mtk1">(</span>{#each func.parameters as param, i (param.name)}<span class="mtk1">{param.name}</span
        ><span class="mtk1">:&nbsp;</span><span class="mtk6">{param.type}</span
        >{#if i < func.parameters.length - 1}<span class="mtk1">,&nbsp;</span>{/if}{/each}<span class="mtk1">)</span
      ><span class="mtk1">:&nbsp;</span><span class="mtk6">{func.returnType}</span></pre>
    <p>{@render content(func.description)}</p>
    {#if func.parameters.length > 0}
      <p><strong>Parameters</strong>:</p>
      <ol>
        {#each func.parameters as param (param.name)}
          <li>
            <p>
              <code class="vs">
                <span class="mtk1">{param.name}</span><span class="mtk1">:&nbsp;</span><span class="mtk6"
                  >{param.type}</span
                >
              </code>
            </p>
            <p>{@render content(param.description)}</p>
          </li>
        {/each}
      </ol>
    {/if}
    <p><strong>Returns</strong>: <code class="vs"><span class="mtk6">{func.returnType}</span></code></p>
  {/each}
</article>

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

<style>
  .vs {
    .mtk1 {
      color: var(--text);
    }
    .mtk6 {
      color: var(--keyword);
    }
  }

  article {
    margin-inline-start: 2rem;
    padding-block-end: 1rem;
    width: 80ch;

    h2 {
      margin-block: 0.75em 0em;

      &:not(:first-of-type) {
        border-block-start: 2px solid var(--edge);
        padding-block-start: 0.65em;
      }
    }
    pre {
      margin-block-start: 0.5em;
    }

    p:has(+ ol) {
      margin-block-end: 0;
    }

    ol {
      list-style: none;
      margin-block-start: 0em;
      padding-inline-start: 2ch;

      li {
        margin-block-end: 0.5em;

        p {
          margin-block: 0;

          &:not(:first-of-type) {
            margin-inline-start: 2ch;
          }
        }
      }
    }
  }
</style>
