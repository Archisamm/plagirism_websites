class HistorySection {
    constructor() {
        if (window.historySectionInstance) {
            return window.historySectionInstance;
        }
        
        console.log('HistorySection initializing...');
        this.container = document.getElementById('history-container');
        this.loader = document.getElementById('history-loader');
        this.currentFilter = 'all';
        
        if (!this.container) {
            console.warn('History container not found');
            return;
        }
        
        window.historySectionInstance = this;
        this.init();
    }

    async init() {
        await this.loadHistory();
    }

    async loadHistory() {
        this.showLoader();
        
        try {
            const mockHistory = [
                { id: 1, title: 'Research Paper on AI Ethics', type: 'document', date: new Date().toISOString(), score: 12, verdict: 'Original' },
                { id: 2, title: 'Blog Post - Future of Technology', type: 'text', date: new Date(Date.now() - 86400000).toISOString(), score: 28, verdict: 'Suspicious' },
                { id: 3, title: 'Thesis - Quantum Computing', type: 'document', date: new Date(Date.now() - 172800000).toISOString(), score: 45, verdict: 'Plagiarized' },
                { id: 4, title: 'Marketing Content - Q1 Report', type: 'document', date: new Date(Date.now() - 259200000).toISOString(), score: 8, verdict: 'Original' },
                { id: 5, title: 'Product Description - New Launch', type: 'text', date: new Date(Date.now() - 345600000).toISOString(), score: 22, verdict: 'Suspicious' }
            ];
            
            this.historyData = mockHistory;
            
            setTimeout(() => {
                this.renderHistory(mockHistory);
                this.hideLoader();
            }, 1000);
            
        } catch (error) {
            console.error('Error loading history:', error);
            this.renderError();
            this.hideLoader();
        }
    }

    renderHistory(history) {
        if (!this.container) return;
        
        let html = `
            <div class="history-filters">
                <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
                <button class="filter-btn ${this.currentFilter === 'document' ? 'active' : ''}" data-filter="document">Documents</button>
                <button class="filter-btn ${this.currentFilter === 'text' ? 'active' : ''}" data-filter="text">Text</button>
                <button class="filter-btn ${this.currentFilter === 'recent' ? 'active' : ''}" data-filter="recent">Last 7 Days</button>
            </div>

            <div class="history-list">
        `;
        
        history.forEach(item => {
            const date = new Date(item.date);
            const timeAgo = this.timeAgo(date);
            const verdictClass = item.score < 15 ? 'success' : (item.score < 30 ? 'warning' : 'danger');
            
            html += `
                <div class="history-item" data-type="${item.type}" data-date="${item.date}">
                    <div class="history-icon">${item.type === 'document' ? '📄' : '📝'}</div>
                    <div class="history-details">
                        <div class="history-header">
                            <h4>${this.escapeHtml(item.title)}</h4>
                            <span class="history-time">${timeAgo}</span>
                        </div>
                        <div class="history-meta">
                            <span class="history-score">${item.score}% Match</span>
                            <span class="history-verdict ${verdictClass}">${item.verdict}</span>
                        </div>
                    </div>
                    <div class="history-actions">
                        <button class="btn-icon view-history" data-id="${item.id}" title="View">👁️</button>
                        <button class="btn-icon download-history" data-id="${item.id}" title="Download">📥</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    timeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'just now';
    }

    attachEventListeners() {
        // Filter buttons
        this.container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = btn.dataset.filter;
                this.applyFilter(filter);
                
                this.container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // View buttons
        this.container.querySelectorAll('.view-history').forEach(btn => {
            btn.addEventListener('click', () => {
                alert(`Viewing history item #${btn.dataset.id}`);
            });
        });

        // Download buttons
        this.container.querySelectorAll('.download-history').forEach(btn => {
            btn.addEventListener('click', () => {
                this.downloadHistoryItem(btn.dataset.id);
            });
        });
    }

    applyFilter(filter) {
        this.currentFilter = filter;
        
        if (!this.historyData) return;
        
        let filtered = [...this.historyData];

        if (filter === 'document') {
            filtered = filtered.filter(item => item.type === 'document');
        } else if (filter === 'text') {
            filtered = filtered.filter(item => item.type === 'text');
        } else if (filter === 'recent') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            filtered = filtered.filter(item => new Date(item.date) > sevenDaysAgo);
        }

        this.renderHistory(filtered);
    }

    downloadHistoryItem(id) {
        const report = `HISTORY ITEM
============
Item ID: ${id}
Date: ${new Date().toLocaleString()}
        
This is a sample history item download.`;
        
        const blob = new Blob([report], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `history-${id}.txt`;
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
                <h3>Error Loading History</h3>
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
        new HistorySection();
    });
} else {
    new HistorySection();
}