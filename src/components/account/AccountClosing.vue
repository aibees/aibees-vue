<template>
    <div class="monthly-closing-management">
        <header class="page-header">
            <h2>월별 마감 및 잔액 대사</h2>
            <p>장부상의 계산된 잔액과 실제 계좌 잔액을 대조하여 이상이 없으면 해당 월을 마감 확정합니다.</p>
        </header>

        <section class="top-action-bar d-panel">
            <div class="month-selector">
                <label>마감 대상 월 (Closing Month)</label>
                <div class="month-input-group">
                    <button class="btn-icon-nav" @click="changeMonth(-1)">◀</button>
                    <input type="month" v-model="targetMonth" @change="loadClosingData">
                    <button class="btn-icon-nav" @click="changeMonth(1)">▶</button>
                </div>
            </div>

            <div class="status-summary">
                <div class="summary-box">
                    <span class="label">마감 상태</span>
                    <span class="status-badge" :class="isClosed ? 'closed' : 'open'">
                        {{ isClosed ? '🔒 마감 완료' : '🔓 진행 중' }}
                    </span>
                </div>
            </div>
        </section>

        <section class="reconciliation-section d-panel">
            <div class="section-header">
                <h3>계좌별 잔액 대사 (Bank Reconciliation)</h3>
                <div class="actions">
                    <button class="btn-secondary btn-sm" @click="loadClosingData" :disabled="isClosed">🔄 새로고침</button>
                </div>
            </div>

            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th class="col-account">계좌/카드명</th>
                            <th class="col-prev">전월 이월 잔액 (A)</th>
                            <th class="col-inout">당월 입금 (증가)</th>
                            <th class="col-inout">당월 출금 (감소)</th>
                            <th class="col-net">당월 증감액 (B)</th>
                            <th class="col-calc">장부상 잔액 (A+B)</th>
                            <th class="col-actual">실제 잔액 입력 (C)</th>
                            <th class="col-diff">차액 (C - 장부)</th>
                            <th class="col-status">검증</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="acc in closingAccounts" :key="acc.bankId">

                            <td class="col-account font-bold">{{ acc.bankName }}</td>

                            <td class="col-prev text-right mono">{{ acc.prevBalance.toLocaleString() }}</td>

                            <td class="col-inout text-right mono">
                                <span class="clickable-amt text-blue" @click="openDetailModal(acc, 'IN')" title="입금 내역 보기">
                                    +{{ acc.totalIn.toLocaleString() }}
                                </span>
                            </td>

                            <td class="col-inout text-right mono">
                                <span class="clickable-amt text-red" @click="openDetailModal(acc, 'OUT')" title="출금 내역 보기">
                                    -{{ acc.totalOut.toLocaleString() }}
                                </span>
                            </td>

                            <td class="col-net text-right mono font-bold">
                                {{ getNetChange(acc) > 0 ? '+' : '' }}{{ getNetChange(acc)}}
                            </td>

                            <td class="col-calc text-right mono font-bold bg-highlight">
                                {{ getCalcBalance(acc) }}
                            </td>

                            <td class="col-actual">
                                <div class="input-with-unit">
                                    <input type="number" v-model.number="acc.actualBalance" placeholder="실제 잔액"
                                        :disabled="isClosed" class="compact-input text-right mono font-bold"
                                        :class="{ 'is-error-input': acc.actualBalance !== null && getDiff(acc) !== 0 }">
                                    <span class="unit">원</span>
                                </div>
                            </td>

                            <td class="col-diff text-right mono font-bold"
                                :class="getDiff(acc) === 0 ? 'text-green' : 'text-red'">
                                {{ getDiff(acc) === 0 ? '0' : getDiff(acc) }}
                            </td>

                            <td class="col-status text-center">
                                <span class="match-badge"
                                    v-if="acc.actualBalance === null || acc.actualBalance === ''">입력대기</span>
                                <span class="match-badge ok" v-else-if="getDiff(acc) === 0">일치</span>
                                <span class="match-badge error" v-else>불일치</span>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot v-if="closingAccounts.length > 0">
                        <tr>
                            <td class="text-center font-bold">전체 합계</td>
                            <td class="text-right mono font-bold">{{ totalPrevBalance.toLocaleString() }}</td>
                            <td class="text-right mono text-blue font-bold">+{{ totalIn.toLocaleString() }}</td>
                            <td class="text-right mono text-red font-bold">-{{ totalOut.toLocaleString() }}</td>
                            <td class="text-right mono font-bold">{{ totalNetChange.toLocaleString() }}</td>
                            <td class="text-right mono font-bold bg-highlight">{{ totalCalcBalance.toLocaleString() }}</td>
                            <td class="text-right mono font-bold">{{ totalActualBalance.toLocaleString() }}</td>
                            <td class="text-right mono font-bold" :class="totalDiff === 0 ? 'text-green' : 'text-red'">{{
                                totalDiff.toLocaleString() }}</td>
                            <td class="text-center">
                                <span class="match-badge ok" v-if="isAllMatched && !isAnyEmpty">전체 일치</span>
                                <span class="match-badge error" v-else>확인필요</span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div class="warning-alert" v-if="unpostedCount > 0 && !isClosed">
                ⚠️ 해당 월에 확정(POSTED)되지 않은 <strong>초기입력(INIT) 상태의 전표가 {{ unpostedCount }}건</strong> 있습니다. 마감 전 모든 전표를 확정해 주세요.
            </div>
        </section>

        <section class="bottom-action-bar">
            <button class="btn-danger btn-large" v-if="isClosed" @click="cancelClosing">
                🔓 마감 취소 (수정 모드로 전환)
            </button>
            <div class="closing-action-group" v-else>
                <div class="hint-text" v-if="!isAllMatched || isAnyEmpty || unpostedCount > 0">
                    * 모든 계좌의 실제 잔액을 입력하고 차액이 0원이 되어야 월 마감이 가능합니다.
                </div>
                <button class="btn-primary btn-large" @click="executeClosing"
                    :disabled="!isAllMatched || isAnyEmpty || unpostedCount > 0">
                    🔒 월 마감 확정 (CONFIRM)
                </button>
            </div>
        </section>

        <Transition name="fade">
            <div v-if="detailModal.open" class="modal-overlay" @click.self="closeDetailModal">
                <div class="modal-container modal-lg">
                    <header class="modal-header">
                        <div class="header-titles">
                            <h4>
                                <span :class="detailModal.type === 'IN' ? 'text-blue' : 'text-red'">
                                    {{ detailModal.type === 'IN' ? '입금(증가)' : '출금(감소)' }} 상세 내역
                                </span>
                            </h4>
                            <p class="modal-sub">{{ detailModal.accountName }} ({{ targetMonth }}월)</p>
                        </div>
                        <button class="btn-close" @click="closeDetailModal">&times;</button>
                    </header>

                    <div class="modal-body">
                        <div class="journal-list-wrapper">
                            <table class="detail-data-table">
                                <thead>
                                    <tr>
                                        <th class="col-date">거래 일자</th>
                                        <th class="col-no">전표 번호</th>
                                        <th class="col-preset">프리셋</th>
                                        <th class="col-remark">적요 (메모)</th>
                                        <th class="col-amt text-right">금액 (원)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in detailModal.list" :key="item.je_header_id">
                                        <td class="col-date mono">{{ item.je_date.substring(0, 16) }}</td>
                                        <td class="col-no mono text-light">{{ item.je_header_no }}</td>
                                        <td class="col-preset"><span class="preset-badge">{{ item.preset_cd }}</span></td>
                                        <td class="col-remark desc-text">{{ item.remark || '-' }}</td>
                                        <td class="col-amt text-right mono font-bold"
                                            :class="detailModal.type === 'IN' ? 'text-blue' : 'text-red'">
                                            {{ item.amount.toLocaleString() }}
                                        </td>
                                    </tr>
                                    <tr v-if="detailModal.list.length === 0">
                                        <td colspan="5" class="text-center empty-state">해당 내역이 없습니다.</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="4" class="text-right font-bold">합 계</td>
                                        <td class="text-right mono font-bold"
                                            :class="detailModal.type === 'IN' ? 'text-blue' : 'text-red'">
                                            {{ detailModal.totalAmount.toLocaleString() }}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <footer class="modal-footer">
                        <button class="btn-primary" @click="closeDetailModal">확인 완료</button>
                    </footer>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';

