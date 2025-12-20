<template>
    <div class="monthly-bspl-page">
        <div class="container">
            <!-- 헤더 -->
            <header class="page-header">
                <div>
                    <h1>월별 BS / PL 요약</h1>
                    <p class="subtitle">
                        선택한 월 기준으로 대차대조표(BS)와 손익계산서(PL)를 요약해서 보여줍니다.
                        입력된 Preset 거래를 집계하여 자산·부채·자본, 수익·비용·당기손익을 계산합니다.
                    </p>
                </div>
            </header>

            <!-- 필터 카드 -->
            <section class="filter-card">
                <div class="filter-row filter-row--period">
                    <div class="field">
                        <label>기준 연월</label>
                        <input type="month" v-model="filters.yearMonth" />
                    </div>

                    <div class="quick-buttons">
                        <span class="quick-label">빠른 선택</span>
                        <button type="button" class="quick-btn" @click="setCurrentMonth">
                            이번 달
                        </button>
                        <button type="button" class="quick-btn" @click="setPrevMonth">
                            지난 달
                        </button>
                    </div>
                </div>

                <div class="filter-row filter-row--selects">
                    <div class="field">
                        <label>가계 단위</label>
                        <select v-model="filters.householdUnit">
                            <option value="">전체</option>
                            <option value="joint">공동</option>
                            <option value="me">본인</option>
                            <option value="spouse">배우자</option>
                        </select>
                    </div>

                    <div class="field">
                        <label>표시 기준</label>
                        <select v-model="filters.viewMode">
                            <option value="consolidated">전체 합산</option>
                            <option value="byHousehold">가계 단위별(공동/본인/배우자)</option>
                        </select>
                    </div>

                    <div class="field field--buttons">
                        <button type="button" class="btn btn--ghost" @click="resetFilters">
                            필터 초기화
                        </button>
                    </div>
                </div>
            </section>

            <!-- 요약 카드: BS / PL -->
            <section class="summary-row">
                <div class="summary-card">
                    <div class="summary-label">자산 (Assets)</div>
                    <div class="summary-value positive">
                        ₩ {{ formatCurrency(bsSummary.assets) }}
                    </div>
                    <div class="summary-sub">
                        보유 현금, 예금, 투자 등
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">부채 (Liabilities)</div>
                    <div class="summary-value negative">
                        ₩ {{ formatCurrency(bsSummary.liabilities) }}
                    </div>
                    <div class="summary-sub">
                        대출, 신용카드 미지급금 등
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">순자산 (Equity)</div>
                    <div class="summary-value" :class="bsSummary.equity >= 0 ? 'positive' : 'negative'">
                        ₩ {{ formatCurrency(bsSummary.equity) }}
                    </div>
                    <div class="summary-sub">
                        자산 - 부채 기준, 단위: 전체
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">세전 당기손익 (PL)</div>
                    <div class="summary-value" :class="plSummary.netIncome >= 0 ? 'positive' : 'negative'">
                        ₩ {{ formatCurrency(plSummary.netIncome) }}
                    </div>
                    <div class="summary-sub">
                        수익 - 비용 (기간 손익)
                    </div>
                </div>
            </section>

            <!-- 하단: BS / PL 테이블 -->
            <section class="bspl-layout">
                <!-- BS 테이블 -->
                <div class="panel">
                    <header class="panel-header">
                        <div>
                            <h2>BS 요약 (대차대조표)</h2>
                            <p class="panel-sub">
                                기준월 말 현재의 잔액 기준. 계정분류(자산/부채/자본)별 합계입니다.
                            </p>
                        </div>
                        <span class="badge">Balance Sheet</span>
                    </header>

                    <table>
                        <thead>
                            <tr>
                                <th>분류</th>
                                <th>계정</th>
                                <th class="right">금액</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in bsRows" :key="row.id">
                                <td>
                                    <span class="type-pill" :class="bsTypeClass(row.type)">
                                        {{ bsTypeLabel(row.type) }}
                                    </span>
                                </td>
                                <td>
                                    <div class="account-name">{{ row.accountName }}</div>
                                    <div class="account-code">{{ row.accountCode }}</div>
                                </td>
                                <td class="right" :class="{
                                    positive: row.type === 'ASSET' || row.type === 'EQUITY',
                                    negative: row.type === 'LIABILITY'
                                }">
                                    {{ formatCurrency(row.amount) }}
                                </td>
                            </tr>
                            <tr v-if="bsRows.length === 0">
                                <td colspan="3" class="empty">
                                    표시할 BS 데이터가 없습니다.
                                </td>
                            </tr>
                        </tbody>
                        <tfoot v-if="bsRows.length > 0">
                            <tr class="tfoot-row">
                                <td>합계</td>
                                <td class="right">자산 / 부채 / 순자산</td>
                                <td class="right">
                                    자산 {{ formatCurrency(bsSummary.assets) }}
                                    · 부채 {{ formatCurrency(bsSummary.liabilities) }}
                                    · 순자산 {{ formatCurrency(bsSummary.equity) }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- PL 테이블 -->
                <div class="panel">
                    <header class="panel-header">
                        <div>
                            <h2>PL 요약 (손익계산서)</h2>
                            <p class="panel-sub">
                                선택한 월의 수익/비용 및 순이익. Preset 수입/지출을 집계한 결과입니다.
                            </p>
                        </div>
                        <span class="badge">Profit & Loss</span>
                    </header>

                    <table>
                        <thead>
                            <tr>
                                <th>분류</th>
                                <th>계정 / Preset 그룹</th>
                                <th class="right">금액</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in plRows" :key="row.id">
                                <td>
                                    <span class="type-pill" :class="plTypeClass(row.type)">
                                        {{ plTypeLabel(row.type) }}
                                    </span>
                                </td>
                                <td>
                                    <div class="account-name">{{ row.name }}</div>
                                    <div class="account-code">{{ row.note }}</div>
                                </td>
                                <td class="right" :class="{
                                    positive: row.type === 'INCOME',
                                    negative: row.type === 'EXPENSE'
                                }">
                                    {{ formatCurrency(row.amount) }}
                                </td>
                            </tr>
                            <tr v-if="plRows.length === 0">
                                <td colspan="3" class="empty">
                                    표시할 PL 데이터가 없습니다.
                                </td>
                            </tr>
                        </tbody>
                        <tfoot v-if="plRows.length > 0">
                            <tr class="tfoot-row">
                                <td>합계</td>
                                <td class="right">수익 / 비용 / 당기손익</td>
                                <td class="right">
                                    수익 {{ formatCurrency(plSummary.income) }}
                                    · 비용 {{ formatCurrency(plSummary.expense) }}
                                    · 손익 {{ formatCurrency(plSummary.netIncome) }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </section>
        </div>
    </div>
</template>
  
<script setup>
import { computed, reactive } from 'vue';

// 필터 상태
const filters = reactive({
    yearMonth: '', // '2025-01' 형태
    householdUnit: '',
    viewMode: 'consolidated'
});

// 예시: BS 데이터 (월말 잔액 기준)
const bsRows = reactive([
    {
        id: 1,
        type: 'ASSET',
        accountCode: '111',
        accountName: '현금',
        amount: 520000
    },
    {
        id: 2,
        type: 'ASSET',
        accountCode: '112',
        accountName: '입출금통장',
        amount: 2130000
    },
    {
        id: 3,
        type: 'ASSET',
        accountCode: '130',
        accountName: '저축예금',
        amount: 5000000
    },
    {
        id: 4,
        type: 'LIABILITY',
        accountCode: '411',
        accountName: '신용카드 미지급금',
        amount: 850000
    },
    {
        id: 5,
        type: 'LIABILITY',
        accountCode: '421',
        accountName: '전세보증금 반환의무',
        amount: 20000000
    },
    {
        id: 6,
        type: 'EQUITY',
        accountCode: '310',
        accountName: '기초자본',
        amount: 6000000
    },
    {
        id: 7,
        type: 'EQUITY',
        accountCode: '390',
        accountName: '당기손익 누계',
        amount: 2000000
    }
]);

// 예시: PL 데이터 (월 손익)
const plRows = reactive([
    {
        id: 1,
        type: 'INCOME',
        name: '급여 수익',
        note: 'Preset: INC_SALARY_BANK',
        amount: 3200000
    },
    {
        id: 2,
        type: 'INCOME',
        name: '이자/배당 수익',
        note: 'Preset: INC_INTEREST_BANK',
        amount: 50000
    },
    {
        id: 3,
        type: 'EXPENSE',
        name: '식비',
        note: 'Preset 그룹: EXP_CARD_MEAL / EXP_CARD_MART',
        amount: 242000
    },
    {
        id: 4,
        type: 'EXPENSE',
        name: '주거비(월세/관리비)',
        note: 'Preset: EXP_TRANSFER_RENT',
        amount: 700000
    },
    {
        id: 5,
        type: 'EXPENSE',
        name: '기타 생활비',
        note: '기타 Preset 지출 합산',
        amount: 160000
    }
]);

// 요약 계산
const bsSummary = computed(() => {
    const assets = bsRows
        .filter((r) => r.type === 'ASSET')
        .reduce((sum, r) => sum + r.amount, 0);
    const liabilities = bsRows
        .filter((r) => r.type === 'LIABILITY')
        .reduce((sum, r) => sum + r.amount, 0);
    const equity = bsRows
        .filter((r) => r.type === 'EQUITY')
        .reduce((sum, r) => sum + r.amount, 0);

    // 회계 원칙상 자산 = 부채 + 자본이어야 함
    // 여기선 간단하게 자산 - 부채로 순자산을 다시 계산 가능
    const netEquity = assets - liabilities;

    return {
        assets,
        liabilities,
        equity: netEquity // 표시용으로 순자산 사용
    };
});

const plSummary = computed(() => {
    const income = plRows
        .filter((r) => r.type === 'INCOME')
        .reduce((sum, r) => sum + r.amount, 0);
    const expense = plRows
        .filter((r) => r.type === 'EXPENSE')
        .reduce((sum, r) => sum + r.amount, 0);
    const netIncome = income - expense;

    return {
        income,
        expense,
        netIncome
    };
});

// 유틸
function formatCurrency(v) {
    if (!v) return '0';
    return Number(v).toLocaleString('ko-KR');
}

function bsTypeLabel(type) {
    switch (type) {
        case 'ASSET':
            return '자산';
        case 'LIABILITY':
            return '부채';
        case 'EQUITY':
            return '자본';
        default:
            return type;
    }
}

function bsTypeClass(type) {
    switch (type) {
        case 'ASSET':
            return 'pill-asset';
        case 'LIABILITY':
            return 'pill-liability';
        case 'EQUITY':
            return 'pill-equity';
        default:
            return '';
    }
}

function plTypeLabel(type) {
    switch (type) {
        case 'INCOME':
            return '수익';
        case 'EXPENSE':
            return '비용';
        default:
            return type;
    }
}

function plTypeClass(type) {
    switch (type) {
        case 'INCOME':
            return 'pill-income';
        case 'EXPENSE':
            return 'pill-expense';
        default:
            return '';
    }
}

// 필터 조작 (지금은 UI용, 실제로는 yearMonth/householdUnit 기준으로 데이터 재조회)
function setCurrentMonth() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    filters.yearMonth = `${y}-${m}`;
}

