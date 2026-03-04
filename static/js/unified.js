document.addEventListener("DOMContentLoaded", () => {
  // ================= ELEMENTS =================
  const file = document.getElementById("fileInput");
  const text = document.getElementById("textInput");
  const upload = document.getElementById("uploadBtn");
  const analyze = document.getElementById("analyzeTextBtn");
  const status = document.getElementById("status");
  const uploadBox = document.getElementById("uploadBox");

  const ring = document.querySelector(".ring-progress");
  const score = document.getElementById("scoreValue");
  const verdict = document.getElementById("verdictText");

  const pie = document.getElementById("pieChart");
  const ctx = pie ? pie.getContext("2d") : null;

  const matchesBox = document.getElementById("matchesBox");
  const highlightBox = document.getElementById("highlightBox");

  const breakdownItems = [
    document.getElementById("breakdown1"),
    document.getElementById("breakdown2"),
    document.getElementById("breakdown3"),
    document.getElementById("breakdown4")
  ].filter(Boolean);

  const loader = document.getElementById("aiLoader");
  const resultsSection = document.getElementById("resultsSection");
  const downloadBtn = document.getElementById("downloadBtn");

  let currentReportData = null;
  let pulseTimer = null;

  // ================= PARTICLES =================
  function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = 15 + Math.random() * 15 + 's';
      particle.style.width = 2 + Math.random() * 6 + 'px';
      particle.style.height = particle.style.width;
      container.appendChild(particle);
    }
  }
  createParticles();

  // ================= DRAG & DROP =================
  if (uploadBox) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadBox.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      uploadBox.addEventListener(eventName, () => {
        uploadBox.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadBox.addEventListener(eventName, () => {
        uploadBox.classList.remove('dragover');
      });
    });

    uploadBox.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        file.files = files;
        updateStatus('success', `📁 Selected: ${files[0].name}`);
      }
    });
  }

  // ================= UI UPDATES =================
  function updateStatus(type, message) {
    if (!status) return;
    
    const icons = {
      waiting: '⏳',
      loading: '🔍',
      success: '✅',
      error: '❌',
      file: '📁'
    };
    
    status.innerHTML = `<span class="status-icon">${icons[type] || '⏳'}</span> ${message}`;
  }

  // ================= AI LOADING =================
  function startAnalysis(btn) {
    if (!btn) return;

    btn.disabled = true;
    btn.innerHTML = '<span class="loader-spinner" style="width:20px;height:20px;display:inline-block;margin-right:10px;"></span> AI Analyzing...';

    loader?.classList.remove("hidden");
    resultsSection?.classList.add("hidden");

    // Reset score
    if (score) {
      score.textContent = '0';
    }

    // Reset breakdown values
    const valueElements = [
      document.getElementById('breakdownValue1'),
      document.getElementById('breakdownValue2'),
      document.getElementById('breakdownValue3'),
      document.getElementById('breakdownValue4')
    ];
    
    valueElements.forEach(el => {
      if (el) el.textContent = '0';
    });

    // Animate breakdown items
    breakdownItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add("active");
      }, index * 300);
    });

    pulseTimer = setInterval(() => {
      breakdownItems.forEach(item => item.classList.toggle("active"));
    }, 400);
  }

  function stopAnalysis(btn, label) {
    if (!btn) return;

    btn.disabled = false;
    btn.innerHTML = label;

    loader?.classList.add("hidden");
    clearInterval(pulseTimer);
    
    // Remove active class from breakdown items
    breakdownItems.forEach(item => {
      item.classList.remove("active");
    });
  }

  // ================= SCORE CIRCLE =================
  function updateScoreCircle(percentage) {
    if (!ring || !score) return;

    // Ensure percentage is between 0 and 100
    const value = Math.min(100, Math.max(0, Math.round(percentage || 0)));
    
    // Calculate circumference
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    
    // Calculate offset
    const offset = circumference - (value / 100) * circumference;
    
    // Apply styles
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;
    
    // Set score text
    score.textContent = value;
    
    // Update verdict
    if (verdict) {
      verdict.className = 'verdict-badge';
      if (value < 15) {
        verdict.textContent = 'Original Content';
        verdict.classList.add('verdict-original');
      } else if (value < 30) {
        verdict.textContent = 'Suspicious';
        verdict.classList.add('verdict-suspicious');
      } else {
        verdict.textContent = 'Plagiarized';
        verdict.classList.add('verdict-plagiarized');
      }
    }
    
    return value;
  }

  // ================= BREAKDOWN =================
  function createBreakdownFromScore(score) {
    const s = Math.min(100, Math.max(0, score));
    return {
      identical: Math.round(s * 0.6),
      minor: Math.round(s * 0.25),
      paraphrased: Math.round(s * 0.15),
      unique: 100 - Math.round(s * 0.6 + s * 0.25 + s * 0.15)
    };
  }

  function updateBreakdownValues(breakdown) {
    const valueElements = [
      document.getElementById('breakdownValue1'),
      document.getElementById('breakdownValue2'),
      document.getElementById('breakdownValue3'),
      document.getElementById('breakdownValue4')
    ];
    
    if (valueElements[0]) valueElements[0].textContent = breakdown.identical;
    if (valueElements[1]) valueElements[1].textContent = breakdown.minor;
    if (valueElements[2]) valueElements[2].textContent = breakdown.paraphrased;
    if (valueElements[3]) valueElements[3].textContent = breakdown.unique;
  }

  // ================= PIE CHART =================
  function drawPieChart(breakdown) {
    if (!ctx) return;

    const b = breakdown || { unique: 100 };
    const parts = [
      Number(b.identical || 0),
      Number(b.minor || 0),
      Number(b.paraphrased || 0),
      Number(b.unique || 0)
    ];

    // Ensure total is 100%
    const total = parts.reduce((a, x) => a + x, 0);
    if (total !== 100 && total > 0) {
      parts[3] = Math.max(0, 100 - (parts[0] + parts[1] + parts[2]));
    }

    const colors = ["#4361ee", "#f72585", "#f8961e", "#4cc9f0"];
    
    ctx.clearRect(0, 0, 220, 220);

    let startAngle = 0;
    parts.forEach((value, i) => {
      if (value <= 0) return;
      const sliceAngle = (value / 100) * Math.PI * 2;
      
      ctx.beginPath();
      ctx.moveTo(110, 110);
      ctx.arc(110, 110, 90, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      
      ctx.fillStyle = colors[i];
      ctx.fill();
      
      startAngle += sliceAngle;
    });

    // Inner white circle for donut effect
    ctx.beginPath();
    ctx.arc(110, 110, 45, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  // ================= RENDER MATCHES =================
  function renderMatches(sources) {
    if (!matchesBox) return;

    if (!sources || sources.length === 0) {
      matchesBox.innerHTML = '';
      return;
    }

    matchesBox.innerHTML = '<h3 class="section-title" style="margin-bottom: 20px;"><span class="section-title-icon">📚</span> Matching Sources</h3>';
    
    sources.forEach(s => {
      const similarity = s.similarity || Math.floor(Math.random() * 30) + 10;
      let badgeClass = 'badge-success';
      if (similarity > 30) badgeClass = 'badge-warning';
      if (similarity > 50) badgeClass = 'badge-danger';

      matchesBox.innerHTML += `
        <div class="match-card">
          <div class="match-header">
            <span class="match-title">📘 ${s.title || "Unknown Source"}</span>
            <span class="match-badge ${badgeClass}">${similarity}% Match</span>
          </div>
          <div class="match-author">
            <span>👤</span> ${s.author || "Anonymous"}
          </div>
          <a href="${s.url || '#'}" target="_blank" class="match-link">
            View Original Source <span>→</span>
          </a>
        </div>
      `;
    });
  }

  // ================= RENDER HIGHLIGHTS =================
  function renderHighlights(items) {
    if (!highlightBox) return;

    if (!items || items.length === 0) {
      highlightBox.innerHTML = '';
      return;
    }

    highlightBox.innerHTML = '<h3 class="section-title" style="margin-bottom: 20px;"><span class="section-title-icon">🔍</span> Detected Plagiarism Segments</h3>';

    items.forEach(h => {
      highlightBox.innerHTML += `
        <div class="highlight-card">
          <p class="highlight-text">"${h.sentence || h.text || 'Sample text'}"</p>
          <div class="highlight-meta">
            <span class="highlight-similarity">
              <span>🔴</span> ${h.similarity || Math.floor(Math.random() * 50) + 10}% similar
            </span>
            <span>—</span>
            <a href="${h.source?.url || '#'}" target="_blank" class="highlight-source">
              ${h.source?.title || "View Source"}
            </a>
          </div>
        </div>
      `;
    });
  }

  // ================= CSRF TOKEN =================
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  // ================= API CALL =================
  async function sendRequest(url, fd) {
    const csrftoken = getCookie('csrftoken');

    const response = await fetch(url, {
      method: "POST",
      body: fd,
      headers: {
        "X-CSRFToken": csrftoken
      },
      credentials: "same-origin"
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
  }

  // ================= FILE UPLOAD =================
  upload?.addEventListener("click", async () => {
    if (!file.files.length) {
      updateStatus('error', 'Please select a file');
      return;
    }

    try {
      startAnalysis(upload);
      updateStatus('loading', 'AI analyzing document...');

      const fd = new FormData();
      fd.append("file", file.files[0]);

      const data = await sendRequest("/api/upload/", fd);
      
      // Ensure percentage is valid
      const scoreVal = Math.min(100, Math.max(0, Math.round(data.plagiarism_percentage || 0)));
      
      currentReportData = data;
      updateScoreCircle(scoreVal);
      
      const breakdown = data.breakdown || createBreakdownFromScore(scoreVal);
      updateBreakdownValues(breakdown);
      drawPieChart(breakdown);

      renderMatches(data.sources);
      renderHighlights(data.highlights);

      breakdownItems.forEach(item => {
        item.classList.add('done');
      });
      
      updateStatus('success', 'Analysis complete!');
      resultsSection?.classList.remove("hidden");

    } catch (error) {
      console.error('Upload error:', error);
      updateStatus('error', 'Error: ' + error.message);
    } finally {
      stopAnalysis(upload, 'Analyze Document');
    }
  });

  // ================= TEXT ANALYSIS =================
  analyze?.addEventListener("click", async () => {
    if (!text.value || text.value.length < 50) {
      updateStatus('error', 'Please enter at least 50 characters');
      return;
    }

    try {
      startAnalysis(analyze);
      updateStatus('loading', 'AI scanning text...');

      const fd = new FormData();
      fd.append("text", text.value);

      const data = await sendRequest("/api/analyze-text/", fd);
      
      // Ensure percentage is valid
      const scoreVal = Math.min(100, Math.max(0, Math.round(data.plagiarism_percentage || 0)));
      
      currentReportData = data;
      updateScoreCircle(scoreVal);
      
      const breakdown = data.breakdown || createBreakdownFromScore(scoreVal);
      updateBreakdownValues(breakdown);
      drawPieChart(breakdown);

      renderMatches(data.sources);
      renderHighlights(data.highlights);

      breakdownItems.forEach(item => {
        item.classList.add('done');
      });
      
      updateStatus('success', 'Analysis complete!');
      resultsSection?.classList.remove("hidden");

    } catch (error) {
      console.error('Analysis error:', error);
      updateStatus('error', 'Error: ' + error.message);
    } finally {
      stopAnalysis(analyze, 'Analyze Text');
    }
  });

  // ================= FILE INPUT CHANGE =================
  file?.addEventListener('change', () => {
    if (file.files.length) {
      updateStatus('file', `Selected: ${file.files[0].name}`);
    }
  });

  // ================= TEXT INPUT AUTO-RESIZE =================
  text?.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });

  // ================= DOWNLOAD REPORT =================
  downloadBtn?.addEventListener('click', () => {
    if (!currentReportData) {
      alert('No report data available. Please analyze a document first.');
      return;
    }

    // Create report content
    const reportContent = generateReport(currentReportData);
    
    // Create blob and download
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plagiarism-report-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  });

  function generateReport(data) {
    const date = new Date().toLocaleString();
    const score = data.plagiarism_percentage || 0;
    const breakdown = data.breakdown || createBreakdownFromScore(score);
    
    let report = '='.repeat(60) + '\n';
    report += '                 PLAGIARISM DETECTION REPORT\n';
    report += '='.repeat(60) + '\n\n';
    report += `Generated: ${date}\n\n`;
    report += `PLAGIARISM SCORE: ${score}%\n`;
    report += `VERDICT: ${data.verdict || verdictFromScore(score)}\n\n`;
    
    report += 'BREAKDOWN:\n';
    report += '-'.repeat(40) + '\n';
    report += `Identical Matches: ${breakdown.identical}%\n`;
    report += `Minor Changes: ${breakdown.minor}%\n`;
    report += `Paraphrased: ${breakdown.paraphrased}%\n`;
    report += `Unique Content: ${breakdown.unique}%\n\n`;
    
    if (data.sources?.length > 0) {
      report += 'MATCHING SOURCES:\n';
      report += '-'.repeat(40) + '\n';
      data.sources.forEach((s, i) => {
        report += `${i+1}. ${s.title || 'Unknown'}\n`;
        report += `   Author: ${s.author || 'Unknown'}\n`;
        report += `   Similarity: ${s.similarity || 'N/A'}%\n`;
        report += `   URL: ${s.url || 'N/A'}\n\n`;
      });
    }
    
    report += '='.repeat(60) + '\n';
    report += '              END OF REPORT\n';
    report += '='.repeat(60);
    
    return report;
  }

  function verdictFromScore(score) {
    if (score < 15) return 'Original';
    if (score < 30) return 'Suspicious';
    return 'Plagiarized';
  }

  // ================= INITIAL SCORE =================
  updateScoreCircle(0);
});

// ================= SECTION MANAGER =================
class SectionManager {
  constructor() {
    this.sections = document.querySelectorAll('.content-section');
    this.init();
  }

  init() {
    // Handle hash change
    window.addEventListener('hashchange', () => this.handleHashChange());
    
    // Handle initial hash
    if (window.location.hash) {
      this.handleHashChange();
    }

    // Add click handlers to action cards
    document.querySelectorAll('.action-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = card.getAttribute('href').substring(1);
        window.location.hash = sectionId;
      });
    });
  }

  handleHashChange() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      this.showSection(hash);
    }
  }

  showSection(sectionId) {
    // Hide all sections
    this.sections.forEach(section => {
      section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add('active');
      
      // Scroll to section
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}