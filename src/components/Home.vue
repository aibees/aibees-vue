<template>
    <div class="d-container home-dashboard">

        <!-- 헤더 -->
        <div class="home-header">
            <div class="title-area">
                <h2>홈 대시보드</h2>
                <p class="subtitle">이번 달 가계부 현황을 한눈에 확인하세요.</p>
            </div>
            <div class="month-nav d-panel" style="margin:0; padding: 10px 16px;">
                <button class="nav-btn" @click="changeMonth(-1)">◀</button>
                <input type="month" v-model="targetMonth" @change="loadData" class="month-input" />
                <button class="nav-btn" @click="changeMonth(1)">▶</button>
            </div>
        </div>

        <!-- 요약 카드 3개 -->
        <div class="summary-cards">
            <div class="summary-card d-panel" style="margin: 0;">
                <div class="card-label">이번달 수입</div>
                <div class="card-value text-blue mono">+{{ summary.income.toLocaleString() }}원</div>
                <div class="card-sub" :class="summary.incomeChange >= 0 ? 'positive' : 'negative'">
                    전월 대비 {{ summary.incomeChange >= 0 ? '▲' : '▼' }} {{ Math.abs(summary.incomeChange).toLocaleString() }}원
                </div>
            </div>
            <div class="summary-card d-panel" style="margin: 0;">
                <div class="card-label">이번달 지출</div>
                <div class="card-value text-red mono">-{{ summary.expense.toLocaleString() }}원</div>
                <div class="card-sub" :class="summary.expenseChange <= 0 ? 'positive' : 'negative'">
                    전월 대비 {{ summary.expenseChange >= 0 ? '▲' : '▼' }} {{ Math.abs(summary.expenseChange).toLocaleString() }}원
                </div>
            </div>
            <div class="summary-card d-panel" style="margin: 0;">
                <div class="card-label">순 증감</div>
                <div class="card-value mono" :class="summary.net >= 0 ? 'text-blue' : 'text-red'">
                    {{ summary.net >= 0 ? '+' : '' }}{{ summary.net.toLocaleString() }}원
                </div>
                <div class="card-sub neutral">
                    수입 - 지출
                </div>
            </div>
        </div>

        <!-- 차트 영역 (좌: 월별 흐름 / 우: 지출 구성) -->
        <div class="chart-grid">
            <!-- 월별 자산 흐름 라인 차트 -->
            <section class="d-panel chart-section">
                <div class="d-panel-header">
                    <div>
                        <h3>월별 수입·지출 흐름</h3>
                        <p class="panel-sub">최근 6개월 수입/지출 추이</p>
                    </div>
                </div>
                <div class="line-chart-wrap">
                    <canvas ref="lineCanvas"></canvas>
                </div>
            </section>

            <!-- 이번달 지출 구성 도넛 차트 -->
            <section class="d-panel chart-section">
                <div class="d-panel-header">
                    <div>
                        <h3>이번달 지출 구성</h3>
                        <p class="panel-sub">계정과목별 지출 비중</p>
                    </div>
                    <span class="total-badge">총 {{ summary.expense.toLocaleString() }}원</span>
                </div>
                <div class="donut-wrap">
                    <div class="donut-box">
                        <canvas ref="donutCanvas"></canvas>
                        <div class="donut-center">
                            <span class="donut-label">지출 합계</span>
                            <span class="donut-value">{{ (summary.expense / 10000).toFixed(1) }}만</span>
                        </div>
                    </div>
                    <div class="donut-legend">
                        <div v-for="(item, idx) in expenseItems" :key="item.name" class="legend-row">
                            <div class="legend-left">
                                <span class="legend-dot" :style="{ backgroundColor: chartColors[idx % chartColors.length] }"></span>
                                <span class="legend-name">{{ item.name }}</span>
                            </div>
                            <div class="legend-right">
                                <span class="legend-pct">{{ getPercent(item.amount, summary.expense) }}%</span>
                                <span class="legend-amt mono">{{ item.amount.toLocaleString() }}원</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <!-- 하단 영역 (좌: 최근 내역 / 우: 고정비 현황) -->
        <div class="bottom-grid">
            <!-- 최근 거래 내역 -->
            <section class="d-panel bottom-section">
                <div class="d-panel-header">
                    <div>
                        <h3>최근 거래 내역</h3>
                        <p class="panel-sub">최근 입력된 10건</p>
                    </div>
                    <button class="btn btn--ghost" @click="goTo('Account-cashflow')">전체 보기</button>
                </div>
                <div class="table-wrap">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th class="col-date">일자</th>
                                <th>유형</th>
                                <th>적요</th>
                                <th class="text-right">금액 (원)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="tx in recentTx" :key="tx.id"
                                class="data-row"
                                :class="tx.flowType === 'IN' ? 'row-income' : 'row-expense'">
                                <td class="col-date mono text-light">{{ tx.date }}</td>
                                <td>
                                    <span class="preset-badge" :class="tx.flowType === 'IN' ? 'badge-income' : 'badge-expense'">
                                        {{ tx.presetNm }}
                                    </span>
                                </td>
                                <td class="desc-text">{{ tx.remark }}</td>
                                <td class="text-right mono font-bold"
                                    :class="tx.flowType === 'IN' ? 'text-blue' : 'text-red'">
                                    {{ tx.flowType === 'IN' ? '+' : '-' }}{{ tx.amount.toLocaleString() }}
                                </td>
                            </tr>
                            <tr v-if="recentTx.length === 0">
                                <td colspan="4" class="empty-state">거래 내역이 없습니다.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- 이번달 고정비 현황 -->
            <section class="d-panel bottom-section">
                <div class="d-panel-header">
                    <div>
                        <h3>이번달 고정비 현황</h3>
                        <p class="panel-sub">{{ targetMonth }} 처리 현황</p>
                    </div>
                    <button class="btn btn--ghost" @click="goTo('Account-fixed')">고정비 관리</button>
                </div>

                <!-- 처리 현황 요약 바 -->
                <div class="fixed-summary">
                    <div class="fixed-stat">
                        <span class="fs-label">처리 완료</span>
                        <span class="fs-value text-blue">{{ fixedDone }}건</span>
                    </div>
                    <div class="fixed-stat">
                        <span class="fs-label">미처리</span>
                        <span class="fs-value text-red">{{ fixedPending }}건</span>
                    </div>
                    <div class="fixed-stat">
                        <span class="fs-label">완료 금액</span>
                        <span class="fs-value mono font-bold">{{ fixedDoneAmt.toLocaleString() }}원</span>
                    </div>
                </div>

                <!-- 진행률 바 -->
                <div class="progress-wrap">
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: fixedProgress + '%' }"></div>
                    </div>
                    <span class="progress-label">{{ fixedProgress }}% 완료</span>
                </div>

                <!-- 고정비 목록 -->
                <div class="table-wrap">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>항목명</th>
                                <th class="text-right">금액 (원)</th>
                                <th class="text-center">결제일</th>
                                <th class="text-center">상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="fx in fixedList" :key="fx.id" class="data-row"
                                :class="{ 'is-disabled': fx.status !== 'DONE' }">
                                <td class="font-bold">{{ fx.name }}</td>
                                <td class="text-right mono text-blue">{{ fx.amount.toLocaleString() }}</td>
                                <td class="text-center mono text-light">{{ fx.payDay }}일</td>
                                <td class="text-center">
                                    <span class="status-badge" :class="fx.status === 'DONE' ? 'badge-done' : 'badge-pending'">
                                        {{ fx.status === 'DONE' ? '완료' : '미처리' }}
                                    </span>
                                </td>
                            </tr>
                            <tr v-if="fixedList.length === 0">
                                <td colspan="4" class="empty-state">등록된 고정비가 없습니다.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import Chart from 'chart.js/auto';

