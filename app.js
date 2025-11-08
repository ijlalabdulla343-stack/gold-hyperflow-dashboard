// Gold HyperFlow Scalper - Live Dashboard JavaScript
let equityCurveChart = null;
let plDistributionChart = null;
let winLossChart = null;
let streakChart = null;
let updateInterval = null;
let lastUpdateTime = null;
let equityHistory = [];
let startingBalance = 0;

// Debug logger
function debug(message, data = null) {
    if (CONFIG.DEBUG_MODE) {
        console.log(`[GHFS Dashboard] ${message}`, data || '');
    }
}

// Format currency
function formatCurrency(value) {
    const num = parseFloat(value) || 0;
    return '

// Debug logger
function debug(message, data = null) {
    if (CONFIG.DEBUG_MODE) {
        console.log(`[GHFS Dashboard] ${message}`, data || '');
    }
}

// Format currency
function formatCurrency(value) {
    const num = parseFloat(value) || 0;
    return '$' + num.toFixed(2);
}

// Format percentage
function formatPercent(value) {
    const num = parseFloat(value) || 0;
    return num.toFixed(1) + '%';
}

// Format date
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    } catch (e) {
        return dateString;
    }
}

// Format duration
function formatDuration(seconds) {
    const sec = parseInt(seconds) || 0;
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = sec % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

// Update connection status
function updateConnectionStatus(connected) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('connectionStatus');
    
    if (connected) {
        statusDot.classList.remove('disconnected');
        statusText.textContent = 'Connected';
    } else {
        statusDot.classList.add('disconnected');
        statusText.textContent = 'Disconnected';
    }
}

// Fetch data from Google Apps Script
async function fetchData(action) {
    try {
        const url = `${CONFIG.GOOGLE_SCRIPT_URL}?action=${action}`;
        debug(`Fetching ${action}...`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        debug(`${action} response:`, data);
        
        if (data.status === 'success') {
            return data.data;
        } else {
            throw new Error(data.message || 'Unknown error');
        }
    } catch (error) {
        console.error(`Error fetching ${action}:`, error);
        return null;
    }
}



// Update live statistics
async function updateLiveStats() {
    const stats = await fetchData('getLiveStats');
    
    if (!stats) {
        updateConnectionStatus(false);
        return;
    }
    
    updateConnectionStatus(true);
    
    // Update all stat cards
    document.getElementById('balance').textContent = formatCurrency(stats.Balance);
    document.getElementById('equity').textContent = formatCurrency(stats.Equity);
    
    const floatingPL = parseFloat(stats['Floating P/L']) || 0;
    const floatingEl = document.getElementById('floatingPL');
    floatingEl.textContent = formatCurrency(floatingPL);
    floatingEl.className = 'stat-value ' + (floatingPL >= 0 ? 'positive' : 'negative');
    
    document.getElementById('dailyTrades').textContent = stats['Daily Trades'] || '0';
    document.getElementById('wins').textContent = stats['Daily Wins'] || '0';
    document.getElementById('losses').textContent = stats['Daily Losses'] || '0';
    document.getElementById('winRate').textContent = formatPercent(stats['Win Rate']);
    
    const dailyPL = parseFloat(stats['Daily P/L']) || 0;
    const dailyPLEl = document.getElementById('dailyPL');
    dailyPLEl.textContent = formatCurrency(dailyPL);
    dailyPLEl.className = 'stat-value ' + (dailyPL >= 0 ? 'positive' : 'negative');
    
    document.getElementById('consecLosses').textContent = stats['Consecutive Losses'] || '0';
    document.getElementById('openPositions').textContent = stats['Open Positions'] || '0';
    
    // Update EA status
    const statusEl = document.getElementById('eaStatus');
    const status = stats.Status || 'UNKNOWN';
    statusEl.textContent = status;
    statusEl.className = 'stat-value';
    
    if (status === 'MONITORING' || status === 'IN_POSITION') {
        statusEl.classList.add('positive');
    } else if (status === 'LOCKOUT' || status === 'LIMIT_REACHED') {
        statusEl.classList.add('negative');
    }
    
    // Update last trade
    const lastTradeDirection = stats['Last Trade Direction'] || 'NONE';
    const lastTradeProfit = parseFloat(stats['Last Trade Profit']) || 0;
    const lastTradeEl = document.getElementById('lastTrade');
    
    if (lastTradeDirection !== 'NONE') {
        lastTradeEl.textContent = `${lastTradeDirection} (${formatCurrency(lastTradeProfit)})`;
        lastTradeEl.className = 'stat-value ' + (lastTradeProfit >= 0 ? 'positive' : 'negative');
    } else {
        lastTradeEl.textContent = 'NONE';
        lastTradeEl.className = 'stat-value';
    }
    
    // Update last update time
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    lastUpdateTime = now;
}

// Update trade history
async function updateTradeHistory() {
    const trades = await fetchData(`getTradeHistory&limit=${CONFIG.MAX_TRADES_DISPLAY}`);
    
    if (!trades || trades.length === 0) {
        document.getElementById('tradesTableBody').innerHTML = 
            '<tr><td colspan="9" class="no-data">No trades recorded yet</td></tr>';
        return;
    }
    
    allTradesData = trades;
    
    let html = '';
    trades.forEach((trade, index) => {
        const profit = parseFloat(trade.Profit) || 0;
        const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
        const profitSymbol = profit >= 0 ? '+' : '';
        
        html += `<tr>
            <td>${index + 1}</td>
            <td><span class="type-${trade.Type}">${trade.Type}</span></td>
            <td>${formatDate(trade['Open Time'])}</td>
            <td>${formatDate(trade['Close Time'])}</td>
            <td>${parseFloat(trade['Open Price']).toFixed(5)}</td>
            <td>${parseFloat(trade['Close Price']).toFixed(5)}</td>
            <td>${parseFloat(trade.Lots).toFixed(2)}</td>
            <td class="${profitClass}">${profitSymbol}${formatCurrency(profit)}</td>
            <td>${formatDuration(trade.Duration)}</td>
        </tr>`;
    });
    
    document.getElementById('tradesTableBody').innerHTML = html;
    
    // Calculate and update performance metrics
    const metrics = calculatePerformanceMetrics(trades);
    updatePerformanceMetrics(metrics);
    
    // Update all charts with trade data
    updateAllCharts(trades);
}

// Update Equity Curve Chart
function updateEquityCurveChart(trades) {
    const ctx = document.getElementById('equityCurveChart');
    if (!ctx) return;
    
    if (equityCurveChart) {
        equityCurveChart.destroy();
    }
    
    // Calculate cumulative P/L
    let cumulative = 0;
    const labels = ['Start'];
    const data = [0];
    
    trades.slice().reverse().forEach((trade, idx) => {
        cumulative += parseFloat(trade.Profit) || 0;
        labels.push(`T${idx + 1}`);
        data.push(cumulative);
    });
    
    equityCurveChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cumulative P/L ($)',
                data: data,
                borderColor: CONFIG.COLORS.primary,
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#b0b7c3',
                        font: { size: 14, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Cumulative P/L: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8892a6',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8892a6',
                        maxRotation: 45,
                        minRotation: 0
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
}

// Update P/L Distribution Chart
function updatePLDistributionChart(trades) {
    const ctx = document.getElementById('plDistributionChart');
    if (!ctx) return;
    
    if (plDistributionChart) {
        plDistributionChart.destroy();
    }
    
    const recent20 = trades.slice(0, 20).reverse();
    const labels = recent20.map((_, idx) => `T${idx + 1}`);
    const profits = recent20.map(trade => parseFloat(trade.Profit) || 0);
    const colors = profits.map(p => p >= 0 ? CONFIG.COLORS.success : CONFIG.COLORS.danger);
    
    plDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'P/L ($)',
                data: profits,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'P/L: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8892a6',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8892a6'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
}

// Update Win/Loss Chart
function updateWinLossChart(trades) {
    const ctx = document.getElementById('winLossChart');
    if (!ctx) return;
    
    if (winLossChart) {
        winLossChart.destroy();
    }
    
    let wins = 0, losses = 0;
    trades.forEach(trade => {
        const profit = parseFloat(trade.Profit) || 0;
        if (profit > 0) wins++;
        else if (profit < 0) losses++;
    });
    
    winLossChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [`Wins (${wins})`, `Losses (${losses})`],
            datasets: [{
                data: [wins, losses],
                backgroundColor: [
                    'rgba(74, 222, 128, 0.8)',
                    'rgba(248, 113, 113, 0.8)'
                ],
                borderColor: [
                    CONFIG.COLORS.success,
                    CONFIG.COLORS.danger
                ],
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#b0b7c3',
                        font: { size: 14, weight: '600' },
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12
                }
            }
        }
    });
}

