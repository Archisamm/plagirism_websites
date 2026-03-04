class CitationsSection {
    constructor() {
        if (window.citationsSectionInstance) {
            return window.citationsSectionInstance;
        }
        
        console.log('CitationsSection initializing...');
        this.container = document.getElementById('citations-container');
        this.loader = document.getElementById('citations-loader');
        
        if (!this.container) {
            console.warn('Citations container not found');
            return;
        }
        
        window.citationsSectionInstance = this;
        this.init();
    }

    async init() {
        await this.loadCitations();
    }

    async loadCitations() {
        this.showLoader();
        
        try {
            const mockData = {
                total: 24,
                correct: 18,
                needs_review: 6,
                citations: [
                    {
                        id: 1,
                        text: "Smith et al. (2020) demonstrated that AI can detect plagiarism with 99% accuracy.",
                        format: "APA",
                        page: 42,
                        correct: true
                    },
                    {
                        id: 2,
                        text: "Johnson and Lee, 2019, p. 123 - Machine Learning Applications",
                        format: "MLA",
                        page: 123,
                        correct: false,
                        suggestion: "Should be: (Johnson and Lee 123)"
                    },
                    {
                        id: 3,
                        text: "[1] K. Kumar, et al., 'Deep Learning for Text Analysis,' IEEE Trans., vol. 15, pp. 45-52, 2021",
                        format: "IEEE",
                        page: 45,
                        correct: true
                    },
                    {
                        id: 4,
                        text: "Williams, John. The Future of AI. Oxford University Press, 2022.",
                        format: "Chicago",
                        page: 78,
                        correct: false,
                        suggestion: "Should include: Williams, John. 2022. The Future of AI. Oxford: Oxford University Press."
                    }
                ]
            };
            
            setTimeout(() => {
                this.renderCitations(mockData);
                this.hideLoader();
            }, 1000);
            
        } catch (error) {
            console.error('Error loading citations:', error);
            this.renderError();
            this.hideLoader();
        }
    }

    renderCitations(data) {
        if (!this.container) return;
        
        let html = `
            <div class="citations-summary">
                <div class="summary-card">
                    <div class="summary-icon">📚</div>
                    <div class="summary-info">
                        <span class="summary-value">${data.total}</span>
                        <span class="summary-label">Total Citations</span>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">✅</div>
                    <div class="summary-info">
                        <span class="summary-value">${data.correct}</span>
                        <span class="summary-label">Correct Format</span>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">⚠️</div>
                    <div class="summary-info">
                        <span class="summary-value">${data.needs_review}</span>
                        <span class="summary-label">Needs Review</span>
                    </div>
                </div>
            </div>

            <div class="citations-list">
        `;
        
        data.citations.forEach(citation => {
            const cardClass = citation.correct ? 'citation-card' : 'citation-card needs-review';
            const badgeClass = citation.correct ? 'status-badge success' : 'status-badge warning';
            const badgeText = citation.correct ? '✅ Correct' : '⚠️ Needs Review';
            
            html += `
                <div class="${cardClass}">
                    <div class="citation-status">
                        <span class="${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="citation-text">"${this.escapeHtml(citation.text)}"</div>
                    <div class="citation-meta">
                        <span>${citation.format}</span>
                        <span>Page ${citation.page}</span>
                    </div>
            `;
            
            if (!citation.correct) {
                html += `
                    <div class="citation-suggestion">
                        <strong>Suggestion:</strong> ${this.escapeHtml(citation.suggestion)}
                    </div>
                `;
            }
            
            html += `</div>`;
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

    renderError() {
        this.container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Error Loading Citations</h3>
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
        new CitationsSection();
    });
} else {
    new CitationsSection();
}