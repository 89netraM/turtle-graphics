<script lang="ts">
  let {
    isOpen = false,
    onClose = () => {},
    onSuccess = () => {},
  } = $props<{
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (pin?: string, groupName?: string) => void;
  }>();

  let step = $state<"name" | "password" | "create">("name");
  let groupName = $state("");
  let password = $state("");
  let error = $state("");
  let isChecking = $state(false);
  let isSubmitting = $state(false);

  async function checkUsername() {
    if (!groupName.trim()) {
      error = "Please enter a group name";
      return;
    }

    isChecking = true;
    error = "";

    try {
      const response = await fetch("/auth/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: groupName.trim() }),
      });

      const data = await response.json();

      if (data.exists) {
        step = "password";
      } else {
        step = "create";
      }
    } catch {
      error = "Failed to check username. Please try again.";
    } finally {
      isChecking = false;
    }
  }

  async function handleLogin() {
    if (!password.trim()) {
      error = "Please enter your PIN";
      return;
    }

    isSubmitting = true;
    error = "";

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: groupName.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
        resetModal();
      } else {
        error = data.error || "Invalid PIN. Please try again.";
      }
    } catch {
      error = "Login failed. Please try again.";
    } finally {
      isSubmitting = false;
    }
  }

  async function handleCreate() {
    isSubmitting = true;
    error = "";

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: groupName.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Pass PIN and group name to parent so it can show the PIN modal
        onSuccess(data.pin, groupName.trim());
        resetModal();
      } else {
        error = data.error || "Failed to create account. Please try again.";
      }
    } catch {
      error = "Account creation failed. Please try again.";
    } finally {
      isSubmitting = false;
    }
  }

  function resetModal() {
    step = "name";
    groupName = "";
    password = "";
    error = "";
    onClose();
  }

  function handleBack() {
    step = "name";
    password = "";
    error = "";
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      resetModal();
    } else if (event.key === "Enter") {
      if (step === "name") {
        checkUsername();
      } else if (step === "password") {
        handleLogin();
      } else if (step === "create") {
        handleCreate();
      }
    }
  }
</script>

{#if isOpen}
  <div class="modal-overlay" onclick={resetModal} onkeydown={handleKeydown} role="presentation">
    <div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
      <div class="modal-header">
        <h2>
          {#if step === "name"}
            Enter Group Name
          {:else if step === "password"}
            Welcome Back!
          {:else}
            Create New Group
          {/if}
        </h2>
        <button class="close-button" onclick={resetModal} type="button" aria-label="Close">×</button>
      </div>

      <div class="modal-content">
        {#if error}
          <div class="error-message">{error}</div>
        {/if}

        {#if step === "name"}
          <div class="form-group">
            <label for="groupName">Group Name</label>
            <input id="groupName" type="text" bind:value={groupName} placeholder="Enter your group name" autofocus />
          </div>
          <div class="modal-actions">
            <button class="secondary" onclick={resetModal} type="button">Cancel</button>
            <button class="primary" onclick={checkUsername} disabled={isChecking} type="button">
              {isChecking ? "Checking..." : "Next"}
            </button>
          </div>
        {:else if step === "password"}
          <p class="group-display">Group: <strong>{groupName}</strong></p>
          <div class="form-group">
            <label for="password">PIN</label>
            <input
              id="password"
              type="password"
              bind:value={password}
              placeholder="Enter your 6-digit PIN"
              maxlength="6"
              autofocus
            />
          </div>
          <div class="modal-actions">
            <button class="secondary" onclick={handleBack} type="button">Back</button>
            <button class="primary" onclick={handleLogin} disabled={isSubmitting} type="button">
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </div>
        {:else if step === "create"}
          <p class="group-display">Group: <strong>{groupName}</strong></p>
          <p class="info-message">
            This group doesn't exist yet. Click "Create" to create a new group with this name. You'll receive a PIN that
            you can share with your team members.
          </p>
          <div class="modal-actions">
            <button class="secondary" onclick={handleBack} type="button">Back</button>
            <button class="primary" onclick={handleCreate} disabled={isSubmitting} type="button">
              {isSubmitting ? "Creating..." : "Create Group"}
            </button>
          </div>
        {/if}
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
    z-index: 1000;
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
    color: var(--text);
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
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    color: var(--text);
    font-weight: 600;
    font-size: 0.875rem;
  }

  .form-group input {
    padding: 0.75rem;
    background-color: var(--editor-background);
    border: 2px solid var(--edge);
    border-radius: 0.25rem;
    color: var(--text);
    font-size: 1rem;
    font-family: inherit;
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--link);
  }

  .group-display {
    color: var(--text);
    margin: 0;
    padding: 0.75rem;
    background-color: var(--editor-background);
    border-radius: 0.25rem;
  }

  .group-display strong {
    color: var(--link);
  }

  .info-message {
    color: var(--text-dim);
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .error-message {
    color: var(--error-text);
    background-color: rgba(255, 0, 0, 0.1);
    border: 1px solid var(--error-edge);
    border-radius: 0.25rem;
    padding: 0.75rem;
    font-size: 0.875rem;
  }

  .modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }

  .modal-actions button {
    padding: 0.75rem 1.5rem;
    border: 2px solid var(--edge);
    border-radius: 0.25rem;
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .modal-actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .modal-actions button.secondary {
    background-color: var(--ui-background);
    color: var(--text);
  }

  .modal-actions button.secondary:hover:not(:disabled) {
    background-color: #424242;
  }

  .modal-actions button.primary {
    background-color: var(--link);
    color: var(--secondary-text);
    border-color: var(--link);
  }

  .modal-actions button.primary:hover:not(:disabled) {
    background-color: #cc9500;
  }
</style>
