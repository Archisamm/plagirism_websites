class SettingsSection {
    constructor() {
        if (window.settingsSectionInstance) {
            return window.settingsSectionInstance;
        }
        
        console.log('SettingsSection initializing...');
        this.container = document.getElementById('settings-container');
        this.loader = document.getElementById('settings-loader');
        
        if (!this.container) {
            console.warn('Settings container not found');
            return;
        }
        
        window.settingsSectionInstance = this;
        this.init();
    }

    async init() {
        await this.loadSettings();
    }

    async loadSettings() {
        this.showLoader();
        
        try {
            // Get user data from localStorage or API
            const userData = {
                display_name: localStorage.getItem('user_display_name') || 'John Doe',
                email: localStorage.getItem('user_email') || 'john.doe@example.com',
                institution: localStorage.getItem('user_institution') || 'University of Technology',
                phone: localStorage.getItem('user_phone') || '+1 (555) 123-4567',
                api_key: localStorage.getItem('api_key') || 'bri_api_2x7h9k3m5p8q'
            };
            
            setTimeout(() => {
                this.renderSettings(userData);
                this.hideLoader();
            }, 1000);
            
        } catch (error) {
            console.error('Error loading settings:', error);
            this.renderError();
            this.hideLoader();
        }
    }

    renderSettings(user) {
        if (!this.container) return;
        
        const html = `
            <div class="settings-grid">
                <div class="settings-card">
                    <h3>Profile Settings</h3>
                    <form class="settings-form" id="profile-form">
                        <div class="form-group">
                            <label for="display_name">Display Name</label>
                            <input type="text" id="display_name" value="${this.escapeHtml(user.display_name)}">
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" value="${this.escapeHtml(user.email)}" disabled>
                        </div>
                        <div class="form-group">
                            <label for="institution">Institution/Organization</label>
                            <input type="text" id="institution" value="${this.escapeHtml(user.institution)}">
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone Number</label>
                            <input type="tel" id="phone" value="${this.escapeHtml(user.phone)}">
                        </div>
                        <button type="submit" class="btn-small btn-primary" style="width: 100%;">Save Changes</button>
                    </form>
                </div>

                <div class="settings-card">
                    <h3>Analysis Preferences</h3>
                    <div class="preferences-list">
                        <label class="checkbox-label">
                            <input type="checkbox" id="deepWebSearch" checked>
                            <div class="checkbox-content">
                                <span>Deep Web Search</span>
                                <span class="checkbox-description">Search deep web and academic databases</span>
                            </div>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="academicDatabases" checked>
                            <div class="checkbox-content">
                                <span>Academic Databases</span>
                                <span class="checkbox-description">Include Scopus, IEEE, PubMed</span>
                            </div>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="autoCitation">
                            <div class="checkbox-content">
                                <span>Auto-Citation Check</span>
                                <span class="checkbox-description">Automatically verify citations</span>
                            </div>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="emailReports">
                            <div class="checkbox-content">
                                <span>Email Reports</span>
                                <span class="checkbox-description">Send reports via email</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div class="settings-card">
                    <h3>Notification Settings</h3>
                    <div class="preferences-list">
                        <label class="checkbox-label">
                            <input type="checkbox" id="notifyAnalysis" checked>
                            <div class="checkbox-content">
                                <span>Analysis Complete</span>
                            </div>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="notifyCopyright" checked>
                            <div class="checkbox-content">
                                <span>Copyright Alerts</span>
                            </div>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="notifyWeekly">
                            <div class="checkbox-content">
                                <span>Weekly Summary</span>
                            </div>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="notifyMarketing">
                            <div class="checkbox-content">
                                <span>Marketing Emails</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div class="settings-card">
                    <h3>API Access</h3>
                    <div class="api-key-display">
                        <code id="api-key">${user.api_key}</code>
                        <button class="btn-icon" id="generate-api-key" title="Generate New Key">🔄</button>
                    </div>
                    <p class="help-text">Use this key to access our API programmatically</p>
                    
                    <div class="api-usage" style="margin-top: 1.5rem;">
                        <h4 style="font-size: 1rem; margin-bottom: 0.8rem;">API Usage</h4>
                        <div class="usage-stats">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>Requests Today</span>
                                <span>127 / 1000</span>
                            </div>
                            <div style="width: 100%; height: 6px; background: var(--gray-200); border-radius: 3px; overflow: hidden;">
                                <div style="width: 12.7%; height: 100%; background: var(--primary);"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Profile form submission
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        // Generate API key
        const generateBtn = document.getElementById('generate-api-key');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateApiKey();
            });
        }

        // Save preferences when changed
        const checkboxes = ['deepWebSearch', 'academicDatabases', 'autoCitation', 'emailReports', 
                           'notifyAnalysis', 'notifyCopyright', 'notifyWeekly', 'notifyMarketing'];
        
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.savePreferences();
                });
            }
        });
    }

    saveProfile() {
        const displayName = document.getElementById('display_name')?.value;
        const institution = document.getElementById('institution')?.value;
        const phone = document.getElementById('phone')?.value;

        if (displayName) localStorage.setItem('user_display_name', displayName);
        if (institution) localStorage.setItem('user_institution', institution);
        if (phone) localStorage.setItem('user_phone', phone);

        this.showToast('Profile saved successfully!');
    }

    savePreferences() {
        const preferences = {
            deepWebSearch: document.getElementById('deepWebSearch')?.checked || false,
            academicDatabases: document.getElementById('academicDatabases')?.checked || false,
            autoCitation: document.getElementById('autoCitation')?.checked || false,
            emailReports: document.getElementById('emailReports')?.checked || false,
            notifyAnalysis: document.getElementById('notifyAnalysis')?.checked || false,
            notifyCopyright: document.getElementById('notifyCopyright')?.checked || false,
            notifyWeekly: document.getElementById('notifyWeekly')?.checked || false,
            notifyMarketing: document.getElementById('notifyMarketing')?.checked || false
        };

        localStorage.setItem('user_preferences', JSON.stringify(preferences));
        this.showToast('Preferences saved');
    }

    generateApiKey() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let key = 'bri_api_';
        for (let i = 0; i < 16; i++) {
            key += chars[Math.floor(Math.random() * chars.length)];
        }
        
        const apiKeyElement = document.getElementById('api-key');
        if (apiKeyElement) {
            apiKeyElement.textContent = key;
            localStorage.setItem('api_key', key);
            this.showToast('New API key generated!');
        }
    }

    showToast(message) {
        // Remove any existing toast
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            font-weight: 600;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
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
                <h3>Error Loading Settings</h3>
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

// Add animation styles if not already in CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SettingsSection();
    });
} else {
    new SettingsSection();
}