// Update Duration Analysis Chart
function updateDurationChart(trades) {
    const ctx = document.getElementById('durationChart');
    if (!ctx) return;
    
    if (durationChart) {
        durationChart.destroy();
    }
    
    const recent15 = trades.slice(0, 15).reverse();
    const labels = recent15.map((_, idx) => `T${idx + 1}`);
    const durations = recent15.map(trade => (parseInt(trade.Duration) || 0) / 60); // Convert to minutes
    
    durationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Duration (minutes)',
                data: durations,
                borderColor: CONFIG.COLORS.warning,
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#b0b7c3',
                        font: { size: 14, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Duration: ' + context.parsed.y.toFixed(1) + ' min';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8892a6',
                        callback: function(value) {
                            return value.toFixed(1) + 'm';
                        }
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8892a6'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
}

// Update Trade Type Performance Chart
function updateTradeTypeChart(trades) {
    const ctx = document.getElementById('tradeTypeChart');
    if (!ctx) return;
    
    if (tradeTypeChart) {
        tradeTypeChart.destroy();
    }
    
    let buyProfit = 0, sellProfit = 0;
    let buyCount = 0, sellCount = 0;
    
    trades.forEach(trade => {
        const profit = parseFloat(trade.Profit) || 0;
        if (trade.Type === 'BUY') {
            buyProfit += profit;
            buyCount++;
        } else if (trade.Type === 'SELL') {
            sellProfit += profit;
            sellCount++;
        }
    });
    
    tradeTypeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [`BUY (${buyCount})`, `SELL (${sellCount})`],
            datasets: [{
                label: 'Total P/L ($)',
                data: [buyProfit, sellProfit],
                backgroundColor: [
                    'rgba(74, 222, 128, 0.6)',
                    'rgba(248, 113, 113, 0.6)'
                ],
                borderColor: [
                    CONFIG.COLORS.success,
                    CONFIG.COLORS.danger
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#b0b7c3',
                        font: { size: 14, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'P/L: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8892a6',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8892a6'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
}

// Update Streak Chart
function updateStreakChart(trades) {
    const ctx = document.getElementById('streakChart');
    if (!ctx) return;
    
    if (streakChart) {
        streakChart.destroy();
    }
    
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let lastWasWin = null;
    
    trades.slice().reverse().forEach(trade => {
        const profit = parseFloat(trade.Profit) || 0;
        const isWin = profit > 0;
        
        if (lastWasWin === null || lastWasWin === isWin) {
            currentStreak++;
        } else {
            if (lastWasWin) {
                maxWinStreak = Math.max(maxWinStreak, currentStreak);
            } else {
                maxLossStreak = Math.max(maxLossStreak, currentStreak);
            }
            currentStreak = 1;
        }
        lastWasWin = isWin;
    });
    
    if (lastWasWin) {
        maxWinStreak = Math.max(maxWinStreak, currentStreak);
    } else if (lastWasWin === false) {
        maxLossStreak = Math.max(maxLossStreak, currentStreak);
    }
    
    streakChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Max Win Streak', 'Max Loss Streak'],
            datasets: [{
                label: 'Streak Length',
                data: [maxWinStreak, maxLossStreak],
                backgroundColor: [
                    'rgba(74, 222, 128, 0.6)',
                    'rgba(248, 113, 113, 0.6)'
                ],
                borderColor: [
                    CONFIG.COLORS.success,
                    CONFIG.COLORS.danger
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Streak: ' + context.parsed.y + ' trades';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8892a6',
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8892a6'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
}

// Update P/L Trend Chart
function updatePLTrendChart(trades) {
    const ctx = document.getElementById('plTrendChart');
    if (!ctx) return;
    
    if (plTrendChart) {
        plTrendChart.destroy();
    }
    
    const recent20 = trades.slice(0, 20).reverse();
    const labels = recent20.map((_, idx) => `T${idx + 1}`);
    const profits = recent20.map(trade => parseFloat(trade.Profit) || 0);
    
    // Calculate moving average (5-trade MA)
    const movingAvg = [];
    for (let i = 0; i < profits.length; i++) {
        const start = Math.max(0, i - 4);
        const slice = profits.slice(start, i + 1);
        const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
        movingAvg.push(avg);
    }
    
    plTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Trade P/L',
                    data: profits,
                    borderColor: CONFIG.COLORS.info,
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6
                },
                {
                    label: '5-Trade MA',
                    data: movingAvg,
                    borderColor: CONFIG.COLORS.warning,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 0,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#b0b7c3',
                        font: { size: 14, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8892a6',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8892a6'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
}

// Update all charts
function updateAllCharts(trades) {
    if (!trades || trades.length === 0) return;
    
    updateEquityCurveChart(trades);
    updatePLDistributionChart(trades);
    updateWinLossChart(trades);
    updateDurationChart(trades);
    updateTradeTypeChart(trades);
    updateStreakChart(trades);
    updatePLTrendChart(trades);
}

// Update all data
async function updateAll() {
    debug('Updating all data...');
    await Promise.all([
        updateLiveStats(),
        updateTradeHistory()
    ]);
    debug('All data updated');
}

// Initialize dashboard
function initDashboard() {
    debug('Initializing dashboard...');
    
    // Set Chart.js defaults
    Chart.defaults.color = '#b0b7c3';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.1)';
    Chart.defaults.font.family = "'Inter', sans-serif";
    
    // Initial update
    updateAll();
    
    // Set up auto-update
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    updateInterval = setInterval(() => {
        updateAll();
    }, CONFIG.UPDATE_INTERVAL);
    
    debug(`Auto-update enabled (${CONFIG.UPDATE_INTERVAL}ms interval)`);
}

// Start dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Gold HyperFlow Scalper Dashboard - Initializing...');
    console.log('Google Script URL:', CONFIG.GOOGLE_SCRIPT_URL);
    
    initDashboard();
    
    // Handle visibility change to pause/resume updates
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            debug('Page hidden - pausing updates');
            if (updateInterval) {
                clearInterval(updateInterval);
            }
        } else {
            debug('Page visible - resuming updates');
            initDashboard();
        }
    });
});

// Handle errors globally
window.addEventListener('error', function(event) {
    console.error('Dashboard error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
}); + num.toFixed(2);
}

// Format percentage
function formatPercent(value) {
    const num = parseFloat(value) || 0;
    return num.toFixed(1) + '%';
}

// Format date
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    } catch (e) {
        return dateString;
    }
}

// Format duration
function formatDuration(seconds) {
    const sec = parseInt(seconds) || 0;
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = sec % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

// Update connection status
function updateConnectionStatus(connected) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('connectionStatus');
    
    if (connected) {
        statusDot.classList.remove('disconnected');
        statusText.textContent = 'Connected';
    } else {
        statusDot.classList.add('disconnected');
        statusText.textContent = 'Disconnected';
    }
}

// Fetch data from Google Apps Script
async function fetchData(action) {
    try {
        const url = `${CONFIG.GOOGLE_SCRIPT_URL}?action=${action}&t=${Date.now()}`;
        debug(`Fetching ${action}...`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        debug(`${action} response:`, data);
        
        if (data.status === 'success') {
            return data.data;
        } else {
            throw new Error(data.message || 'Unknown error');
        }
    } catch (error) {
        console.error(`Error fetching ${action}:`, error);
        return null;
    }
}

// Calculate live performance metrics from current stats
function calculateLiveMetrics(stats, todaysTrades) {
    const dailyWins = parseInt(stats['Daily Wins']) || 0;
    const dailyLosses = parseInt(stats['Daily Losses']) || 0;
    const totalTrades = dailyWins + dailyLosses;
    const winRate = totalTrades > 0 ? (dailyWins / totalTrades * 100) : 0;
    const dailyPL = parseFloat(stats['Daily P/L']) || 0;
    
    let bestTrade = 0;
    let worstTrade = 0;
    let totalDuration = 0;
    let totalProfit = 0;
    let totalLoss = 0;
    
    if (todaysTrades && todaysTrades.length > 0) {
        todaysTrades.forEach(trade => {
            const profit = parseFloat(trade.Profit) || 0;
            const duration = parseInt(trade.Duration) || 0;
            
            totalDuration += duration;
            
            if (profit > 0) {
                totalProfit += profit;
                if (profit > bestTrade) bestTrade = profit;
            } else if (profit < 0) {
                totalLoss += Math.abs(profit);
                if (profit < worstTrade) worstTrade = profit;
            }
        });
    }
    
    const avgDuration = totalTrades > 0 ? totalDuration / totalTrades : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : (totalProfit > 0 ? 999 : 0);
    
    return {
        equity: parseFloat(stats.Equity) || 0,
        dailyPL,
        bestTrade,
        worstTrade,
        profitFactor,
        avgDuration,
        winRate,
        totalTrades
    };
}

// Update live performance metrics display
function updateLiveMetrics(metrics) {
    document.getElementById('currentEquity').textContent = formatCurrency(metrics.equity);
    document.getElementById('currentEquity').className = 'metric-value positive';
    
    document.getElementById('todayPL').textContent = formatCurrency(metrics.dailyPL);
    document.getElementById('todayPL').className = 'metric-value ' + 
        (metrics.dailyPL >= 0 ? 'positive' : 'negative');
    
    document.getElementById('bestTradeToday').textContent = formatCurrency(metrics.bestTrade);
    document.getElementById('worstTradeToday').textContent = formatCurrency(metrics.worstTrade);
    document.getElementById('avgDurationLive').textContent = formatDuration(metrics.avgDuration);
    document.getElementById('tradesToday').textContent = metrics.totalTrades;
    
    document.getElementById('liveProfitFactor').textContent = 
        metrics.profitFactor === 999 ? '∞' : metrics.profitFactor.toFixed(2);
    const pfElement = document.getElementById('liveProfitFactor');
    pfElement.className = 'metric-value';
    if (metrics.profitFactor >= 2.0) {
        pfElement.classList.add('positive');
    } else if (metrics.profitFactor < 1.0) {
        pfElement.classList.add('negative');
    }
    
    document.getElementById('liveWinRate').textContent = formatPercent(metrics.winRate);
    const wrElement = document.getElementById('liveWinRate');
    wrElement.className = 'metric-value';
    if (metrics.winRate >= 60) {
        wrElement.classList.add('positive');
    } else if (metrics.winRate < 40) {
        wrElement.classList.add('negative');
    }
}

// Update live statistics
async function updateLiveStats() {
    const stats = await fetchData('getLiveStats');
    
    if (!stats) {
        updateConnectionStatus(false);
        return;
    }
    
    updateConnectionStatus(true);
    
    // Store starting balance if not set
    if (startingBalance === 0) {
        startingBalance = parseFloat(stats.Balance) || 0;
    }
    
    // Update all stat cards
    document.getElementById('balance').textContent = formatCurrency(stats.Balance);
    document.getElementById('equity').textContent = formatCurrency(stats.Equity);
    
    const floatingPL = parseFloat(stats['Floating P/L']) || 0;
    const floatingEl = document.getElementById('floatingPL');
    floatingEl.textContent = formatCurrency(floatingPL);
    floatingEl.className = 'stat-value ' + (floatingPL >= 0 ? 'positive' : 'negative');
    
    document.getElementById('dailyTrades').textContent = stats['Daily Trades'] || '0';
    document.getElementById('wins').textContent = stats['Daily Wins'] || '0';
    document.getElementById('losses').textContent = stats['Daily Losses'] || '0';
    document.getElementById('winRate').textContent = formatPercent(stats['Win Rate']);
    
    const dailyPL = parseFloat(stats['Daily P/L']) || 0;
    const dailyPLEl = document.getElementById('dailyPL');
    dailyPLEl.textContent = formatCurrency(dailyPL);
    dailyPLEl.className = 'stat-value ' + (dailyPL >= 0 ? 'positive' : 'negative');
    
    document.getElementById('consecLosses').textContent = stats['Consecutive Losses'] || '0';
    document.getElementById('openPositions').textContent = stats['Open Positions'] || '0';
    
    // Update EA status
    const statusEl = document.getElementById('eaStatus');
    const status = stats.Status || 'UNKNOWN';
    statusEl.textContent = status;
    statusEl.className = 'stat-value';
    
    if (status === 'MONITORING' || status === 'IN_POSITION') {
        statusEl.classList.add('positive');
    } else if (status === 'LOCKOUT' || status === 'LIMIT_REACHED') {
        statusEl.classList.add('negative');
    }
    
    // Update last trade
    const lastTradeDirection = stats['Last Trade Direction'] || 'NONE';
    const lastTradeProfit = parseFloat(stats['Last Trade Profit']) || 0;
    const lastTradeEl = document.getElementById('lastTrade');
    
    if (lastTradeDirection !== 'NONE') {
        lastTradeEl.textContent = `${lastTradeDirection} (${formatCurrency(lastTradeProfit)})`;
        lastTradeEl.className = 'stat-value ' + (lastTradeProfit >= 0 ? 'positive' : 'negative');
    } else {
        lastTradeEl.textContent = 'NONE';
        lastTradeEl.className = 'stat-value';
    }
    
    // Add current equity to history
    const currentEquity = parseFloat(stats.Equity) || 0;
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    equityHistory.push({ time: timestamp, equity: currentEquity });
    
    // Keep only last 50 data points
    if (equityHistory.length > 50) {
        equityHistory.shift();
    }
    
    // Update last update time
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    lastUpdateTime = now;
    
    return stats;
}

// Get today's trades only
async function getTodaysTrades() {
    const allTrades = await fetchData('getTradeHistory&limit=100');
    if (!allTrades || allTrades.length === 0) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return allTrades.filter(trade => {
        const tradeDate = new Date(trade['Close Time']);
        tradeDate.setHours(0, 0, 0, 0);
        return tradeDate.getTime() === today.getTime();
    });
}

// Update trade history
async function updateTradeHistory() {
    const todaysTrades = await getTodaysTrades();
    
    if (!todaysTrades || todaysTrades.length === 0) {
        document.getElementById('tradesTableBody').innerHTML = 
            '<tr><td colspan="9" class="no-data">No trades today</td></tr>';
        return todaysTrades;
    }
    
    let html = '';
    todaysTrades.forEach((trade, index) => {
        const profit = parseFloat(trade.Profit) || 0;
        const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
        const profitSymbol = profit >= 0 ? '+' : '';
        
        html += `<tr>
            <td>${index + 1}</td>
            <td><span class="type-${trade.Type}">${trade.Type}</span></td>
            <td>${formatDate(trade['Open Time'])}</td>
            <td>${formatDate(trade['Close Time'])}</td>
            <td>${parseFloat(trade['Open Price']).toFixed(5)}</td>
            <td>${parseFloat(trade['Close Price']).toFixed(5)}</td>
            <td>${parseFloat(trade.Lots).toFixed(2)}</td>
            <td class="${profitClass}">${profitSymbol}${formatCurrency(profit)}</td>
            <td>${formatDuration(trade.Duration)}</td>
        </tr>`;
    });
    
    document.getElementById('tradesTableBody').innerHTML = html;
    
    return todaysTrades;
}

// Update Real-Time Equity Curve
function updateEquityCurveChart() {
    const ctx = document.getElementById('equityCurveChart');
    if (!ctx) return;
    
    if (equityCurveChart) {
        equityCurveChart.destroy();
    }
    
    if (equityHistory.length === 0) return;
    
    const labels = equityHistory.map(item => item.time);
    const data = equityHistory.map(item => item.equity);
    
    equityCurveChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Live Equity ($)',
                data: data,
                borderColor: CONFIG.COLORS.primary,
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 6,
                pointBackgroundColor: CONFIG.COLORS.primary
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#b0b7c3',
                        font: { size: 14, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Equity: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#8892a6',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8892a6',
                        maxRotation: 45,
                        minRotation: 45,
                        maxTicksLimit: 10
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
}

// Update P/L Distribution Chart
function updatePLDistributionChart(trades) {
    const ctx = document.getElementById('plDistributionChart');
    if (!ctx) return;
    
    if (plDistributionChart) {
        plDistributionChart.destroy();
    }
    
    if (!trades || trades.length === 0) return;
    
    const recent20 = trades.slice(0, 20).reverse();
    const labels = recent20.map((_, idx) => `T${idx + 1}`);
    const profits = recent20.map(trade => parseFloat(trade.Profit) || 0);
    const colors = profits.map(p => p >= 0 ? CONFIG.COLORS.success : CONFIG.COLORS.danger);
    
    plDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'P/L ($)',
                data: profits,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'P/L: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8892a6',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8892a6'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
}

// Update Win/Loss Chart
function updateWinLossChart(trades) {
    const ctx = document.getElementById('winLossChart');
    if (!ctx) return;
    
    if (winLossChart) {
        winLossChart.destroy();
    }
    
    if (!trades || trades.length === 0) return;
    
    let wins = 0, losses = 0;
    trades.forEach(trade => {
        const profit = parseFloat(trade.Profit) || 0;
        if (profit > 0) wins++;
        else if (profit < 0) losses++;
    });
    
    winLossChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [`Wins (${wins})`, `Losses (${losses})`],
            datasets: [{
                data: [wins, losses],
                backgroundColor: [
                    'rgba(74, 222, 128, 0.8)',
                    'rgba(248, 113, 113, 0.8)'
                ],
                borderColor: [
                    CONFIG.COLORS.success,
                    CONFIG.COLORS.danger
                ],
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#b0b7c3',
                        font: { size: 14, weight: '600' },
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12
                }
            }
        }
    });
}

