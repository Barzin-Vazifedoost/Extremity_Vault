# Debugging Tools Usage Guide

## 🛠️ General Debugging Tools

### Files Created:
- **`public/js/debug.js`** - Main debugging utility (reusable for any HTML page)
- **Enhanced existing files** - Added debugging hooks without breaking original functionality

### How to Use:

#### 1. **Visual Debug Panel**
- A floating debug panel appears on the top-right of your page
- Shows real-time logs, fetch requests, form submissions
- Click **"−"** to minimize/maximize
- Click **"Clear"** to clear logs

#### 2. **Manual Debug Commands**
In browser console, you can use:
```javascript
// Check if an element exists
debugTool.checkElement('#email');

// Log all form values
debugTool.logFormValues('register_page');

// Manual logging
debugTool.log('Custom message', 'info'); // or 'error', 'warn', 'fetch'
```

#### 3. **Automatic Monitoring**
The debug tool automatically logs:
- ✅ All fetch requests and responses
- ✅ Form submissions and field values  
- ✅ Console.log, console.error, console.warn
- ✅ Page load information
- ✅ Element existence checks

#### 4. **PHP Error Logs**
Check PHP error logs for backend debugging:
```bash
tail -f /Applications/XAMPP/xamppfiles/logs/error_log
```

### 🗑️ How to Remove Debugging (After Fixing Issues):

#### Quick Disable:
1. In `debug.js`, change `const ENABLE_DEBUG = true;` to `false`

#### Complete Removal:

1. **Delete the debug file:**
   ```bash
   rm public/js/debug.js
   ```

2. **Remove debug script tags from HTML:**
   - Delete lines containing `<script src="../public/js/debug.js" defer></script>` from login.html and register.html

3. **Clean JavaScript files:**
   - Search for `// ========== DEBUG` and delete all debugging sections
   - Remove the `debugLog` functions

4. **Clean PHP files:**
   - Search for `// ========== DEBUG` and delete all error_log debugging sections

5. **Clean CSS:**
   - Remove the debugging styles section in `style.css`

### 🚀 Adding Debug Tools to New Files:

#### For HTML Pages:
```html
<script src="../public/js/debug.js" defer></script>
```

#### For JavaScript Files:
```javascript
function debugLog(message, type = 'info') {
    if (window.debugTool) {
        window.debugTool.log(`[MODULE] ${message}`, type);
    }
    console.log(`[MODULE DEBUG] ${message}`);
}

// Then use throughout your code:
debugLog('Something happened', 'info');
debugLog('Error occurred', 'error');
```

#### For PHP Files:
```php
// At top of file
error_log('[MODULE DEBUG] Request received at ' . date('Y-m-d H:i:s'));

// Throughout code
error_log('[MODULE DEBUG] Variable value: ' . print_r($variable, true));
```

### 🎯 What Each Debug Tool Shows:

- **🌐 FETCH logs**: HTTP requests, responses, status codes
- **📋 FORM SUBMIT logs**: Form data being submitted  
- **📄 PAGE logs**: Current URL, user agent info
- **🔧 ELEMENT logs**: Whether DOM elements exist
- **⚠️ ERROR logs**: JavaScript errors, PHP errors
- **✅/❌ STATUS logs**: Success/failure states

### Example Debug Output:
```
[14:30:15] 🚀 Debug tools loaded
[14:30:16] 📄 PAGE: /html/register.html  
[14:30:20] 👥 Register form submitted
[14:30:20] Name field value: ✅ has value
[14:30:20] 🌐 FETCH: POST /Extremity_Vault/src/php/register.php
[14:30:20] 📤 REQUEST BODY: {"name":"John","email":"john@test.com","password":"test123"}
[14:30:21] ✅ RESPONSE: 200 OK
[14:30:21] ✅ Registration successful, redirecting to login...
```

This should help you quickly identify exactly where issues occur and fix them efficiently! 🎯