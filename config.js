/**
 * Gold HyperFlow Scalper - Dashboard Configuration
 * Version: 3.0
 * 
 * IMPORTANT: Replace GOOGLE_SCRIPT_URL with your actual deployment URL
 */

const CONFIG = {
    // ============================================
    // GOOGLE APPS SCRIPT CONFIGURATION
    // ============================================
    // Your Google Apps Script Web App URL
    // Get this from: Deploy → New Deployment → Copy Web App URL
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbw-kWv__5Em1lhqHxIBh34lFwBXcxsh_s2jm8O6S0UCmBYDJeLVtMIKmDJCIJISOEJf/exec',
    
    // ============================================
    // UPDATE INTERVALS (milliseconds)
    // ============================================
    UPDATE_INTERVAL: 5000,          // Dashboard refresh rate (5 seconds)
    CHART_UPDATE_RATE: 1000,        // Chart animation rate (1 second)
    
    // ============================================
    // DISPLAY LIMITS
    // ============================================
    MAX_TRADES_DISPLAY: 50,         // Number of trades in history table
    MAX_EQUITY_POINTS: 100,         // Number of points in equity curve
    MAX_CHART_TRADES: 20,           // Number of trades in bar chart
    
    // ============================================
    // CHART COLORS (Google Material Design)
    // ============================================
    COLORS: {
        // Primary colors
        primary: '#1a73e8',
        primaryDark: '#1557b0',
        primaryLight: '#4285f4',
        
        // Success (green)
        success: '#34a853',
        successLight: '#81c995',
        
        // Danger (red)
        danger: '#ea4335',
        dangerLight: '#f28b82',
        
        // Warning (yellow/orange)
        warning: '#fbbc04',
        warningLight: '#fdd663',
        
        // Info (blue)
        info: '#4285f4',
        infoLight: '#8ab4f8',
        
        // Background colors
        bgPrimary: '#0d1117',
        bgSecondary: '#161b22',
        bgTertiary: '#21262d',
        bgElevated: '#1c2128',
        
        // Text colors
        textPrimary: '#e6edf3',
        textSecondary: '#8b949e',
        textTertiary: '#6e7681',
        
        // Border colors
        borderColor: '#30363d',
        borderHover: '#484f58',
        
        // Chart specific
        chartGrid: 'rgba(48, 54, 61, 0.5)',
        chartBackground: 'rgba(26, 115, 232, 0.1)'
    },
    
    // ============================================
    // FEATURE FLAGS
    // ============================================
    FEATURES: {
        enableAnimations: true,         // Enable smooth animations
        enableAutoReconnect: true,      // Auto-reconnect on connection loss
        enableSoundAlerts: false,       // Sound alerts for trades (future)
        enableNotifications: false,     // Browser notifications (future)
        enableDarkMode: true,           // Dark mode (currently only option)
        showDebugInfo: false,           // Show debug info in console
        enableChartStreaming: true,     // Real-time chart updates
        pauseChartOnHover: false        // Pause chart updates on hover
    },
    
    // ============================================
    // CHART CONFIGURATION
    // ============================================
    CHART_OPTIONS: {
        // Animation duration
        animationDuration: 750,
        
        // Line tension (0 = straight, 1 = very curved)
        lineTension: 0.4,
        
        // Point sizes
        pointRadius: 0,
        pointHoverRadius: 6,
        
        // Border widths
        lineBorderWidth: 3,
        barBorderWidth: 2,
        
        // Chart heights (in pixels)
        equityChartHeight: 400,
        tradesChartHeight: 350,
        pieChartHeight: 350
    },
    
    // ============================================
    // TABLE CONFIGURATION
    // ============================================
    TABLE_OPTIONS: {
        maxHeight: '600px',             // Maximum table height
        enableInfiniteScroll: false,    // Infinite scroll (future)
        enableSearch: false,            // Search functionality (future)
        enableExport: false,            // Export to CSV (future)
        rowsPerPage: 50                 // Rows per page (pagination)
    },
    
    // ============================================
    // RESPONSIVE BREAKPOINTS
    // ============================================
    BREAKPOINTS: {
        mobile: 480,
        tablet: 768,
        laptop: 1024,
        desktop: 1400
    },
    
    // ============================================
    // TIMING CONFIGURATION
    // ============================================
    TIMING: {
        reconnectDelay: 5000,           // Delay before reconnect attempt
        maxReconnectAttempts: 10,       // Max reconnect attempts
        chartPauseTimeout: 30000,       // Auto-resume chart after pause
        notificationDuration: 5000,     // Notification display time
        tooltipDelay: 200               // Tooltip show delay
    },
    
    // ============================================
    // DATA VALIDATION
    // ============================================
    VALIDATION: {
        minBalance: 0,                  // Minimum valid balance
        maxBalance: 1000000,            // Maximum valid balance
        minTrades: 0,                   // Minimum trades per day
        maxTrades: 1000,                // Maximum trades per day
        minProfit: -10000,              // Minimum P/L value
        maxProfit: 10000                // Maximum P/L value
    },
    
    // ============================================
    // DEBUG MODE
    // ============================================
    DEBUG_MODE: false,                  // Enable debug logging
    
    // ============================================
    // API ENDPOINTS (for future expansion)
    // ============================================
    API_ENDPOINTS: {
        liveStats: 'getLiveStats',
        tradeHistory: 'getTradeHistory',
        dailyReports: 'getDailyReports',
        equityCurve: 'getEquityCurve',
        test: 'test'
    },
    
    // ============================================
    // LOCALE SETTINGS
    // ============================================
    LOCALE: {
        currency: 'USD',
        currencySymbol: '$',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: 'HH:mm:ss',
        timezone: 'auto'                // 'auto' or specific timezone
    },
    
    // ============================================
    // PERFORMANCE SETTINGS
    // ============================================
    PERFORMANCE: {
        enableLazyLoading: true,        // Lazy load charts
        enableCaching: true,            // Cache API responses
        cacheExpiry: 30000,             // Cache expiry (30 seconds)
        throttleScroll: 100,            // Scroll throttle (ms)
        debounceResize: 250             // Resize debounce (ms)
    }
};

