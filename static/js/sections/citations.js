class CitationsSection {
    constructor() {
        console.log('CitationsSection initializing...');
        this.container = document.getElementById('citations-container');
        this.loader = document.getElementById('citations-loader');
        
        if (!this.container) {
            console.error('Citations container not found! Check ID: citations-container');
        }
        if (!this.loader) {
            console.error('Citations loader not found! Check ID: citations-loader');
        }
        
        this.init();
    }

    async init() {
        console.log('CitationsSection init started');
        await this.loadCitations();
    }

    async loadCitations() {
        console.log('Loading citations...');
        this.showLoader();
        
        try {
            // Mock data
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
                console.log('Rendering citations with mock data');
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
        if (!this.container) {
            console.error('Cannot render citations: container not found');
            return;
        }
        
        let html = `
            <div class="citations-summary" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
                <div class="summary-card" style="background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                    <div class="summary-icon" style="width: 50px; height: 50px; background: linear-gradient(135deg, #f72585, #b5179e); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white;">📚</div>
                    <div class="summary-info" style="flex: 1;">
                        <span class="summary-value" style="font-size: 1.5rem; font-weight: 800; display: block;">${data.total}</span>
                        <span class="summary-label" style="font-size: 0.9rem; color: #6c757d;">Total Citations</span>
                    </div>
                </div>
                <div class="summary-card" style="background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                    <div class="summary-icon" style="width: 50px; height: 50px; background: linear-gradient(135deg, #4cc9f0, #4895ef); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white;">✅</div>
                    <div class="summary-info" style="flex: 1;">
                        <span class="summary-value" style="font-size: 1.5rem; font-weight: 800; display: block;">${data.correct}</span>
                        <span class="summary-label" style="font-size: 0.9rem; color: #6c757d;">Correct Format</span>
                    </div>
                </div>
                <div class="summary-card" style="background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                    <div class="summary-icon" style="width: 50px; height: 50px; background: linear-gradient(135deg, #f8961e, #f9c74f); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white;">⚠️</div>
                    <div class="summary-info" style="flex: 1;">
                        <span class="summary-value" style="font-size: 1.5rem; font-weight: 800; display: block;">${data.needs_review}</span>
                        <span class="summary-label" style="font-size: 0.9rem; color: #6c757d;">Needs Review</span>
                    </div>
                </div>
            </div>

            <div class="citations-list">
        `;
        
        data.citations.forEach(citation => {
            const borderColor = citation.correct ? '#4cc9f0' : '#f8961e';
            const badgeClass = citation.correct ? 'success' : 'warning';
            const badgeColor = citation.correct ? '#4cc9f0' : '#f8961e';
            const badgeText = citation.correct ? '✅ Correct' : '⚠️ Needs Review';
            
            html += `
                <div class="citation-card" style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 15px; border-left: 4px solid ${borderColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div class="citation-status" style="margin-bottom: 10px;">
                        <span class="status-badge ${badgeClass}" style="padding: 4px 12px; border-radius: 50px; font-size: 0.8rem; font-weight: 600; background: ${badgeColor}; color: white; display: inline-block;">${badgeText}</span>
                    </div>
                    <div class="citation-text" style="font-size: 1rem; margin-bottom: 10px; color: #212529; font-style: italic;">"${this.escapeHtml(citation.text)}"</div>
                    <div class="citation-meta" style="display: flex; gap: 15px; font-size: 0.9rem; color: #6c757d; margin-bottom: 10px;">
                        <span class="citation-format">${citation.format}</span>
                        <span class="citation-location">Page ${citation.page}</span>
                    </div>
            `;
            
            if (!citation.correct) {
                html += `
                    <div class="citation-suggestion" style="margin-top: 10px; padding: 10px; background: #fff9e6; border-radius: 8px; font-size: 0.9rem; border-left: 3px solid #f8961e;">
                        <strong style="color: #212529;">Suggestion:</strong> ${this.escapeHtml(citation.suggestion)}
                    </div>
                `;
            }
            
            html += `</div>`;
        });
        
        html += '</div>';
        this.container.innerHTML = html;
    }

    showLoader() {
        console.log('Showing citations loader');
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
        console.log('Hiding citations loader');
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
                <div class="empty-icon" style="font-size: 4rem; margin-bottom: 20px;">📚</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 10px;">No Citations Found</h3>
                <p style="color: #6c757d; margin-bottom: 20px;">Citations from your analyzed documents will appear here.</p>
                <a href="#upload" class="btn-primary" style="display: inline-block; padding: 12px 30px; background: #4361ee; color: white; text-decoration: none; border-radius: 50px;">Upload Document</a>
            </div>
        `;
    }

    renderError() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="error-state" style="text-align: center; padding: 60px 20px;">
                <div class="error-icon" style="font-size: 4rem; margin-bottom: 20px;">❌</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 10px; color: #f94144;">Error Loading Citations</h3>
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
    console.log('DOM loaded, creating CitationsSection');
    window.citationsSection = new CitationsSection();
});