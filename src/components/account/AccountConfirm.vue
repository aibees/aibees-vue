<template>
    <div class="journal-posting-management">
        <header class="page-header">
            <h2>전표 확정 및 분개 관리</h2>
            <p>초기 입력된 전표의 헤더 정보 및 차/대변 분개(Lines) 내역을 검토, 수정하고 확정(POSTED) 처리합니다.</p>
        </header>

        <section class="search-filter-section d-panel">
            <div class="filter-wrap">
                <div class="form-group">
                    <label>귀속 년월</label>
                    <input type="month" v-model="filters.yearMonth">
                </div>

                <div class="form-group acct-search-group">
                    <label>계정과목 검색</label>
                    <input type="text" v-model="filters.acctCd" list="account-list" placeholder="코드 또는 계정명 입력">
                    <datalist id="account-list">
                        <option v-for="acc in allAccounts" :key="acc.acctCd" :value="acc.acctCd">
                            {{ acc.acctNm }}
                        </option>
                    </datalist>
                </div>

                <div class="form-group remark-group">
                    <label>적요 (메모)</label>
                    <input type="text" v-model="filters.remark" placeholder="적요 내용 검색" @keyup.enter="searchData">
                </div>

                <div class="form-group">
                    <label>프리셋 (Preset)</label>
                    <select v-model="filters.presetCd">
                        <option value="">전체 프리셋</option>
                        <option v-for="p in presetMasters" :key="p.presetCd" :value="p.presetCd">
                            [{{ p.presetCd }}] {{ p.presetNm }}
                        </option>
                    </select>
                </div>

                <div class="form-group button-group">
                    <button class="btn-primary" @click="searchData">🔍 검색</button>
                </div>
            </div>
        </section>

        <section class="data-list-section d-panel">
            <div class="list-header">
                <div class="summary">
                    조회 결과: 총 <strong>{{ journalList.length }}</strong>건
                    <span class="selected-count" v-if="selectedIds.length > 0">
                        (선택됨: <strong class="text-blue">{{ selectedIds.length }}</strong>건)
                    </span>
                </div>
                <div class="actions">
                    <button class="btn-primary btn-batch" @click="batchConfirm" :disabled="selectedIds.length === 0">
                        ✅ 선택 일괄 확정 (POSTED)
                    </button>
                </div>
            </div>

            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th class="col-check">
                                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll">
                            </th>
                            <th class="col-no">전표 번호</th>
                            <th class="col-date">전표 일자 (수정)</th>
                            <th class="col-preset">프리셋 (수정)</th>
                            <th class="col-remark">헤더 적요 (수정)</th>
                            <th class="col-amt">총 금액 (원)</th>
                            <th class="col-status">상태</th>
                            <th class="col-action">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="journal in journalList" :key="journal.jeHeaderId" class="data-row">
                            <td class="col-check">
                                <input type="checkbox" :value="journal.jeHeaderId" v-model="selectedIds">
                            </td>
                            <td class="col-no mono text-light">{{ journal.jeHeaderNo }}</td>

                            <td class="col-date">
                                <input type="date" v-model="journal.txDate" class="grid-input mono"
                                    :disabled="journal.status === 'POSTED'">
                            </td>

                            <td class="col-preset">
                                <select v-model="journal.presetCd" class="grid-input"
                                    :disabled="journal.status === 'POSTED'">
                                    <option v-for="p in presetMasters" :key="p.presetCd" :value="p.presetCd">
                                        {{ p.presetNm }}
                                    </option>
                                </select>
                            </td>

                            <td class="col-remark">
                                <input type="text" v-model="journal.remark" class="grid-input" placeholder="헤더 적요"
                                    :disabled="journal.status === 'POSTED'">
                            </td>

                            <td class="col-amt text-right font-bold">{{ journal.amount.toLocaleString() }}</td>

                            <td class="col-status">
                                <span class="status-pill" :class="journal.status === 'POSTED' ? 'bg-green' : 'bg-gray'">
                                    {{ journal.status === 'POSTED' ? '확정' : '초기입력' }}
                                </span>
                            </td>

                            <td class="col-action">
                                <div class="action-btn-group">
                                    <button class="btn-sm btn-line-edit" @click="openLinesModal(journal)"
                                        :disabled="journal.status === 'POSTED'" title="차/대변 분개 상세 수정">
                                        📝 라인변경
                                    </button>
                                    <button class="btn-toggle"
                                        :class="journal.status === 'POSTED' ? 'is-posted' : 'is-init'"
                                        @click="toggleStatus(journal)">
                                        {{ journal.status === 'POSTED' ? '↩ 확정취소' : '✅ 확정' }}
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="journalList.length === 0">
                            <td colspan="8" class="empty-state">조건에 일치하는 전표가 없습니다.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Transition name="fade">
            <div v-if="detailModal.open" class="modal-overlay" @click.self="closeLinesModal">
                <div class="modal-container modal-xl">
                    <header class="modal-header">
                        <div>
                            <h4>차/대변 분개 상세 수정 (Lines)</h4>
                            <p class="modal-sub mono">전표번호: {{ detailModal.header.jeHeaderNo }} | 적요: {{
                                detailModal.header.remark }}</p>
                        </div>
                        <button class="btn-close" @click="closeLinesModal">&times;</button>
                    </header>

                    <div class="modal-body">
                        <div class="lines-editor-wrapper">
                            <table class="lines-table">
                                <thead>
                                    <tr>
                                        <th style="width: 50px;">No.</th>
                                        <th style="width: 200px;">계정과목 (acctCd)</th>
                                        <th style="width: 130px;">차변 금액 (Dr)</th>
                                        <th style="width: 130px;">대변 금액 (Cr)</th>
                                        <th>라인 적요 (remark)</th>
                                        <th style="width: 100px;">속성 (attr1)</th>
                                        <th style="width: 50px;">삭제</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(line, idx) in detailModal.lines" :key="idx">
                                        <td class="text-center mono">{{ idx + 1 }}</td>
                                        <td><input type="text" v-model="line.acctCd" list="account-list" class="grid-input"
                                                placeholder="코드/명 검색"></td>
                                        <td><input type="number" v-model.number="line.amountDr"
                                                class="grid-input text-right text-blue mono font-bold" placeholder="0"></td>
                                        <td><input type="number" v-model.number="line.amountCr"
                                                class="grid-input text-right text-red mono font-bold" placeholder="0"></td>
                                        <td><input type="text" v-model="line.remark" class="grid-input"
                                                placeholder="라인별 메모"></td>
                                        <td><input type="text" v-model="line.attribute1" class="grid-input"
                                                placeholder="Attr 1"></td>
                                        <td class="text-center">
                                            <button class="btn-icon-danger" @click="removeLine(idx)">✕</button>
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="2" class="text-right font-bold">합 계</td>
                                        <td class="text-right mono font-bold text-blue">{{ totalDr.toLocaleString() }}</td>
                                        <td class="text-right mono font-bold text-red">{{ totalCr.toLocaleString() }}</td>
                                        <td colspan="3" class="diff-msg font-bold"
                                            :class="totalDr === totalCr ? 'text-green' : 'text-red'">
                                            {{ totalDr === totalCr ? '✅ 대차평균 일치' : `🚨 차액: ${Math.abs(totalDr -
                                                totalCr).toLocaleString()}원` }}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                            <button class="btn-add-line" @click="addLine">+ 분개 라인 추가</button>
                        </div>
                    </div>

                    <footer class="modal-footer flex-between">
                        <div class="left-actions">
                            <span class="hint-text text-red" v-if="totalDr !== totalCr">* 대차 합계가 일치해야 저장할 수 있습니다.</span>
                        </div>
                        <div class="right-actions">
                            <button class="btn-secondary" @click="closeLinesModal">취소</button>
                            <button class="btn-primary" @click="saveLines"
                                :disabled="totalDr !== totalCr || detailModal.lines.length === 0">💾 라인 수정내역 저장</button>
                        </div>
                    </footer>
                </div>
            </div>
        </Transition>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';

