document.addEventListener("DOMContentLoaded", async () => {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  // ✅ Get user info from backend (role comes from DB)
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

  // ✅ if not logged in -> only show Home + Login
  if (!user) {
    navbar.innerHTML = `
      <div class="nav-wrapper">
        <div class="brand">BRI Plagiarism</div>
        <ul class="nav-links">
          <li><a class="nav-link" href="/">🏠 Home</a></li>
          <li><a class="nav-link" href="/login/">🔐 Sign In</a></li>
        </ul>
      </div>
    `;
    return;
  }

  const role = user.role;

  function logout() {
    window.location.href = "/accounts/logout/";
  }

  function setActiveLink() {
    const path = window.location.pathname;
    document.querySelectorAll(".nav-link").forEach(link => {
      if (link.getAttribute("href") === path) {
        link.classList.add("active");
      }
    });
  }

  function renderNavbar(items) {
    navbar.innerHTML = `
      <div class="nav-wrapper">
        <div class="brand">BRI Plagiarism</div>

        <ul class="nav-links">
          ${items.map(i => `
            <li>
              <a class="nav-link" href="${i.url}">
                ${i.icon} ${i.label}
              </a>
            </li>
          `).join("")}
        </ul>

        <div class="nav-right">
          <span class="user-tag">👤 ${user.display_name || user.email}</span>
          <button class="logout-btn" id="logoutBtn">Logout</button>
        </div>
      </div>
    `;

    document.getElementById("logoutBtn").addEventListener("click", logout);
    setActiveLink();
  }

  // ✅ Role-based menus
  if (role === "student") {
    renderNavbar([
      { label: "Home", url: "/", icon: "🏠" },
      { label: "Dashboard", url: "/student/dashboard/", icon: "📊" },
      { label: "Upload", url: "/student/upload/", icon: "📤" },
      { label: "Results", url: "/student/results/", icon: "✅" },
      { label: "Reports", url: "/student/reports/", icon: "📄" }
    ]);
  }

  if (role === "professional") {
    renderNavbar([
      { label: "Home", url: "/", icon: "🏠" },
      { label: "Dashboard", url: "/professional/dashboard/", icon: "📊" },
      { label: "Upload", url: "/professional/upload/", icon: "📤" },
      { label: "History", url: "/professional/history/", icon: "🕒" },
      { label: "Reports", url: "/professional/reports/", icon: "📄" },
      { label: "Copyright", url: "/professional/copyright/", icon: "©️" }
    ]);
  }

  if (role === "researcher") {
    renderNavbar([
      { label: "Home", url: "/", icon: "🏠" },
      { label: "Dashboard", url: "/researcher/dashboard/", icon: "📊" },
      { label: "Upload", url: "/researcher/upload/", icon: "📤" },
      { label: "Similarity", url: "/researcher/similarity/", icon: "📈" },
      { label: "Citations", url: "/researcher/citations/", icon: "📚" },
      { label: "Results", url: "/researcher/results/", icon: "✅" },
      { label: "Reports", url: "/researcher/reports/", icon: "📄" }
    ]);
  }
});
