<template>
    <div class="expense-dashboard">
        <header class="dashboard-header">
            <div class="title-area">
                <h2>지출 분석 대시보드</h2>
                <p>그룹별 지출 비중과 상세 계정의 소비 추이를 한눈에 확인하세요.</p>
            </div>

            <div class="header-controls d-panel">
                <div class="month-picker">
                    <button class="nav-btn" @click="changeMonth(-1)">◀</button>
                    <input type="month" v-model="targetMonth" @change="loadDashboardData">
                    <button class="nav-btn" @click="changeMonth(1)">▶</button>
                </div>
                <div class="total-stats">
                    <span class="label">당월 총 지출</span>
                    <span class="value">{{ currentMonthTotal.toLocaleString() }}원</span>
                </div>
            </div>
        </header>

        <nav class="dashboard-tabs">
            <button :class="{ active: activeTab === 'DOUGHNUT' }" @click="activeTab = 'DOUGHNUT'">
                🍩 그룹별 비중 분석
            </button>
            <button :class="{ active: activeTab === 'BAR' }" @click="activeTab = 'BAR'">
                📊 계정별 추이 분석
            </button>
        </nav>

        <main class="dashboard-body">
            <div v-show="activeTab === 'DOUGHNUT'" class="tab-pane">
                <div class="multi-chart-grid">
                    <div class="chart-card" v-for="group in doughnutGroups" :key="group.parent.acct_cd">
                        <div class="card-title">
                            <h3>{{ group.parent.acct_nm }}</h3>
                            <span class="badge">{{ getPercentage(group.total, currentMonthTotal) }}%</span>
                        </div>

                        <div class="card-content">
                            <div class="chart-box">
                                <canvas :ref="el => setChartRef(el, group.parent.acct_cd)"></canvas>
                                <div class="chart-center-label">
                                    <span class="label">Total</span>
                                    <span class="amt">{{ (group.total / 10000).toFixed(1) }}만</span>
                                </div>
                            </div>

                            <div class="custom-legend">
                                <div v-for="(child, idx) in group.childrenData" :key="child.acct_cd" class="legend-item">
                                    <div class="info">
                                        <span class="dot"
                                            :style="{ backgroundColor: chartColors[idx % chartColors.length] }"></span>
                                        <span class="name">{{ child.acct_nm.replace('지출-', '') }}</span>
                                    </div>
                                    <div class="values">
                                        <span class="pct">{{ getPercentage(child.amount, group.total) }}%</span>
                                        <span class="amt">{{ child.amount.toLocaleString() }}원</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-show="activeTab === 'BAR'" class="tab-pane">
                <div class="trend-analysis d-panel">
                    <div class="analysis-header">
                        <div class="text">
                            <h3>계정과목별 3개월 지출 추이</h3>
                            <p>보고 싶은 계정과목을 아래에서 선택하세요 (다중 선택 가능)</p>
                        </div>
                        <button class="btn-outline" @click="selectAllTrendAccounts">전체 선택/해제</button>
                    </div>

                    <div class="account-pills">
                        <button v-for="acc in childAccounts" :key="acc.acct_cd" class="pill"
                            :class="{ active: selectedTrendAccounts.includes(acc.acct_cd) }"
                            @click="toggleTrendAccount(acc.acct_cd)">
                            {{ acc.acct_nm.replace('지출-', '') }}
                        </button>
                    </div>

                    <div class="bar-chart-container">
                        <canvas ref="barCanvas"></canvas>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import Chart from 'chart.js/auto';