function setPrevMonth() {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    filters.yearMonth = `${y}-${m}`;
}

function resetFilters() {
    filters.yearMonth = '';
    filters.householdUnit = '';
    filters.viewMode = 'consolidated';
}
</script>
  
<style lang="scss" scoped>
.monthly-bspl-page {
    background: #f5f6fa;
    min-height: 100vh;
    padding: 24px 0;

    .container {
        width: 1200px;
        margin: 0 auto;
        padding: 0 16px;
    }

    .page-header {
        margin-bottom: 14px;

        h1 {
            font-size: 1.5rem;
            margin: 0 0 4px;
        }

        .subtitle {
            margin: 0;
            font-size: 0.85rem;
            color: #6b7280;
        }
    }

    .filter-card {
        background: #ffffff;
        border-radius: 12px;
        padding: 14px 16px 12px;
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
        margin-bottom: 16px;

        .filter-row {
            display: flex;
            gap: 12px;
            margin-bottom: 10px;

            &--period {
                align-items: flex-end;

                .field {
                    flex: 0 0 200px;
                }

                .quick-buttons {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex: 1;

                    .quick-label {
                        font-size: 0.78rem;
                        color: #6b7280;
                    }

                    .quick-btn {
                        border-radius: 999px;
                        border: 1px solid #d1d5db;
                        background: #f9fafb;
                        padding: 5px 10px;
                        font-size: 0.78rem;
                        cursor: pointer;
                        color: #374151;

                        &:hover {
                            background: #edf2ff;
                            border-color: #4b74ff;
                            color: #1d3a8a;
                        }
                    }
                }
            }

            &--selects {
                align-items: flex-end;

                .field {
                    flex: 1;

                    &--buttons {
                        flex: 0 0 140px;
                        display: flex;
                        justify-content: flex-end;
                    }
                }
            }
        }

        .field {
            display: flex;
            flex-direction: column;

            label {
                font-size: 0.8rem;
                margin-bottom: 4px;
                color: #4b5563;
            }

            input,
            select {
                border-radius: 8px;
                border: 1px solid #d1d5db;
                padding: 7px 9px;
                font-size: 0.9rem;
                outline: none;
                background: #ffffff;

                &:focus {
                    border-color: #4b74ff;
                    box-shadow: 0 0 0 1px rgba(75, 116, 255, 0.18);
                }
            }
        }

        .btn {
            border-radius: 999px;
            border: none;
            padding: 7px 14px;
            font-size: 0.85rem;
            cursor: pointer;
            font-weight: 500;

            &--ghost {
                background: #ffffff;
                color: #4b5563;
                border: 1px solid #d1d5db;
            }
        }
    }

    .summary-row {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
        margin-bottom: 16px;

        .summary-card {
            background: #ffffff;
            border-radius: 10px;
            padding: 10px 12px;
            box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
            font-size: 0.85rem;

            .summary-label {
                font-size: 0.78rem;
                color: #6b7280;
                margin-bottom: 4px;
            }

            .summary-value {
                font-size: 1rem;
                font-weight: 600;

                &.positive {
                    color: #15803d;
                }

                &.negative {
                    color: #b91c1c;
                }
            }

            .summary-sub {
                margin-top: 4px;
                font-size: 0.75rem;
                color: #9ca3af;
            }
        }
    }

    .bspl-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 24px;

        .panel {
            background: #ffffff;
            border-radius: 12px;
            padding: 14px 16px 16px;
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);

            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;

                h2 {
                    font-size: 1rem;
                    margin: 0 0 3px;
                }

                .panel-sub {
                    margin: 0;
                    font-size: 0.78rem;
                    color: #6b7280;
                }

                .badge {
                    font-size: 0.75rem;
                    padding: 2px 8px;
                    border-radius: 999px;
                    background: #e4ebff;
                    color: #3848c7;
                }
            }

            table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.82rem;

                th,
                td {
                    padding: 7px 6px;
                    border-bottom: 1px solid #e5e7eb;
                    text-align: left;
                    vertical-align: middle;
                }

                th {
                    background: #f3f4f6;
                    font-size: 0.78rem;
                    color: #4b5563;
                    font-weight: 600;
                }

                .right {
                    text-align: right;
                }

                .empty {
                    text-align: center;
                    font-size: 0.8rem;
                    color: #9ca3af;
                    padding: 18px 0;
                }

                .tfoot-row {
                    background: #f9fafb;
                    font-weight: 600;

                    td {
                        border-top: 1px solid #e5e7eb;
                    }
                }

                .account-name {
                    font-weight: 500;
                    margin-bottom: 2px;
                }

                .account-code {
                    font-size: 0.7rem;
                    color: #9ca3af;
                }

                td.right {
                    &.positive {
                        color: #15803d;
                        font-weight: 600;
                    }

                    &.negative {
                        color: #b91c1c;
                        font-weight: 600;
                    }
                }
            }

            .type-pill {
                display: inline-flex;
                align-items: center;
                padding: 2px 8px;
                border-radius: 999px;
                font-size: 0.7rem;
                font-weight: 500;

                &.pill-asset {
                    background: #ecfdf3;
                    color: #166534;
                }

                &.pill-liability {
                    background: #fef2f2;
                    color: #b91c1c;
                }

                &.pill-equity {
                    background: #eef2ff;
                    color: #3730a3;
                }

                &.pill-income {
                    background: #ecfdf3;
                    color: #166534;
                }

                &.pill-expense {
                    background: #fef2f2;
                    color: #b91c1c;
                }
            }
        }
    }
}
</style>
  