<script lang="ts">
  import type { Challenge } from "$lib/server/dynamodb";

  let { data, form } = $props();

  let editingChallenge = $state<Challenge | null>(null);
  let showCreateForm = $state(false);
  let deleteConfirmId = $state<string | null>(null);

  function startEdit(challenge: Challenge) {
    editingChallenge = { ...challenge };
    showCreateForm = false;
  }

  function cancelEdit() {
    editingChallenge = null;
  }

  function toggleCreateForm() {
    showCreateForm = !showCreateForm;
    editingChallenge = null;
  }
</script>

<main>
  <h1>Manage Challenges</h1>

  {#if data.isReadOnly}
    <div class="warning">
      <strong>Read-Only Mode:</strong> Challenges cannot be modified during an active challenge timespan.
    </div>
  {/if}

  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}

  {#if form?.success}
    <p class="success">Operation completed successfully!</p>
  {/if}

  <section class="create-section">
    <button type="button" onclick={toggleCreateForm} disabled={data.isReadOnly}>
      {showCreateForm ? "Cancel" : "Create New Challenge"}
    </button>

    {#if showCreateForm}
      <form method="POST" action="?/create" enctype="multipart/form-data" class="challenge-form">
        <label>
          <span>Challenge Title:</span>
          <input type="text" name="title" required maxlength="100" />
        </label>

        <label>
          <span>Goal Image:</span>
          <input type="file" name="image" accept="image/*" required />
        </label>

        <div class="buttons">
          <button type="submit">Create Challenge</button>
          <button type="button" class="secondary" onclick={toggleCreateForm}>Cancel</button>
        </div>
      </form>
    {/if}
  </section>

  <section class="challenges-list">
    <h2>Existing Challenges ({data.challenges.length})</h2>

    {#if data.challenges.length === 0}
      <p class="empty-state">No challenges yet. Create your first challenge to get started!</p>
    {:else}
      <div class="challenges-grid">
        {#each data.challenges as challenge (challenge.id)}
          <div class="challenge-card">
            <div class="challenge-image">
              <img src={challenge.imageUrl} alt={challenge.title} />
            </div>

            <div class="challenge-info">
              <h3>{challenge.title}</h3>
              <p class="meta">
                Created: {challenge.createdAt.toLocaleDateString()}<br />
                Updated: {challenge.updatedAt.toLocaleDateString()}
              </p>
            </div>

            <div class="challenge-actions">
              <button type="button" onclick={() => startEdit(challenge)} disabled={data.isReadOnly} class="secondary">
                Edit
              </button>
              <button
                type="button"
                onclick={() => (deleteConfirmId = challenge.id)}
                disabled={data.isReadOnly}
                class="danger"
              >
                Delete
              </button>
            </div>

            {#if deleteConfirmId === challenge.id}
              <div class="delete-confirm">
                <p>Are you sure you want to delete "{challenge.title}"?</p>
                <form method="POST" action="?/delete">
                  <input type="hidden" name="id" value={challenge.id} />
                  <input type="hidden" name="imageUrl" value={challenge.imageUrl} />
                  <div class="buttons">
                    <button type="submit" class="danger">Yes, Delete</button>
                    <button type="button" class="secondary" onclick={() => (deleteConfirmId = null)}> Cancel </button>
                  </div>
                </form>
              </div>
            {/if}

            {#if editingChallenge && editingChallenge.id === challenge.id}
              <div class="edit-form">
                <h4>Edit Challenge</h4>
                <form method="POST" action="?/update" enctype="multipart/form-data">
                  <input type="hidden" name="id" value={challenge.id} />
                  <input type="hidden" name="existingImageUrl" value={challenge.imageUrl} />

                  <label>
                    <span>Challenge Title:</span>
                    <input type="text" name="title" value={editingChallenge.title} required maxlength="100" />
                  </label>

                  <label>
                    <span>Replace Image (optional):</span>
                    <input type="file" name="image" accept="image/*" />
                  </label>

                  <div class="buttons">
                    <button type="submit">Update Challenge</button>
                    <button type="button" class="secondary" onclick={cancelEdit}>Cancel</button>
                  </div>
                </form>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </section>
</main>

<style>
  main {
    padding: 2rem;
    max-width: 1200px;
  }

  h1 {
    margin-bottom: 1.5rem;
  }

  section {
    margin-bottom: 2rem;
  }

  .warning {
    padding: 1rem;
    background-color: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    color: #856404;
  }

  .error {
    color: var(--error-text, #d32f2f);
    margin-bottom: 1rem;
    padding: 0.75rem;
    background-color: #ffebee;
    border-radius: 4px;
  }

  .success {
    color: #2e7d32;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background-color: #e8f5e9;
    border-radius: 4px;
  }

  .create-section button[type="button"]:first-child {
    margin-bottom: 1rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    background-color: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      opacity: 0.9;
    }
  }

  .challenge-form {
    padding: 1.5rem;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 8px;
    background-color: #f9f9f9;
  }

  .challenges-list h2 {
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
  }

  .empty-state {
    padding: 2rem;
    text-align: center;
    color: var(--text-secondary, #666);
    font-style: italic;
  }

  .challenges-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .challenge-card {
    border: 1px solid var(--border-color, #ddd);
    border-radius: 8px;
    overflow: hidden;
    background-color: white;
  }

  .challenge-image {
    width: 100%;
    aspect-ratio: 1;
    background-color: #f5f5f5;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .challenge-info {
    padding: 1rem;

    h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
    }

    .meta {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
      line-height: 1.6;
    }
  }

  .challenge-actions {
    padding: 0 1rem 1rem;
    display: flex;
    gap: 0.5rem;
  }

  .delete-confirm {
    padding: 1rem;
    background-color: #ffebee;
    border-top: 1px solid #ef5350;

    p {
      margin: 0 0 0.75rem 0;
      font-weight: 500;
    }
  }

  .edit-form {
    padding: 1rem;
    background-color: #e3f2fd;
    border-top: 1px solid #2196f3;

    h4 {
      margin: 0 0 1rem 0;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    span {
      font-weight: 500;
      font-size: 0.9rem;
    }

    input {
      padding: 0.5rem;
      font-size: 1rem;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 4px;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  button {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.2s;
    background-color: #1976d2;
    color: white;
    flex: 1;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      opacity: 0.9;
    }

    &.secondary {
      background-color: #f5f5f5;
      color: #333;
      border: 1px solid var(--border-color, #ddd);
    }

    &.danger {
      background-color: #d32f2f;
      color: white;
    }
  }
</style>
