document.addEventListener("DOMContentLoaded", async () => {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  // Get current path
  const currentPath = window.location.pathname;
  
  // Public pages that don't require auth
  const publicPages = ['/', '/home/', '/index/', '/features/', '/pricing/', '/about/', '/contact/', '/login/', '/signup/', '/forgot-password/'];
  const isPublicPage = publicPages.includes(currentPath);

  // Get user info from backend
  async function getMe() {
    try {
      const res = await fetch("/accounts/me/");
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  const user = await getMe();

  // ============================================
  // PUBLIC NAVBAR (For landing pages)
  // ============================================
  if (isPublicPage || !user) {
    navbar.innerHTML = `
      <div class="nav-wrapper">
        <div class="brand">
          <span class="brand-icon">🤖</span>
          BRI AI
        </div>
        <ul class="nav-links">
          <li><a class="nav-link" href="/">🏠 Home</a></li>
          <li><a class="nav-link" href="/#features">✨ Features</a></li>
          <li><a class="nav-link" href="/#pricing">💰 Pricing</a></li>
          <li><a class="nav-link" href="/about/">📖 About</a></li>
          <li><a class="nav-link" href="/contact/">📞 Contact</a></li>
          <li><a class="nav-link btn-primary" href="/login/">🔐 Sign In</a></li>
        </ul>
        <button class="mobile-menu-btn">☰</button>
      </div>
    `;
    return;
  }

  // ============================================
  // PROTECTED NAVBAR (For authenticated users)
  // ============================================
  function logout() {
    window.location.href = "/accounts/logout/";
  }

  navbar.innerHTML = `
    <div class="nav-wrapper">
      <div class="brand">
        <span class="brand-icon">🤖</span>
        BRI AI
      </div>

      <ul class="nav-links">
        <li><a class="nav-link" href="/dashboard/">🏠 Dashboard</a></li>
        <li><a class="nav-link" href="/">🌐 Visit Site</a></li>
      </ul>

      <div class="nav-right">
        <span class="user-tag">
          👤 ${user.display_name || user.email || 'User'}
        </span>
        <button class="logout-btn" id="logoutBtn">
          🚪 Logout
        </button>
      </div>
      <button class="mobile-menu-btn">☰</button>
    </div>
  `;

  document.getElementById("logoutBtn").addEventListener("click", logout);
});