const router = useRouter();

// ==========================================
// 상태
// ==========================================
const targetMonth = ref(new Date().toISOString().slice(0, 7));
const chartColors = ['#4b74ff', '#20c997', '#fab005', '#ff6b6b', '#be4bdb', '#15aabf', '#fd7e14'];

const summary = ref({ income: 0, expense: 0, net: 0, incomeChange: 0, expenseChange: 0 });
const expenseItems = ref([]);
const recentTx = ref([]);
const fixedList = ref([]);

// ==========================================
// Computed
// ==========================================
const fixedDone    = computed(() => fixedList.value.filter(f => f.status === 'DONE').length);
const fixedPending = computed(() => fixedList.value.filter(f => f.status !== 'DONE').length);
const fixedDoneAmt = computed(() => fixedList.value.filter(f => f.status === 'DONE').reduce((s, f) => s + f.amount, 0));
const fixedProgress = computed(() => {
    if (fixedList.value.length === 0) return 0;
    return Math.round((fixedDone.value / fixedList.value.length) * 100);
});

const getPercent = (amt, total) => total > 0 ? ((amt / total) * 100).toFixed(1) : 0;

// ==========================================
// 차트
// ==========================================
const lineCanvas = ref(null);
const donutCanvas = ref(null);
let lineChart = null;
let donutChart = null;

