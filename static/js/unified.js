// ================= STORAGE MANAGER =================
class StorageManager {
    constructor() {
        this.storageKey = 'bri_ai_user_data';
        this.userId = this.getUserId();
        this.loadData();
    }

    getUserId() {
        let userId = localStorage.getItem('bri_ai_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('bri_ai_user_id', userId);
        }
        return userId;
    }

    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                AppState.analyses = data.analyses || [];
                AppState.results = data.results || [];
                AppState.reports = data.reports || [];
                AppState.citations = data.citations || [];
                AppState.similarities = data.similarities || [];
                AppState.history = data.history || [];
                AppState.copyright = data.copyright || {
                    risk_level: 'low',
                    risk_percentage: 0,
                    checked_documents: 0,
                    flagged: 0,
                    protected: 0,
                    flagged_items: []
                };
                AppState.settings = data.settings || {
                    displayName: localStorage.getItem('display_name') || 'User',
                    email: localStorage.getItem('email') || '',
                    institution: localStorage.getItem('institution') || '',
                    phone: localStorage.getItem('phone') || '',
                    apiKey: localStorage.getItem('api_key') || 'bri_api_' + Math.random().toString(36).substr(2, 16)
                };
                AppState.stats = data.stats || {
                    totalAnalyses: 0,
                    todayAnalyses: 0,
                    avgUniqueness: 0
                };
                
                console.log('📦 Data loaded from storage:', AppState);
            } catch (e) {
                console.error('Error loading stored data:', e);
                this.initializeDefaultState();
            }
        } else {
            this.initializeDefaultState();
        }
        this.refreshAllSections();
    }

    initializeDefaultState() {
        AppState.analyses = [];
        AppState.results = [];
        AppState.reports = [];
        AppState.citations = [];
        AppState.similarities = [];
        AppState.history = [];
        AppState.copyright = {
            risk_level: 'low',
            risk_percentage: 0,
            checked_documents: 0,
            flagged: 0,
            protected: 0,
            flagged_items: []
        };
        AppState.settings = {
            displayName: localStorage.getItem('display_name') || 'User',
            email: localStorage.getItem('email') || '',
            institution: localStorage.getItem('institution') || '',
            phone: localStorage.getItem('phone') || '',
            apiKey: localStorage.getItem('api_key') || 'bri_api_' + Math.random().toString(36).substr(2, 16)
        };
        AppState.stats = {
            totalAnalyses: 0,
            todayAnalyses: 0,
            avgUniqueness: 0
        };
    }

    saveData() {
        const dataToStore = {
            analyses: AppState.analyses,
            results: AppState.results,
            reports: AppState.reports,
            citations: AppState.citations,
            similarities: AppState.similarities,
            history: AppState.history,
            copyright: AppState.copyright,
            settings: AppState.settings,
            stats: AppState.stats,
            lastUpdated: new Date().toISOString(),
            userId: this.userId
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(dataToStore));
        console.log('💾 Data saved to storage');
    }

    getCsrfToken() {
        const name = 'csrftoken';
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

    refreshAllSections() {
        setTimeout(() => {
            if (window.resultsSection) {
                window.resultsSection.results = AppState.results;
                window.resultsSection.render();
                window.resultsSection.updateBadge();
            }
            if (window.reportsSection) {
                window.reportsSection.reports = AppState.reports;
                window.reportsSection.render();
                window.reportsSection.updateBadge();
            }
            if (window.citationsSection) {
                window.citationsSection.citations = AppState.citations;
                window.citationsSection.render();
            }
            if (window.similaritySection) {
                window.similaritySection.similarities = AppState.similarities;
                window.similaritySection.render();
            }
            if (window.historySection) {
                window.historySection.history = AppState.history;
                window.historySection.render();
                window.historySection.updateBadge();
            }
            if (window.copyrightSection) {
                window.copyrightSection.data = AppState.copyright;
                window.copyrightSection.render();
            }
            if (window.settingsSection) {
                window.settingsSection.settings = AppState.settings;
                window.settingsSection.render();
            }
            this.updateHeaderStats();
        }, 100);
    }

    updateHeaderStats() {
        const totalEl = document.getElementById('totalAnalyses');
        const todayEl = document.getElementById('todayAnalyses');
        const uniqueEl = document.getElementById('uniqueContent');
        
        if (totalEl) {
            const valueEl = totalEl.querySelector('.stat-value');
            if (valueEl) valueEl.textContent = AppState.stats.totalAnalyses;
        }
        if (todayEl) {
            const today = new Date().toDateString();
            const todayCount = AppState.analyses.filter(a => 
                new Date(a.created_at).toDateString() === today
            ).length;
            const valueEl = todayEl.querySelector('.stat-value');
            if (valueEl) valueEl.textContent = todayCount;
        }
        if (uniqueEl) {
            const valueEl = uniqueEl.querySelector('.stat-value');
            if (valueEl) valueEl.textContent = AppState.stats.avgUniqueness + '%';
        }
    }
}