// ==========================================
// 1. State Management (월 및 데이터 로드)
// ==========================================
const getCurrentMonthStr = () => {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().slice(0, 7);
};

const targetMonth = ref(getCurrentMonthStr());
const isClosed = ref(false);
const unpostedCount = ref(0);
const closingAccounts = ref([]);

onMounted(() => {
    loadClosingData();
});

const changeMonth = (offset) => {
    const [year, month] = targetMonth.value.split('-').map(Number);
    const d = new Date(year, month - 1 + offset, 1);
    targetMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    loadClosingData();
};

const loadClosingData = () => {
    console.log(`${targetMonth.value} 마감 데이터 로드`);

    if (targetMonth.value === '2026-02') {
        isClosed.value = true; unpostedCount.value = 0;
        closingAccounts.value = [
            { bankId: 'ACC_001', bankName: '신한 주거래통장', prevBalance: 5000000, totalIn: 3500000, totalOut: 2000000, actualBalance: 6500000 },
            { bankId: 'ACC_002', bankName: '카카오뱅크 생활비', prevBalance: 1000000, totalIn: 500000, totalOut: 1200000, actualBalance: 300000 }
        ];
    } else {
        isClosed.value = false; unpostedCount.value = 1;
        closingAccounts.value = [
            { bankId: 'ACC_001', bankName: '신한 주거래통장', prevBalance: 6500000, totalIn: 3500000, totalOut: 1500000, actualBalance: null },
            { bankId: 'ACC_002', bankName: '카카오뱅크 생활비', prevBalance: 300000, totalIn: 1000000, totalOut: 800000, actualBalance: null }
        ];
    }
};

