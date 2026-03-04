class ReportsSection {
    constructor() {
        console.log('ReportsSection initializing...');
        this.container = document.getElementById('reports-container');
        this.loader = document.getElementById('reports-loader');
        
        if (!this.container) {
            console.error('Reports container not found! Check ID: reports-container');
        }
        if (!this.loader) {
            console.error('Reports loader not found! Check ID: reports-loader');
        }
        
        this.init();
    }

    async init() {
        console.log('ReportsSection init started');
        await this.loadReports();
    }

    async loadReports() {
        console.log('Loading reports...');
        this.showLoader();
        
        try {
            // Mock data
            const mockReports = [
                {
                    id: 1,
                    title: 'Research Paper - AI Ethics',
                    date: new Date().toISOString(),
                    score: 12,
                    type: 'PDF'
                },
                {
                    id: 2,
                    title: 'Blog Post - Future Tech',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    score: 28,
                    type: 'DOCX'
                },
                {
                    id: 3,
                    title: 'Thesis - Quantum Computing',
                    date: new Date(Date.now() - 172800000).toISOString(),
                    score: 45,
                    type: 'PDF'
                },
                {
                    id: 4,
                    title: 'Marketing Content - Q1',
                    date: new Date(Date.now() - 259200000).toISOString(),
                    score: 8,
                    type: 'TXT'
                }
            ];
            
            setTimeout(() => {
                console.log('Rendering reports with mock data');
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
        if (!this.container) {
            console.error('Cannot render reports: container not found');
            return;
        }
        
        let html = '<div class="reports-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">';
        
        reports.forEach(report => {
            const date = new Date(report.date);
            const formattedDate = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
            
            let badgeClass = 'badge-success';
            if (report.score >= 15 && report.score < 30) badgeClass = 'badge-warning';
            if (report.score >= 30) badgeClass = 'badge-danger';
            
            html += `
                <div class="report-card" style="background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                    <div class="report-icon" style="width: 50px; height: 50px; background: linear-gradient(135deg, #4361ee, #4895ef); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white;">📄</div>
                    <div class="report-info" style="flex: 1;">
                        <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 5px;">${this.escapeHtml(report.title)}</h4>
                        <div>
                            <span class="report-date" style="font-size: 0.8rem; color: #6c757d; margin-right: 10px;">${formattedDate}</span>
                            <span class="report-score ${badgeClass}" style="font-size: 0.8rem; font-weight: 600; padding: 2px 8px; border-radius: 50px; background: ${report.score < 15 ? '#4cc9f0' : (report.score < 30 ? '#f8961e' : '#f94144')}; color: white;">${report.score}%</span>
                        </div>
                        <small style="color: #adb5bd;">Type: ${report.type}</small>
                    </div>
                    <div class="report-actions" style="display: flex; gap: 8px;">
                        <button class="btn-icon-only" title="View" onclick="alert('Viewing report #${report.id}')" style="width: 35px; height: 35px; border-radius: 50%; border: none; background: #f8f9fa; cursor: pointer;">
                            👁️
                        </button>
                        <button class="btn-icon-only" title="Download" onclick="downloadReport(${report.id})" style="width: 35px; height: 35px; border-radius: 50%; border: none; background: #f8f9fa; cursor: pointer;">
                            📥
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        this.container.innerHTML = html;
    }

    showLoader() {
        console.log('Showing reports loader');
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
        console.log('Hiding reports loader');
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
                <div class="empty-icon" style="font-size: 4rem; margin-bottom: 20px;">📄</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 10px;">No Reports Yet</h3>
                <p style="color: #6c757d;">Your generated reports will appear here.</p>
            </div>
        `;
    }

    renderError() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="error-state" style="text-align: center; padding: 60px 20px;">
                <div class="error-icon" style="font-size: 4rem; margin-bottom: 20px;">❌</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 10px; color: #f94144;">Error Loading Reports</h3>
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating ReportsSection');
    window.reportsSection = new ReportsSection();
});