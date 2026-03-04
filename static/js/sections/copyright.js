class CopyrightSection {
    constructor() {
        if (window.copyrightSectionInstance) {
            return window.copyrightSectionInstance;
        }
        
        console.log('CopyrightSection initializing...');
        this.container = document.getElementById('copyright-container');
        this.loader = document.getElementById('copyright-loader');
        
        if (!this.container) {
            console.warn('Copyright container not found');
            return;
        }
        
        window.copyrightSectionInstance = this;
        this.init();
    }

    async init() {
        await this.loadCopyrightData();
    }

    async loadCopyrightData() {
        this.showLoader();
        
        try {
            const mockData = {
                risk_level: 'low',
                risk_percentage: 15,
                checked_documents: 42,
                flagged: 3,
                protected: 39,
                flagged_items: [
                    {
                        id: 1,
                        title: 'Marketing Blog Post - Q1 2026',
                        risk: 65,
                        excerpt: 'The quick brown fox jumps over the lazy dog... This content appears similar to multiple online sources.',
                        sources: [
                            { title: 'Example.com Blog', url: '#' },
                            { title: 'Marketing Weekly', url: '#' }
                        ]
                    },
                    {
                        id: 2,
                        title: 'Product Description - New Launch',
                        risk: 42,
                        excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit... Found matching content on competitor sites.',
                        sources: [
                            { title: 'Competitor Site A', url: '#' },
                            { title: 'Product Review Blog', url: '#' }
                        ]
                    }
                ]
            };
            
            setTimeout(() => {
                this.renderCopyrightData(mockData);
                this.hideLoader();
            }, 1000);
            
        } catch (error) {
            console.error('Error loading copyright data:', error);
            this.renderError();
            this.hideLoader();
        }
    }

    renderCopyrightData(data) {
        if (!this.container) return;
        
        const riskClass = data.risk_level === 'low' ? 'success' : (data.risk_level === 'medium' ? 'warning' : 'danger');
        const riskLevelText = data.risk_level.charAt(0).toUpperCase() + data.risk_level.slice(1);
        
        let html = `
            <div class="copyright-summary">
                <div class="risk-meter">
                    <div class="risk-circle ${riskClass}">
                        ${data.risk_percentage}%
                    </div>
                    <div class="risk-info">
                        <h4>Copyright Risk Level</h4>
                        <p class="risk-level ${riskClass}">${riskLevelText} Risk</p>
                    </div>
                </div>

                <div class="copyright-stats">
                    <div class="stat-box">
                        <span class="stat-number">${data.checked_documents}</span>
                        <span class="stat-label">Documents Checked</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-number">${data.flagged}</span>
                        <span class="stat-label">Flagged Content</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-number">${data.protected}</span>
                        <span class="stat-label">Protected</span>
                    </div>
                </div>
            </div>

            <div class="flagged-content">
                <h3 class="section-title" style="font-size: 1.2rem; margin-bottom: 1rem;">
                    <span class="section-title-icon" style="width: 32px; height: 32px; font-size: 1rem;">⚠️</span>
                    Flagged Content
                </h3>
        `;
        
        data.flagged_items.forEach(item => {
            html += `
                <div class="flagged-item">
                    <div class="flagged-header">
                        <span class="flagged-title">${this.escapeHtml(item.title)}</span>
                        <span class="flagged-risk">${item.risk}% Risk</span>
                    </div>
                    <p class="flagged-excerpt">${this.escapeHtml(item.excerpt)}</p>
                    <div class="flagged-sources">
                        <strong>Potential Sources:</strong>
                        <ul>
            `;
            
            item.sources.forEach(source => {
                html += `<li><a href="${source.url}" target="_blank">${this.escapeHtml(source.title)}</a></li>`;
            });
            
            html += `
                        </ul>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        this.container.innerHTML = html;
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
                <div class="empty-icon">©️</div>
                <h3>No Copyright Issues Detected</h3>
                <p>Your content appears to be original.</p>
            </div>
        `;
    }

    renderError() {
        this.container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Error Loading Copyright Data</h3>
                <p>Please try again later.</p>
                <button class="btn-small btn-primary" onclick="window.location.reload()">Retry</button>
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
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new CopyrightSection();
    });
} else {
    new CopyrightSection();
}