// Update Streak Chart
function updateStreakChart(trades) {
    const ctx = document.getElementById('streakChart');
    if (!ctx) return;
    
    if (streakChart) {
        streakChart.destroy();
    }
    
    if (!trades || trades.length === 0) return;
    
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let lastWasWin = null;
    
    trades.slice().reverse().forEach(trade => {
        const profit = parseFloat(trade.Profit) || 0;
        const isWin = profit > 0;
        
        if (lastWasWin === null || lastWasWin === isWin) {
            currentStreak++;
        } else {
            if (lastWasWin) {
                maxWinStreak = Math.max(maxWinStreak, currentStreak);
            } else {
                maxLossStreak = Math.max(maxLossStreak, currentStreak);
            }
            currentStreak = 1;
        }
        lastWasWin = isWin;
    });
    
    if (lastWasWin) {
        maxWinStreak = Math.max(maxWinStreak, currentStreak);
    } else if (lastWasWin === false) {
        maxLossStreak = Math.max(maxLossStreak, currentStreak);
    }
    
    streakChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Max Win Streak', 'Max Loss Streak'],
            datasets: [{
                label: 'Streak Length',
                data: [maxWinStreak, maxLossStreak],
                backgroundColor: [
                    'rgba(74, 222, 128, 0.6)',
                    'rgba(248, 113, 113, 0.6)'
                ],
                borderColor: [
                    CONFIG.COLORS.success,
                    CONFIG.COLORS.danger
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Streak: ' + context.parsed.y + ' trades';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8892a6',
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8892a6'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
}

// Update all charts
function updateAllCharts(trades) {
    updateEquityCurveChart();
    if (trades && trades.length > 0) {
        updatePLDistributionChart(trades);
        updateWinLossChart(trades);
        updateStreakChart(trades);
    }
}

// Update all data
async function updateAll() {
    debug('Updating all data...');
    const stats = await updateLiveStats();
    if (stats) {
        const todaysTrades = await updateTradeHistory();
        const metrics = calculateLiveMetrics(stats, todaysTrades);
        updateLiveMetrics(metrics);
        updateAllCharts(todaysTrades);
    }
    debug('All data updated');
}

// Initialize dashboard
function initDashboard() {
    debug('Initializing dashboard...');
    
    // Set Chart.js defaults
    Chart.defaults.color = '#b0b7c3';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.1)';
    Chart.defaults.font.family = "'Inter', sans-serif";
    
    // Initial update
    updateAll();
    
    // Set up auto-update
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    updateInterval = setInterval(() => {
        updateAll();
    }, CONFIG.UPDATE_INTERVAL);
    
    debug(`Auto-update enabled (${CONFIG.UPDATE_INTERVAL}ms interval)`);
}

// Start dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Gold HyperFlow Scalper Dashboard - Initializing...');
    console.log('Google Script URL:', CONFIG.GOOGLE_SCRIPT_URL);
    
    initDashboard();
    
    // Handle visibility change to pause/resume updates
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            debug('Page hidden - pausing updates');
            if (updateInterval) {
                clearInterval(updateInterval);
            }
        } else {
            debug('Page visible - resuming updates');
            equityHistory = []; // Reset equity history
            initDashboard();
        }
    });
});

