// Configuration for Gold HyperFlow Scalper Dashboard
const CONFIG = {
    // Your Google Apps Script Web App URL
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwN27ilgeFKlTekjFX_gWt91S3NezIrY6QRaZOPzqPFR9YW-iPPMiE2nw-b8X-N4-s/exec',
    
    // Update interval in milliseconds (5000 = 5 seconds)
    UPDATE_INTERVAL: 5000,
    
    // Chart colors
    COLORS: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#4ade80',
        danger: '#f87171',
        warning: '#fbbf24',
        info: '#60a5fa',
        background: 'rgba(102, 126, 234, 0.1)',
        border: 'rgba(102, 126, 234, 0.3)'
    },
    
    // Number of trades to display in history
    MAX_TRADES_DISPLAY: 50,
    
    // Enable debug mode (logs to console)
    DEBUG_MODE: false
};