// ==========================================
// 1. 기초 마스터 데이터 (Mock)
// ==========================================
const getCurrentMonthStr = () => {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().slice(0, 7);
};

const allAccounts = ref([
    { acctCd: '1110', acctNm: '보통예금 (신한)' },
    { acctCd: '2110', acctNm: '미지급금 (신용카드)' },
    { acctCd: '4110', acctNm: '급여수익' },
    { acctCd: '5110', acctNm: '식비' },
    { acctCd: '5120', acctNm: '여비교통비' }
]);

const presetMasters = ref([
    { presetCd: 'EXP_MEAL', presetNm: '식비 결제' },
    { presetCd: 'EXP_TRANS', presetNm: '교통비 결제' },
    { presetCd: 'INC_SALARY', presetNm: '급여 입금' }
]);

// ==========================================
// 2. 검색 및 리스트 상태 관리
// ==========================================
const filters = reactive({
    yearMonth: getCurrentMonthStr(),
    acctCd: '',
    remark: '',
    presetCd: ''
});

const journalList = ref([]);
const selectedIds = ref([]);

onMounted(() => searchData());

const searchData = () => {
    // 💡 날짜(date) input 바인딩을 위해 txDate(YYYY-MM-DD) 분리
    journalList.value = [
        { jeHeaderId: 101, jeHeaderNo: '202603-000101-M', txDate: '2026-03-08', presetCd: 'EXP_MEAL', amount: 15000, remark: '강남역 점심', status: 'INIT' },
        { jeHeaderId: 102, jeHeaderNo: '202603-000102-X', txDate: '2026-03-08', presetCd: 'EXP_TRANS', amount: 5500, remark: '택시비 (야근)', status: 'INIT' },
        { jeHeaderId: 103, jeHeaderNo: '202603-000103-M', txDate: '2026-03-09', presetCd: 'INC_SALARY', amount: 3500000, remark: '3월 정기 급여', status: 'POSTED' }
    ];
    selectedIds.value = [];
};

