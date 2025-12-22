<script lang="ts">
  let {
    status = "Not submitted",
    lastSubmittedAt = null,
    onSubmit = () => {},
    onLoadFromDB = () => {},
    isSubmitting = false,
    isLoading = false,
    isReadonly = false,
  } = $props<{
    status: "Not submitted" | "Submitted" | "Modified";
    lastSubmittedAt: Date | null;
    onSubmit: () => void;
    onLoadFromDB: () => void;
    isSubmitting?: boolean;
    isLoading?: boolean;
    isReadonly?: boolean;
  }>();

  function formatTimestamp(date: Date | null): string {
    if (!date) return "";

    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than 1 minute
    if (diff < 60000) {
      return "Just now";
    }

    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }

    // More than 24 hours - show date and time
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusClass(status: string): string {
    if (status === "Not submitted") return "status-not-submitted";
    if (status === "Submitted") return "status-submitted";
    if (status === "Modified") return "status-modified";
    return "";
  }
</script>

<div class="submission-status-bar">
  <div class="status-info">
    <div class="status-indicator">
      <span class="status-dot {getStatusClass(status)}"></span>
      <span class="status-text">{status}</span>
    </div>
    {#if lastSubmittedAt}
      <span class="timestamp">{formatTimestamp(lastSubmittedAt)}</span>
    {/if}
  </div>

  <div class="actions">
    <button
      class="load-button"
      onclick={onLoadFromDB}
      disabled={isLoading || isSubmitting || status === "Not submitted"}
      type="button"
      title="Load latest submission from database"
    >
      {isLoading ? "Loading..." : "Load from DB"}
    </button>

    <button class="submit-button" onclick={onSubmit} disabled={isSubmitting || isLoading || isReadonly} type="button">
      {isSubmitting ? "Submitting..." : "Submit"}
    </button>
  </div>
</div>

<style>
  .submission-status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: var(--ui-background);
    border: 2px solid var(--edge);
    border-radius: 0.25rem;
    gap: 1rem;
  }

  .status-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    display: inline-block;
  }

  .status-dot.status-not-submitted {
    background-color: var(--text-dim);
  }

  .status-dot.status-submitted {
    background-color: #4caf50;
  }

  .status-dot.status-modified {
    background-color: var(--link);
  }

  .status-text {
    color: var(--text);
    font-weight: 600;
    font-size: 0.875rem;
  }

  .timestamp {
    color: var(--text-dim);
    font-size: 0.75rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .load-button,
  .submit-button {
    padding: 0.5rem 1rem;
    border: 2px solid var(--edge);
    border-radius: 0.25rem;
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .load-button {
    background-color: var(--ui-background);
    color: var(--text);
  }

  .load-button:hover:not(:disabled) {
    background-color: #424242;
  }

  .load-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .submit-button {
    background-color: var(--link);
    color: var(--secondary-text);
    border-color: var(--link);
  }

  .submit-button:hover:not(:disabled) {
    background-color: #cc9500;
  }

  .submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