// ============================================
// CONFIGURATION VALIDATION
// ============================================
(function validateConfig() {
    // Check if Google Script URL is set
    if (CONFIG.GOOGLE_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID_HERE')) {
        console.error('%c⚠️ CONFIGURATION ERROR', 'color: #ea4335; font-size: 16px; font-weight: bold');
        console.error('%c❌ Google Apps Script URL not configured!', 'color: #ea4335; font-size: 14px');
        console.error('%c📋 Steps to fix:', 'color: #fbbc04; font-size: 14px');
        console.error('1. Open your Google Apps Script project');
        console.error('2. Click Deploy → New Deployment');
        console.error('3. Select type: Web App');
        console.error('4. Copy the Web App URL');
        console.error('5. Paste it in config.js → GOOGLE_SCRIPT_URL');
        console.error('%c🔗 Example URL format:', 'color: #4285f4; font-size: 14px');
        console.error('https://script.google.com/macros/s/AKfycbx.../exec');
        
        // Show error on page
        setTimeout(() => {
            document.body.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #0d1117; color: #e6edf3; font-family: Roboto, sans-serif; text-align: center; padding: 40px;">
                    <div>
                        <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
                        <h1 style="color: #ea4335; margin-bottom: 20px;">Configuration Error</h1>
                        <p style="font-size: 18px; color: #8b949e; margin-bottom: 30px;">
                            Google Apps Script URL is not configured!
                        </p>
                        <div style="background: rgba(26, 115, 232, 0.1); border: 1px solid rgba(26, 115, 232, 0.3); border-radius: 12px; padding: 30px; max-width: 600px; margin: 0 auto; text-align: left;">
                            <h3 style="color: #1a73e8; margin-bottom: 15px;">📋 How to Fix:</h3>
                            <ol style="color: #8b949e; line-height: 2;">
                                <li>Open your Google Apps Script project</li>
                                <li>Click <strong>Deploy → New Deployment</strong></li>
                                <li>Select type: <strong>Web App</strong></li>
                                <li>Copy the <strong>Web App URL</strong></li>
                                <li>Paste it in <code style="background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;">config.js</code></li>
                            </ol>
                        </div>
                    </div>
                </div>
            `;
        }, 100);
        
        return false;
    }
    
    // Validate update interval
    if (CONFIG.UPDATE_INTERVAL < 1000) {
        console.warn('⚠️ Update interval too fast, setting to 1000ms minimum');
        CONFIG.UPDATE_INTERVAL = 1000;
    }
    
    console.log('%c✅ Configuration validated successfully', 'color: #34a853; font-weight: bold');
    return true;
})();

// ============================================
// EXPORT CONFIGURATION
// ============================================
// Configuration is now available globally as CONFIG object
console.log('%c📊 Dashboard Configuration Loaded', 'color: #1a73e8; font-size: 14px; font-weight: bold');
if (CONFIG.DEBUG_MODE) {
    console.log('Configuration:', CONFIG);
}
