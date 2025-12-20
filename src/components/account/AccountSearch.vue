<template>
    <div class="ledger-search-page">
        <div class="container">
            <!-- 헤더 -->
            <header class="page-header">
                <div>
                    <h1>가계부 조회 (기간별)</h1>
                    <p class="subtitle">
                        입력된 Preset 기반 가계부 내역을 기간별로 조회하고, 지출/수입/순현금 흐름을 확인합니다.
                    </p>
                </div>
            </header>

            <!-- 필터 영역 -->
            <section class="filter-card">
                <div class="filter-row filter-row--period">
                    <div class="field">
                        <label>시작일</label>
                        <input type="date" v-model="filters.startDate" />
                    </div>
                    <div class="field">
                        <label>종료일</label>
                        <input type="date" v-model="filters.endDate" />
                    </div>

                    <div class="quick-buttons">
                        <span class="quick-label">빠른 선택</span>
                        <button type="button" class="quick-btn" @click="setThisMonth">
                            이번 달
                        </button>
                        <button type="button" class="quick-btn" @click="setLastMonth">
                            지난 달
                        </button>
                        <button type="button" class="quick-btn" @click="setThisYear">
                            올해 전체
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
                        <label>거래 큰 유형</label>
                        <select v-model="filters.groupCode">
                            <option value="">전체</option>
                            <option v-for="g in presetGroups" :key="g.code" :value="g.code">
                                {{ g.label }}
                            </option>
                        </select>
                    </div>

                    <div class="field">
                        <label>검색어</label>
                        <input type="text" v-model="filters.keyword" placeholder="메모 / Preset 이름으로 검색" />
                    </div>

                    <div class="field field--buttons">
                        <button type="button" class="btn btn--ghost" @click="resetFilters">
                            필터 초기화
                        </button>
                    </div>
                </div>
            </section>

            <!-- 요약 카드 -->
            <section class="summary-row">
                <div class="summary-card">
                    <div class="summary-label">기간 내 지출</div>
                    <div class="summary-value negative">
                        ₩ {{ formatCurrency(totalExpense) }}
                    </div>
                    <div class="summary-sub">Preset 그룹: 지출(EXPENSE)</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">기간 내 수입</div>
                    <div class="summary-value positive">
                        ₩ {{ formatCurrency(totalIncome) }}
                    </div>
                    <div class="summary-sub">Preset 그룹: 수입(INCOME)</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">순현금 흐름</div>
                    <div class="summary-value" :class="netCashFlow >= 0 ? 'positive' : 'negative'">
                        ₩ {{ formatCurrency(netCashFlow) }}
                    </div>
                    <div class="summary-sub">
                        수입 - 지출 기준 (이체는 제외 또는 별도 처리 가능)
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">건수</div>
                    <div class="summary-value">
                        {{ filteredEntries.length }} 건
                    </div>
                    <div class="summary-sub">
                        전체 입력 {{ entries.length }} 건 중
                        {{ filteredEntries.length }} 건이 조건에 해당
                    </div>
                </div>
            </section>

            <!-- 리스트 테이블 -->
            <section class="list-card">
                <header class="list-header">
                    <div>
                        <h2>거래 내역</h2>
                        <p class="list-subtitle">
                            Preset 기반으로 입력된 거래를 날짜 순으로 정렬합니다.
                        </p>
                    </div>
                    <div class="list-meta">
                        <span class="meta-item">정렬: 날짜 ▼</span>
                    </div>
                </header>

                <table>
                    <thead>
                        <tr>
                            <th>날짜</th>
                            <th>가계 단위</th>
                            <th>유형</th>
                            <th>Preset</th>
                            <th class="right">금액</th>
                            <th>메모</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in filteredEntries" :key="row.id">
                            <td>{{ row.date }}</td>
                            <td>{{ householdLabel(row.householdUnit) }}</td>
                            <td>
                                <span class="group-pill" :class="groupClass(row.groupCode)">
                                    {{ groupLabel(row.groupCode) }}
                                </span>
                            </td>
                            <td>
                                <div class="preset-label">
                                    {{ presetLabel(row.presetCode) }}
                                </div>
                                <div class="preset-code">
                                    {{ row.presetCode }}
                                </div>
                            </td>
                            <td class="right" :class="{
                                negative: row.groupCode === 'EXPENSE',
                                positive: row.groupCode === 'INCOME'
                            }">
                                {{ formatCurrency(row.amount) }}
                            </td>
                            <td class="memo-cell">
                                <div class="memo-main">{{ row.memo || '-' }}</div>
                            </td>
                        </tr>
                        <tr v-if="filteredEntries.length === 0">
                            <td colspan="6" class="empty">
                                조건에 해당하는 거래가 없습니다.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </div>
    </div>
