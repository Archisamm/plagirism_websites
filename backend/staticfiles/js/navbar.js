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
    
    // Add mobile menu functionality
    addMobileMenuListener();
    return;
  }

  // ============================================
  // PROTECTED NAVBAR (For authenticated users)
  // ============================================
  function logout() {
    window.location.href = "/accounts/logout/";
  }

  // Function to set active link based on current path/hash
  function setActiveLink() {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("active");
      
      const href = link.getAttribute("href");
      
      // Check if it's a dashboard link with hash
      if (path === '/dashboard/' && href.startsWith('/dashboard/#')) {
        if (hash && href.includes(hash)) {
          link.classList.add("active");
        }
      }
      // Regular path matching
      else if (href === path) {
        link.classList.add("active");
      }
    });
  }

  // Function to handle smooth scrolling to sections
  function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  navbar.innerHTML = `
    <div class="nav-wrapper">
      <div class="brand">
        <span class="brand-icon">🤖</span>
        BRI AI
      </div>

      <ul class="nav-links">
        <li><a class="nav-link" href="/dashboard/">🏠 Dashboard</a></li>
        <li><a class="nav-link" href="/dashboard/#upload">📤 Upload</a></li>
        <li><a class="nav-link" href="/dashboard/#results">📊 Results</a></li>
        <li><a class="nav-link" href="/dashboard/#reports">📄 Reports</a></li>
        <li><a class="nav-link" href="/dashboard/#citations">📚 Citations</a></li>
        <li><a class="nav-link" href="/dashboard/#similarity">📈 Similarity</a></li>
        <li><a class="nav-link" href="/dashboard/#history">🕒 History</a></li>
        <li><a class="nav-link" href="/dashboard/#copyright">©️ Copyright</a></li>
        <li><a class="nav-link" href="/dashboard/#settings">⚙️ Settings</a></li>
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

  // Add click handlers for dashboard navigation with smooth scroll
  document.querySelectorAll('.nav-link[href^="/dashboard/#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      const sectionId = href.split('#')[1];
      
      // If we're not on dashboard page, navigate there first
      if (window.location.pathname !== '/dashboard/') {
        window.location.href = href;
      } else {
        // We're already on dashboard, just scroll
        scrollToSection(sectionId);
        // Update URL hash without page jump
        history.pushState(null, null, href);
        setActiveLink();
      }
    });
  });

  // Handle dashboard home link
  document.querySelector('.nav-link[href="/dashboard/"]')?.addEventListener('click', (e) => {
    if (window.location.pathname === '/dashboard/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.pushState(null, null, '/dashboard/');
      setActiveLink();
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", logout);
  
  // Set active link on page load
  setActiveLink();
  
  // Add scroll event listener for active link highlighting
  window.addEventListener('scroll', () => {
    if (window.location.pathname === '/dashboard/') {
      highlightSectionOnScroll();
    }
  });
  
  // Check if URL has hash on load and scroll to that section
  if (window.location.pathname === '/dashboard/' && window.location.hash) {
    const sectionId = window.location.hash.substring(1);
    setTimeout(() => {
      scrollToSection(sectionId);
    }, 200);
  }

  // Add mobile menu functionality
  addMobileMenuListener();
});

// Helper function to highlight active section while scrolling
function highlightSectionOnScroll() {
  const sections = ['upload', 'results', 'reports', 'citations', 'similarity', 'history', 'copyright', 'settings'];
  const scrollPosition = window.scrollY + 100;

  sections.forEach(section => {
    const element = document.getElementById(section);
    if (element) {
      const { offsetTop, offsetHeight } = element;
      if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
        });
        
        // Add active class to corresponding nav link
        const activeLink = document.querySelector(`.nav-link[href="/dashboard/#${section}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    }
  });
}

// Mobile menu functionality
function addMobileMenuListener() {
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");
  
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("show");
      
      // Animate menu button
      if (navLinks.classList.contains("show")) {
        menuBtn.innerHTML = "✕";
      } else {
        menuBtn.innerHTML = "☰";
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove("show");
        menuBtn.innerHTML = "☰";
      }
    });
    
    // Close menu when clicking a link
    navLinks.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("show");
        menuBtn.innerHTML = "☰";
      });
    });
  }
}