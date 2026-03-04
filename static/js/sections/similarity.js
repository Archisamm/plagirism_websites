class SimilaritySection {
    constructor() {
        if (window.similaritySectionInstance) {
            return window.similaritySectionInstance;
        }
        
        console.log('SimilaritySection initializing...');
        this.container = document.getElementById('similarity-container');
        this.loader = document.getElementById('similarity-loader');
        
        if (!this.container) {
            console.warn('Similarity container not found');
            return;
        }
        
        window.similaritySectionInstance = this;
        this.init();
    }

    async init() {
        await this.loadSimilarity();
    }

    async loadSimilarity() {
        this.showLoader();
        
        try {
            const mockData = {
                similarities: [
                    {
                        id: 1,
                        title: 'Research Paper on AI Ethics',
                        type: 'Document',
                        date: new Date(Date.now() - 172800000).toISOString(),
                        score: 12,
                        sources: { internet: 5, publications: 7, internal: 0 }
                    },
                    {
                        id: 2,
                        title: 'Blog Post - Future of Technology',
                        type: 'Text',
                        date: new Date(Date.now() - 432000000).toISOString(),
                        score: 28,
                        sources: { internet: 18, publications: 5, internal: 5 }
                    },
                    {
                        id: 3,
                        title: 'Thesis - Quantum Computing',
                        type: 'Document',
                        date: new Date(Date.now() - 864000000).toISOString(),
                        score: 45,
                        sources: { internet: 25, publications: 15, internal: 5 }
                    }
                ]
            };
            
            setTimeout(() => {
                this.renderSimilarity(mockData);
                this.hideLoader();
            }, 1000);
            
        } catch (error) {
            console.error('Error loading similarity:', error);
            this.renderError();
            this.hideLoader();
        }
    }

    renderSimilarity(data) {
        if (!this.container) return;
        
        let html = '<div class="similarity-timeline">';
        
        data.similarities.forEach(item => {
            const date = new Date(item.date);
            const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            const meterClass = item.score < 15 ? 'success' : (item.score < 30 ? 'warning' : 'danger');
            
            html += `
                <div class="timeline-item">
                    <div class="timeline-date">${formattedDate}</div>
                    <div class="timeline-content">
                        <div class="document-info">
                            <h4>${this.escapeHtml(item.title)}</h4>
                            <span class="document-type">${item.type}</span>
                        </div>
                        
                        <div class="similarity-meter">
                            <div class="meter-bar">
                                <div class="meter-fill ${meterClass}" style="width: ${item.score}%"></div>
                            </div>
                            <span class="meter-score">${item.score}%</span>
                        </div>

                        <div class="similarity-breakdown">
                            <div class="breakdown-item">
                                <span class="breakdown-label">Internet</span>
                                <span class="breakdown-value">${item.sources.internet}</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="breakdown-label">Publications</span>
                                <span class="breakdown-value">${item.sources.publications}</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="breakdown-label">Internal</span>
                                <span class="breakdown-value">${item.sources.internal}</span>
                            </div>
                        </div>

                        <button class="btn-small btn-outline view-similarity" data-id="${item.id}">
                            View Details
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        this.container.innerHTML = html;
        
        this.container.querySelectorAll('.view-similarity').forEach(btn => {
            btn.addEventListener('click', () => {
                alert(`Viewing similarity details for item #${btn.dataset.id}`);
            });
        });
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
                <h3>Error Loading Similarity Data</h3>
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
        new SimilaritySection();
    });
} else {
    new SimilaritySection();
}