</template>
  
<script setup>
import { computed, reactive } from 'vue';

// Preset 그룹 & Preset 목록 (입력화면과 통일)
const presetGroups = [
    {
        code: 'EXPENSE',
        label: '지출',
        presets: [
            {
                code: 'EXP_CARD_MEAL',
                label: '식비 - 신용카드 결제'
            },
            {
                code: 'EXP_CARD_MART',
                label: '마트/장보기 - 신용카드'
            },
            {
                code: 'EXP_TRANSFER_RENT',
                label: '월세/관리비 - 계좌이체'
            }
        ]
    },
    {
        code: 'INCOME',
        label: '수입',
        presets: [
            {
                code: 'INC_SALARY_BANK',
                label: '급여 입금 - 통장'
            },
            {
                code: 'INC_INTEREST_BANK',
                label: '이자/배당 - 통장'
            }
        ]
    },
    {
        code: 'TRANSFER',
        label: '이체/내부이동',
        presets: [
            {
                code: 'TRF_BANK_TO_BANK',
                label: '통장 ↔ 통장 이체'
            },
            {
                code: 'TRF_BANK_TO_SAVING',
                label: '통장 → 저축예금'
            },
            {
                code: 'TRF_CARD_PAY',
                label: '신용카드 대금 출금'
            }
        ]
    }
];

// 더미 가계부 데이터 (실제로는 API로 가져올 것)
const entries = reactive([
    {
        id: 1,
        date: '2025-01-02',
        householdUnit: 'me',
        groupCode: 'EXPENSE',
        presetCode: 'EXP_CARD_MEAL',
        amount: 12000,
        memo: '회사 근처 점심'
    },
    {
        id: 2,
        date: '2025-01-03',
        householdUnit: 'joint',
        groupCode: 'EXPENSE',
        presetCode: 'EXP_CARD_MART',
        amount: 82000,
        memo: '주말 마트 장보기'
    },
    {
        id: 3,
        date: '2025-01-05',
        householdUnit: 'joint',
        groupCode: 'INCOME',
        presetCode: 'INC_SALARY_BANK',
        amount: 3200000,
        memo: '1월 급여 입금'
    },
    {
        id: 4,
        date: '2024-12-28',
        householdUnit: 'me',
        groupCode: 'TRANSFER',
        presetCode: 'TRF_CARD_PAY',
        amount: 850000,
        memo: '12월 사용분 카드대금 출금'
    },
    {
        id: 5,
        date: '2025-01-10',
        householdUnit: 'spouse',
        groupCode: 'EXPENSE',
        presetCode: 'EXP_TRANSFER_RENT',
        amount: 700000,
        memo: '1월 월세'
    },
    {
        id: 6,
        date: '2025-01-15',
        householdUnit: 'joint',
        groupCode: 'INCOME',
        presetCode: 'INC_INTEREST_BANK',
        amount: 50000,
        memo: '예금이자'
    }
]);

// 필터 상태
const filters = reactive({
    startDate: '',
    endDate: '',
    householdUnit: '',
    groupCode: '',
    keyword: ''
});

function formatCurrency(v) {
    if (!v) return '0';
    return Number(v).toLocaleString('ko-KR');
}

