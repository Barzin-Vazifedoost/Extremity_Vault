// ========== DEBUGGING UTILITIES - DELETE AFTER FIXING ==========
// To use: Include this script in any HTML file with <script src="js/debug.js"></script>
// To disable: Comment out the script tag or set ENABLE_DEBUG = false

const ENABLE_DEBUG = true; // SET TO FALSE TO DISABLE ALL DEBUGGING

class DebugTool {
    constructor() {
        if (!ENABLE_DEBUG) return;
        
        this.debugPanel = null;
        this.logCount = 0;
        this.init();
    }

    init() {
        // Create visual debug panel
        this.createDebugPanel();
        
        // Override console methods to capture logs
        this.hijackConsole();
        
        // Monitor fetch requests
        this.monitorFetch();
        
        // Monitor form submissions
        this.monitorForms();
        
        // Add page load info
        this.logPageInfo();
        
        this.log('🚀 Debug tools loaded');
    }

    createDebugPanel() {
        // Create floating debug panel
        this.debugPanel = document.createElement('div');
        this.debugPanel.className = 'debug-panel';
        this.debugPanel.innerHTML = `
            <div class="debug-header">
                DEBUG MODE 
                <button onclick="debugTool.togglePanel()" class="debug-toggle">−</button>
            </div>
            <div class="debug-content">
                <div class="debug-logs"></div>
                <button onclick="debugTool.clearLogs()" class="debug-clear">Clear</button>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .debug-panel {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 350px;
                max-height: 400px;
                background: #1a1a1a;
                color: #00ff00;
                border: 2px solid #00ff00;
                border-radius: 5px;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                z-index: 99999;
                box-shadow: 0 4px 8px rgba(0,0,0,0.5);
            }
            .debug-header {
                background: #333;
                padding: 5px 10px;
                color: #ffff00;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .debug-toggle, .debug-clear {
                background: none;
                border: 1px solid;
                color: inherit;
                padding: 2px 6px;
                cursor: pointer;
                font-size: 10px;
            }
            .debug-content {
                max-height: 350px;
                overflow-y: auto;
                padding: 5px;
            }
            .debug-logs {
                margin-bottom: 10px;
            }
            .debug-log {
                margin: 2px 0;
                padding: 2px 4px;
                border-radius: 2px;
                font-size: 10px;
            }
            .debug-error { background: rgba(255,0,0,0.2); }
            .debug-warn { background: rgba(255,255,0,0.2); }
            .debug-info { background: rgba(0,255,255,0.2); }
            .debug-fetch { background: rgba(255,165,0,0.2); }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(this.debugPanel);
    }

    log(message, type = 'info') {
        if (!ENABLE_DEBUG) return;
        
        this.logCount++;
        const timestamp = new Date().toTimeString().slice(0,8);
        const logElement = document.createElement('div');
        logElement.className = `debug-log debug-${type}`;
        logElement.textContent = `[${timestamp}] ${message}`;
        
        const logsContainer = this.debugPanel.querySelector('.debug-logs');
        logsContainer.appendChild(logElement);
        
        // Keep only last 50 logs
        if (this.logCount > 50) {
            logsContainer.removeChild(logsContainer.firstChild);
        }
        
        // Auto scroll to bottom
        this.debugPanel.querySelector('.debug-content').scrollTop = 999999;
    }

    togglePanel() {
        const content = this.debugPanel.querySelector('.debug-content');
        const toggle = this.debugPanel.querySelector('.debug-toggle');
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggle.textContent = '−';
        } else {
            content.style.display = 'none';
            toggle.textContent = '+';
        }
    }

    clearLogs() {
        const logsContainer = this.debugPanel.querySelector('.debug-logs');
        logsContainer.innerHTML = '';
        this.logCount = 0;
    }

    hijackConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            this.log(args.join(' '), 'info');
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            this.log('ERROR: ' + args.join(' '), 'error');
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            this.log('WARN: ' + args.join(' '), 'warn');
            originalWarn.apply(console, args);
        };
    }

    monitorFetch() {
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            const url = args[0];
            const options = args[1] || {};
            
            this.log(`🌐 FETCH: ${options.method || 'GET'} ${url}`, 'fetch');
            
            if (options.body) {
                this.log(`📤 REQUEST BODY: ${options.body}`, 'fetch');
            }
            
            return originalFetch.apply(window, args)
                .then(response => {
                    this.log(`✅ RESPONSE: ${response.status} ${response.statusText}`, 'fetch');
                    return response;
                })
                .catch(error => {
                    this.log(`❌ FETCH ERROR: ${error.message}`, 'error');
                    throw error;
                });
        };
    }

    monitorForms() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            this.log(`📋 FORM SUBMIT: ${form.id || form.className || 'unnamed form'}`, 'info');
            
            // Log form data
            const formData = new FormData(form);
            for (let [key, value] of formData.entries()) {
                this.log(`   ${key}: ${value}`, 'info');
            }
        });
    }

    logPageInfo() {
        this.log(`📄 PAGE: ${window.location.pathname}`, 'info');
        this.log(`🌍 URL: ${window.location.href}`, 'info');
        this.log(`🔧 USER AGENT: ${navigator.userAgent.slice(0, 50)}...`, 'info');
    }

    // Helper methods for manual debugging
    checkElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            this.log(`✅ ELEMENT EXISTS: ${selector}`, 'info');
            return element;
        } else {
            this.log(`❌ ELEMENT NOT FOUND: ${selector}`, 'error');
            return null;
        }
    }

    logFormValues(formId) {
        const form = document.getElementById(formId);
        if (!form) {
            this.log(`❌ FORM NOT FOUND: ${formId}`, 'error');
            return;
        }
        
        this.log(`📋 FORM VALUES for ${formId}:`, 'info');
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            this.log(`   ${input.name || input.id}: ${input.value}`, 'info');
        });
    }
}

// Initialize debug tool when DOM is ready
let debugTool;
if (ENABLE_DEBUG) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            debugTool = new DebugTool();
        });
    } else {
        debugTool = new DebugTool();
    }
}

// ========== END DEBUGGING UTILITIES ==========