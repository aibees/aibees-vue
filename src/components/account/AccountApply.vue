<template>
    <div class="card-clearing-management">
        <header class="page-header">
            <h2>신용카드 미지급금 정밀 반제</h2>
            <p>할부(부분 반제) 및 청구할인, 수수료 등의 보정 내역을 추가하여 명세서와 1원까지 정확히 대사합니다.</p>
        </header>

        <section class="clearing-setup d-panel">
            <div class="setup-grid">
                <div class="form-group">
                    <label>대상 신용카드</label>
                    <select v-model="setup.bankId" @change="loadUnclearedLines">
                        <option value="" disabled>카드를 선택하세요</option>
                        <option v-for="card in creditCards" :key="card.id" :value="card.id">
                            {{ card.name }}
                        </option>
                    </select>
                </div>
                <div class="form-group">
                    <label>카드대금 출금 전표 (실제 통장 출금액)</label>
                    <select v-model="setup.paymentJeId" :disabled="!setup.bankId">
                        <option value="" disabled>통장에서 카드대금이 빠져나간 전표 선택</option>
                        <option v-for="je in paymentJournals" :key="je.jeHeaderId" :value="je.jeHeaderId">
                            [{{ je.jeDate.substring(5, 10) }}] {{ je.remark }} - {{ je.amount.toLocaleString() }}원
                        </option>
                    </select>
                </div>
                <div class="setup-summary" v-if="selectedPayment">
                    <span class="label">결제(출금) 금액 (A)</span>
                    <span class="value">{{ selectedPayment.amount.toLocaleString() }}원</span>
                </div>
            </div>
        </section>

        <div class="main-split-layout" v-if="setup.bankId">
            <section class="uncleared-list d-panel">
                <div class="list-header">
                    <h3>미반제 카드 사용 내역</h3>
                    <div class="hint-text">* 할부 건은 '반제할 금액'을 직접 수정하세요.</div>
                </div>

                <div class="table-wrapper">
                    <table class="clearing-table">
                        <thead>
                            <tr>
                                <th class="col-check"><input type="checkbox" @change="toggleAll" :checked="isAllSelected">
                                </th>
                                <th class="col-date">사용 일자</th>
                                <th class="col-remark">적요</th>
                                <th class="col-amt">잔액 (전체)</th>
                                <th class="col-clear-amt">이번 달 반제할 금액 ✏️</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in unclearedItems" :key="item.jeHeaderId"
                                :class="{ 'is-selected': selectedIds.includes(item.jeHeaderId) }">
                                <td class="col-check" @click="toggleRow(item.jeHeaderId)">
                                    <input type="checkbox" :value="item.jeHeaderId" v-model="selectedIds" @click.stop>
                                </td>
                                <td class="col-date mono" @click="toggleRow(item.jeHeaderId)">{{ item.jeDate.substring(5,
                                    10) }}</td>
                                <td class="col-remark" @click="toggleRow(item.jeHeaderId)">
                                    <span class="badge-halbu" v-if="item.isInstallment">할부</span>
                                    {{ item.remark }}
                                </td>
                                <td class="col-amt text-right mono text-light" @click="toggleRow(item.jeHeaderId)">
                                    {{ item.remainAmount.toLocaleString() }}
                                </td>
                                <td class="col-clear-amt text-right">
                                    <div class="input-with-unit" v-if="selectedIds.includes(item.jeHeaderId)">
                                        <input type="number" v-model.number="item.clearingAmount"
                                            class="inline-input mono font-bold" :max="item.remainAmount">
                                    </div>
                                    <span class="mono text-light" v-else>-</span>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" class="text-right font-bold">선택 항목 반제 합계 (B)</td>
                                <td class="text-right mono font-bold text-blue">{{ selectedTotal.toLocaleString() }}원</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </section>

            <section class="adjustment-panel d-panel">
                <div class="panel-header">
                    <h3>반제 보정 (Adjustments)</h3>
                    <button class="btn-sm btn-outline" @click="addAdjustment">+ 보정 추가</button>
                </div>
                <div class="panel-desc">
                    청구할인(-), 연회비(+), 해외수수료(+) 등 명세서와 차이나는 내역을 추가하세요.
                </div>

                <div class="adjustment-list">
                    <div class="adj-item" v-for="(adj, idx) in adjustments" :key="idx">
                        <select v-model="adj.type" class="adj-select">
                            <option value="DISCOUNT">청구할인 (수익, -)</option>
                            <option value="FEE">수수료/연회비 (비용, +)</option>
                            <option value="INTEREST">할부이자 (비용, +)</option>
                            <option value="ETC">기타 보정</option>
                        </select>
                        <input type="text" v-model="adj.remark" placeholder="보정 내역 메모" class="adj-input-text">
                        <div class="adj-input-amt">
                            <span class="sign" :class="adj.type === 'DISCOUNT' ? 'text-blue' : 'text-red'">
                                {{ adj.type === 'DISCOUNT' ? '-' : '+' }}
                            </span>
                            <input type="number" v-model.number="adj.amount" placeholder="0" class="mono font-bold">
                        </div>
                        <button class="btn-icon-del" @click="removeAdjustment(idx)">✕</button>
                    </div>
                    <div v-if="adjustments.length === 0" class="empty-adj">추가된 보정 내역이 없습니다.</div>
                </div>

                <div class="reconciliation-box">
                    <div class="calc-row">
                        <span>선택 반제 합계 (B)</span>
                        <span class="mono">{{ selectedTotal.toLocaleString() }}</span>
                    </div>
                    <div class="calc-row">
                        <span>보정 금액 합계 (C)</span>
                        <span class="mono"
                            :class="adjustmentTotal < 0 ? 'text-blue' : (adjustmentTotal > 0 ? 'text-red' : '')">
                            {{ adjustmentTotal > 0 ? '+' : '' }}{{ adjustmentTotal.toLocaleString() }}
                        </span>
                    </div>
                    <div class="calc-row result-row">
                        <span>계산된 결제액 (B+C)</span>
                        <span class="mono font-bold">{{ calculatedTotal.toLocaleString() }}</span>
                    </div>

                    <div class="divider"></div>

                    <div class="calc-row target-row" v-if="selectedPayment">
                        <span>실제 출금액 (A)</span>
                        <span class="mono font-bold">{{ selectedPayment.amount.toLocaleString() }}</span>
                    </div>

                    <div class="diff-result" :class="diffAmount === 0 ? 'is-match' : 'is-mismatch'" v-if="selectedPayment">
                        <div class="status">{{ diffAmount === 0 ? '✅ 완벽하게 일치합니다' : '🚨 차액이 발생했습니다' }}</div>
                        <div class="diff-amt mono">{{ diffAmount === 0 ? '0' : Math.abs(diffAmount).toLocaleString() }}원
                        </div>
                    </div>
                </div>

                <button class="btn-primary btn-large" :disabled="!isMatch" @click="executeClearing">
                    🔒 최종 반제 처리 확정
                </button>
            </section>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

