document.addEventListener("DOMContentLoaded", async () => {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

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

  // Public pages that don't require auth
  const publicPages = ['/', '/home/', '/index/', '/features/', '/pricing/', '/about/', '/contact/', '/login/', '/signup/', '/forgot-password/'];
  const currentPath = window.location.pathname;
  const isPublicPage = publicPages.includes(currentPath);

  // PUBLIC NAVBAR
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
          <li><a class="nav-link" href="/login/">🔐 Sign In</a></li>
        </ul>
        <button class="mobile-menu-btn">☰</button>
      </div>
    `;
    addMobileMenuListener();
    return;
  }

  // PROTECTED NAVBAR
  function logout() {
    window.location.href = "/accounts/logout/";
  }

  navbar.innerHTML = `
    <div class="nav-wrapper">
      <a href="/dashboard/" class="brand">
        <span class="brand-icon">🤖</span>
        BRI AI
      </a>

      <ul class="nav-links">
        <li><a class="nav-link" href="/dashboard/">🏠 Dashboard</a></li>
      </ul>

      <div class="nav-right">
        <span class="user-tag">
          👤 ${user.display_name || user.email?.split('@')[0] || 'User'}
        </span>
        <button class="logout-btn" id="logoutBtn">
          🚪 Logout
        </button>
      </div>
      <button class="mobile-menu-btn">☰</button>
    </div>
  `;

  document.getElementById("logoutBtn").addEventListener("click", logout);
  addMobileMenuListener();
});

// Mobile menu functionality
function addMobileMenuListener() {
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");
  
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("show");
      menuBtn.innerHTML = navLinks.classList.contains("show") ? "✕" : "☰";
    });
  }
}