// Handle errors globally
window.addEventListener('error', function(event) {
    console.error('Dashboard error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});

// Debug logger
function debug(message, data = null) {
    if (CONFIG.DEBUG_MODE) {
        console.log(`[GHFS Dashboard] ${message}`, data || '');
    }
}

// Format currency
function formatCurrency(value) {
    const num = parseFloat(value) || 0;
    return '$' + num.toFixed(2);
}

// Format percentage
function formatPercent(value) {
    const num = parseFloat(value) || 0;
    return num.toFixed(1) + '%';
}

// Format date
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    } catch (e) {
        return dateString;
    }
}

// Format duration
function formatDuration(seconds) {
    const sec = parseInt(seconds) || 0;
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = sec % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

// Update connection status
function updateConnectionStatus(connected) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('connectionStatus');
    
    if (connected) {
        statusDot.classList.remove('disconnected');
        statusText.textContent = 'Connected';
    } else {
        statusDot.classList.add('disconnected');
        statusText.textContent = 'Disconnected';
    }
}

// Fetch data from Google Apps Script
async function fetchData(action) {
    try {
        const url = `${CONFIG.GOOGLE_SCRIPT_URL}?action=${action}`;
        debug(`Fetching ${action}...`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        debug(`${action} response:`, data);
        
        if (data.status === 'success') {
            return data.data;
        } else {
            throw new Error(data.message || 'Unknown error');
        }
    } catch (error) {
        console.error(`Error fetching ${action}:`, error);
        return null;
    }
}

// Calculate performance metrics
function calculatePerformanceMetrics(trades) {
    if (!trades || trades.length === 0) {
        return {
            totalNetPL: 0,
            bestTrade: 0,
            worstTrade: 0,
            avgWin: 0,
            avgLoss: 0,
            profitFactor: 0,
            avgDuration: 0,
            totalTrades: 0,
            wins: 0,
            losses: 0
        };
    }
    
    let totalProfit = 0;
    let totalLoss = 0;
    let wins = 0;
    let losses = 0;
    let bestTrade = 0;
    let worstTrade = 0;
    let totalDuration = 0;
    
    trades.forEach(trade => {
        const profit = parseFloat(trade.Profit) || 0;
        const duration = parseInt(trade.Duration) || 0;
        
        totalDuration += duration;
        
        if (profit > 0) {
            wins++;
            totalProfit += profit;
            if (profit > bestTrade) bestTrade = profit;
        } else if (profit < 0) {
            losses++;
            totalLoss += Math.abs(profit);
            if (profit < worstTrade) worstTrade = profit;
        }
    });
    
    const avgWin = wins > 0 ? totalProfit / wins : 0;
    const avgLoss = losses > 0 ? totalLoss / losses : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;
    const avgDuration = trades.length > 0 ? totalDuration / trades.length : 0;
    
    return {
        totalNetPL: totalProfit - totalLoss,
        bestTrade,
        worstTrade,
        avgWin,
        avgLoss,
        profitFactor,
        avgDuration,
        totalTrades: trades.length,
        wins,
        losses
    };
}

// Update performance metrics display
function updatePerformanceMetrics(metrics) {
    document.getElementById('totalNetPL').textContent = formatCurrency(metrics.totalNetPL);
    document.getElementById('totalNetPL').className = 'metric-value ' + 
        (metrics.totalNetPL >= 0 ? 'positive' : 'negative');
    
    document.getElementById('bestTrade').textContent = formatCurrency(metrics.bestTrade);
    document.getElementById('worstTrade').textContent = formatCurrency(metrics.worstTrade);
    document.getElementById('avgWin').textContent = formatCurrency(metrics.avgWin);
    document.getElementById('avgLoss').textContent = formatCurrency(metrics.avgLoss);
    document.getElementById('profitFactor').textContent = metrics.profitFactor.toFixed(2);
    document.getElementById('avgDuration').textContent = formatDuration(metrics.avgDuration);
    document.getElementById('totalTrades').textContent = metrics.totalTrades;
    
    // Color profit factor based on value
    const pfElement = document.getElementById('profitFactor');
    pfElement.className = 'metric-value';
    if (metrics.profitFactor >= 2.0) {
        pfElement.classList.add('positive');
    } else if (metrics.profitFactor < 1.0) {
        pfElement.classList.add('negative');
    }
}

// Update live statistics
async function updateLiveStats() {
    const stats = await fetchData('getLiveStats');
    
    if (!stats) {
        updateConnectionStatus(false);
        return;
    }
    
    updateConnectionStatus(true);
    
    // Update all stat cards
    document.getElementById('balance').textContent = formatCurrency(stats.Balance);
    document.getElementById('equity').textContent = formatCurrency(stats.Equity);
    
    const floatingPL = parseFloat(stats['Floating P/L']) || 0;
    const floatingEl = document.getElementById('floatingPL');
    floatingEl.textContent = formatCurrency(floatingPL);
    floatingEl.className = 'stat-value ' + (floatingPL >= 0 ? 'positive' : 'negative');
    
    document.getElementById('dailyTrades').textContent = stats['Daily Trades'] || '0';
    document.getElementById('wins').textContent = stats['Daily Wins'] || '0';
    document.getElementById('losses').textContent = stats['Daily Losses'] || '0';
    document.getElementById('winRate').textContent = formatPercent(stats['Win Rate']);
    
    const dailyPL = parseFloat(stats['Daily P/L']) || 0;
    const dailyPLEl = document.getElementById('dailyPL');
    dailyPLEl.textContent = formatCurrency(dailyPL);
    dailyPLEl.className = 'stat-value ' + (dailyPL >= 0 ? 'positive' : 'negative');
    
    document.getElementById('consecLosses').textContent = stats['Consecutive Losses'] || '0';
    document.getElementById('openPositions').textContent = stats['Open Positions'] || '0';
    
    // Update EA status
    const statusEl = document.getElementById('eaStatus');
    const status = stats.Status || 'UNKNOWN';
    statusEl.textContent = status;
    statusEl.className = 'stat-value';
    
    if (status === 'MONITORING' || status === 'IN_POSITION') {
        statusEl.classList.add('positive');
    } else if (status === 'LOCKOUT' || status === 'LIMIT_REACHED') {
        statusEl.classList.add('negative');
    }
    
    // Update last trade
    const lastTradeDirection = stats['Last Trade Direction'] || 'NONE';
    const lastTradeProfit = parseFloat(stats['Last Trade Profit']) || 0;
    const lastTradeEl = document.getElementById('lastTrade');
    
    if (lastTradeDirection !== 'NONE') {
        lastTradeEl.textContent = `${lastTradeDirection} (${formatCurrency(lastTradeProfit)})`;
        lastTradeEl.className = 'stat-value ' + (lastTradeProfit >= 0 ? 'positive' : 'negative');
    } else {
        lastTradeEl.textContent = 'NONE';
        lastTradeEl.className = 'stat-value';
    }
    
    // Update last update time
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    lastUpdateTime = now;
}

// Update trade history
async function updateTradeHistory() {
    const trades = await fetchData(`getTradeHistory&limit=${CONFIG.MAX_TRADES_DISPLAY}`);
    
    if (!trades || trades.length === 0) {
        document.getElementById('tradesTableBody').innerHTML = 
            '<tr><td colspan="9" class="no-data">No trades recorded yet</td></tr>';
        return;
    }
    
    allTradesData = trades;
    
    let html = '';
    trades.forEach((trade, index) => {
        const profit = parseFloat(trade.Profit) || 0;
        const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
        const profitSymbol = profit >= 0 ? '+' : '';
        
        html += `<tr>
            <td>${index + 1}</td>
            <td><span class="type-${trade.Type}">${trade.Type}</span></td>
            <td>${formatDate(trade['Open Time'])}</td>
            <td>${formatDate(trade['Close Time'])}</td>
            <td>${parseFloat(trade['Open Price']).toFixed(5)}</td>
            <td>${parseFloat(trade['Close Price']).toFixed(5)}</td>
            <td>${parseFloat(trade.Lots).toFixed(2)}</td>
            <td class="${profitClass}">${profitSymbol}${formatCurrency(profit)}</td>
            <td>${formatDuration(trade.Duration)}</td>
        </tr>`;
    });
    
    document.getElementById('tradesTableBody').innerHTML = html;
    
    // Calculate and update performance metrics
    const metrics = calculatePerformanceMetrics(trades);
    updatePerformanceMetrics(metrics);
    
    // Update all charts with trade data
    updateAllCharts(trades);
}

// Update Equity Curve Chart
function updateEquityCurveChart(trades) {
    const ctx = document.getElementById('equityCurveChart');
    if (!ctx) return;
    
    if (equityCurveChart) {
        equityCurveChart.destroy();
    }
    
    // Calculate cumulative P/L
    let cumulative = 0;
    const labels = ['Start'];
    const data = [0];
    
    trades.slice().reverse().forEach((trade, idx) => {
        cumulative += parseFloat(trade.Profit) || 0;
        labels.push(`T${idx + 1}`);
        data.push(cumulative);
    });
    
    equityCurveChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cumulative P/L ($)',
                data: data,
                borderColor: CONFIG.COLORS.primary,
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#b0b7c3',
                        font: { size: 14, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Cumulative P/L: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8892a6',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8892a6',
                        maxRotation: 45,
                        minRotation: 0
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
}

// Update P/L Distribution Chart
function updatePLDistributionChart(trades) {
    const ctx = document.getElementById('plDistributionChart');
    if (!ctx) return;
    
    if (plDistributionChart) {
        plDistributionChart.destroy();
    }
    
    const recent20 = trades.slice(0, 20).reverse();
    const labels = recent20.map((_, idx) => `T${idx + 1}`);
    const profits = recent20.map(trade => parseFloat(trade.Profit) || 0);
    const colors = profits.map(p => p >= 0 ? CONFIG.COLORS.success : CONFIG.COLORS.danger);
    
    plDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'P/L ($)',
                data: profits,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'P/L: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8892a6',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8892a6'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
}

// Update Win/Loss Chart
function updateWinLossChart(trades) {
    const ctx = document.getElementById('winLossChart');
    if (!ctx) return;
    
    if (winLossChart) {
        winLossChart.destroy();
    }
    
    let wins = 0, losses = 0;
    trades.forEach(trade => {
        const profit = parseFloat(trade.Profit) || 0;
        if (profit > 0) wins++;
        else if (profit < 0) losses++;
    });
    
    winLossChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [`Wins (${wins})`, `Losses (${losses})`],
            datasets: [{
                data: [wins, losses],
                backgroundColor: [
                    'rgba(74, 222, 128, 0.8)',
                    'rgba(248, 113, 113, 0.8)'
                ],
                borderColor: [
                    CONFIG.COLORS.success,
                    CONFIG.COLORS.danger
                ],
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#b0b7c3',
                        font: { size: 14, weight: '600' },
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12
                }
            }
        }
    });
}