// 1. 기초 데이터
const creditCards = ref([
    { id: 'CARD_001', name: '현대카드 Zero' },
    { id: 'CARD_002', name: '신한카드 Mr.Life' }
]);

const setup = reactive({ bankId: '', paymentJeId: '' });

// 2. 상태 관리 (미반제 내역 및 보정 내역)
const unclearedItems = ref([]);
const paymentJournals = ref([]);
const selectedIds = ref([]);
const adjustments = ref([]); // 보정 내역 배열

// 3. 로직
const loadUnclearedLines = () => {
    // 💡 부분 반제를 위해 원래 잔액(remainAmount)과 이번 달 반제 입력용(clearingAmount)을 분리
    unclearedItems.value = [
        { jeHeaderId: 501, jeDate: '2026-02-15', remark: '스타벅스', remainAmount: 15500, clearingAmount: 15500, isInstallment: false },
        { jeHeaderId: 502, jeDate: '2026-02-16', remark: '쿠팡 로켓배송', remainAmount: 42000, clearingAmount: 42000, isInstallment: false },
        { jeHeaderId: 503, jeDate: '2026-02-18', remark: '애플스토어 (3개월 할부)', remainAmount: 300000, clearingAmount: 100000, isInstallment: true }, // 할부 기본값 세팅 예시
        { jeHeaderId: 504, jeDate: '2026-02-20', remark: 'GS25', remainAmount: 3200, clearingAmount: 3200, isInstallment: false }
    ];

    paymentJournals.value = [
        { jeHeaderId: 901, jeDate: '2026-03-05', remark: '현대카드 결제대금 출금', amount: 156200 }, // 시나리오: (15500+42000+100000) - 청구할인 1300원 = 156200원
        { jeHeaderId: 902, jeDate: '2026-03-05', remark: '신한카드 결제대금 출금', amount: 85000 }
    ];
    selectedIds.value = [];
    adjustments.value = [];
};

// 4. 보정(Adjustment) 관리
const addAdjustment = () => {
    adjustments.value.push({ type: 'DISCOUNT', remark: '', amount: 0 });
};
const removeAdjustment = (idx) => {
    adjustments.value.splice(idx, 1);
};

// 5. 계산 로직 (Computed)
const selectedPayment = computed(() => paymentJournals.value.find(j => j.jeHeaderId === setup.paymentJeId));