// ==========================================
// 2. Computed Calculations (잔액 계산)
// ==========================================
const getNetChange = (acc) => acc.totalIn - acc.totalOut;
const getCalcBalance = (acc) => acc.prevBalance + getNetChange(acc);
const getDiff = (acc) => {
    if (acc.actualBalance === null || acc.actualBalance === '') return null;
    return acc.actualBalance - getCalcBalance(acc);
};

const totalPrevBalance = computed(() => closingAccounts.value.reduce((s, a) => s + a.prevBalance, 0));
const totalIn = computed(() => closingAccounts.value.reduce((s, a) => s + a.totalIn, 0));
const totalOut = computed(() => closingAccounts.value.reduce((s, a) => s + a.totalOut, 0));
const totalNetChange = computed(() => totalIn.value - totalOut.value);
const totalCalcBalance = computed(() => totalPrevBalance.value + totalNetChange.value);
const totalActualBalance = computed(() => closingAccounts.value.reduce((s, a) => s + (Number(a.actualBalance) || 0), 0));
const totalDiff = computed(() => totalActualBalance.value - totalCalcBalance.value);

const isAnyEmpty = computed(() => closingAccounts.value.some(a => a.actualBalance === null || a.actualBalance === ''));
const isAllMatched = computed(() => closingAccounts.value.every(a => getDiff(a) === 0));

// ==========================================
// 3. 💡 Detail Modal Logic (상세내역 팝업)
// ==========================================
const detailModal = reactive({
    open: false,
    accountName: '',
    type: 'IN', // 'IN' (입금) | 'OUT' (출금)
    list: [],
    totalAmount: 0
});

const openDetailModal = async (acc, type) => {
    // 0원이면 클릭 안되게 방어
    if (type === 'IN' && acc.totalIn === 0) return;
    if (type === 'OUT' && acc.totalOut === 0) return;

    detailModal.accountName = acc.bankName;
    detailModal.type = type;
    detailModal.totalAmount = type === 'IN' ? acc.totalIn : acc.totalOut;

    // 실제 API 호출 시 계좌, 월, 입출금 구분을 넘겨서 account_journal_header 목록을 조회합니다.
    // const res = await mariaApi.get(`/api/journals/monthly-details`, { params: { bankId: acc.bankId, month: targetMonth.value, type: type } });
    // detailModal.list = res.data;

    // 테스트용 Mock 데이터 세팅 (입/출금에 따라 다르게)
    const baseDate = `${targetMonth.value}-15`;
    if (type === 'IN') {
        detailModal.list = [
            { je_header_id: 101, je_date: `${baseDate} 09:00:00`, je_header_no: '202603-000101-M', preset_cd: 'INC_SALARY', remark: '월 급여 입금', amount: acc.totalIn }
        ];
    } else {
        detailModal.list = [
            { je_header_id: 201, je_date: `${baseDate} 12:30:00`, je_header_no: '202603-000201-X', preset_cd: 'EXP_MEAL', remark: '식대 결제', amount: acc.totalOut * 0.4 },
            { je_header_id: 202, je_date: `${baseDate} 19:15:00`, je_header_no: '202603-000202-X', preset_cd: 'EXP_TRANS', remark: '교통비 결제', amount: acc.totalOut * 0.6 }
        ];
    }

    detailModal.open = true;
};

const closeDetailModal = () => detailModal.open = false;