// Update Duration Analysis Chart
function updateDurationChart(trades) {
    const ctx = document.getElementById('durationChart');
    if (!ctx) return;
    
    if (durationChart) {
        durationChart.destroy();
    }
    
    const recent15 = trades.slice(0, 15).reverse();
    const labels = recent15.map((_, idx) => `T${idx + 1}`);
    const durations = recent15.map(trade => (parseInt(trade.Duration) || 0) / 60); // Convert to minutes
    
    durationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Duration (minutes)',
                data: durations,
                borderColor: CONFIG.COLORS.warning,
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#b0b7c3',
                        font: { size: 14, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Duration: ' + context.parsed.y.toFixed(1) + ' min';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8892a6',
                        callback: function(value) {
                            return value.toFixed(1) + 'm';
                        }
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8892a6'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
}

// Update Trade Type Performance Chart
function updateTradeTypeChart(trades) {
    const ctx = document.getElementById('tradeTypeChart');
    if (!ctx) return;
    
    if (tradeTypeChart) {
        tradeTypeChart.destroy();
    }
    
    let buyProfit = 0, sellProfit = 0;
    let buyCount = 0, sellCount = 0;
    
    trades.forEach(trade => {
        const profit = parseFloat(trade.Profit) || 0;
        if (trade.Type === 'BUY') {
            buyProfit += profit;
            buyCount++;
        } else if (trade.Type === 'SELL') {
            sellProfit += profit;
            sellCount++;
        }
    });
    
    tradeTypeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [`BUY (${buyCount})`, `SELL (${sellCount})`],
            datasets: [{
                label: 'Total P/L ($)',
                data: [buyProfit, sellProfit],
                backgroundColor: [
                    'rgba(74, 222, 128, 0.6)',
                    'rgba(248, 113, 113, 0.6)'
                ],
                borderColor: [
                    CONFIG.COLORS.success,
                    CONFIG.COLORS.danger
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#b0b7c3',
                        font: { size: 14, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'P/L: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8892a6',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8892a6'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
}

// Update Streak Chart
function updateStreakChart(trades) {
    const ctx = document.getElementById('streakChart');
    if (!ctx) return;
    
    if (streakChart) {
        streakChart.destroy();
    }
    
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let lastWasWin = null;
    
    trades.slice().reverse().forEach(trade => {
        const profit = parseFloat(trade.Profit) || 0;
        const isWin = profit > 0;
        
        if (lastWasWin === null || lastWasWin === isWin) {
            currentStreak++;
        } else {
            if (lastWasWin) {
                maxWinStreak = Math.max(maxWinStreak, currentStreak);
            } else {
                maxLossStreak = Math.max(maxLossStreak, currentStreak);
            }
            currentStreak = 1;
        }
        lastWasWin = isWin;
    });
    
    if (lastWasWin) {
        maxWinStreak = Math.max(maxWinStreak, currentStreak);
    } else if (lastWasWin === false) {
        maxLossStreak = Math.max(maxLossStreak, currentStreak);
    }
    
    streakChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Max Win Streak', 'Max Loss Streak'],
            datasets: [{
                label: 'Streak Length',
                data: [maxWinStreak, maxLossStreak],
                backgroundColor: [
                    'rgba(74, 222, 128, 0.6)',
                    'rgba(248, 113, 113, 0.6)'
                ],
                borderColor: [
                    CONFIG.COLORS.success,
                    CONFIG.COLORS.danger
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Streak: ' + context.parsed.y + ' trades';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8892a6',
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8892a6'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
}

// Update P/L Trend Chart
function updatePLTrendChart(trades) {
    const ctx = document.getElementById('plTrendChart');
    if (!ctx) return;
    
    if (plTrendChart) {
        plTrendChart.destroy();
    }
    
    const recent20 = trades.slice(0, 20).reverse();
    const labels = recent20.map((_, idx) => `T${idx + 1}`);
    const profits = recent20.map(trade => parseFloat(trade.Profit) || 0);
    
    // Calculate moving average (5-trade MA)
    const movingAvg = [];
    for (let i = 0; i < profits.length; i++) {
        const start = Math.max(0, i - 4);
        const slice = profits.slice(start, i + 1);
        const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
        movingAvg.push(avg);
    }
    
    plTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Trade P/L',
                    data: profits,
                    borderColor: CONFIG.COLORS.info,
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6
                },
                {
                    label: '5-Trade MA',
                    data: movingAvg,
                    borderColor: CONFIG.COLORS.warning,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 0,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#b0b7c3',
                        font: { size: 14, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    titleColor: CONFIG.COLORS.primary,
                    bodyColor: '#fff',
                    borderColor: CONFIG.COLORS.primary,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8892a6',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8892a6'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
}

// Update all charts
function updateAllCharts(trades) {
    if (!trades || trades.length === 0) return;
    
    updateEquityCurveChart(trades);
    updatePLDistributionChart(trades);
    updateWinLossChart(trades);
    updateDurationChart(trades);
    updateTradeTypeChart(trades);
    updateStreakChart(trades);
    updatePLTrendChart(trades);
}

// Update all data
async function updateAll() {
    debug('Updating all data...');
    await Promise.all([
        updateLiveStats(),
        updateTradeHistory()
    ]);
    debug('All data updated');
}

// Initialize dashboard
function initDashboard() {
    debug('Initializing dashboard...');
    
    // Set Chart.js defaults
    Chart.defaults.color = '#b0b7c3';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.1)';
    Chart.defaults.font.family = "'Inter', sans-serif";
    
    // Initial update
    updateAll();
    
    // Set up auto-update
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    updateInterval = setInterval(() => {
        updateAll();
    }, CONFIG.UPDATE_INTERVAL);
    
    debug(`Auto-update enabled (${CONFIG.UPDATE_INTERVAL}ms interval)`);
}

// Start dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Gold HyperFlow Scalper Dashboard - Initializing...');
    console.log('Google Script URL:', CONFIG.GOOGLE_SCRIPT_URL);
    
    initDashboard();
    
    // Handle visibility change to pause/resume updates
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            debug('Page hidden - pausing updates');
            if (updateInterval) {
                clearInterval(updateInterval);
            }
        } else {
            debug('Page visible - resuming updates');
            initDashboard();
        }
    });
});

// Handle errors globally
window.addEventListener('error', function(event) {
    console.error('Dashboard error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});