function householdLabel(code) {
    switch (code) {
        case 'joint':
            return '공동';
        case 'me':
            return '본인';
        case 'spouse':
            return '배우자';
        default:
            return code || '-';
    }
}

function groupLabel(code) {
    const g = presetGroups.find((x) => x.code === code);
    return g ? g.label : code || '-';
}

function groupClass(code) {
    switch (code) {
        case 'EXPENSE':
            return 'group-expense';
        case 'INCOME':
            return 'group-income';
        case 'TRANSFER':
            return 'group-transfer';
        default:
            return '';
    }
}

function presetLabel(presetCode) {
    for (const g of presetGroups) {
        const p = g.presets.find((x) => x.code === presetCode);
        if (p) return p.label;
    }
    return presetCode || '-';
}

// 필터링된 리스트
const filteredEntries = computed(() => {
    return entries.filter((row) => {
        // 날짜 필터
        if (filters.startDate && row.date < filters.startDate) return false;
        if (filters.endDate && row.date > filters.endDate) return false;

        // 가계 단위
        if (filters.householdUnit && row.householdUnit !== filters.householdUnit)
            return false;

        // 그룹 코드
        if (filters.groupCode && row.groupCode !== filters.groupCode) return false;

        // 검색어
        if (filters.keyword) {
            const q = filters.keyword.toLowerCase();
            const memo = (row.memo || '').toLowerCase();
            const pLabel = presetLabel(row.presetCode).toLowerCase();
            if (!memo.includes(q) && !pLabel.includes(q)) return false;
        }

        return true;
    });
});

// 요약 계산 (지출/수입만)
const totalExpense = computed(() =>
    filteredEntries.value
        .filter((row) => row.groupCode === 'EXPENSE')
        .reduce((sum, row) => sum + row.amount, 0)
);
const totalIncome = computed(() =>
    filteredEntries.value
        .filter((row) => row.groupCode === 'INCOME')
        .reduce((sum, row) => sum + row.amount, 0)
);
const netCashFlow = computed(() => totalIncome.value - totalExpense.value);

// 빠른 기간 선택
function setThisMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 ~ 11
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    filters.startDate = toDateInput(start);
    filters.endDate = toDateInput(end);
}

function setLastMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() - 1;
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    filters.startDate = toDateInput(start);
    filters.endDate = toDateInput(end);
}

function setThisYear() {
    const now = new Date();
    const year = now.getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    filters.startDate = toDateInput(start);
    filters.endDate = toDateInput(end);
}

function toDateInput(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function resetFilters() {
    filters.startDate = '';
    filters.endDate = '';
    filters.householdUnit = '';
    filters.groupCode = '';
    filters.keyword = '';
}
</script>
  
<style lang="scss" scoped>
.ledger-search-page {
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
                    flex: 0 0 180px;
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

    .list-card {
        background: #ffffff;
        border-radius: 12px;
        padding: 14px 16px 16px;
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
        margin-bottom: 24px;

        .list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;

            h2 {
                font-size: 1rem;
                margin: 0 0 3px;
            }

            .list-subtitle {
                margin: 0;
                font-size: 0.78rem;
                color: #6b7280;
            }

            .list-meta {
                .meta-item {
                    font-size: 0.78rem;
                    color: #9ca3af;
                }
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

            .group-pill {
                display: inline-flex;
                align-items: center;
                padding: 2px 8px;
                border-radius: 999px;
                font-size: 0.7rem;
                font-weight: 500;

                &.group-expense {
                    background: #fef2f2;
                    color: #b91c1c;
                }

                &.group-income {
                    background: #ecfdf3;
                    color: #166534;
                }

                &.group-transfer {
                    background: #eef2ff;
                    color: #3730a3;
                }
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

            .preset-label {
                font-weight: 500;
                margin-bottom: 2px;
            }

            .preset-code {
                font-size: 0.7rem;
                color: #9ca3af;
            }

            .memo-cell {
                .memo-main {
                    font-size: 0.8rem;
                    color: #374151;
                    word-break: break-all;
                }
            }
        }
    }
}
</style>
  