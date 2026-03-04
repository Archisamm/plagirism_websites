class SettingsSection {
    constructor() {
        this.container = document.getElementById('settings-container');
        this.loader = document.getElementById('settings-loader');
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
    }

    async loadSettings() {
        this.showLoader();
        try {
            // Simulate API call - replace with actual endpoint
            // const response = await fetch('/api/user-settings/');
            // const data = await response.json();
            
            // Mock user data from localStorage or session
            const userData = {
                display_name: localStorage.getItem('user_display_name') || 'John Doe',
                email: localStorage.getItem('user_email') || 'john.doe@example.com',
                institution: localStorage.getItem('user_institution') || 'University of Technology',
                phone: localStorage.getItem('user_phone') || '+1 (555) 123-4567',
                api_key: localStorage.getItem('api_key') || 'bri_api_2x7h9k3m5p8q'
            };
            
            this.renderSettings(userData);
        } catch (error) {
            console.error('Error loading settings:', error);
            this.renderError();
        } finally {
            this.hideLoader();
        }
    }

    renderSettings(user) {
        const html = `
            <div class="settings-grid">
                <div class="settings-card">
                    <h3>Profile Settings</h3>
                    <form id="profile-form" class="settings-form">
                        <div class="form-group">
                            <label for="display_name">Display Name</label>
                            <input type="text" id="display_name" value="${this.escapeHtml(user.display_name)}" class="form-input">
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" value="${this.escapeHtml(user.email)}" disabled class="form-input">
                        </div>
                        <div class="form-group">
                            <label for="institution">Institution/Organization</label>
                            <input type="text" id="institution" value="${this.escapeHtml(user.institution)}" class="form-input">
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone Number</label>
                            <input type="tel" id="phone" value="${this.escapeHtml(user.phone)}" class="form-input">
                        </div>
                        <button type="submit" class="btn-primary" id="save-profile-btn">Save Changes</button>
                    </form>
                </div>

                <div class="settings-card">
                    <h3>Analysis Preferences</h3>
                    <div class="preferences-list">
                        <label class="checkbox-label">
                            <input type="checkbox" id="deepWebSearch" checked> 
                            <span>Deep Web Search</span>
                            <span class="checkbox-description">Search deep web and academic databases for matches</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="academicDatabases" checked> 
                            <span>Academic Databases</span>
                            <span class="checkbox-description">Include Scopus, IEEE, PubMed, and more</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="autoCitation"> 
                            <span>Auto-Citation Check</span>
                            <span class="checkbox-description">Automatically verify and format citations</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="emailReports"> 
                            <span>Email Reports</span>
                            <span class="checkbox-description">Send analysis reports via email</span>
                        </label>
                    </div>
                </div>

                <div class="settings-card">
                    <h3>Notification Settings</h3>
                    <div class="preferences-list">
                        <label class="checkbox-label">
                            <input type="checkbox" id="notifyAnalysis" checked> 
                            <span>Analysis Complete</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="notifyCopyright" checked> 
                            <span>Copyright Alerts</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="notifyWeekly"> 
                            <span>Weekly Summary</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="notifyMarketing"> 
                            <span>Marketing Emails</span>
                        </label>
                    </div>
                </div>

                <div class="settings-card">
                    <h3>API Access</h3>
                    <div class="api-key-display">
                        <code id="api-key">${user.api_key}</code>
                        <button class="btn-small btn-outline" id="generate-api-key">Generate New</button>
                    </div>
                    <p class="help-text">Use this key to access our API programmatically. Keep it secure!</p>
                    <div class="api-usage">
                        <h4>API Usage</h4>
                        <div class="usage-stats">
                            <div class="stat-item">
                                <span class="stat-label">Requests Today</span>
                                <span class="stat-value">127 / 1000</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 12.7%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    }

    setupEventListeners() {
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'profile-form') {
                e.preventDefault();
                this.saveProfile();
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.id === 'generate-api-key') {
                this.generateApiKey();
            }
        });

        // Save preferences when changed
        document.querySelectorAll('.preferences-list input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.savePreferences());
        });
    }

    saveProfile() {
        const displayName = document.getElementById('display_name')?.value;
        const institution = document.getElementById('institution')?.value;
        const phone = document.getElementById('phone')?.value;

        // Save to localStorage for demo
        if (displayName) localStorage.setItem('user_display_name', displayName);
        if (institution) localStorage.setItem('user_institution', institution);
        if (phone) localStorage.setItem('user_phone', phone);

        // Show success message
        alert('Profile saved successfully!');
        
        // Here you would typically send to server
        // const formData = new FormData();
        // formData.append('display_name', displayName);
        // formData.append('institution', institution);
        // formData.append('phone', phone);
        // await fetch('/api/save-profile/', { method: 'POST', body: formData });
    }

    savePreferences() {
        // Collect all preferences
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

        // Save to localStorage for demo
        localStorage.setItem('user_preferences', JSON.stringify(preferences));
        
        // Show subtle notification
        this.showToast('Preferences saved');
    }

    generateApiKey() {
        // Generate a random API key
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
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--gradient-4);
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showLoader() {
        this.loader.classList.remove('hidden');
        this.container.classList.add('hidden');
    }

    hideLoader() {
        this.loader.classList.add('hidden');
        this.container.classList.remove('hidden');
    }

    renderError() {
        this.container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Error Loading Settings</h3>
                <p>Please try again later.</p>
                <button class="btn-primary" onclick="window.location.reload()">Retry</button>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when section becomes visible
document.addEventListener('DOMContentLoaded', () => {
    window.settingsSection = new SettingsSection();
});