// --- 데이터 및 상태 관리 로직 (이전 로직 유지 및 유동적 대응) ---
const dbAccounts = [
    { acct_cd: '501000', acct_nm: '일반지출(변동)', parent_acct_cd: '500000', final_flag: 'N' },
    { acct_cd: '501001', acct_nm: '지출-식비', parent_acct_cd: '501000', final_flag: 'Y' },
    { acct_cd: '501002', acct_nm: '지출-여가', parent_acct_cd: '501000', final_flag: 'Y' },
    { acct_cd: '501006', acct_nm: '지출-교통비', parent_acct_cd: '501000', final_flag: 'Y' },
    { acct_cd: '502000', acct_nm: '고정지출', parent_acct_cd: '500000', final_flag: 'N' },
    { acct_cd: '502001', acct_nm: '월세지급', parent_acct_cd: '502000', final_flag: 'Y' },
    { acct_cd: '502004', acct_nm: '서비스구독료', parent_acct_cd: '502000', final_flag: 'Y' },
    { acct_cd: '503000', acct_nm: '기타지출', parent_acct_cd: '500000', final_flag: 'N' },
    { acct_cd: '503001', acct_nm: '지출-기타', parent_acct_cd: '503000', final_flag: 'Y' }
];

const chartColors = ['#5c7cfa', '#20c997', '#fab005', '#be4bdb', '#ff6b6b', '#15aabf', '#fd7e14'];
const targetMonth = ref(new Date().toISOString().slice(0, 7));
const activeTab = ref('DOUGHNUT');
const doughnutGroups = ref([]);
const childAccounts = dbAccounts.filter(a => a.final_flag === 'Y');
const selectedTrendAccounts = ref(['501001', '502001']);

const currentMonthTotal = computed(() => doughnutGroups.value.reduce((s, g) => s + g.total, 0));
const getPercentage = (amt, total) => total > 0 ? ((amt / total) * 100).toFixed(1) : 0;

// 차트 인스턴스 관리
const chartRefs = ref({});
let chartInstances = {};
const setChartRef = (el, key) => { if (el) chartRefs.value[key] = el; };

const renderDoughnutCharts = () => {
    Object.values(chartInstances).forEach(i => i.destroy());
    chartInstances = {};
    doughnutGroups.value.forEach(group => {
        const ctx = chartRefs.value[group.parent.acct_cd].getContext('2d');
        chartInstances[group.parent.acct_cd] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: group.childrenData.map(c => c.acct_nm.replace('지출-', '')),
                datasets: [{ data: group.childrenData.map(c => c.amount), backgroundColor: chartColors, borderWidth: 0, hoverOffset: 10 }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } }
        });
    });
};

const barCanvas = ref(null);
let barChartInstance = null;
const renderBarChart = () => {
    if (!barCanvas.value) return;
    if (barChartInstance) barChartInstance.destroy();
    const ctx = barCanvas.value.getContext('2d');
    const datasets = selectedTrendAccounts.value.map((acctCd, idx) => ({
        label: childAccounts.find(a => a.acct_cd === acctCd).acct_nm.replace('지출-', ''),
        data: [Math.random() * 500000, Math.random() * 500000, Math.random() * 500000],
        backgroundColor: chartColors[idx % chartColors.length],
        borderRadius: 5
    }));
    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: ['2026-01', '2026-02', '2026-03'], datasets },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
};

const loadDashboardData = async () => {
    const parents = dbAccounts.filter(a => a.final_flag === 'N');
    doughnutGroups.value = parents.map(parent => {
        const children = dbAccounts.filter(c => c.parent_acct_cd === parent.acct_cd && c.final_flag === 'Y');
        const childrenData = children.map(c => ({ ...c, amount: Math.floor(Math.random() * 400000) + 50000 }));
        return { parent, childrenData, total: childrenData.reduce((s, c) => s + c.amount, 0) };
    });
    await nextTick();
    renderDoughnutCharts();
    renderBarChart();
};

const changeMonth = (offset) => {
    const [y, m] = targetMonth.value.split('-').map(Number);
    const d = new Date(y, m - 1 + offset, 1);
    targetMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    loadDashboardData();
};

const toggleTrendAccount = (cd) => {
    const i = selectedTrendAccounts.value.indexOf(cd);
    if (i > -1) selectedTrendAccounts.value.splice(i, 1);
    else selectedTrendAccounts.value.push(cd);
    renderBarChart();
};

const selectAllTrendAccounts = () => {
    if (selectedTrendAccounts.value.length === childAccounts.length) selectedTrendAccounts.value = [];
    else selectedTrendAccounts.value = childAccounts.map(a => a.acct_cd);
    renderBarChart();
};

