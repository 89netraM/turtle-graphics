<script lang="ts">
  let {
    isOpen = false,
    pin = "",
    groupName = "",
    onClose = () => {},
  } = $props<{
    isOpen: boolean;
    pin: string;
    groupName: string;
    onClose: () => void;
  }>();

  let copied = $state(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(pin);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (e) {
      // Clipboard API might not be available
      console.error("Failed to copy to clipboard:", e);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" || event.key === "Enter") {
      onClose();
    }
  }
</script>

{#if isOpen}
  <div class="modal-overlay" onclick={onClose} onkeydown={handleKeydown} role="presentation">
    <div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
      <div class="modal-header">
        <h2>Group Created!</h2>
        <button class="close-button" onclick={onClose} type="button" aria-label="Close">×</button>
      </div>

      <div class="modal-content">
        <p class="success-message">
          Your group <strong>{groupName}</strong> has been created successfully!
        </p>

        <div class="pin-section">
          <label>Your PIN:</label>
          <div class="pin-display">{pin}</div>
          <button class="copy-button" onclick={copyToClipboard} type="button">
            {copied ? "Copied!" : "Copy PIN"}
          </button>
        </div>

        <div class="info-box">
          <p><strong>Important:</strong></p>
          <ul>
            <li>Save this PIN - you'll need it to sign in</li>
            <li>Share this PIN with your team members so they can join your group</li>
            <li>You can view your PIN anytime from the profile menu</li>
          </ul>
        </div>

        <div class="modal-actions">
          <button class="primary" onclick={onClose} type="button">Got it!</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
  }

  .modal {
    background-color: var(--ui-background);
    border: 2px solid var(--edge);
    border-radius: 0.5rem;
    min-width: 400px;
    max-width: 500px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.6);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 2px solid var(--edge);
  }

  .modal-header h2 {
    margin: 0;
    color: var(--link);
    font-family: "Barlow Condensed", sans-serif;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .close-button {
    background: none;
    border: none;
    color: var(--text);
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
  }

  .close-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .modal-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .success-message {
    color: var(--text);
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
  }

  .success-message strong {
    color: var(--link);
  }

  .pin-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background-color: var(--editor-background);
    border-radius: 0.5rem;
    border: 2px solid var(--link);
  }

  .pin-section label {
    color: var(--text-dim);
    font-size: 0.875rem;
    font-weight: 600;
    text-align: center;
  }

  .pin-display {
    background-color: var(--ui-background);
    border: 2px solid var(--edge);
    border-radius: 0.25rem;
    padding: 1rem;
    color: var(--link);
    font-family: monospace;
    font-size: 1.5rem;
    text-align: center;
    letter-spacing: 0.3em;
    font-weight: 600;
  }

  .copy-button {
    padding: 0.5rem 1rem;
    background-color: var(--ui-background);
    border: 2px solid var(--edge);
    border-radius: 0.25rem;
    color: var(--text);
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .copy-button:hover {
    background-color: #424242;
  }

  .info-box {
    background-color: rgba(255, 174, 0, 0.1);
    border: 1px solid var(--link);
    border-radius: 0.25rem;
    padding: 1rem;
    color: var(--text);
  }

  .info-box p {
    margin: 0 0 0.5rem 0;
    color: var(--link);
    font-weight: 600;
  }

  .info-box ul {
    margin: 0;
    padding-left: 1.5rem;
    font-size: 0.875rem;
    line-height: 1.6;
  }

  .info-box li {
    margin-bottom: 0.25rem;
  }

  .modal-actions {
    display: flex;
    justify-content: center;
  }

  .modal-actions button.primary {
    padding: 0.75rem 2rem;
    background-color: var(--link);
    color: var(--secondary-text);
    border: 2px solid var(--link);
    border-radius: 0.25rem;
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .modal-actions button.primary:hover {
    background-color: #cc9500;
  }
</style>
