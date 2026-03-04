class ResultsSection {
    constructor() {
        console.log('ResultsSection initializing...'); // Debug log
        this.container = document.getElementById('results-container');
        this.loader = document.getElementById('results-loader');
        
        // Check if elements exist
        if (!this.container) {
            console.error('Results container not found! Check ID: results-container');
        }
        if (!this.loader) {
            console.error('Results loader not found! Check ID: results-loader');
        }
        
        this.init();
    }

    async init() {
        console.log('ResultsSection init started');
        await this.loadResults();
    }

    async loadResults() {
        console.log('Loading results...');
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
            
            // Simulate network delay
            setTimeout(() => {
                console.log('Rendering results with mock data');
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
        if (!this.container) {
            console.error('Cannot render results: container not found');
            return;
        }
        
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
                <div class="match-card" style="margin-bottom: 20px; padding: 20px;">
                    <div class="match-header">
                        <span class="match-title" style="font-size: 1.2rem; font-weight: 600;">📄 ${this.escapeHtml(result.title)}</span>
                        <span class="match-badge ${badgeClass}" style="padding: 6px 15px;">${result.score}% ${result.verdict}</span>
                    </div>
                    
                    <div class="match-author" style="margin: 10px 0; color: #6c757d;">
                        <span>📅</span> ${formattedDate}
                    </div>
                    
                    <p style="margin: 15px 0; color: #495057; line-height: 1.6;">
                        ${this.escapeHtml(result.preview)}
                    </p>
                    
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0;">
                        <div class="stat-item" style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                            <span class="stat-label" style="display: block; font-size: 0.8rem; color: #6c757d;">Identical</span>
                            <span class="stat-value" style="font-size: 1.2rem; font-weight: 700; color: #4361ee;">${result.breakdown.identical}%</span>
                        </div>
                        <div class="stat-item" style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                            <span class="stat-label" style="display: block; font-size: 0.8rem; color: #6c757d;">Minor</span>
                            <span class="stat-value" style="font-size: 1.2rem; font-weight: 700; color: #f72585;">${result.breakdown.minor}%</span>
                        </div>
                        <div class="stat-item" style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                            <span class="stat-label" style="display: block; font-size: 0.8rem; color: #6c757d;">Paraphrased</span>
                            <span class="stat-value" style="font-size: 1.2rem; font-weight: 700; color: #f8961e;">${result.breakdown.paraphrased}%</span>
                        </div>
                        <div class="stat-item" style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                            <span class="stat-label" style="display: block; font-size: 0.8rem; color: #6c757d;">Unique</span>
                            <span class="stat-value" style="font-size: 1.2rem; font-weight: 700; color: #4cc9f0;">${result.breakdown.unique}%</span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button class="btn-small btn-primary" style="padding: 8px 16px; border-radius: 50px; border: none; background: #4361ee; color: white; cursor: pointer;" onclick="alert('Viewing details for result #${result.id}')">
                            <span style="margin-right: 5px;">👁️</span> View Details
                        </button>
                        <button class="btn-small btn-success" style="padding: 8px 16px; border-radius: 50px; border: none; background: #4cc9f0; color: white; cursor: pointer;" onclick="downloadReport(${result.id})">
                            <span style="margin-right: 5px;">📥</span> Download Report
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        this.container.innerHTML = html;
    }

    getBadgeClass(score) {
        if (score < 15) return 'badge-success';
        if (score < 30) return 'badge-warning';
        return 'badge-danger';
    }

    showLoader() {
        console.log('Showing results loader');
        if (this.loader) {
            this.loader.style.display = 'flex';
            this.loader.classList.remove('hidden');
        }
        if (this.container) {
            this.container.style.display = 'none';
            this.container.classList.add('hidden');
        }
    }

    hideLoader() {
        console.log('Hiding results loader');
        if (this.loader) {
            this.loader.style.display = 'none';
            this.loader.classList.add('hidden');
        }
        if (this.container) {
            this.container.style.display = 'block';
            this.container.classList.remove('hidden');
        }
    }

    renderEmpty() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 60px 20px;">
                <div class="empty-icon" style="font-size: 4rem; margin-bottom: 20px;">📊</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 10px;">No Results Yet</h3>
                <p style="color: #6c757d; margin-bottom: 20px;">Upload a document or paste text to see analysis results here.</p>
                <a href="#upload" class="btn-primary" style="display: inline-block; padding: 12px 30px; background: #4361ee; color: white; text-decoration: none; border-radius: 50px;">Upload Now</a>
            </div>
        `;
    }

    renderError() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="error-state" style="text-align: center; padding: 60px 20px;">
                <div class="error-icon" style="font-size: 4rem; margin-bottom: 20px;">❌</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 10px; color: #f94144;">Error Loading Results</h3>
                <p style="color: #6c757d; margin-bottom: 20px;">Please try again later.</p>
                <button class="btn-primary" onclick="window.location.reload()" style="padding: 12px 30px; background: #4361ee; color: white; border: none; border-radius: 50px; cursor: pointer;">Retry</button>
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

// Global download function
window.downloadReport = function(reportId) {
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
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating ResultsSection');
    window.resultsSection = new ResultsSection();
});