const renderLineChart = (labels, incomes, expenses) => {
    if (lineChart) lineChart.destroy();
    if (!lineCanvas.value) return;
    lineChart = new Chart(lineCanvas.value.getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: '수입',
                    data: incomes,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    borderWidth: 2,
                    pointRadius: 4,
                    tension: 0.35,
                    fill: true,
                },
                {
                    label: '지출',
                    data: expenses,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.06)',
                    borderWidth: 2,
                    pointRadius: 4,
                    tension: 0.35,
                    fill: true,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { font: { size: 12, weight: '700' }, padding: 16 } },
            },
            scales: {
                y: {
                    ticks: {
                        callback: v => (v / 10000).toFixed(0) + '만',
                        font: { size: 11 },
                    },
                    grid: { color: '#f0f0f0' },
                },
                x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            },
        },
    });
};

const renderDonutChart = () => {
    if (donutChart) donutChart.destroy();
    if (!donutCanvas.value) return;
    donutChart = new Chart(donutCanvas.value.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: expenseItems.value.map(i => i.name),
            datasets: [{
                data: expenseItems.value.map(i => i.amount),
                backgroundColor: chartColors,
                borderWidth: 0,
                hoverOffset: 8,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: { legend: { display: false } },
        },
    });
};

// ==========================================
// 데이터 로드 (Mock)
// ==========================================
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const loadData = async () => {
    // --- 요약 카드 ---
    const income  = rand(280, 350) * 10000;
    const expense = rand(150, 250) * 10000;
    const prevIncome  = rand(260, 340) * 10000;
    const prevExpense = rand(140, 240) * 10000;
    summary.value = {
        income,
        expense,
        net: income - expense,
        incomeChange:  income  - prevIncome,
        expenseChange: expense - prevExpense,
    };

    // --- 지출 구성 ---
    const items = [
        { name: '식비',       amount: rand(30, 80) * 10000 },
        { name: '월세',       amount: rand(50, 70) * 10000 },
        { name: '교통비',     amount: rand(5, 20)  * 10000 },
        { name: '통신비',     amount: rand(5, 10)  * 10000 },
        { name: '문화/여가',  amount: rand(5, 30)  * 10000 },
        { name: '기타',       amount: rand(5, 20)  * 10000 },
    ];
    expenseItems.value = items;

    // --- 최근 거래 10건 ---
    const PRESETS = [
        { presetNm: '급여',      flowType: 'IN'  },
        { presetNm: '식비',      flowType: 'OUT' },
        { presetNm: '교통비',    flowType: 'OUT' },
        { presetNm: '월세',      flowType: 'OUT' },
        { presetNm: '공과금',    flowType: 'OUT' },
        { presetNm: '이자수익',  flowType: 'IN'  },
        { presetNm: '쇼핑',      flowType: 'OUT' },
        { presetNm: '통신비',    flowType: 'OUT' },
    ];
    const REMARKS = {
        '급여':     '월급 이체',
        '식비':     ['배달의민족', '마켓컬리', '점심 - 국밥', '편의점'][rand(0, 3)],
        '교통비':   ['티머니 충전', 'KTX 승차권', '택시'][rand(0, 2)],
        '월세':     '이번달 월세 이체',
        '공과금':   ['전기요금', '가스요금', '관리비'][rand(0, 2)],
        '이자수익': '정기예금 이자',
        '쇼핑':     ['쿠팡 주문', '올리브영', '다이소'][rand(0, 2)],
        '통신비':   'KT 휴대폰 요금',
    };
    const [y, m] = targetMonth.value.split('-').map(Number);
    const days = new Date(y, m, 0).getDate();
    recentTx.value = Array.from({ length: 10 }, (_, i) => {
        const p = PRESETS[rand(0, PRESETS.length - 1)];
        const day = String(rand(1, days)).padStart(2, '0');
        return {
            id: i,
            date: `${targetMonth.value}-${day}`,
            presetNm: p.presetNm,
            flowType: p.flowType,
            remark: REMARKS[p.presetNm],
            amount: p.flowType === 'IN' ? rand(20, 35) * 10000 : rand(1, 15) * 10000,
        };
    }).sort((a, b) => b.date.localeCompare(a.date));

    // --- 고정비 현황 ---
    fixedList.value = [
        { id: 1, name: '월세',         amount: 600000, payDay: 1,  status: 'DONE'    },
        { id: 2, name: '넷플릭스',     amount: 17000,  payDay: 7,  status: 'DONE'    },
        { id: 3, name: '헬스장 회비',  amount: 70000,  payDay: 10, status: 'PENDING' },
        { id: 4, name: 'KT 통신비',   amount: 65000,  payDay: 15, status: 'DONE'    },
        { id: 5, name: '공과금',       amount: 85000,  payDay: 20, status: 'PENDING' },
    ];

    // --- 6개월 라인 차트 데이터 ---
    const labels = [];
    const incomes = [];
    const expenses = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(y, m - 1 - i, 1);
        labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        incomes.push(rand(250, 380) * 10000);
        expenses.push(rand(140, 270) * 10000);
    }
    // 현재 달은 실제 값
    incomes[5]  = income;
    expenses[5] = expense;

    await nextTick();
    renderLineChart(labels, incomes, expenses);
    renderDonutChart();
};

