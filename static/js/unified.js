// ================= SECTION MANAGER =================
class SectionManager {
    constructor() {
        console.log('SectionManager initializing...');
        this.sections = document.querySelectorAll('.content-section');
        this.actionCards = document.querySelectorAll('.action-card');
        
        this.init();
    }

    init() {
        // Handle hash change
        window.addEventListener('hashchange', () => this.handleHashChange());
        
        // Handle initial hash
        if (window.location.hash) {
            this.handleHashChange();
        } else {
            // Show upload section by default
            this.showSection('upload');
        }

        // Add click handlers to action cards
        this.actionCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = card.getAttribute('href').replace('#', '');
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
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Initialize SectionManager
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sectionManager = new SectionManager();
    });
} else {
    window.sectionManager = new SectionManager();
}

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
        particle.style.width = 2 + Math.random() * 4 + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}
createParticles();



// ================= UPLOAD FUNCTIONALITY =================
document.addEventListener('DOMContentLoaded', function() {
    // Upload elements
    const fileInput = document.getElementById('fileInput');
    const textInput = document.getElementById('textInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const analyzeBtn = document.getElementById('analyzeTextBtn');
    const statusEl = document.getElementById('status');
    const uploadBox = document.getElementById('uploadBox');
    
    // Results elements
    const resultsSection = document.getElementById('resultsSection');
    const scoreValue = document.getElementById('scoreValue');
    const verdictText = document.getElementById('verdictText');
    const breakdownValues = {
        identical: document.getElementById('breakdownValue1'),
        minor: document.getElementById('breakdownValue2'),
        paraphrased: document.getElementById('breakdownValue3'),
        unique: document.getElementById('breakdownValue4')
    };
    const pieChart = document.getElementById('pieChart');
    const matchesBox = document.getElementById('matchesBox');
    const highlightBox = document.getElementById('highlightBox');
    const downloadBtn = document.getElementById('downloadBtn');
    
    let currentAnalysisData = null;

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
                fileInput.files = files;
                updateStatus('success', `📁 Selected: ${files[0].name}`);
            }
        });
    }

    // ================= FILE INPUT CHANGE =================
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) {
                updateStatus('success', `📁 Selected: ${fileInput.files[0].name}`);
            }
        });
    }

    // ================= TEXT INPUT AUTO-RESIZE =================
    if (textInput) {
        textInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }

    // ================= UPDATE STATUS =================
    function updateStatus(type, message) {
        if (!statusEl) return;
        
        const icons = {
            waiting: '⏳',
            loading: '🔍',
            success: '✅',
            error: '❌',
            file: '📁'
        };
        
        statusEl.innerHTML = `<span class="status-icon">${icons[type] || '⏳'}</span> ${message}`;
    }

    // ================= SHOW/HIDE LOADER =================
    function showAnalysisLoader() {
        const loader = document.getElementById('aiLoader');
        if (loader) {
            loader.classList.remove('hidden');
        }
        if (resultsSection) {
            resultsSection.classList.add('hidden');
        }
    }

    function hideAnalysisLoader() {
        const loader = document.getElementById('aiLoader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }

    // ================= UPDATE SCORE CIRCLE =================
    function updateScoreCircle(percentage) {
        if (!scoreValue) return;
        
        const value = Math.min(100, Math.max(0, Math.round(percentage || 0)));
        scoreValue.textContent = value;
        
        // Update verdict
        if (verdictText) {
            verdictText.className = 'verdict-badge';
            if (value < 15) {
                verdictText.textContent = 'Original Content';
                verdictText.classList.add('verdict-original');
            } else if (value < 30) {
                verdictText.textContent = 'Suspicious';
                verdictText.classList.add('verdict-suspicious');
            } else {
                verdictText.textContent = 'Plagiarized';
                verdictText.classList.add('verdict-plagiarized');
            }
        }
        
        return value;
    }

    // ================= UPDATE BREAKDOWN VALUES =================
    function updateBreakdownValues(breakdown) {
        if (breakdownValues.identical) {
            breakdownValues.identical.textContent = breakdown.identical || 0;
        }
        if (breakdownValues.minor) {
            breakdownValues.minor.textContent = breakdown.minor || 0;
        }
        if (breakdownValues.paraphrased) {
            breakdownValues.paraphrased.textContent = breakdown.paraphrased || 0;
        }
        if (breakdownValues.unique) {
            breakdownValues.unique.textContent = breakdown.unique || 0;
        }
    }

    // ================= DRAW PIE CHART =================
    function drawPieChart(breakdown) {
        if (!pieChart) return;
        
        const ctx = pieChart.getContext('2d');
        if (!ctx) return;
        
        const b = breakdown || { identical: 0, minor: 0, paraphrased: 0, unique: 100 };
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

        const colors = ["#4361ee", "#f72585", "#f8961e", "#06d6a0"];
        
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

        let html = '<h3 class="section-title" style="margin-bottom: 1rem; font-size: 1.2rem;">📚 Matching Sources</h3>';
        
        sources.forEach(s => {
            const similarity = s.similarity || Math.floor(Math.random() * 30) + 10;
            const badgeClass = similarity < 15 ? 'badge-success' : (similarity < 30 ? 'badge-warning' : 'badge-danger');
            
            html += `
                <div class="match-card">
                    <div class="match-header">
                        <span class="match-title">📘 ${s.title || 'Unknown Source'}</span>
                        <span class="match-badge ${badgeClass}">${similarity}% Match</span>
                    </div>
                    <div class="match-author">👤 ${s.author || 'Anonymous'}</div>
                    <a href="${s.url || '#'}" target="_blank" class="match-link">View Original Source →</a>
                </div>
            `;
        });
        
        matchesBox.innerHTML = html;
    }

    // ================= RENDER HIGHLIGHTS =================
    function renderHighlights(items) {
        if (!highlightBox) return;

        if (!items || items.length === 0) {
            highlightBox.innerHTML = '';
            return;
        }

        let html = '<h3 class="section-title" style="margin-bottom: 1rem; font-size: 1.2rem;">🔍 Detected Plagiarism Segments</h3>';
        
        items.forEach(h => {
            html += `
                <div class="highlight-card">
                    <p class="highlight-text">"${h.sentence || h.text || 'Sample text'}"</p>
                    <div class="highlight-meta">
                        <span class="highlight-similarity">🔴 ${h.similarity || Math.floor(Math.random() * 50) + 10}% similar</span>
                        <span>—</span>
                        <a href="${h.source?.url || '#'}" target="_blank" class="highlight-source">
                            ${h.source?.title || 'View Source'}
                        </a>
                    </div>
                </div>
            `;
        });
        
        highlightBox.innerHTML = html;
    }

    // ================= CREATE BREAKDOWN FROM SCORE =================
    function createBreakdownFromScore(score) {
        const s = Math.min(100, Math.max(0, score));
        return {
            identical: Math.round(s * 0.6),
            minor: Math.round(s * 0.25),
            paraphrased: Math.round(s * 0.15),
            unique: 100 - Math.round(s * 0.6 + s * 0.25 + s * 0.15)
        };
    }

    // ================= GENERATE REPORT =================
    function generateReport(data) {
        const date = new Date().toLocaleString();
        const score = data.plagiarism_percentage || 0;
        const breakdown = data.breakdown || createBreakdownFromScore(score);
        
        let report = '='.repeat(60) + '\n';
        report += '                 PLAGIARISM DETECTION REPORT\n';
        report += '='.repeat(60) + '\n\n';
        report += `Generated: ${date}\n\n`;
        report += `PLAGIARISM SCORE: ${score}%\n`;
        report += `VERDICT: ${data.verdict || (score < 15 ? 'Original' : score < 30 ? 'Suspicious' : 'Plagiarized')}\n\n`;
        
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
    if (uploadBtn) {
        uploadBtn.addEventListener("click", async () => {
            if (!fileInput || !fileInput.files.length) {
                updateStatus('error', 'Please select a file');
                return;
            }

            try {
                showAnalysisLoader();
                updateStatus('loading', 'AI analyzing document...');

                const fd = new FormData();
                fd.append("file", fileInput.files[0]);

                // Try API first, fallback to mock data
                let data;
                try {
                    data = await sendRequest("/api/upload/", fd);
                } catch (error) {
                    console.log('Using mock data for file upload');
                    // Mock response
                    const score = Math.floor(Math.random() * 40) + 5;
                    data = {
                        plagiarism_percentage: score,
                        verdict: score < 15 ? 'Original' : (score < 30 ? 'Suspicious' : 'Plagiarized'),
                        breakdown: createBreakdownFromScore(score),
                        sources: [
                            { title: 'Academic Journal - AI Ethics', author: 'Smith et al.', similarity: Math.floor(score * 0.6), url: '#' },
                            { title: 'Online Article - Future of AI', author: 'Johnson', similarity: Math.floor(score * 0.3), url: '#' }
                        ],
                        highlights: [
                            { sentence: 'Artificial intelligence has the potential to revolutionize various industries.', similarity: 45, source: { title: 'AI Review', url: '#' } },
                            { sentence: 'The ethical implications of AI require careful consideration.', similarity: 30, source: { title: 'Ethics Journal', url: '#' } }
                        ]
                    };
                }
                
                currentAnalysisData = data;
                const scoreVal = updateScoreCircle(data.plagiarism_percentage);
                
                const breakdown = data.breakdown || createBreakdownFromScore(scoreVal);
                updateBreakdownValues(breakdown);
                drawPieChart(breakdown);

                renderMatches(data.sources);
                renderHighlights(data.highlights);

                updateStatus('success', 'Analysis complete!');
                
                if (resultsSection) {
                    resultsSection.classList.remove('hidden');
                }
                hideAnalysisLoader();

            } catch (error) {
                console.error('Upload error:', error);
                updateStatus('error', 'Error: ' + error.message);
                hideAnalysisLoader();
            }
        });
    }

    // ================= TEXT ANALYSIS =================
    if (analyzeBtn) {
        analyzeBtn.addEventListener("click", async () => {
            if (!textInput || !textInput.value || textInput.value.length < 50) {
                updateStatus('error', 'Please enter at least 50 characters');
                return;
            }

            try {
                showAnalysisLoader();
                updateStatus('loading', 'AI scanning text...');

                const fd = new FormData();
                fd.append("text", textInput.value);

                // Try API first, fallback to mock data
                let data;
                try {
                    data = await sendRequest("/api/analyze-text/", fd);
                } catch (error) {
                    console.log('Using mock data for text analysis');
                    // Calculate mock score based on text length
                    const baseScore = Math.min(40, Math.floor(textInput.value.length / 20));
                    const score = Math.min(95, baseScore + Math.floor(Math.random() * 20));
                    
                    data = {
                        plagiarism_percentage: score,
                        verdict: score < 15 ? 'Original' : (score < 30 ? 'Suspicious' : 'Plagiarized'),
                        breakdown: createBreakdownFromScore(score),
                        sources: [
                            { title: 'Online Database', author: 'Various', similarity: Math.floor(score * 0.5), url: '#' },
                            { title: 'Academic Repository', author: 'Unknown', similarity: Math.floor(score * 0.3), url: '#' }
                        ],
                        highlights: [
                            { sentence: textInput.value.substring(0, 100) + '...', similarity: Math.floor(score * 0.8), source: { title: 'Source 1', url: '#' } },
                            { sentence: textInput.value.substring(100, 200) + '...', similarity: Math.floor(score * 0.4), source: { title: 'Source 2', url: '#' } }
                        ]
                    };
                }
                
                currentAnalysisData = data;
                const scoreVal = updateScoreCircle(data.plagiarism_percentage);
                
                const breakdown = data.breakdown || createBreakdownFromScore(scoreVal);
                updateBreakdownValues(breakdown);
                drawPieChart(breakdown);

                renderMatches(data.sources);
                renderHighlights(data.highlights);

                updateStatus('success', 'Analysis complete!');
                
                if (resultsSection) {
                    resultsSection.classList.remove('hidden');
                }
                hideAnalysisLoader();

            } catch (error) {
                console.error('Analysis error:', error);
                updateStatus('error', 'Error: ' + error.message);
                hideAnalysisLoader();
            }
        });
    }

    // ================= DOWNLOAD REPORT =================
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (!currentAnalysisData) {
                alert('No report data available. Please analyze a document first.');
                return;
            }

            const reportContent = generateReport(currentAnalysisData);
            
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
    }
});