// 선택된 항목들의 반제할 금액 합계 (B)
const selectedTotal = computed(() => {
    return unclearedItems.value
        .filter(item => selectedIds.value.includes(item.jeHeaderId))
        .reduce((sum, item) => sum + (Number(item.clearingAmount) || 0), 0);
});

// 보정 금액 합계 (C) - 할인은 차감(-), 수수료는 가산(+)
const adjustmentTotal = computed(() => {
    return adjustments.value.reduce((sum, adj) => {
        const amt = Number(adj.amount) || 0;
        return adj.type === 'DISCOUNT' ? sum - amt : sum + amt;
    }, 0);
});

// 계산된 결제액 (B + C)
const calculatedTotal = computed(() => selectedTotal.value + adjustmentTotal.value);

// 차액 (A - (B+C))
const diffAmount = computed(() => {
    if (!selectedPayment.value) return 0;
    return selectedPayment.value.amount - calculatedTotal.value;
});

// 최종 일치 여부
const isMatch = computed(() => {
    return selectedPayment.value && diffAmount.value === 0 && selectedIds.value.length > 0;
});

// 6. UI 제어 (체크박스)
const toggleRow = (id) => {
    const idx = selectedIds.value.indexOf(id);
    if (idx > -1) selectedIds.value.splice(idx, 1);
    else selectedIds.value.push(id);
};

const isAllSelected = computed(() => unclearedItems.value.length > 0 && selectedIds.value.length === unclearedItems.value.length);
const toggleAll = () => {
    if (isAllSelected.value) selectedIds.value = [];
    else selectedIds.value = unclearedItems.value.map(i => i.jeHeaderId);
};

// 7. 확정 실행
const executeClearing = () => {
    // 💡 실제 API Payload 전송 형태 예시:
    const payload = {
        paymentJeId: setup.paymentJeId,
        clearedItems: unclearedItems.value.filter(i => selectedIds.value.includes(i.jeHeaderId)).map(i => ({
            jeHeaderId: i.jeHeaderId,
            clearedAmount: i.clearingAmount
        })),
        adjustments: adjustments.value
    };
    console.log('반제 Payload:', payload);
    alert('반제 처리 및 보정 전표 생성이 완료되었습니다!');

    loadUnclearedLines();
    setup.paymentJeId = '';
};
</script>

<style lang="scss" scoped>
$primary: #4b74ff;
$primary-hover: #3848c7;
$border: #e2e8f0;
$bg-light: #f8fafc;
$danger: #ef4444;
$success: #10b981;
$blue: #2563eb;
$text-main: #1e293b;
$text-sub: #64748b;
$text-light: #94a3b8;

.card-clearing-management {
    max-width: 1280px;
    margin: 0 auto;
    padding: 24px;
    font-family: 'Pretendard', sans-serif;
    color: $text-main;
}

.page-header {
    margin-bottom: 24px;

    h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 800;
    }

    p {
        margin: 0;
        color: $text-sub;
        font-size: 14px;
    }
}

.d-panel {
    background: #fff;
    border: 1px solid $border;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

/* 상단 셋업 */
.setup-grid {
    display: grid;
    grid-template-columns: 1.5fr 2fr auto;
    gap: 24px;
    align-items: flex-end;

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;

        label {
            font-size: 13px;
            font-weight: 700;
            color: $text-sub;
        }

        select {
            padding: 10px 12px;
            border: 1px solid $border;
            border-radius: 8px;
            font-size: 14px;
            outline: none;

            &:focus {
                border-color: $primary;
            }
        }
    }

    .setup-summary {
        text-align: right;
        border-left: 2px solid $border;
        padding-left: 24px;

        .label {
            display: block;
            font-size: 13px;
            color: $text-sub;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .value {
            font-size: 24px;
            font-weight: 900;
            color: $text-main;
        }
    }
}

/* 메인 스플릿 레이아웃 */
.main-split-layout {
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    gap: 24px;
    margin-top: 20px;
    align-items: flex-start;
}

/* 좌측: 리스트 */
.uncleared-list {
    padding: 0;
    overflow: hidden;

    .list-header {
        padding: 16px 20px;
        border-bottom: 1px solid $border;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 800;
        }

        .hint-text {
            font-size: 12px;
            color: $danger;
            font-weight: 600;
        }
    }

    .table-wrapper {
        overflow-x: auto;
        max-height: 500px;
        overflow-y: auto;
    }
}

