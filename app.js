/**
 * Gold HyperFlow Scalper - Advanced Dashboard
 * Version: 3.0 - Real-Time Streaming
 */

// Global chart instances
let equityChart = null;
let tradesChart = null;
let pieChart = null;

// Update intervals
let statsUpdateInterval = null;
let chartPaused = false;

// Data cache
let equityData = [];
let lastUpdateTime = null;

/* ==========================================
   INITIALIZATION
   ========================================== */

document.addEventListener('DOMContentLoaded', function() {
    console.log('%c🚀 Gold HyperFlow Scalper Dashboard', 'color: #1a73e8; font-size: 24px; font-weight: bold');
    console.log('%c📊 Version 3.0 - Real-Time Analytics', 'color: #34a853; font-size: 14px');
    console.log('%c🔗 Script URL:', 'color: #fbbc04', CONFIG.GOOGLE_SCRIPT_URL);
    
    // Initialize Chart.js defaults
    initChartDefaults();
    
    // Create all charts
    createEquityChart();
    createTradesChart();
    createPieChart();
    
    // Initial data load
    updateAllData();
    
    // Start auto-update
    startAutoUpdate();
    
    // Handle page visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    console.log('%c✅ Dashboard initialized successfully', 'color: #34a853; font-weight: bold');
});

/* ==========================================
   CHART INITIALIZATION
   ========================================== */

function initChartDefaults() {
    Chart.defaults.color = '#8b949e';
    Chart.defaults.borderColor = '#30363d';
    Chart.defaults.font.family = "'Roboto', sans-serif";
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 20;
    Chart.defaults.elements.point.radius = 0;
    Chart.defaults.elements.point.hoverRadius = 6;
}

/* ==========================================
   REAL-TIME EQUITY CHART
   ========================================== */

function createEquityChart() {
    const ctx = document.getElementById('equityChart');
    if (!ctx) return;
    
    equityChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Balance',
                    data: [],
                    borderColor: '#1a73e8',
                    backgroundColor: 'rgba(26, 115, 232, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#1a73e8',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Equity',
                    data: [],
                    borderColor: '#34a853',
                    backgroundColor: 'rgba(52, 168, 83, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#34a853',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#e6edf3',
                        font: {
                            size: 14,
                            weight: '600'
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(13, 17, 23, 0.95)',
                    titleColor: '#1a73e8',
                    bodyColor: '#e6edf3',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    padding: 16,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            const date = new Date(context[0].parsed.x);
                            return date.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                            });
                        },
                        label: function(context) {
                            return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'second',
                        displayFormats: {
                            second: 'HH:mm:ss',
                            minute: 'HH:mm',
                            hour: 'HH:mm'
                        }
                    },
                    ticks: {
                        color: '#8b949e',
                        font: {
                            size: 11
                        },
                        maxRotation: 0
                    },
                    grid: {
                        color: 'rgba(48, 54, 61, 0.5)',
                        drawBorder: false
                    }
                },
                y: {
                    position: 'right',
                    ticks: {
                        color: '#8b949e',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    },
                    grid: {
                        color: 'rgba(48, 54, 61, 0.5)',
                        drawBorder: false
                    }
                }
            },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function updateEquityChart(balance, equity) {
    if (!equityChart || chartPaused) return;
    
    const now = Date.now();
    
    // Add data point
    equityChart.data.datasets[0].data.push({
        x: now,
        y: parseFloat(balance) || 0
    });
    
    equityChart.data.datasets[1].data.push({
        x: now,
        y: parseFloat(equity) || 0
    });
    
    // Keep only last 100 points for performance
    if (equityChart.data.datasets[0].data.length > 100) {
        equityChart.data.datasets[0].data.shift();
        equityChart.data.datasets[1].data.shift();
    }
    
    // Update chart
    equityChart.update('none'); // Use 'none' mode for smooth updates
}

function toggleChartPause() {
    chartPaused = !chartPaused;
    const btn = document.getElementById('pauseBtn');
    const icon = btn.querySelector('.material-icons');
    
    if (chartPaused) {
        icon.textContent = 'play_arrow';
        btn.style.color = '#34a853';
    } else {
        icon.textContent = 'pause';
        btn.style.color = '#8b949e';
    }
}

function resetChart() {
    if (!equityChart) return;
    
    equityChart.data.datasets[0].data = [];
    equityChart.data.datasets[1].data = [];
    equityChart.update();
    
    // Show reset animation
    const btn = event.target.closest('.btn-icon');
    btn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        btn.style.transform = 'rotate(0deg)';
    }, 300);
}

/* ==========================================
   TRADES BAR CHART
   ========================================== */

