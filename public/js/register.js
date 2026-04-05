// ========== DEBUG HOOKS - DELETE AFTER FIXING ==========
function debugLog(message, type = 'info') {
    if (window.debugTool) {
        window.debugTool.log(`[REGISTER] ${message}`, type);
    }
    console.log(`[REGISTER DEBUG] ${message}`);
}
// ========== END DEBUG HOOKS ==========

document.getElementById('register_page').addEventListener('submit', function(e) {
    // ========== DEBUGGING - DELETE AFTER FIXING ==========
    debugLog('👥 Register form submitted');
    debugLog('Form element found: ' + !!e.target);
    // ========== END DEBUGGING ==========
    
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // ========== DEBUGGING - DELETE AFTER FIXING ==========
    debugLog(`Name field value: ${name ? '✅ has value' : '❌ empty'}`);
    debugLog(`Email field value: ${email ? '✅ has value' : '❌ empty'}`);
    debugLog(`Password field value: ${password ? '✅ has value' : '❌ empty'}`);
    debugLog('About to fetch to: /Extremity_Vault/src/php/register.php');
    // ========== END DEBUGGING ==========
    
    fetch('/Extremity_Vault/src/php/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
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
            debugLog('✅ Registration successful, redirecting to login...', 'info');
            // ========== END DEBUGGING ==========
            window.location.href = '../html/login.html';
        } else {
            // ========== DEBUGGING - DELETE AFTER FIXING ==========
            debugLog('❌ Registration failed, showing error message', 'error');
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
        console.error('Registration error:', error);
        document.getElementById('message').innerText = 'Registration failed. Please try again.';
    });
});