// ==========================================
// 3. 일괄 확정 / 개별 토글 액션
// ==========================================
const isAllSelected = computed(() => {
    return journalList.value.length > 0 && selectedIds.value.length === journalList.value.length;
});

const toggleSelectAll = (e) => {
    if (e.target.checked) selectedIds.value = journalList.value.map(j => j.jeHeaderId);
    else selectedIds.value = [];
};

const toggleStatus = (journal) => {
    const nextStatus = journal.status === 'POSTED' ? 'INIT' : 'POSTED';
    const actionName = nextStatus === 'POSTED' ? '확정' : '확정 취소';

    if (confirm(`해당 전표를 ${actionName} 하시겠습니까?`)) {
        // 이 시점에서 인라인 수정된 헤더 데이터(txDate, presetCd, remark)도 서버로 함께 보내 업데이트 가능
        journal.status = nextStatus;
    }
};

const batchConfirm = () => {
    if (confirm(`선택한 ${selectedIds.value.length}건의 전표를 일괄 확정(POSTED) 처리하시겠습니까?`)) {
        journalList.value.forEach(j => {
            if (selectedIds.value.includes(j.jeHeaderId)) j.status = 'POSTED';
        });
        selectedIds.value = [];
        alert('일괄 확정이 완료되었습니다.');
    }
};

// ==========================================
// 4. 분개 라인 (Journal Lines) 팝업 관리
// ==========================================
const detailModal = reactive({
    open: false,
    header: {},
    lines: []
});

const openLinesModal = (journal) => {
    detailModal.header = journal;
    detailModal.lines = [
        { jeHeaderId: journal.jeHeaderId, lineNum: 1, acctCd: '5110', amountDr: journal.amount, amountCr: 0, remark: journal.remark, attribute1: '', attribute2: '', lineType: 'ITEM' },
        { jeHeaderId: journal.jeHeaderId, lineNum: 2, acctCd: '2110', amountDr: 0, amountCr: journal.amount, remark: journal.remark, attribute1: 'CARD_001', attribute2: '', lineType: 'LIABILITY' }
    ];
    detailModal.open = true;
};

const closeLinesModal = () => detailModal.open = false;

const addLine = () => {
    detailModal.lines.push({
        jeHeaderId: detailModal.header.jeHeaderId,
        lineNum: detailModal.lines.length + 1,
        acctCd: '', amountDr: 0, amountCr: 0, remark: '', attribute1: '', attribute2: '', lineType: 'MANUAL'
    });
};

const removeLine = (idx) => detailModal.lines.splice(idx, 1);