function createTradesChart() {
    const ctx = document.getElementById('tradesChart');
    if (!ctx) return;
    
    tradesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Profit/Loss ($)',
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(13, 17, 23, 0.95)',
                    titleColor: '#1a73e8',
                    bodyColor: '#e6edf3',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return 'P/L: $' + value.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8b949e',
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    },
                    grid: {
                        color: 'rgba(48, 54, 61, 0.5)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: '#8b949e'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 500,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function updateTradesChart(trades) {
    if (!tradesChart || !trades || trades.length === 0) return;
    
    const recentTrades = trades.slice(0, 20).reverse();
    
    const labels = recentTrades.map((_, idx) => 'T' + (idx + 1));
    const data = recentTrades.map(trade => parseFloat(trade.Profit) || 0);
    const colors = data.map(profit => {
        if (profit > 0) {
            return {
                bg: 'rgba(52, 168, 83, 0.8)',
                border: '#34a853'
            };
        } else {
            return {
                bg: 'rgba(234, 67, 53, 0.8)',
                border: '#ea4335'
            };
        }
    });
    
    tradesChart.data.labels = labels;
    tradesChart.data.datasets[0].data = data;
    tradesChart.data.datasets[0].backgroundColor = colors.map(c => c.bg);
    tradesChart.data.datasets[0].borderColor = colors.map(c => c.border);
    
    tradesChart.update();
}

/* ==========================================
   PIE CHART
   ========================================== */

function createPieChart() {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;
    
    pieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Wins', 'Losses'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [
                    'rgba(52, 168, 83, 0.8)',
                    'rgba(234, 67, 53, 0.8)'
                ],
                borderColor: [
                    '#34a853',
                    '#ea4335'
                ],
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e6edf3',
                        font: {
                            size: 14,
                            weight: '600'
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(13, 17, 23, 0.95)',
                    titleColor: '#1a73e8',
                    bodyColor: '#e6edf3',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    padding: 12
                }
            },
            cutout: '70%',
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 800
            }
        }
    });
}

function updatePieChart(wins, losses) {
    if (!pieChart) return;
    
    const winsCount = parseInt(wins) || 0;
    const lossesCount = parseInt(losses) || 0;
    
    pieChart.data.datasets[0].data = [winsCount, lossesCount];
    pieChart.data.labels = [`Wins (${winsCount})`, `Losses (${lossesCount})`];
    pieChart.update();
}

/* ==========================================
   DATA FETCHING
   ========================================== */

async function fetchData(action) {
    try {
        const url = `${CONFIG.GOOGLE_SCRIPT_URL}?action=${action}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            return data.data;
        } else {
            console.error(`API Error (${action}):`, data.message);
            return null;
        }
    } catch (error) {
        console.error(`Fetch Error (${action}):`, error.message);
        return null;
    }
}

/* ==========================================
   DATA UPDATES
   ========================================== */

async function updateLiveStats() {
    const stats = await fetchData('getLiveStats');
    
    if (!stats) {
        updateConnectionStatus(false);
        return;
    }
    
    updateConnectionStatus(true);
    
    // Update quick stats
    document.getElementById('balance').textContent = formatCurrency(stats.Balance);
    document.getElementById('equity').textContent = formatCurrency(stats.Equity);
    
    const floatingPL = parseFloat(stats['Floating P/L']) || 0;
    updateValueWithColor('floatingPL', floatingPL, true);
    
    const dailyPL = parseFloat(stats['Daily P/L']) || 0;
    updateValueWithColor('dailyPL', dailyPL, true);
    
    // Update performance cards
    document.getElementById('dailyTrades').textContent = stats['Daily Trades'] || '0';
    document.getElementById('wins').textContent = stats['Daily Wins'] || '0';
    document.getElementById('losses').textContent = stats['Daily Losses'] || '0';
    document.getElementById('winRate').textContent = formatPercent(stats['Win Rate']);
    document.getElementById('consecLosses').textContent = stats['Consecutive Losses'] || '0';
    document.getElementById('openPositions').textContent = stats['Open Positions'] || '0';
    
    // Update EA status
    updateEAStatus(stats.Status);
    
    // Update last trade
    updateLastTrade(stats['Last Trade Direction'], stats['Last Trade Profit']);
    
    // Update equity chart
    updateEquityChart(stats.Balance, stats.Equity);
    
    // Update pie chart
    updatePieChart(stats['Daily Wins'], stats['Daily Losses']);
    
    // Update last update time
    updateLastUpdateTime();
}

async function updateTradeHistory() {
    const trades = await fetchData('getTradeHistory&limit=50');
    
    if (!trades || trades.length === 0) {
        document.getElementById('tradesTableBody').innerHTML = `
            <tr>
                <td colspan="9" class="no-data">
                    <span class="material-icons">info</span>
                    <span>No trades recorded yet</span>
                </td>
            </tr>
        `;
        return;
    }
    
    // Update trades chart
    updateTradesChart(trades);
    
    // Update table
    let html = '';
    trades.forEach((trade, index) => {
        const profit = parseFloat(trade.Profit) || 0;
        const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
        const profitSymbol = profit >= 0 ? '+' : '';
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><span class="type-${trade.Type}">${trade.Type}</span></td>
                <td>${formatDateTime(trade['Open Time'])}</td>
                <td>${formatDateTime(trade['Close Time'])}</td>
                <td>${parseFloat(trade['Open Price']).toFixed(5)}</td>
                <td>${parseFloat(trade['Close Price']).toFixed(5)}</td>
                <td>${parseFloat(trade.Lots).toFixed(2)}</td>
                <td class="${profitClass}">${profitSymbol}${formatCurrency(profit)}</td>
                <td>${formatDuration(trade.Duration)}</td>
            </tr>
        `;
    });
    
    document.getElementById('tradesTableBody').innerHTML = html;
}