// ================= GLOBAL STATE =================
const AppState = {
    analyses: [],
    results: [],
    reports: [],
    citations: [],
    similarities: [],
    history: [],
    copyright: {
        risk_level: 'low',
        risk_percentage: 0,
        checked_documents: 0,
        flagged: 0,
        protected: 0,
        flagged_items: []
    },
    settings: {
        displayName: localStorage.getItem('display_name') || 'User',
        email: localStorage.getItem('email') || '',
        institution: localStorage.getItem('institution') || '',
        phone: localStorage.getItem('phone') || '',
        apiKey: localStorage.getItem('api_key') || 'bri_api_' + Math.random().toString(36).substr(2, 16)
    },
    stats: {
        totalAnalyses: 0,
        todayAnalyses: 0,
        avgUniqueness: 0
    }
};

const storageManager = new StorageManager();

// ================= SECTION MANAGER =================
class SectionManager {
    constructor() {
        this.sections = document.querySelectorAll('.content-section');
        this.actionCards = document.querySelectorAll('.action-card');
        this.currentSection = 'upload';
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.handleHashChange());
        if (window.location.hash) {
            this.handleHashChange();
        } else {
            this.showSection('upload');
        }
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
        this.sections.forEach(section => section.classList.remove('active'));
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.refreshSection(sectionId);
        }
    }

    refreshSection(sectionId) {
        switch(sectionId) {
            case 'results': if (window.resultsSection) window.resultsSection.render(); break;
            case 'reports': if (window.reportsSection) window.reportsSection.render(); break;
            case 'citations': if (window.citationsSection) window.citationsSection.render(); break;
            case 'similarity': if (window.similaritySection) window.similaritySection.render(); break;
            case 'history': if (window.historySection) window.historySection.render(); break;
            case 'copyright': if (window.copyrightSection) window.copyrightSection.render(); break;
            case 'settings': if (window.settingsSection) window.settingsSection.render(); break;
        }
    }
}

// ================= RESULTS SECTION =================
class ResultsSection {
    constructor() {
        this.container = document.getElementById('results-container');
        this.loader = document.getElementById('results-loader');
        this.results = AppState.results;
        window.resultsSection = this;
    }

    addResult(analysis) {
        this.results.unshift(analysis);
        AppState.results = this.results;
        AppState.analyses.push(analysis);
        this.updateBadge();
        this.render();
        storageManager.saveData();
    }

    updateBadge() {
        const badge = document.getElementById('resultsBadge');
        if (badge) {
            badge.textContent = this.results.length;
            badge.style.display = this.results.length > 0 ? 'block' : 'none';
        }
    }

