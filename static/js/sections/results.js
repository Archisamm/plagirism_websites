class ResultsSection {
    constructor() {
        if (window.resultsSectionInstance) {
            return window.resultsSectionInstance;
        }
        
        console.log('ResultsSection initializing...');
        this.container = document.getElementById('results-container');
        this.loader = document.getElementById('results-loader');
        
        if (!this.container) {
            console.warn('Results container not found');
            return;
        }
        
        window.resultsSectionInstance = this;
        this.init();
    }

    async init() {
        await this.loadResults();
    }

    async loadResults() {
        this.showLoader();
        
        try {
            // Mock data
            const mockResults = [
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
                },
                {
                    id: 3,
                    title: 'Thesis - Quantum Computing',
                    score: 45,
                    verdict: 'Plagiarized',
                    created_at: new Date(Date.now() - 172800000).toISOString(),
                    preview: 'Quantum computing represents a paradigm shift in computational capabilities...',
                    breakdown: { identical: 27, minor: 10, paraphrased: 8, unique: 55 }
                }
            ];
            
            setTimeout(() => {
                this.renderResults(mockResults);
                this.hideLoader();
            }, 1000);
            
        } catch (error) {
            console.error('Error loading results:', error);
            this.renderError();
            this.hideLoader();
        }
    }

    renderResults(results) {
        if (!this.container) return;
        
        let html = '<div class="results-list">';
        
        results.forEach(result => {
            const date = new Date(result.created_at);
            const formattedDate = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            const badgeClass = this.getBadgeClass(result.score);
            
            html += `
                <div class="result-card">
                    <div class="result-header">
                        <h3>📄 ${this.escapeHtml(result.title)}</h3>
                        <span class="result-date">${formattedDate}</span>
                    </div>
                    
                    <span class="result-badge ${badgeClass}">
                        ${result.score}% ${result.verdict}
                    </span>

                    <p class="result-preview">
                        ${this.escapeHtml(result.preview)}
                    </p>

                    <div class="result-stats">
                        <div class="stat-item">
                            <span class="stat-label">Identical</span>
                            <span class="stat-value">${result.breakdown.identical}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Minor</span>
                            <span class="stat-value">${result.breakdown.minor}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Paraphrased</span>
                            <span class="stat-value">${result.breakdown.paraphrased}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Unique</span>
                            <span class="stat-value">${result.breakdown.unique}%</span>
                        </div>
                    </div>

                    <div class="result-actions">
                        <button class="btn-small btn-primary view-details" data-id="${result.id}">
                            👁️ View Details
                        </button>
                        <button class="btn-small btn-success download-report" data-id="${result.id}">
                            📥 Download
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    getBadgeClass(score) {
        if (score < 15) return 'badge-success';
        if (score < 30) return 'badge-warning';
        return 'badge-danger';
    }

    attachEventListeners() {
        this.container.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', () => {
                alert(`Viewing details for result #${btn.dataset.id}`);
            });
        });

        this.container.querySelectorAll('.download-report').forEach(btn => {
            btn.addEventListener('click', () => {
                this.downloadReport(btn.dataset.id);
            });
        });
    }

    downloadReport(id) {
        const report = `PLAGIARISM REPORT
================
Report ID: ${id}
Date: ${new Date().toLocaleString()}
        
This is a sample report.`;
        
        const blob = new Blob([report], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${id}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    showLoader() {
        if (this.loader) {
            this.loader.classList.remove('hidden');
        }
        if (this.container) {
            this.container.classList.add('hidden');
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
        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No Results Yet</h3>
                <p>Upload a document to see results here.</p>
            </div>
        `;
    }

    renderError() {
        this.container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Error Loading Results</h3>
                <p>Please try again.</p>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ResultsSection();
    });
} else {
    new ResultsSection();
}