const changeMonth = (offset) => {
    const [y, m] = targetMonth.value.split('-').map(Number);
    const d = new Date(y, m - 1 + offset, 1);
    targetMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    loadData();
};

const goTo = (name) => router.push({ name });

onMounted(() => loadData());
onBeforeUnmount(() => {
    if (lineChart)  lineChart.destroy();
    if (donutChart) donutChart.destroy();
});
</script>

<style lang="scss" scoped>
@use '@@/__variables.scss' as *;
@use '@@/common.scss' as *;

/* 색상 */
$primary:      #4b74ff;
$danger:       #ef4444;
$blue:         #2563eb;
$green:        #10b981;
$amber:        #f59e0b;
$text-main:    #111827;
$text-sub:     #4b5563;
$text-light:   #9ca3af;
$bg-white:     #ffffff;
$border-color: #e5e7eb;

/* ==========================================
   전체 컨테이너
========================================== */
.home-dashboard {
    padding-bottom: 60px;
    font-family: 'Pretendard', sans-serif;
    color: $text-main;
}

/* ==========================================
   헤더
========================================== */
.home-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 1.3rem 1.3rem;

    .title-area {
        h2 {
            font-size: 1.25rem;
            font-weight: 800;
            margin: 0 0 4px;
            color: $text-main;
        }
        .subtitle {
            margin: 0;
            font-size: 0.82rem;
            color: $text-light;
        }
    }

    .month-nav {
        display: flex;
        align-items: center;
        gap: 8px;

        .month-input {
            border: none;
            font-weight: 800;
            font-size: 1rem;
            cursor: pointer;
            outline: none;
            color: $text-main;
        }

        .nav-btn {
            background: #f1f5f9;
            border: none;
            border-radius: 6px;
            padding: 5px 9px;
            cursor: pointer;
            font-size: 0.75rem;
            color: $text-sub;
            &:hover { background: #e2e8f0; }
        }
    }
}

/* ==========================================
   요약 카드 3열
========================================== */
.summary-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin: 0 1.3rem 0;

    .summary-card {
        padding: 18px 20px;
        border-radius: 10px;

        .card-label {
            font-size: 0.78rem;
            font-weight: 700;
            color: $text-light;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            margin-bottom: 8px;
        }

        .card-value {
            font-size: 1.45rem;
            font-weight: 900;
            margin-bottom: 6px;
        }

        .card-sub {
            font-size: 0.78rem;
            font-weight: 600;
        }
    }
}

/* ==========================================
   차트 그리드 (2열)
========================================== */
.chart-grid {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 0;

    .chart-section {
        .d-panel-header {
            margin-bottom: 12px;
        }
    }

    .line-chart-wrap {
        height: 260px;
    }

    .total-badge {
        background: #eff6ff;
        color: $blue;
        border: 1px solid #bfdbfe;
        padding: 4px 12px;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 800;
        white-space: nowrap;
    }

    /* 도넛 차트 */
    .donut-wrap {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .donut-box {
            position: relative;
            height: 180px;

            .donut-center {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                pointer-events: none;

                .donut-label {
                    display: block;
                    font-size: 0.7rem;
                    color: $text-light;
                    font-weight: 600;
                }

                .donut-value {
                    font-size: 1.05rem;
                    font-weight: 900;
                    color: $text-main;
                }
            }
        }

        .donut-legend {
            display: flex;
            flex-direction: column;
            gap: 7px;

            .legend-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.82rem;

                .legend-left {
                    display: flex;
                    align-items: center;
                    gap: 7px;

                    .legend-dot {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        flex-shrink: 0;
                    }

                    .legend-name {
                        font-weight: 600;
                        color: $text-sub;
                    }
                }

                .legend-right {
                    display: flex;
                    gap: 10px;

                    .legend-pct {
                        color: $text-light;
                        font-weight: 700;
                        width: 38px;
                        text-align: right;
                    }

                    .legend-amt {
                        font-weight: 700;
                        width: 90px;
                        text-align: right;
                        color: $text-sub;
                    }
                }
            }
        }
    }
}