const totalDr = computed(() => detailModal.lines.reduce((s, l) => s + (Number(l.amountDr) || 0), 0));
const totalCr = computed(() => detailModal.lines.reduce((s, l) => s + (Number(l.amountCr) || 0), 0));

const saveLines = () => {
    if (totalDr.value !== totalCr.value) return alert('차변(Dr)과 대변(Cr) 합계가 일치하지 않아 저장할 수 없습니다.');
    if (detailModal.lines.some(l => !l.acctCd)) return alert('모든 분개 라인에 계정과목을 지정해주세요.');

    detailModal.lines.forEach((l, idx) => l.lineNum = idx + 1);
    detailModal.header.amount = totalDr.value; // 헤더 총 금액 싱크

    alert('분개 라인이 성공적으로 수정되었습니다.');
    closeLinesModal();
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

.journal-posting-management {
    max-width: 1300px;
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

/* 1. 상단 필터 */
.search-filter-section {
    .filter-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 16px 20px;
        align-items: flex-end;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1 1 180px;

        label {
            font-size: 13px;
            font-weight: 700;
            color: $text-sub;
        }

        input[type="text"],
        input[type="month"],
        select {
            width: 100%;
            height: 40px;
            padding: 0 12px;
            border: 1px solid #ced4da;
            border-radius: 8px;
            font-size: 14px;
            box-sizing: border-box;
            outline: none;
            transition: 0.2s;

            &:focus {
                border-color: $primary;
                box-shadow: 0 0 0 2px rgba($primary, 0.1);
            }
        }
    }

    .acct-search-group {
        flex: 1.2 1 200px;
    }

    .remark-group {
        flex: 2 1 250px;
    }

    .button-group {
        flex: 0 0 auto;
        height: 40px;

        button {
            height: 100%;
            padding: 0 24px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
        }
    }
}

/* 2. 전표 리스트 영역 (수정) */
.data-list-section {
    padding: 0;
    overflow: hidden;

    .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid $border-color;

        .summary {
            font-size: 15px;
            color: $text-main;

            strong {
                font-weight: 800;
            }

            .selected-count {
                margin-left: 8px;
                font-size: 14px;
                color: $text-sub;

                strong {
                    color: $blue;
                }
            }
        }
    }

    .data-table-wrapper {
        overflow-x: auto;
        max-height: 55vh;
        overflow-y: auto;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        min-width: 1100px;

        th {
            background: #f8fafc;
            padding: 14px 10px;
            font-size: 13px;
            font-weight: 700;
            color: $text-sub;
            border-bottom: 1px solid $border-color;
            position: sticky;
            top: 0;
            z-index: 10;
            box-shadow: 0 1px 0 $border-color;
        }

        td {
            padding: 8px 10px;
            vertical-align: middle;
            border-bottom: 1px solid $border-color;
            font-size: 14px;
        }

        .data-row {
            transition: 0.2s;

            &:hover {
                background: #f8faff;
            }
        }

        .col-check {
            width: 40px;
            text-align: center;

            input {
                cursor: pointer;
                width: 16px;
                height: 16px;
                accent-color: $primary;
            }
        }

        .col-no {
            width: 150px;
            font-size: 13px;
        }

        .col-date {
            width: 130px;
        }

        .col-preset {
            width: 140px;
        }

        .col-remark {
            width: auto;
            max-width: 250px;
        }

        .col-amt {
            width: 120px;
            padding-right: 16px;
        }

        .col-status {
            width: 90px;
            text-align: center;
        }

        .col-action {
            width: 180px;
            text-align: center;
        }

        /* 💡 인라인 그리드 인풋 디자인 */
        .grid-input {
            width: 100%;
            height: 32px;
            padding: 4px 8px;
            border: 1px solid transparent;
            border-radius: 4px;
            background: transparent;
            font-size: 13px;
            box-sizing: border-box;
            outline: none;
            transition: 0.2s;

            &:hover:not(:disabled) {
                border-color: #cbd5e1;
                background: #fff;
            }

            &:focus:not(:disabled) {
                border-color: $primary;
                background: #fff;
                box-shadow: 0 0 0 2px rgba($primary, 0.1);
            }

            &:disabled {
                color: $text-light;
                cursor: not-allowed;
            }
        }

        .action-btn-group {
            display: flex;
            gap: 6px;
            justify-content: center;
        }

        .btn-line-edit {
            background: #f1f5f9;
            color: #475569;
            border: 1px solid #cbd5e1;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: 0.2s;

            &:hover:not(:disabled) {
                background: #e2e8f0;
                color: #1e293b;
            }

            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }

        .btn-toggle {
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 800;
            cursor: pointer;
            transition: 0.2s;
            border: none;
            width: 80px;

            &.is-init {
                background: #e0e7ff;
                color: #3730a3;

                &:hover {
                    background: #c7d2fe;
                }
            }

            &.is-posted {
                background: #fee2e2;
                color: #991b1b;

                &:hover {
                    background: #fecaca;
                }
            }
        }

        .status-pill {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 800;

            &.bg-gray {
                background: #f1f5f9;
                color: #475569;
            }

            &.bg-green {
                background: #ecfdf5;
                color: #047857;
            }
        }

        .text-right {
            text-align: right;
        }

        .font-bold {
            font-weight: 700;
        }

        .text-light {
            color: $text-light;
        }

        .mono {
            font-family: monospace;
        }

        .empty-state {
            text-align: center;
            padding: 60px;
            color: $text-light;
        }
    }
}