    render() {
        if (!this.container) return;
        if (this.results.length === 0) {
            this.showEmpty();
            return;
        }
        this.hideLoader();
        
        let html = '<div class="results-list">';
        this.results.forEach(result => {
            const date = new Date(result.created_at);
            const formattedDate = date.toLocaleDateString('en-US', { 
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            const badgeClass = result.score < 15 ? 'original' : (result.score < 30 ? 'suspicious' : 'plagiarized');
            const badgeText = result.score < 15 ? 'Original' : (result.score < 30 ? 'Suspicious' : 'Plagiarized');
            
            html += `
                <div class="result-card glass-card" data-id="${result.id}">
                    <div class="result-header">
                        <h3 class="result-title">📄 ${this.escapeHtml(result.title)}</h3>
                        <span class="result-date">${formattedDate}</span>
                    </div>
                    <span class="result-badge ${badgeClass}">${result.score}% ${badgeText}</span>
                    <p class="result-preview">${this.escapeHtml(result.preview || 'Analysis completed successfully.')}</p>
                    <div class="result-stats">
                        <div class="stat-item"><span class="stat-label">Identical</span><span class="stat-value">${result.breakdown?.identical || 0}%</span></div>
                        <div class="stat-item"><span class="stat-label">Minor</span><span class="stat-value">${result.breakdown?.minor || 0}%</span></div>
                        <div class="stat-item"><span class="stat-label">Paraphrased</span><span class="stat-value">${result.breakdown?.paraphrased || 0}%</span></div>
                        <div class="stat-item"><span class="stat-label">Unique</span><span class="stat-value">${result.breakdown?.unique || 0}%</span></div>
                    </div>
                    <div class="result-actions">
                        <button class="btn-small btn-primary view-details" data-id="${result.id}"><span>👁️</span> View Details</button>
                        <button class="btn-small btn-success download-report" data-id="${result.id}" data-title="${result.title}" data-score="${result.score}" data-breakdown='${JSON.stringify(result.breakdown)}' data-sources='${JSON.stringify(result.sources || [])}'><span>📥</span> Download Report</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.container.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const result = this.results.find(r => r.id == id);
                if (result) {
                    alert(`📄 DETAILED ANALYSIS\nTitle: ${result.title}\nScore: ${result.score}% - ${result.verdict}\n\n📊 BREAKDOWN\nIdentical: ${result.breakdown?.identical || 0}%\nMinor: ${result.breakdown?.minor || 0}%\nParaphrased: ${result.breakdown?.paraphrased || 0}%\nUnique: ${result.breakdown?.unique || 0}%`);
                }
            });
        });
        this.container.querySelectorAll('.download-report').forEach(btn => {
            btn.addEventListener('click', () => {
                const reportData = {
                    id: btn.dataset.id,
                    title: btn.dataset.title,
                    score: btn.dataset.score,
                    breakdown: JSON.parse(btn.dataset.breakdown || '{}'),
                    sources: JSON.parse(btn.dataset.sources || '[]')
                };
                this.downloadReport(reportData);
            });
        });
    }

    downloadReport(data) {
        const date = new Date().toLocaleString();
        const score = data.score;
        const verdict = score < 15 ? 'Original' : (score < 30 ? 'Suspicious' : 'Plagiarized');
        
        let report = '='.repeat(60) + '\n';
        report += '                 PLAGIARISM DETECTION REPORT\n';
        report += '='.repeat(60) + '\n\n';
        report += `Generated: ${date}\n`;
        report += `Document: ${data.title}\n\n`;
        report += `PLAGIARISM SCORE: ${score}%\n`;
        report += `VERDICT: ${verdict}\n\n`;
        report += 'BREAKDOWN:\n';
        report += '-'.repeat(40) + '\n';
        report += `Identical Matches: ${data.breakdown?.identical || 0}%\n`;
        report += `Minor Changes: ${data.breakdown?.minor || 0}%\n`;
        report += `Paraphrased: ${data.breakdown?.paraphrased || 0}%\n`;
        report += `Unique Content: ${data.breakdown?.unique || 0}%\n\n`;
        
        if (data.sources && data.sources.length > 0) {
            report += 'MATCHING SOURCES:\n';
            report += '-'.repeat(40) + '\n';
            data.sources.forEach((s, i) => {
                report += `${i+1}. ${s.title || 'Unknown'}\n`;
                report += `   Author: ${s.author || 'Unknown'}\n`;
                report += `   Similarity: ${s.similarity || 0}%\n`;
                report += `   URL: ${s.url || 'N/A'}\n\n`;
            });
        } else {
            report += 'No external sources found.\n\n';
        }
        
        report += '='.repeat(60) + '\n';
        report += '              END OF REPORT\n';
        report += '='.repeat(60);
        
        const blob = new Blob([report], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plagiarism-report-${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    showLoader() {
        if (this.loader) this.loader.style.display = 'flex';
        if (this.container) this.container.style.display = 'none';
    }

    hideLoader() {
        if (this.loader) this.loader.style.display = 'none';
        if (this.container) this.container.style.display = 'block';
    }

    showEmpty() {
        this.container.innerHTML = `<div class="empty-state"><div class="empty-icon">📊</div><h3>No Results Yet</h3><p>Upload a document or paste text to see analysis results here.</p></div>`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ================= REPORTS SECTION =================
class ReportsSection {
    constructor() {
        this.container = document.getElementById('reports-container');
        this.loader = document.getElementById('reports-loader');
        this.reports = AppState.reports;
        window.reportsSection = this;
    }

    addReport(analysis) {
        const report = {
            id: analysis.id,
            title: analysis.title,
            date: analysis.created_at,
            score: analysis.score,
            type: analysis.type || 'Document',
            breakdown: analysis.breakdown,
            sources: analysis.sources
        };
        this.reports.unshift(report);
        AppState.reports = this.reports;
        this.updateBadge();
        this.render();
        storageManager.saveData();
    }

    updateBadge() {
        const badge = document.getElementById('reportsBadge');
        if (badge) {
            badge.textContent = this.reports.length;
            badge.style.display = this.reports.length > 0 ? 'block' : 'none';
        }
    }

    render() {
        if (!this.container) return;
        if (this.reports.length === 0) {
            this.showEmpty();
            return;
        }
        this.hideLoader();
        
        let html = '<div class="reports-grid">';
        this.reports.forEach(report => {
            const date = new Date(report.date);
            const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            html += `
                <div class="report-card glass-card" data-id="${report.id}">
                    <div class="report-icon">📄</div>
                    <div class="report-info">
                        <h4 class="report-title">${this.escapeHtml(report.title)}</h4>
                        <div class="report-meta"><span class="report-date">${formattedDate}</span><span class="report-score">${report.score}%</span></div>
                        <small class="report-type">Type: ${report.type}</small>
                    </div>
                    <div class="report-actions">
                        <button class="btn-icon view-report" title="View" data-id="${report.id}">👁️</button>
                        <button class="btn-icon download-report" title="Download" data-id="${report.id}">📥</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        this.container.innerHTML = html;
    }

    showLoader() {
        if (this.loader) this.loader.style.display = 'flex';
        if (this.container) this.container.style.display = 'none';
    }

    hideLoader() {
        if (this.loader) this.loader.style.display = 'none';
        if (this.container) this.container.style.display = 'block';
    }

    showEmpty() {
        this.container.innerHTML = `<div class="empty-state"><div class="empty-icon">📄</div><h3>No Reports Yet</h3><p>Your generated reports will appear here after analysis.</p></div>`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ================= CITATIONS SECTION =================
class CitationsSection {
    constructor() {
        this.container = document.getElementById('citations-container');
        this.loader = document.getElementById('citations-loader');
        this.citations = AppState.citations;
        window.citationsSection = this;
    }

    addAnalysis(analysis) {
        const citations = this.generateCitations(analysis);
        this.citations = [...this.citations, ...citations];
        AppState.citations = this.citations;
        this.render();
        storageManager.saveData();
    }

    generateCitations(analysis) {
        const citations = [];
        if (analysis.sources && analysis.sources.length > 0) {
            analysis.sources.forEach((source, index) => {
                citations.push({
                    id: `cite_${analysis.id}_${index}`,
                    text: `"${analysis.preview?.substring(0, 100)}..." - Similar content found in "${source.title}"`,
                    format: ['APA', 'MLA', 'Chicago', 'IEEE'][Math.floor(Math.random() * 4)],
                    page: Math.floor(Math.random() * 100) + 1,
                    correct: Math.random() > 0.3,
                    suggestion: 'Please verify the original source and add proper attribution'
                });
            });
        }
        if (citations.length === 0) {
            citations.push({
                id: `cite_${analysis.id}_default`,
                text: `Analysis of "${analysis.title}" - No direct citations found`,
                format: 'MLA',
                page: 1,
                correct: true
            });
        }
        return citations;
    }

    render() {
        if (!this.container) return;
        if (this.citations.length === 0) {
            this.showEmpty();
            return;
        }
        this.hideLoader();

        const total = this.citations.length;
        const correct = this.citations.filter(c => c.correct).length;
        const needsReview = total - correct;

        let html = `
            <div class="citations-summary">
                <div class="summary-card glass-card"><div class="summary-icon">📚</div><div class="summary-info"><span class="summary-value">${total}</span><span class="summary-label">Total Citations</span></div></div>
                <div class="summary-card glass-card"><div class="summary-icon">✅</div><div class="summary-info"><span class="summary-value">${correct}</span><span class="summary-label">Correct Format</span></div></div>
                <div class="summary-card glass-card"><div class="summary-icon">⚠️</div><div class="summary-info"><span class="summary-value">${needsReview}</span><span class="summary-label">Needs Review</span></div></div>
            </div>
            <div class="citations-list">
        `;

        this.citations.forEach(citation => {
            const cardClass = citation.correct ? 'citation-card glass-card' : 'citation-card glass-card needs-review';
            const badgeClass = citation.correct ? 'status-badge success' : 'status-badge warning';
            const badgeText = citation.correct ? '✅ Correct' : '⚠️ Needs Review';
            html += `<div class="${cardClass}"><div class="citation-status"><span class="${badgeClass}">${badgeText}</span></div><div class="citation-text">"${this.escapeHtml(citation.text)}"</div><div class="citation-meta"><span class="citation-format">${citation.format}</span><span class="citation-location">Page ${citation.page}</span></div>`;
            if (!citation.correct) {
                html += `<div class="citation-suggestion"><strong>Suggestion:</strong> ${this.escapeHtml(citation.suggestion)}</div>`;
            }
            html += `</div>`;
        });
        html += '</div>';
        this.container.innerHTML = html;
    }

    showLoader() {
        if (this.loader) this.loader.style.display = 'flex';
        if (this.container) this.container.style.display = 'none';
    }

    hideLoader() {
        if (this.loader) this.loader.style.display = 'none';
        if (this.container) this.container.style.display = 'block';
    }

    showEmpty() {
        this.container.innerHTML = `<div class="empty-state"><div class="empty-icon">📚</div><h3>No Citations Found</h3><p>Citations from your analyzed documents will appear here.</p></div>`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ================= SIMILARITY SECTION =================
class SimilaritySection {
    constructor() {
        this.container = document.getElementById('similarity-container');
        this.loader = document.getElementById('similarity-loader');
        this.similarities = AppState.similarities;
        window.similaritySection = this;
    }

    addAnalysis(analysis) {
        const similarity = {
            id: analysis.id,
            title: analysis.title,
            type: analysis.type || 'Document',
            date: analysis.created_at,
            score: analysis.score,
            sources: {
                internet: analysis.sources?.filter(s => s.type === 'web').length || Math.floor(analysis.score * 0.6),
                publications: analysis.sources?.filter(s => s.type === 'academic').length || Math.floor(analysis.score * 0.3),
                internal: analysis.sources?.filter(s => s.type === 'internal').length || Math.floor(analysis.score * 0.1)
            }
        };
        this.similarities.unshift(similarity);
        AppState.similarities = this.similarities;
        this.render();
        storageManager.saveData();
    }

    render() {
        if (!this.container) return;
        if (this.similarities.length === 0) {
            this.showEmpty();
            return;
        }
        this.hideLoader();
        
        let html = '<div class="similarity-timeline">';
        this.similarities.forEach(item => {
            const date = new Date(item.date);
            const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const meterClass = item.score < 15 ? 'low' : (item.score < 30 ? 'medium' : 'high');
            html += `
                <div class="timeline-item glass-card">
                    <div class="timeline-date">${formattedDate}</div>
                    <div class="timeline-content">
                        <div class="document-info"><h4 class="doc-title">${this.escapeHtml(item.title)}</h4><span class="doc-type">${item.type}</span></div>
                        <div class="similarity-meter"><div class="meter-bar"><div class="meter-fill ${meterClass}" style="width: ${item.score}%"></div></div><span class="meter-score">${item.score}%</span></div>
                        <div class="similarity-breakdown">
                            <div class="breakdown-item"><span class="breakdown-label">Internet</span><span class="breakdown-value">${item.sources.internet}</span></div>
                            <div class="breakdown-item"><span class="breakdown-label">Publications</span><span class="breakdown-value">${item.sources.publications}</span></div>
                            <div class="breakdown-item"><span class="breakdown-label">Internal</span><span class="breakdown-value">${item.sources.internal}</span></div>
                        </div>
                        <button class="btn-small btn-outline view-similarity" data-id="${item.id}">View Details</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        this.container.innerHTML = html;
    }

    showLoader() {
        if (this.loader) this.loader.style.display = 'flex';
        if (this.container) this.container.style.display = 'none';
    }

    hideLoader() {
        if (this.loader) this.loader.style.display = 'none';
        if (this.container) this.container.style.display = 'block';
    }

    showEmpty() {
        this.container.innerHTML = `<div class="empty-state"><div class="empty-icon">📈</div><h3>No Similarity Data</h3><p>Run an analysis to see similarity metrics here.</p></div>`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ================= HISTORY SECTION =================
class HistorySection {
    constructor() {
        this.container = document.getElementById('history-container');
        this.loader = document.getElementById('history-loader');
        this.history = AppState.history;
        this.currentFilter = 'all';
        window.historySection = this;
    }

    addAnalysis(analysis) {
        const historyItem = {
            id: analysis.id,
            title: analysis.title,
            type: analysis.type || 'document',
            date: analysis.created_at,
            score: analysis.score,
            verdict: analysis.score < 15 ? 'Original' : (analysis.score < 30 ? 'Suspicious' : 'Plagiarized')
        };
        this.history.unshift(historyItem);
        AppState.history = this.history;
        this.updateBadge();
        this.render();
        storageManager.saveData();
    }

    updateBadge() {
        const badge = document.getElementById('historyBadge');
        if (badge) {
            badge.textContent = this.history.length;
            badge.style.display = this.history.length > 0 ? 'block' : 'none';
        }
    }

    render() {
        if (!this.container) return;
        if (this.history.length === 0) {
            this.showEmpty();
            return;
        }
        this.hideLoader();

        let filtered = [...this.history];
        if (this.currentFilter === 'document') filtered = filtered.filter(item => item.type === 'document');
        else if (this.currentFilter === 'text') filtered = filtered.filter(item => item.type === 'text');
        else if (this.currentFilter === 'recent') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            filtered = filtered.filter(item => new Date(item.date) > sevenDaysAgo);
        }

        let html = `
            <div class="history-filters">
                <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
                <button class="filter-btn ${this.currentFilter === 'document' ? 'active' : ''}" data-filter="document">Documents</button>
                <button class="filter-btn ${this.currentFilter === 'text' ? 'active' : ''}" data-filter="text">Text</button>
                <button class="filter-btn ${this.currentFilter === 'recent' ? 'active' : ''}" data-filter="recent">Last 7 Days</button>
            </div>
            <div class="history-list">
        `;

        filtered.forEach(item => {
            const date = new Date(item.date);
            const timeAgo = this.timeAgo(date);
            const verdictClass = item.score < 15 ? 'original' : (item.score < 30 ? 'suspicious' : 'plagiarized');
            html += `
                <div class="history-item glass-card" data-type="${item.type}" data-date="${item.date}">
                    <div class="history-icon">${item.type === 'document' ? '📄' : '📝'}</div>
                    <div class="history-details">
                        <div class="history-header"><h4 class="history-title">${this.escapeHtml(item.title)}</h4><span class="history-time">${timeAgo}</span></div>
                        <div class="history-meta"><span class="history-score">${item.score}% Match</span><span class="history-verdict ${verdictClass}">${item.verdict}</span></div>
                    </div>
                    <div class="history-actions">
                        <button class="btn-icon view-history" data-id="${item.id}" title="View">👁️</button>
                        <button class="btn-icon download-history" data-id="${item.id}" title="Download">📥</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        this.container.innerHTML = html;
    }

    timeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'just now';
    }

    showLoader() {
        if (this.loader) this.loader.style.display = 'flex';
        if (this.container) this.container.style.display = 'none';
    }

    hideLoader() {
        if (this.loader) this.loader.style.display = 'none';
        if (this.container) this.container.style.display = 'block';
    }

    showEmpty() {
        this.container.innerHTML = `<div class="empty-state"><div class="empty-icon">🕒</div><h3>No History Yet</h3><p>Your analysis history will appear here.</p></div>`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ================= COPYRIGHT SECTION =================
class CopyrightSection {
    constructor() {
        this.container = document.getElementById('copyright-container');
        this.loader = document.getElementById('copyright-loader');
        this.data = AppState.copyright;
        window.copyrightSection = this;
    }

    addAnalysis(analysis) {
        this.data.checked_documents++;
        if (analysis.score > 30) {
            this.data.flagged++;
            this.data.flagged_items.push({
                id: analysis.id,
                title: analysis.title,
                risk: analysis.score,
                excerpt: analysis.preview?.substring(0, 150) + '...',
                sources: analysis.sources || []
            });
        } else {
            this.data.protected++;
        }

        const riskRatio = this.data.flagged / this.data.checked_documents;
        if (riskRatio < 0.1) {
            this.data.risk_level = 'low';
            this.data.risk_percentage = Math.floor(riskRatio * 100);
        } else if (riskRatio < 0.3) {
            this.data.risk_level = 'medium';
            this.data.risk_percentage = Math.floor(riskRatio * 100);
        } else {
            this.data.risk_level = 'high';
            this.data.risk_percentage = Math.floor(riskRatio * 100);
        }

        AppState.copyright = this.data;
        this.render();
        storageManager.saveData();
    }

    render() {
        if (!this.container) return;
        if (this.data.checked_documents === 0) {
            this.showEmpty();
            return;
        }
        this.hideLoader();

        const riskClass = this.data.risk_level;
        let html = `
            <div class="copyright-summary glass-card">
                <div class="risk-meter">
                    <div class="risk-circle ${riskClass}">${this.data.risk_percentage}%</div>
                    <div class="risk-info"><h4>Copyright Risk Level</h4><p class="risk-level ${riskClass}">${riskClass.charAt(0).toUpperCase() + riskClass.slice(1)} Risk</p></div>
                </div>
                <div class="copyright-stats">
                    <div class="stat-box"><span class="stat-number">${this.data.checked_documents}</span><span class="stat-label">Documents Checked</span></div>
                    <div class="stat-box"><span class="stat-number">${this.data.flagged}</span><span class="stat-label">Flagged Content</span></div>
                    <div class="stat-box"><span class="stat-number">${this.data.protected}</span><span class="stat-label">Protected</span></div>
                </div>
            </div>
            ${this.data.flagged_items.length > 0 ? `<div class="flagged-content"><h3>Flagged Content</h3>` : ''}
        `;

        this.data.flagged_items.forEach(item => {
            html += `
                <div class="flagged-item glass-card">
                    <div class="flagged-header"><span class="flagged-title">${this.escapeHtml(item.title)}</span><span class="flagged-risk">${item.risk}% Risk</span></div>
                    <p class="flagged-excerpt">${this.escapeHtml(item.excerpt)}</p>
                    ${item.sources.length > 0 ? `<div class="flagged-sources"><strong>Potential Sources:</strong><ul>${item.sources.map(s => `<li><a href="${s.url || '#'}" target="_blank">${this.escapeHtml(s.title || 'Unknown Source')}</a></li>`).join('')}</ul></div>` : ''}
                </div>
            `;
        });
        html += '</div>';
        this.container.innerHTML = html;
    }

    showLoader() {
        if (this.loader) this.loader.style.display = 'flex';
        if (this.container) this.container.style.display = 'none';
    }

    hideLoader() {
        if (this.loader) this.loader.style.display = 'none';
        if (this.container) this.container.style.display = 'block';
    }

    showEmpty() {
        this.container.innerHTML = `<div class="empty-state"><div class="empty-icon">©️</div><h3>No Copyright Issues Detected</h3><p>Your content appears to be original.</p></div>`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ================= SETTINGS SECTION =================
class SettingsSection {
    constructor() {
        this.container = document.getElementById('settings-container');
        this.loader = document.getElementById('settings-loader');
        this.settings = AppState.settings;
        window.settingsSection = this;
        this.render();
    }

    render() {
        if (!this.container) return;
        this.hideLoader();

        const html = `
            <div class="settings-grid">
                <div class="settings-card glass-card">
                    <h3>Profile Settings</h3>
                    <div class="settings-form">
                        <div class="form-group"><label for="display_name">Display Name</label><input type="text" id="display_name" value="${this.escapeHtml(this.settings.displayName)}"></div>
                        <div class="form-group"><label for="email">Email</label><input type="email" id="email" value="${this.escapeHtml(this.settings.email)}"></div>
                        <div class="form-group"><label for="institution">Institution/Organization</label><input type="text" id="institution" value="${this.escapeHtml(this.settings.institution)}"></div>
                        <div class="form-group"><label for="phone">Phone Number</label><input type="tel" id="phone" value="${this.escapeHtml(this.settings.phone)}"></div>
                        <button class="btn-primary btn-block" id="saveProfileBtn">Save Changes</button>
                    </div>
                </div>
                <div class="settings-card glass-card">
                    <h3>Analysis Preferences</h3>
                    <div class="preferences-list">
                        <label class="checkbox-label"><input type="checkbox" id="deepWebSearch" checked><div class="checkbox-content"><span>Deep Web Search</span><span class="checkbox-description">Search deep web and academic databases</span></div></label>
                        <label class="checkbox-label"><input type="checkbox" id="academicDatabases" checked><div class="checkbox-content"><span>Academic Databases</span><span class="checkbox-description">Include Scopus, IEEE, PubMed</span></div></label>
                        <label class="checkbox-label"><input type="checkbox" id="autoCitation"><div class="checkbox-content"><span>Auto-Citation Check</span><span class="checkbox-description">Automatically verify citations</span></div></label>
                        <label class="checkbox-label"><input type="checkbox" id="emailReports"><div class="checkbox-content"><span>Email Reports</span><span class="checkbox-description">Send reports via email</span></div></label>
                    </div>
                </div>
                <div class="settings-card glass-card">
                    <h3>API Access</h3>
                    <div class="api-key-display"><code id="api-key">${this.settings.apiKey}</code><button class="btn-icon" id="generateApiKey" title="Generate New Key">🔄</button></div>
                    <p class="help-text">Use this key to access our API programmatically</p>
                    <div class="api-usage"><h4>API Usage</h4><div class="usage-stats"><div><span>Requests Today</span><span>${AppState.stats.totalAnalyses} / 1000</span></div><div><div style="width: ${Math.min(100, (AppState.stats.totalAnalyses / 10))}%"></div></div></div></div>
                </div>
            </div>
        `;
        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        const saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveProfile());
        const generateBtn = document.getElementById('generateApiKey');
        if (generateBtn) generateBtn.addEventListener('click', () => this.generateApiKey());
    }

    saveProfile() {
        const displayName = document.getElementById('display_name')?.value;
        const email = document.getElementById('email')?.value;
        const institution = document.getElementById('institution')?.value;
        const phone = document.getElementById('phone')?.value;

        if (displayName) {
            this.settings.displayName = displayName;
            localStorage.setItem('display_name', displayName);
        }
        if (email) {
            this.settings.email = email;
            localStorage.setItem('email', email);
        }
        if (institution) {
            this.settings.institution = institution;
            localStorage.setItem('institution', institution);
        }
        if (phone) {
            this.settings.phone = phone;
            localStorage.setItem('phone', phone);
        }

        AppState.settings = this.settings;
        storageManager.saveData();
        this.showToast('Profile saved successfully!');
    }

    generateApiKey() {
        const newKey = 'bri_api_' + Math.random().toString(36).substr(2, 16);
        this.settings.apiKey = newKey;
        AppState.settings = this.settings;
        localStorage.setItem('api_key', newKey);
        storageManager.saveData();
        const apiKeyElement = document.getElementById('api-key');
        if (apiKeyElement) apiKeyElement.textContent = newKey;
        this.showToast('New API key generated!');
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    showLoader() {
        if (this.loader) this.loader.style.display = 'flex';
        if (this.container) this.container.style.display = 'none';
    }

    hideLoader() {
        if (this.loader) this.loader.style.display = 'none';
        if (this.container) this.container.style.display = 'block';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ================= UPLOAD HANDLER =================
class UploadHandler {
    constructor() {
        this.fileInput = document.getElementById('fileInput');
        this.textInput = document.getElementById('textInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.analyzeBtn = document.getElementById('analyzeTextBtn');
        this.uploadBox = document.getElementById('uploadBox');
        this.status = document.getElementById('status');
        this.aiLoader = document.getElementById('aiLoader');
        this.resultsPreview = document.getElementById('resultsPreview');
        this.previewTime = document.getElementById('previewTime');
        this.previewRing = document.getElementById('previewRing');
        this.previewScore = document.getElementById('previewScore');
        this.previewVerdict = document.getElementById('previewVerdict');
        this.previewFilename = document.getElementById('previewFilename');

        this.init();
    }

    init() {
        this.setupDragAndDrop();
        this.setupFileInput();
        this.setupTextArea();
        this.setupUploadButton();
        this.setupAnalyzeButton();
    }

    setupDragAndDrop() {
        if (!this.uploadBox) return;
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadBox.addEventListener(eventName, this.preventDefaults, false);
        });
        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadBox.addEventListener(eventName, () => this.uploadBox.classList.add('dragover'));
        });
        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadBox.addEventListener(eventName, () => this.uploadBox.classList.remove('dragover'));
        });
        this.uploadBox.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0 && this.fileInput) {
                this.fileInput.files = files;
                this.updateStatus('success', `📁 Selected: ${files[0].name}`);
            }
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    setupFileInput() {
        if (!this.fileInput) return;
        this.fileInput.addEventListener('change', () => {
            if (this.fileInput.files.length) {
                this.updateStatus('success', `📁 Selected: ${this.fileInput.files[0].name}`);
            }
        });
    }

    setupTextArea() {
        if (!this.textInput) return;
        this.textInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }

    setupUploadButton() {
        if (!this.uploadBtn) return;
        this.uploadBtn.addEventListener('click', () => this.handleFileUpload());
    }

    setupAnalyzeButton() {
        if (!this.analyzeBtn) return;
        this.analyzeBtn.addEventListener('click', () => this.handleTextAnalysis());
    }

    async handleFileUpload() {
        if (!this.fileInput || !this.fileInput.files.length) {
            this.updateStatus('error', '❌ Please select a file');
            return;
        }
        const file = this.fileInput.files[0];
        await this.analyze(file.name, 'file', file);
    }

    async handleTextAnalysis() {
        if (!this.textInput || !this.textInput.value || this.textInput.value.length < 50) {
            this.updateStatus('error', '❌ Please enter at least 50 characters');
            return;
        }
        const text = this.textInput.value;
        const title = 'Text Analysis ' + new Date().toLocaleString();
        await this.analyze(title, 'text', null, text);
    }

    async analyze(title, type, file = null, text = null) {
        this.showLoader();
        this.updateStatus('loading', '🔍 AI analyzing with GLOBAL search...');

        try {
            const formData = new FormData();
            let url = '/api/';
            
            if (type === 'file') {
                url += 'upload/';
                formData.append('file', file);
                console.log('📡 Uploading file:', file.name);
            } else {
                url += 'analyze-text/';
                formData.append('text', text);
                console.log('📡 Analyzing text, length:', text.length);
            }

            console.log('📡 Sending to backend:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': this.getCsrfToken()
                },
                credentials: 'same-origin'
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Backend error:', errorText);
                throw new Error('Analysis failed - check backend logs');
            }

            const data = await response.json();
            console.log('✅ Backend response:', data);

            // ✅ Use REAL data from backend
            const analysis = {
                id: data.id || data.report_id || Date.now(),
                title: data.title || title,
                type: type,
                created_at: data.created_at || new Date().toISOString(),
                score: data.plagiarism_percentage || 0,
                verdict: data.verdict || (data.plagiarism_percentage < 15 ? 'Original' : data.plagiarism_percentage < 30 ? 'Suspicious' : 'Plagiarized'),
                preview: data.preview || `Analysis completed. Found ${data.sources?.length || 0} matching sources.`,
                breakdown: data.breakdown || {
                    identical: 0,
                    minor: 0,
                    paraphrased: 0,
                    unique: 100
                },
                sources: data.sources || []
            };

            // Update all sections
            if (window.resultsSection) window.resultsSection.addResult(analysis);
            if (window.reportsSection) window.reportsSection.addReport(analysis);
            if (window.citationsSection) window.citationsSection.addAnalysis(analysis);
            if (window.similaritySection) window.similaritySection.addAnalysis(analysis);
            if (window.historySection) window.historySection.addAnalysis(analysis);
            if (window.copyrightSection) window.copyrightSection.addAnalysis(analysis);

            // Update stats
            AppState.stats.totalAnalyses++;
            if (analysis.breakdown?.unique) {
                AppState.stats.avgUniqueness = Math.floor(
                    (AppState.stats.avgUniqueness * (AppState.stats.totalAnalyses - 1) + analysis.breakdown.unique) / 
                    AppState.stats.totalAnalyses
                );
            }
            
            this.updateHeaderStats();
            storageManager.saveData();
            this.showPreview(analysis);
            
            this.updateStatus('success', `✅ Analysis complete! Found ${analysis.sources.length} global sources.`);
            
        } catch (error) {
            console.error('❌ Analysis error:', error);
            this.updateStatus('error', '❌ ' + error.message);
        } finally {
            this.hideLoader();
        }
    }

    getCsrfToken() {
        const name = 'csrftoken';
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

    updateHeaderStats() {
        const totalEl = document.getElementById('totalAnalyses');
        const todayEl = document.getElementById('todayAnalyses');
        const uniqueEl = document.getElementById('uniqueContent');
        
        if (totalEl) {
            const valueEl = totalEl.querySelector('.stat-value');
            if (valueEl) valueEl.textContent = AppState.stats.totalAnalyses;
        }
        if (todayEl) {
            const today = new Date().toDateString();
            const todayCount = AppState.analyses.filter(a => 
                new Date(a.created_at).toDateString() === today
            ).length;
            const valueEl = todayEl.querySelector('.stat-value');
            if (valueEl) valueEl.textContent = todayCount;
        }
        if (uniqueEl) {
            const valueEl = uniqueEl.querySelector('.stat-value');
            if (valueEl) valueEl.textContent = AppState.stats.avgUniqueness + '%';
        }
    }

    showPreview(analysis) {
        if (!this.resultsPreview) return;
        this.resultsPreview.classList.remove('hidden');
        const now = new Date();
        this.previewTime.textContent = now.toLocaleTimeString();
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (analysis.score / 100) * circumference;
        this.previewRing.style.strokeDasharray = circumference;
        this.previewRing.style.strokeDashoffset = offset;
        this.previewScore.textContent = analysis.score + '%';
        this.previewVerdict.textContent = analysis.verdict;
        this.previewVerdict.className = 'verdict ' + (analysis.score < 15 ? 'original' : (analysis.score < 30 ? 'suspicious' : 'plagiarized'));
        this.previewFilename.textContent = analysis.title;
    }

    showLoader() {
        if (this.aiLoader) {
            this.aiLoader.classList.remove('hidden');
        }
        if (this.resultsPreview) {
            this.resultsPreview.classList.add('hidden');
        }
    }

    hideLoader() {
        if (this.aiLoader) {
            this.aiLoader.classList.add('hidden');
        }
    }

    updateStatus(type, message) {
        if (!this.status) return;
        const icons = { waiting: '⏳', loading: '🔍', success: '✅', error: '❌', file: '📁' };
        this.status.innerHTML = `<span class="status-icon">${icons[type] || '⏳'}</span> ${message}`;
    }
}

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', function() {
    window.resultsSection = new ResultsSection();
    window.reportsSection = new ReportsSection();
    window.citationsSection = new CitationsSection();
    window.similaritySection = new SimilaritySection();
    window.historySection = new HistorySection();
    window.copyrightSection = new CopyrightSection();
    window.settingsSection = new SettingsSection();
    window.uploadHandler = new UploadHandler();
    window.sectionManager = new SectionManager();
    createParticles();
});

function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 50; i++) {
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