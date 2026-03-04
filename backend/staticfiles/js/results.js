class ResultsSection {
    constructor() {
        this.container = document.getElementById('results-container');
        this.loader = document.getElementById('results-loader');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        // Small delay to ensure container is ready
        setTimeout(() => {
            this.loadResults();
        }, 100);
    }

    async loadResults() {
        this.showLoader();
        try {
            // Try to fetch from API
            let data;
            try {
                const response = await fetch('/api/recent-results/');
                if (response.ok) {
                    data = await response.json();
                } else {
                    throw new Error('API not available');
                }
            } catch (error) {
                console.log('Using mock data for results');
                // Mock data that matches your CSS classes
                data = {
                    results: [
                        {
                            id: 1,
                            title: 'Research Paper on AI Ethics',
                            score: 12,
                            verdict: 'Original',
                            created_at: new Date().toISOString(),
                            preview: 'This paper discusses the ethical implications of artificial intelligence in modern society...',
                            breakdown: { identical: 7, minor: 3, paraphrased: 2, unique: 88 }
                        },
                        {
                            id: 2,
                            title: 'Blog Post - Future of Technology',
                            score: 28,
                            verdict: 'Suspicious',
                            created_at: new Date(Date.now() - 86400000).toISOString(),
                            preview: 'Technology is advancing at an unprecedented rate, with AI leading the charge...',
                            breakdown: { identical: 17, minor: 6, paraphrased: 5, unique: 72 }
                        }
                    ]
                };
            }
            
            if (data.results && data.results.length > 0) {
                this.renderResults(data.results);
            } else {
                this.renderEmpty();
            }
        } catch (error) {
            console.error('Error loading results:', error);
            this.renderError();
        } finally {
            this.hideLoader();
        }
    }

    renderResults(results) {
        if (!this.container) return;
        
        // Create HTML with proper classes that match unified.css
        const html = `
            <div class="results-list">
                ${results.map(result => {
                    const date = new Date(result.created_at);
                    const formattedDate = date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    });
                    
                    const badgeClass = this.getBadgeClass(result.score);
                    
                    return `
                        <div class="match-card" data-id="${result.id}" style="margin-bottom: 20px;">
                            <div class="match-header">
                                <span class="match-title">📄 ${this.escapeHtml(result.title)}</span>
                                <span class="match-badge ${badgeClass}">${result.score}% ${result.verdict}</span>
                            </div>
                            
                            <div class="match-author">
                                <span>📅</span> ${formattedDate}
                            </div>
                            
                            <p style="margin: 15px 0; color: var(--gray-600); line-height: 1.6;">
                                ${this.escapeHtml(result.preview)}
                            </p>
                            
                            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0;">
                                <div class="stat-item">
                                    <span class="stat-label">Identical</span>
                                    <span class="stat-value" style="color: var(--primary);">${result.breakdown?.identical || 0}%</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Minor</span>
                                    <span class="stat-value" style="color: var(--secondary);">${result.breakdown?.minor || 0}%</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Paraphrased</span>
                                    <span class="stat-value" style="color: var(--warning);">${result.breakdown?.paraphrased || 0}%</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Unique</span>
                                    <span class="stat-value" style="color: var(--success);">${result.breakdown?.unique || 0}%</span>
                                </div>
                            </div>
                            
                            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                                <button class="btn-small btn-primary view-details" data-id="${result.id}">
                                    <span class="btn-icon">👁️</span> View Details
                                </button>
                                <button class="btn-small btn-success download-report" data-report-id="${result.id}">
                                    <span class="btn-icon">📥</span> Download Report
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    getBadgeClass(score) {
        if (score < 15) return 'badge-success';
        if (score < 30) return 'badge-warning';
        return 'badge-danger';
    }

    attachEventListeners() {
        if (!this.container) return;
        
        // View Details buttons
        this.container.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                this.viewDetails(id);
            });
        });

        // Download Report buttons
        this.container.querySelectorAll('.download-report').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const reportId = btn.dataset.reportId;
                this.downloadReport(reportId);
            });
        });
    }

    viewDetails(id) {
        // You can replace this with a modal or detailed view
        alert(`Viewing detailed analysis for result #${id}`);
        
        // Optional: You could redirect to a details page
        // window.location.href = `/result/${id}/`;
    }

    downloadReport(reportId) {
        // Create a simple text report
        const report = `PLAGIARISM REPORT
================
Report ID: ${reportId}
Date: ${new Date().toLocaleString()}
        
This is a sample report. In production, this would contain actual plagiarism data.`;
        
        const blob = new Blob([report], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    showLoader() {
        if (this.loader) {
            this.loader.classList.remove('hidden');
        }
        if (this.container) {
            this.container.classList.add('hidden');
            this.container.innerHTML = ''; // Clear any old content
        }
    }

    hideLoader() {
        if (this.loader) {
            this.loader.classList.add('hidden');
        }
        if (this.container) {
            this.container.classList.remove('hidden');
        }
    }

    renderEmpty() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No Results Yet</h3>
                <p>Upload a document or paste text to see analysis results here.</p>
                <a href="#upload" class="btn-primary" style="display: inline-block; padding: 12px 30px; text-decoration: none;">Upload Now</a>
            </div>
        `;
    }

    renderError() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Error Loading Results</h3>
                <p>Please try again later.</p>
                <button class="btn-primary" onclick="window.location.reload()" style="padding: 12px 30px; border: none; cursor: pointer;">Retry</button>
            </div>
        `;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.resultsSection = new ResultsSection();
    });
} else {
    window.resultsSection = new ResultsSection();
}