async function updateAllData() {
    await Promise.all([
        updateLiveStats(),
        updateTradeHistory()
    ]);
}

/* ==========================================
   UI HELPERS
   ========================================== */

function updateConnectionStatus(connected) {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    
    if (connected) {
        dot.classList.remove('disconnected');
        text.textContent = 'Connected';
    } else {
        dot.classList.add('disconnected');
        text.textContent = 'Disconnected';
    }
}

function updateValueWithColor(elementId, value, isCurrency = false) {
    const element = document.getElementById(elementId);
    const formatted = isCurrency ? formatCurrency(value) : value.toString();
    
    element.textContent = formatted;
    element.classList.remove('positive', 'negative');
    
    if (value > 0) {
        element.classList.add('positive');
    } else if (value < 0) {
        element.classList.add('negative');
    }
}

function updateEAStatus(status) {
    const element = document.getElementById('eaStatus');
    element.textContent = status || 'UNKNOWN';
    
    // Add appropriate styling based on status
    element.className = 'perf-status';
    if (status === 'MONITORING' || status === 'IN_POSITION') {
        element.style.color = '#34a853';
    } else if (status === 'LOCKOUT' || status === 'LIMIT_REACHED') {
        element.style.color = '#ea4335';
    } else {
        element.style.color = '#8b949e';
    }
}

function updateLastTrade(direction, profit) {
    const element = document.getElementById('lastTrade');
    const profitValue = parseFloat(profit) || 0;
    
    if (direction && direction !== 'NONE') {
        element.textContent = `${direction} (${formatCurrency(profitValue)})`;
        element.style.color = profitValue >= 0 ? '#34a853' : '#ea4335';
    } else {
        element.textContent = 'NONE';
        element.style.color = '#8b949e';
    }
}

function updateLastUpdateTime() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

/* ==========================================
   FORMATTING HELPERS
   ========================================== */

function formatCurrency(value) {
    const num = parseFloat(value) || 0;
    return '$' + num.toFixed(2);
}

function formatPercent(value) {
    const num = parseFloat(value) || 0;
    return num.toFixed(1) + '%';
}

function formatDateTime(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    } catch {
        return dateString;
    }
}

function formatDuration(seconds) {
    const sec = parseInt(seconds) || 0;
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = sec % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

/* ==========================================
   AUTO-UPDATE SYSTEM
   ========================================== */

function startAutoUpdate() {
    // Clear any existing interval
    if (statsUpdateInterval) {
        clearInterval(statsUpdateInterval);
    }
    
    // Start new interval
    statsUpdateInterval = setInterval(() => {
        updateAllData();
    }, CONFIG.UPDATE_INTERVAL);
    
    console.log(`✓ Auto-update enabled (${CONFIG.UPDATE_INTERVAL}ms)`);
}

function stopAutoUpdate() {
    if (statsUpdateInterval) {
        clearInterval(statsUpdateInterval);
        statsUpdateInterval = null;
    }
    console.log('✓ Auto-update paused');
}

function handleVisibilityChange() {
    if (document.hidden) {
        stopAutoUpdate();
    } else {
        updateAllData();
        startAutoUpdate();
    }
}

/* ==========================================
   ERROR HANDLING
   ========================================== */

window.addEventListener('error', function(event) {
    console.error('Dashboard Error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled Promise:', event.reason);
});

// Make functions global for inline onclick handlers
window.toggleChartPause = toggleChartPause;
window.resetChart = resetChart;
