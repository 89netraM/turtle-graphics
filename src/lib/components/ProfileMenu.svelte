<script lang="ts">
  let {
    username = null,
    pin = null,
    onSignIn = () => {},
  } = $props<{
    username: string | null;
    pin: string | null;
    onSignIn?: () => void;
  }>();

  let showMenu = $state(false);

  function toggleMenu() {
    showMenu = !showMenu;
  }

  function closeMenu() {
    showMenu = false;
  }

  function handleSignInClick() {
    onSignIn();
  }

  async function handleLogout() {
    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        // Reload the page to clear the session
        window.location.reload();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  // Close menu when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest(".profile-menu")) {
      closeMenu();
    }
  }

  $effect(() => {
    if (showMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  });
</script>

<div class="profile-menu">
  {#if username}
    <button class="profile-icon" onclick={toggleMenu} type="button">
      <!-- Temporary profile icon placeholder -->
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
        <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" />
        <path
          d="M6 18.5C6 16 8 14 12 14C16 14 18 16 18 18.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>

    {#if showMenu}
      <div class="popup">
        <div class="popup-header">
          <h3>{username}</h3>
        </div>
        <div class="popup-content">
          <div class="pin-section">
            <label>Your PIN:</label>
            <div class="pin-display">{pin || "••••••"}</div>
            <p class="pin-hint">Share this PIN with your team members</p>
          </div>
          <button type="button" class="logout-button" onclick={handleLogout}>Sign Out</button>
        </div>
      </div>
    {/if}
  {:else}
    <button class="sign-in-button" onclick={handleSignInClick} type="button">Sign In</button>
  {/if}
</div>

<style>
  .profile-menu {
    position: relative;
    margin-left: auto;
  }

  .profile-icon {
    background: none;
    border: none;
    color: var(--text);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  }

  .profile-icon:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .popup {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background-color: var(--ui-background);
    border: 2px solid var(--edge);
    border-radius: 0.5rem;
    min-width: 250px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    z-index: 100;
  }

  .popup-header {
    padding: 1rem;
    border-bottom: 1px solid var(--edge);
  }

  .popup-header h3 {
    margin: 0;
    color: var(--text);
    font-family: "Barlow Condensed", sans-serif;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .popup-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .pin-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .pin-section label {
    color: var(--text-dim);
    font-size: 0.875rem;
    font-weight: 600;
  }

  .pin-display {
    background-color: var(--editor-background);
    border: 2px solid var(--edge);
    border-radius: 0.25rem;
    padding: 0.75rem;
    color: var(--link);
    font-family: monospace;
    font-size: 1.25rem;
    text-align: center;
    letter-spacing: 0.2em;
    font-weight: 600;
  }

  .pin-hint {
    color: var(--text-dim);
    font-size: 0.75rem;
    margin: 0;
    text-align: center;
  }

  .logout-button {
    width: 100%;
    padding: 0.5rem 1rem;
    background-color: var(--ui-background);
    border: 2px solid var(--edge);
    color: var(--text);
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
  }

  .logout-button:hover {
    background-color: #424242;
  }

  .sign-in-button {
    padding: 0.5rem 1rem;
    background-color: var(--link);
    border: 2px solid var(--link);
    color: var(--secondary-text);
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
  }

  .sign-in-button:hover {
    background-color: #cc9500;
  }
</style>