.clearing-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;

    th {
        background: $bg-light;
        padding: 12px;
        font-size: 13px;
        font-weight: 700;
        color: $text-sub;
        border-bottom: 1px solid $border;
        position: sticky;
        top: 0;
        z-index: 10;
        box-shadow: 0 1px 0 $border;
    }

    td {
        padding: 10px 12px;
        border-bottom: 1px solid #f1f5f9;
        font-size: 14px;
        vertical-align: middle;
        cursor: pointer;
        transition: 0.2s;
    }

    tr.is-selected td {
        background-color: #f0fdf4;
    }

    tr:hover:not(.is-selected) td {
        background-color: #f8fafc;
    }

    .col-check {
        width: 40px;
        text-align: center;

        input {
            cursor: pointer;
            accent-color: $primary;
            width: 16px;
            height: 16px;
        }
    }

    .col-date {
        width: 80px;
    }

    .col-remark {
        width: auto;
    }

    .col-amt {
        width: 100px;
    }

    .col-clear-amt {
        width: 150px;
    }

    .badge-halbu {
        background: #fef3c7;
        color: #d97706;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 800;
        margin-right: 6px;
    }

    /* 부분 반제 인풋 */
    .input-with-unit {
        display: inline-block;
        width: 100%;
        max-width: 120px;
    }

    .inline-input {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid $primary;
        border-radius: 6px;
        text-align: right;
        outline: none;
        box-shadow: 0 0 0 2px rgba($primary, 0.1);
        background: #fff;
    }

    tfoot td {
        background: $bg-light;
        font-size: 15px;
        border-top: 2px solid $text-main;
        padding: 16px 12px;
    }
}

/* 우측: 보정 및 대사 패널 */
.adjustment-panel {
    display: flex;
    flex-direction: column;

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 800;
        }

        .btn-sm {
            padding: 4px 10px;
            font-size: 12px;
            border-radius: 6px;
        }
    }

    .panel-desc {
        font-size: 12px;
        color: $text-sub;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px dashed $border;
    }
}

.adjustment-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 24px;
    min-height: 80px;

    .adj-item {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr auto;
        gap: 8px;
        align-items: center;
        background: $bg-light;
        padding: 8px;
        border-radius: 8px;
        border: 1px solid $border;

        select,
        input {
            padding: 8px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            font-size: 13px;
            outline: none;
            width: 100%;
            box-sizing: border-box;
        }

        .adj-input-amt {
            display: flex;
            align-items: center;
            background: #fff;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding-left: 8px;

            .sign {
                font-weight: 900;
                font-size: 14px;
            }

            input {
                border: none;
                padding-left: 4px;
                text-align: right;
                background: transparent;
            }
        }

        .btn-icon-del {
            background: none;
            border: none;
            font-size: 16px;
            color: #cbd5e1;
            cursor: pointer;
            padding: 4px;

            &:hover {
                color: $danger;
            }
        }
    }

    .empty-adj {
        text-align: center;
        color: $text-light;
        font-size: 13px;
        padding: 20px 0;
    }
}

/* 대사 (Reconciliation) 계산식 */
.reconciliation-box {
    background: #f8fafc;
    border: 1px solid $border;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;

    .calc-row {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: $text-sub;
        margin-bottom: 8px;
    }

    .result-row {
        font-size: 16px;
        color: $text-main;
        margin-top: 12px;
        margin-bottom: 0;
    }

    .divider {
        height: 1px;
        background: #cbd5e1;
        margin: 16px 0;
    }

    .target-row {
        font-size: 16px;
        color: $text-main;
    }

    .diff-result {
        margin-top: 16px;
        padding: 16px;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .status {
            font-weight: 800;
            font-size: 14px;
        }

        .diff-amt {
            font-size: 18px;
            font-weight: 900;
        }

        &.is-match {
            background: #ecfdf5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }

        &.is-mismatch {
            background: #fef2f2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }
    }
}

.btn-large {
    width: 100%;
    padding: 16px;
    font-size: 16px;
    font-weight: 800;
    border-radius: 10px;
}

.btn-primary {
    background: $primary;
    color: #fff;
    border: none;
    cursor: pointer;
    transition: 0.2s;

    &:hover:not(:disabled) {
        background: $primary-hover;
    }

    &:disabled {
        background: #cbd5e1;
        cursor: not-allowed;
    }
}

.btn-outline {
    background: #fff;
    border: 1px solid $primary;
    color: $primary;
    font-weight: 700;
    cursor: pointer;

    &:hover {
        background: #f1f5f9;
    }
}

.mono {
    font-family: monospace;
}

.font-bold {
    font-weight: 700;
}

.text-right {
    text-align: right;
}

.text-center {
    text-align: center;
}

.text-red {
    color: $danger;
}

.text-blue {
    color: $blue;
}

.text-light {
    color: $text-light;
}</style>