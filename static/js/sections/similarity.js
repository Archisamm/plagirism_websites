class SimilaritySection {
    constructor() {
        this.container = document.getElementById('similarity-container');
        this.loader = document.getElementById('similarity-loader');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        setTimeout(() => {
            this.loadSimilarity();
        }, 100);
    }

    async loadSimilarity() {
        this.showLoader();
        try {
            // Mock data
            const data = {
                similarities: [
                    {
                        id: 1,
                        title: 'Research Paper on AI Ethics',
                        type: 'Document',
                        date: new Date(Date.now() - 172800000).toISOString(),
                        score: 12,
                        sources: {
                            internet: 5,
                            publications: 7,
                            internal: 0
                        }
                    },
                    {
                        id: 2,
                        title: 'Blog Post - Future of Technology',
                        type: 'Text',
                        date: new Date(Date.now() - 432000000).toISOString(),
                        score: 28,
                        sources: {
                            internet: 18,
                            publications: 5,
                            internal: 5
                        }
                    },
                    {
                        id: 3,
                        title: 'Thesis - Quantum Computing',
                        type: 'Document',
                        date: new Date(Date.now() - 864000000).toISOString(),
                        score: 45,
                        sources: {
                            internet: 25,
                            publications: 15,
                            internal: 5
                        }
                    }
                ]
            };
            
            this.renderSimilarity(data);
        } catch (error) {
            console.error('Error loading similarity:', error);
            this.renderError();
        } finally {
            this.hideLoader();
        }
    }

    renderSimilarity(data) {
        if (!this.container) return;
        
        const html = `
            <div class="similarity-timeline">
                ${data.similarities.map(item => {
                    const date = new Date(item.date);
                    const formattedDate = date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                    });
                    
                    let meterClass = 'meter-success';
                    if (item.score >= 15 && item.score < 30) meterClass = 'meter-warning';
                    if (item.score >= 30) meterClass = 'meter-danger';
                    
                    return `
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

                                <button class="btn-small btn-outline view-similarity" data-id="${item.id}" style="margin-top: 10px;">
                                    View Detailed Analysis
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

    attachEventListeners() {
        if (!this.container) return;
        
        this.container.querySelectorAll('.view-similarity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                alert(`Viewing detailed similarity analysis for item #${id}`);
            });
        });
    }

    showLoader() {
        if (this.loader) {
            this.loader.classList.remove('hidden');
        }
        if (this.container) {
            this.container.classList.add('hidden');
            this.container.innerHTML = '';
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
                <div class="empty-icon">📈</div>
                <h3>No Similarity Data</h3>
                <p>Run an analysis to see similarity metrics here.</p>
            </div>
        `;
    }

    renderError() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Error Loading Similarity Data</h3>
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

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.similaritySection = new SimilaritySection();
    });
} else {
    window.similaritySection = new SimilaritySection();
}