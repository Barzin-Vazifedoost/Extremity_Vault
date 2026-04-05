// ========== DEBUG HOOKS - DELETE AFTER FIXING ==========
function debugLog(message, type = 'info') {
    if (window.debugTool) {
        window.debugTool.log(`[LOGIN] ${message}`, type);
    }
    console.log(`[LOGIN DEBUG] ${message}`);
}
// ========== END DEBUG HOOKS ==========

document.getElementById('login_page').addEventListener('submit', function(e) {
    // ========== DEBUGGING - DELETE AFTER FIXING ==========
    debugLog('🔑 Login form submitted');
    debugLog('Form element found: ' + !!e.target);
    // ========== END DEBUGGING ==========
    
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // ========== DEBUGGING - DELETE AFTER FIXING ==========
    debugLog(`Email field value: ${email ? '✅ has value' : '❌ empty'}`);
    debugLog(`Password field value: ${password ? '✅ has value' : '❌ empty'}`);
    debugLog('About to fetch to: /Extremity_Vault/src/php/login.php');
    // ========== END DEBUGGING ==========
    
    fetch('/Extremity_Vault/src/php/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password})
    })
    .then(response => {
        // ========== DEBUGGING - DELETE AFTER FIXING ==========
        debugLog(`Response status: ${response.status} ${response.statusText}`);
        debugLog(`Response headers: ${response.headers.get('content-type')}`);
        if (!response.ok) {
            debugLog(`Response not OK! Status: ${response.status}`, 'error');
        }
        // ========== END DEBUGGING ==========
        return response.json();
    })
    .then(data => {
        // ========== DEBUGGING - DELETE AFTER FIXING ==========
        debugLog('Raw response data: ' + JSON.stringify(data));
        debugLog(`Success flag: ${data.success}`);
        if (data.error) debugLog(`Error message: ${data.error}`, 'error');
        // ========== END DEBUGGING ==========

        if(data.success) {
            // ========== DEBUGGING - DELETE AFTER FIXING ==========
            debugLog('✅ Login successful, redirecting...', 'info');
            // ========== END DEBUGGING ==========
            // TODO: Create index.html or redirect to appropriate page
            window.location.href = '../html/admin.html'; // Temporary redirect
        } 
        else {
            // ========== DEBUGGING - DELETE AFTER FIXING ==========
            debugLog('❌ Login failed, showing error message', 'error');
            const messageEl = document.getElementById('message');
            debugLog(`Message element found: ${!!messageEl}`);
            // ========== END DEBUGGING ==========
            document.getElementById('message').innerText = data.error;
        }
    })
    .catch(error => {
        // ========== DEBUGGING - DELETE AFTER FIXING ==========
        debugLog(`💥 Fetch error: ${error.message}`, 'error');
        debugLog(`Error stack: ${error.stack}`, 'error');
        // ========== END DEBUGGING ==========
        console.error('Login error:', error);
        document.getElementById('message').innerText = 'Login failed. Please try again.';
    });
})