/* ==========================================
   하단 그리드 (2열)
========================================== */
.bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;

    .bottom-section {
        .d-panel-header {
            margin-bottom: 10px;
        }
    }
}

/* ==========================================
   고정비 현황
========================================== */
.fixed-summary {
    display: flex;
    gap: 0;
    background: #f8fafc;
    border: 1px solid $border-color;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 12px;

    .fixed-stat {
        flex: 1;
        padding: 10px 14px;
        border-right: 1px solid $border-color;
        &:last-child { border-right: none; }

        .fs-label {
            display: block;
            font-size: 0.72rem;
            font-weight: 700;
            color: $text-light;
            margin-bottom: 4px;
        }

        .fs-value {
            font-size: 1rem;
            font-weight: 800;
        }
    }
}

.progress-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;

    .progress-bar {
        flex: 1;
        height: 7px;
        background: #e5e7eb;
        border-radius: 999px;
        overflow: hidden;

        .progress-fill {
            height: 100%;
            background: $primary;
            border-radius: 999px;
            transition: width 0.4s ease;
        }
    }

    .progress-label {
        font-size: 0.75rem;
        font-weight: 800;
        color: $primary;
        white-space: nowrap;
    }
}

/* ==========================================
   공통 테이블
========================================== */
.table-wrap {
    overflow-x: auto;

    .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.83rem;

        thead th {
            background: #f8fafc;
            padding: 9px 12px;
            font-size: 0.75rem;
            font-weight: 700;
            color: $text-sub;
            border-bottom: 1px solid $border-color;
            white-space: nowrap;
        }

        tbody td {
            padding: 9px 12px;
            border-bottom: 1px solid $border-color;
            vertical-align: middle;
        }

        .data-row {
            transition: background 0.12s;
            &:hover { background: #f8fafc; }

            &.row-income:hover  { background: #eff6ff; }
            &.row-expense:hover { background: #fff5f5; }

            &.is-disabled td { color: $text-light; }
        }

        .col-date { width: 90px; white-space: nowrap; }
        .empty-state {
            text-align: center;
            padding: 40px;
            color: $text-light;
            font-size: 0.83rem;
        }

        .preset-badge {
            display: inline-block;
            padding: 3px 9px;
            border-radius: 5px;
            font-size: 0.75rem;
            font-weight: 700;
            white-space: nowrap;

            &.badge-income  { background: #dbeafe; color: #1e40af; }
            &.badge-expense { background: #fee2e2; color: #991b1b; }
        }

        .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 0.72rem;
            font-weight: 800;

            &.badge-done    { background: #d1fae5; color: #065f46; }
            &.badge-pending { background: #fee2e2; color: #991b1b; }
        }

        .desc-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 180px;
        }
    }
}

/* ==========================================
   패널 헤더 공통
========================================== */
.d-panel-header {
    h3 {
        font-size: 0.95rem;
        font-weight: 800;
        margin: 0 0 3px;
        color: $text-main;
    }
    .panel-sub {
        font-size: 0.75rem;
        color: $text-light;
        margin: 0;
    }
}

/* ==========================================
   유틸리티
========================================== */
.text-blue   { color: $blue; }
.text-red    { color: $danger; }
.text-light  { color: $text-light; }
.mono        { font-family: monospace; }
.font-bold   { font-weight: 700; }
.text-right  { text-align: right; }
.text-center { text-align: center; }
.positive    { color: $green; }
.negative    { color: $danger; }
.neutral     { color: $text-light; }

.btn {
    border-radius: 999px;
    border: none;
    padding: 6px 14px;
    font-size: 0.8rem;
    cursor: pointer;
    font-weight: 700;

    &--ghost {
        background: #ffffff;
        color: $text-sub;
        border: 1px solid $border-color;
        &:hover { background: #f8fafc; }
    }
}
</style>