/* 3. 라인 수정 팝업 */
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

    &.modal-xl {
        max-width: 1000px;
        max-height: 90vh;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 24px;
        border-bottom: 1px solid $border-color;

        h4 {
            margin: 0 0 6px 0;
            font-size: 20px;
            font-weight: 800;
        }

        .modal-sub {
            margin: 0;
            font-size: 14px;
            color: $primary;
            font-weight: 700;
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

    .lines-editor-wrapper {
        border: 1px solid $border-color;
        border-radius: 12px;
        overflow: hidden;

        .lines-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;

            th {
                background: #f8fafc;
                padding: 12px;
                border-bottom: 1px solid $border-color;
                color: $text-sub;
                font-weight: 700;
            }

            td {
                padding: 8px 12px;
                border-bottom: 1px solid #f1f5f9;
                vertical-align: middle;
            }

            .grid-input {
                width: 100%;
                padding: 8px;
                border: 1px solid transparent;
                border-radius: 4px;
                background: transparent;
                font-size: 13px;
                box-sizing: border-box;
                outline: none;
                transition: 0.2s;

                &:hover {
                    border-color: #cbd5e1;
                    background: #fff;
                }

                &:focus {
                    border-color: $primary;
                    background: #fff;
                    box-shadow: 0 0 0 2px rgba($primary, 0.1);
                }
            }

            .btn-icon-danger {
                background: none;
                border: none;
                font-size: 16px;
                color: #cbd5e1;
                cursor: pointer;

                &:hover {
                    color: $danger;
                    transform: scale(1.1);
                }
            }

            tfoot td {
                background: #f8fafc;
                font-size: 15px;
                border-top: 2px solid $text-main;
                padding: 16px 12px;
            }

            .diff-msg {
                font-size: 14px;
            }
        }

        .btn-add-line {
            width: 100%;
            padding: 12px;
            background: #fff;
            border: none;
            border-top: 1px dashed #cbd5e1;
            color: $primary;
            font-weight: 700;
            cursor: pointer;
            transition: 0.2s;

            &:hover {
                background: #f8faff;
            }
        }
    }

    .modal-footer {
        padding: 20px 24px;
        border-top: 1px solid $border-color;
        background: $bg-white;
    }

    .flex-between {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .right-actions {
        display: flex;
        gap: 12px;
    }

    .hint-text {
        font-size: 13px;
        font-weight: 600;
    }
}

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

    &:hover:not(:disabled) {
        background: $primary-hover;
    }

    &:disabled {
        background: #9ca3af;
        cursor: not-allowed;
        opacity: 0.8;
    }
}

.btn-secondary {
    background: white;
    color: $text-main;
    border: 1px solid #ced4da;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
        background: #f1f3f5;
    }
}

.btn-batch {
    background: #10b981;

    &:hover:not(:disabled) {
        background: #059669;
    }
}

.text-center {
    text-align: center;
}

.text-right {
    text-align: right;
}

.mono {
    font-family: monospace;
}

.font-bold {
    font-weight: 700;
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