watch(activeTab, async () => { await nextTick(); renderDoughnutCharts(); renderBarChart(); });
onMounted(() => loadDashboardData());
</script>

<style lang="scss" scoped>
/* 🎨 대시보드 전용 테마 */
$primary: #4c6ef5;
$bg-light: #f8f9fa;
$border: #e9ecef;
$text-dark: #212529;
$text-muted: #868e96;

.expense-dashboard {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    background: $bg-light;
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
}

.d-panel {
    background: #fff;
    border: 1px solid $border;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}

/* 헤더 영역 */
.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 2rem;

    .title-area h2 {
        font-size: 1.75rem;
        font-weight: 800;
        color: $text-dark;
        margin: 0 0 0.5rem;
    }

    .title-area p {
        color: $text-muted;
        margin: 0;
    }
}

.header-controls {
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 1rem 1.5rem;

    .month-picker {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        input {
            border: none;
            font-weight: 800;
            font-size: 1.2rem;
            cursor: pointer;
            outline: none;
        }

        .nav-btn {
            background: #f1f3f5;
            border: none;
            border-radius: 6px;
            padding: 0.5rem;
            cursor: pointer;

            &:hover {
                background: #e9ecef;
            }
        }
    }

    .total-stats {
        border-left: 2px solid $border;
        padding-left: 2rem;
        display: flex;
        flex-direction: column;

        .label {
            font-size: 0.8rem;
            color: $text-muted;
            font-weight: 600;
        }

        .value {
            font-size: 1.4rem;
            font-weight: 900;
            color: #fa5252;
        }
    }
}

/* 탭 스타일 */
.dashboard-tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;

    button {
        background: #fff;
        border: 1px solid $border;
        padding: 0.75rem 1.5rem;
        border-radius: 10px;
        font-weight: 700;
        color: $text-muted;
        cursor: pointer;
        transition: 0.2s;

        &.active {
            background: $primary;
            color: #fff;
            border-color: $primary;
            box-shadow: 0 4px 12px rgba(76, 110, 245, 0.3);
        }
    }
}

/* 그리드 레이아웃 */
.multi-chart-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
}

.chart-card {
    background: #fff;
    border: 1px solid $border;
    border-radius: 16px;
    padding: 1.5rem;

    .card-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;

        h3 {
            font-size: 1.1rem;
            font-weight: 800;
            margin: 0;
        }

        .badge {
            background: #edf2ff;
            color: $primary;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 800;
        }
    }
}

.card-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;

    .chart-box {
        flex: 0 0 160px;
        height: 160px;
        position: relative;

        .chart-center-label {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            pointer-events: none;

            .label {
                display: block;
                font-size: 0.7rem;
                color: $text-muted;
                font-weight: 600;
            }

            .amt {
                font-size: 1rem;
                font-weight: 800;
                color: $text-dark;
            }
        }
    }
}

.custom-legend {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;

    .legend-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;

        .info {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }

            .name {
                font-weight: 600;
                color: #495057;
            }
        }

        .values {
            display: flex;
            gap: 0.75rem;

            .pct {
                color: $text-muted;
                font-weight: 700;
                width: 35px;
                text-align: right;
            }

            .amt {
                font-weight: 700;
                width: 80px;
                text-align: right;
            }
        }
    }
}

/* 추이 분석 (막대) */
.analysis-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.5rem;
    border-bottom: 1px solid $border;

    h3 {
        margin: 0 0 0.25rem;
        font-size: 1.25rem;
        font-weight: 800;
    }

    p {
        margin: 0;
        color: $text-muted;
        font-size: 0.9rem;
    }

    .btn-outline {
        background: transparent;
        border: 1px solid $primary;
        color: $primary;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-weight: 700;
        cursor: pointer;

        &:hover {
            background: #f8f9ff;
        }
    }
}

.account-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 1.5rem;

    .pill {
        background: #f1f3f5;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: 0.2s;

        &.active {
            background: #339af0;
            color: #fff;
        }
    }
}

.bar-chart-container {
    height: 400px;
    padding: 0 1.5rem 1.5rem;
}

.mono {
    font-family: 'JetBrains Mono', monospace;
}</style>