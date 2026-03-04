class ReportsSection {
    constructor() {
        if (window.reportsSectionInstance) {
            return window.reportsSectionInstance;
        }
        
        console.log('ReportsSection initializing...');
        this.container = document.getElementById('reports-container');
        this.loader = document.getElementById('reports-loader');
        
        if (!this.container) {
            console.warn('Reports container not found');
            return;
        }
        
        window.reportsSectionInstance = this;
        this.init();
    }

    async init() {
        await this.loadReports();
    }

    async loadReports() {
        this.showLoader();
        
        try {
            const mockReports = [
                { id: 1, title: 'Research Paper - AI Ethics', date: new Date().toISOString(), score: 12, type: 'PDF' },
                { id: 2, title: 'Blog Post - Future Tech', date: new Date(Date.now() - 86400000).toISOString(), score: 28, type: 'DOCX' },
                { id: 3, title: 'Thesis - Quantum Computing', date: new Date(Date.now() - 172800000).toISOString(), score: 45, type: 'PDF' },
                { id: 4, title: 'Marketing Content - Q1', date: new Date(Date.now() - 259200000).toISOString(), score: 8, type: 'TXT' }
            ];
            
            setTimeout(() => {
                this.renderReports(mockReports);
                this.hideLoader();
            }, 1000);
            
        } catch (error) {
            console.error('Error loading reports:', error);
            this.renderError();
            this.hideLoader();
        }
    }

    renderReports(reports) {
        if (!this.container) return;
        
        let html = '<div class="reports-grid">';
        
        reports.forEach(report => {
            const date = new Date(report.date);
            const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const badgeClass = report.score < 15 ? 'badge-success' : (report.score < 30 ? 'badge-warning' : 'badge-danger');
            
            html += `
                <div class="report-card">
                    <div class="report-icon">📄</div>
                    <div class="report-info">
                        <h4>${this.escapeHtml(report.title)}</h4>
                        <div class="report-meta">
                            <span>${formattedDate}</span>
                            <span class="report-score ${badgeClass}">${report.score}%</span>
                        </div>
                        <small>Type: ${report.type}</small>
                    </div>
                    <div class="report-actions">
                        <button class="btn-icon view-report" data-id="${report.id}" title="View">👁️</button>
                        <button class="btn-icon download-report" data-id="${report.id}" title="Download">📥</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.container.querySelectorAll('.view-report').forEach(btn => {
            btn.addEventListener('click', () => {
                alert(`Viewing report #${btn.dataset.id}`);
            });
        });

        this.container.querySelectorAll('.download-report').forEach(btn => {
            btn.addEventListener('click', () => {
                this.downloadReport(btn.dataset.id);
            });
        });
    }

    downloadReport(id) {
        const report = `REPORT
======
Report ID: ${id}
Date: ${new Date().toLocaleString()}
        
This is a sample report download.`;
        
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

    renderError() {
        this.container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Error Loading Reports</h3>
                <p>Please try again later.</p>
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
        new ReportsSection();
    });
} else {
    new ReportsSection();
}