// ==========================================
// 4. Actions (마감 실행/취소)
// ==========================================
const executeClosing = () => {
    if (unpostedCount.value > 0) return alert('확정되지 않은 전표를 먼저 확인해 주세요.');
    if (confirm(`${targetMonth.value}월을 마감하시겠습니까?`)) {
        alert('마감이 성공적으로 완료되었습니다.');
        isClosed.value = true;
    }
};

const cancelClosing = () => {
    if (confirm(`정말 ${targetMonth.value}월 마감을 취소하시겠습니까?`)) {
        alert('마감이 취소되었습니다.');
        isClosed.value = false;
    }
};
</script>

<style lang="scss" scoped>
$primary: #4b74ff;
$primary-hover: #3848c7;
$text-main: #111827;
$text-sub: #4b5563;
$text-light: #9ca3af;
$bg-main: #f5f6fa;
$bg-white: #ffffff;
$border-color: #e5e7eb;
$danger: #ef4444;
$blue: #2563eb;
$green: #10b981;

.monthly-closing-management {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    font-family: 'Pretendard', sans-serif;
    color: $text-main;

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
}

.d-panel {
    background: $bg-white;
    border-radius: 12px;
    border: 1px solid $border-color;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
    margin-bottom: 20px;
}

/* 상단 대상 월 선택 */
.top-action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .month-selector {
        display: flex;
        flex-direction: column;
        gap: 8px;

        label {
            font-size: 13px;
            font-weight: 700;
            color: $text-sub;
        }

        .month-input-group {
            display: flex;
            align-items: center;
            gap: 4px;

            .btn-icon-nav {
                background: $bg-main;
                border: 1px solid $border-color;
                border-radius: 6px;
                padding: 8px 12px;
                cursor: pointer;
                transition: 0.2s;

                &:hover {
                    background: #e2e8f0;
                }
            }

            input[type="month"] {
                padding: 8px 16px;
                border: 1px solid $border-color;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 800;
                font-family: monospace;
                outline: none;

                &:focus {
                    border-color: $primary;
                }
            }
        }
    }

    .status-summary {
        .summary-box {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;

            .label {
                font-size: 12px;
                color: $text-sub;
                font-weight: 700;
            }

            .status-badge {
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 800;

                &.closed {
                    background: #fef2f2;
                    color: #991b1b;
                    border: 1px solid #fecaca;
                }

                &.open {
                    background: #eff6ff;
                    color: #1e40af;
                    border: 1px solid #bfdbfe;
                }
            }
        }
    }
}

/* 중앙 대사 테이블 */
.reconciliation-section {
    padding: 0;
    overflow: hidden;

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid $border-color;

        h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 800;
        }

        .btn-secondary {
            background: $bg-white;
            border: 1px solid #ced4da;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;

            &:hover:not(:disabled) {
                background: #f1f3f5;
            }

            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }
    }

    .data-table-wrapper {
        overflow-x: auto;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        min-width: 1000px;

        th {
            background: #f8fafc;
            padding: 14px 12px;
            font-size: 13px;
            font-weight: 700;
            color: $text-sub;
            border-bottom: 1px solid $border-color;
            text-align: right;
        }

        th.col-account,
        th.col-status {
            text-align: center;
        }

        td {
            padding: 14px 12px;
            vertical-align: middle;
            border-bottom: 1px solid $border-color;
            font-size: 14px;
        }

        .col-account {
            width: 160px;
            text-align: center;
        }

        .col-prev {
            width: 120px;
        }

        .col-inout {
            width: 120px;
        }

        .col-net {
            width: 120px;
        }

        .col-calc {
            width: 130px;
        }

        .col-actual {
            width: 160px;
        }

        .col-diff {
            width: 120px;
        }

        .col-status {
            width: 80px;
            text-align: center;
        }

        .bg-highlight {
            background-color: rgba(75, 116, 255, 0.05);
        }

        /* 💡 추가: 클릭 가능한 금액 디자인 */
        .clickable-amt {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 6px;
            cursor: pointer;
            transition: 0.2s;
            font-weight: 700;

            &:hover {
                background-color: #f1f5f9;
                text-decoration: underline;
            }
        }

        .input-with-unit {
            position: relative;

            .compact-input {
                width: 100%;
                padding: 8px 24px 8px 8px;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                font-size: 14px;
                outline: none;
                transition: 0.2s;

                &:focus {
                    border-color: $primary;
                    box-shadow: 0 0 0 3px rgba($primary, 0.1);
                }

                &:disabled {
                    background: transparent;
                    border-color: transparent;
                    padding-right: 0;
                    text-align: right;
                    color: $text-main;
                }

                /* 💡 입력값이 틀렸을 때만 input 테두리를 붉게 처리 */
                &.is-error-input {
                    border-color: $danger;
                    background-color: #fff5f5;
                    color: $danger;
                }
            }

            .unit {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                color: $text-light;
                font-size: 12px;
                font-weight: 700;
                pointer-events: none;
            }
        }

        .match-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 800;
            background: #e2e8f0;
            color: #475569;

            &.ok {
                background: #d1fae5;
                color: #065f46;
            }

            &.error {
                background: #fee2e2;
                color: #991b1b;
            }
        }

        tfoot td {
            background: #f8fafc;
            border-top: 2px solid $text-main;
            border-bottom: none;
            font-size: 15px;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .font-bold {
            font-weight: 700;
        }

        .mono {
            font-family: monospace;
        }

        .text-blue {
            color: $blue;
        }

        .text-red {
            color: $danger;
        }

        .text-green {
            color: $green;
        }
    }

    .warning-alert {
        padding: 16px 24px;
        background: #fffbeb;
        border-top: 1px solid #fde68a;
        color: #92400e;
        font-size: 14px;
    }
}

/* 💡 팝업 모달 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-container {
    background: $bg-white;
    width: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);

    &.modal-lg {
        max-width: 800px;
        max-height: 85vh;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 24px;
        border-bottom: 1px solid $border-color;

        .header-titles {
            h4 {
                margin: 0 0 6px 0;
                font-size: 20px;
                font-weight: 800;
            }

            .modal-sub {
                margin: 0;
                font-size: 14px;
                color: $text-sub;
                font-weight: 600;
            }
        }

        .btn-close {
            background: none;
            border: none;
            font-size: 28px;
            line-height: 1;
            color: $text-light;
            cursor: pointer;

            &:hover {
                color: $text-main;
            }
        }
    }

    .modal-body {
        padding: 24px;
        overflow-y: auto;
    }

    .journal-list-wrapper {
        border: 1px solid $border-color;
        border-radius: 10px;
        overflow: hidden;

        .detail-data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            text-align: left;

            th {
                background: #f8fafc;
                padding: 12px 16px;
                border-bottom: 1px solid $border-color;
                font-weight: 700;
                color: $text-sub;
            }

            td {
                padding: 14px 16px;
                border-bottom: 1px solid $border-color;
                vertical-align: middle;
            }

            .col-date {
                width: 150px;
            }

            .col-no {
                width: 160px;
            }

            .col-preset {
                width: 130px;
            }

            .col-remark {
                width: auto;
                max-width: 200px;
            }

            .col-amt {
                width: 130px;
            }

            .preset-badge {
                background: #f1f5f9;
                color: #475569;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 700;
                font-family: monospace;
            }

            .desc-text {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            tfoot td {
                background: #f8fafc;
                font-size: 15px;
                border-top: 2px solid $text-main;
                border-bottom: none;
            }

            .empty-state {
                padding: 40px;
                color: $text-light;
            }
        }
    }

    .modal-footer {
        padding: 20px 24px;
        border-top: 1px solid $border-color;
        background: $bg-white;
        display: flex;
        justify-content: flex-end;
    }
}

/* 하단 마감 액션 */
.bottom-action-bar {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;

    .closing-action-group {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;

        .hint-text {
            font-size: 13px;
            color: $danger;
            font-weight: 600;
        }
    }

    .btn-large {
        padding: 16px 40px;
        font-size: 16px;
        font-weight: 800;
        border-radius: 12px;
        border: none;
        cursor: pointer;
        transition: 0.2s;

        &.btn-primary {
            background: $primary;
            color: white;
            box-shadow: 0 4px 12px rgba(75, 116, 255, 0.3);

            &:hover:not(:disabled) {
                background: $primary-hover;
                transform: translateY(-2px);
            }

            &:disabled {
                background: #cbd5e1;
                box-shadow: none;
                cursor: not-allowed;
            }
        }

        &.btn-danger {
            background: $bg-white;
            color: $danger;
            border: 2px solid $danger;

            &:hover {
                background: #fef2f2;
            }
        }
    }
}

/* 공통 */
.btn-primary {
    background: $primary;
    color: white;
    border: none;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
        background: $primary-hover;
    }
}

.text-center {
    text-align: center;
}

.text-right {
    text-align: right;
}

.font-bold {
    font-weight: 700;
}

.mono {
    font-family: monospace;
}

.text-blue {
    color: $blue;
}

.text-red {
    color: $danger;
}

.text-green {
    color: $green;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}</style>