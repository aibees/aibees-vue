<template>
    <div class="journal-inquiry-management">
        <header class="page-header">
            <h2>전표 조회 및 상세</h2>
            <p>입력된 전표(Journal) 내역을 다양한 조건으로 검색하고, 상세 분개 내역을 확인합니다.</p>
        </header>

        <section class="search-filter-section d-panel">
            <div class="filter-wrap">
                <div class="form-group period-group">
                    <label>조회 기간 (전표 일자)</label>
                    <div class="date-range">
                        <input type="date" v-model="filters.startDate">
                        <span class="tilde">~</span>
                        <input type="date" v-model="filters.endDate">
                    </div>
                </div>

                <div class="form-group">
                    <label>거래 계좌/카드</label>
                    <select v-model="filters.bankId">
                        <option value="">전체 (All)</option>
                        <optgroup v-for="group in myAccounts" :key="group.type" :label="group.type">
                            <option v-for="acc in group.items" :key="acc.id" :value="acc.id">
                                {{ acc.name }}
                            </option>
                        </optgroup>
                    </select>
                </div>

                <div class="form-group">
                    <label>진행 상태</label>
                    <select v-model="filters.status">
                        <option value="">전체 (All)</option>
                        <option value="INIT">초기 입력 (INIT)</option>
                        <option value="POSTED">확정 (POSTED)</option>
                        <option value="CONFIRM">마감 완료 (CONFIRM)</option>
                    </select>
                </div>

                <div class="form-group keyword-group">
                    <label>키워드 검색</label>
                    <input type="text" v-model="filters.keyword" placeholder="전표번호, 프리셋, 적요 검색" @keyup.enter="searchData">
                </div>
                
                <div class="form-group button-group">
                    <button class="btn-ghost" @click="resetFilters">초기화</button>
                    <button class="btn-primary" @click="searchData">🔍 검색</button>
                </div>
            </div>
        </section>

        <section class="data-list-section d-panel">
            <div class="list-header">
                <div class="summary">
                    검색 결과: 총 <strong>{{ filteredJournals.length }}</strong>건
                </div>
                <div class="actions">
                    <button class="btn-secondary btn-sm" @click="exportExcel">엑셀 다운로드</button>
                </div>
            </div>

            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th class="col-date">전표 일자</th>
                            <th class="col-no">전표 번호</th>
                            <th class="col-account">출처 (계좌/카드)</th>
                            <th class="col-preset">프리셋</th>
                            <th class="col-amt">금액 (원)</th>
                            <th class="col-remark">적요</th>
                            <th class="col-status">상태</th>
                            <th class="col-action">상세</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="journal in filteredJournals" :key="journal.je_header_id" class="data-row" @click="openDetailModal(journal)">
                            <td class="col-date mono">{{ formatDateTime(journal.je_date) }}</td>
                            <td class="col-no mono text-light">{{ journal.je_header_no }}</td>
                            <td class="col-account">{{ getAccountName(journal.bank_id) }}</td>
                            <td class="col-preset"><span class="preset-badge">{{ journal.preset_cd }}</span></td>
                            <td class="col-amt text-right font-bold text-blue">{{ journal.amount.toLocaleString() }}</td>
                            <td class="col-remark desc-text">{{ journal.remark || '-' }}</td>
                            <td class="col-status">
                                <span class="status-pill" :class="getStatusClass(journal.status)">
                                    {{ getStatusName(journal.status) }}
                                </span>
                            </td>
                            <td class="col-action">
                                <button class="btn-icon view" @click.stop="openDetailModal(journal)" title="상세보기">📄</button>
                            </td>
                        </tr>
                        <tr v-if="filteredJournals.length === 0">
                            <td colspan="8" class="empty-state">조건에 일치하는 전표가 없습니다.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Transition name="fade">
            <div v-if="detailModal.open" class="modal-overlay" @click.self="closeDetailModal">
                <div class="modal-container modal-lg">
                    <header class="modal-header">
                        <div>
                            <h4>전표 상세 내역</h4>
                            <p class="modal-sub mono">{{ detailModal.data.je_header_no }}</p>
                        </div>
                        <button class="btn-close" @click="closeDetailModal">&times;</button>
                    </header>

                    <div class="modal-body">
                        <div class="header-summary-card">
                            <div class="summary-item">
                                <span class="label">전표 일자</span>
                                <span class="value mono">{{ formatDateTime(detailModal.data.je_date) }}</span>
                            </div>
                            <div class="summary-item">
                                <span class="label">거래 계좌</span>
                                <span class="value">{{ getAccountName(detailModal.data.bank_id) }}</span>
                            </div>
                            <div class="summary-item">
                                <span class="label">프리셋 (유형)</span>
                                <span class="value">{{ detailModal.data.preset_cd }}</span>
                            </div>
                            <div class="summary-item">
                                <span class="label">입력 출처</span>
                                <span class="value">{{ detailModal.data.source_cd }}</span>
                            </div>
                            <div class="summary-item full">
                                <span class="label">적요</span>
                                <span class="value">{{ detailModal.data.remark || '-' }}</span>
                            </div>
                        </div>

                        <div class="journal-lines-wrapper">
                            <h5 class="section-title">차/대변 분개 내역 (Lines)</h5>
                            <table class="lines-table">
                                <thead>
                                    <tr>
                                        <th style="width: 80px; text-align: center;">구분</th>
                                        <th>계정과목</th>
                                        <th>적요 (Remark)</th>
                                        <th style="width: 140px; text-align: right;">차변 (Debit)</th>
                                        <th style="width: 140px; text-align: right;">대변 (Credit)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="line in detailModal.lines" :key="line.line_id">
                                        <td class="text-center">
                                            <span :class="['dc-badge', line.dc_flag === 'D' ? 'badge-d' : 'badge-c']">
                                                {{ line.dc_flag === 'D' ? '차변' : '대변' }}
                                            </span>
                                        </td>
                                        <td>[{{ line.acct_cd }}] {{ line.acct_nm }}</td>
                                        <td>{{ line.remark || '-' }}</td>
                                        <td class="text-right mono font-bold text-blue">{{ line.dc_flag === 'D' ? line.amount.toLocaleString() : '' }}</td>
                                        <td class="text-right mono font-bold text-red">{{ line.dc_flag === 'C' ? line.amount.toLocaleString() : '' }}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="3" class="text-right font-bold">합 계</td>
                                        <td class="text-right mono font-bold text-blue">{{ detailModal.totalDebit.toLocaleString() }}</td>
                                        <td class="text-right mono font-bold text-red">{{ detailModal.totalCredit.toLocaleString() }}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <footer class="modal-footer flex-between">
                        <div class="left-actions">
                            <button v-if="detailModal.data.status === 'INIT'" class="btn-danger" @click="deleteJournal">전표 삭제</button>
                        </div>
                        <div class="right-actions">
                            <button class="btn-secondary" @click="closeDetailModal">닫기</button>
                            <button v-if="detailModal.data.status === 'INIT'" class="btn-primary" @click="updateStatus('POSTED')">확정 처리</button>
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
// 1. Mock Data & Masters
// ==========================================
const myAccounts = ref([
    { type: '입출금 통장', items: [{ id: 'ACC_001', name: '신한 주거래통장' }, { id: 'ACC_002', name: '카카오뱅크 생활비' }] },
    { type: '신용/체크카드', items: [{ id: 'CARD_001', name: '현대카드 Zero' }] }
]);

const getAccountName = (bankId) => {
    for (const group of myAccounts.value) {
        const acc = group.items.find(i => i.id === bankId);
        if (acc) return acc.name;
    }
    return bankId || '-';
};

// ==========================================
// 2. State Management (Filters & List)
// ==========================================
const getTodayStr = () => new Date().toISOString().split('T')[0];
const getFirstDayOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

const filters = reactive({
    startDate: getFirstDayOfMonth(),
    endDate: getTodayStr(),
    bankId: '',
    status: '',
    keyword: ''
});

const journalList = ref([]);
const filteredJournals = ref([]);

// 더미 데이터 로드
onMounted(() => {
    searchData();
});

const searchData = () => {
    journalList.value = [
        { je_header_id: 1, je_header_no: '202603-000001-M', je_date: '2026-03-08 12:30:00', bank_id: 'CARD_001', preset_cd: 'EXP_MEAL', amount: 15000, remark: '점심 식사', status: 'INIT', source_cd: 'MANUAL' },
        { je_header_id: 2, je_header_no: '202603-000002-X', je_date: '2026-03-08 18:45:00', bank_id: 'ACC_001', preset_cd: 'EXP_TRANS', amount: 2500, remark: '택시비', status: 'POSTED', source_cd: 'EXCEL_UPLOAD' },
        { je_header_id: 3, je_header_no: '202603-000003-M', je_date: '2026-03-09 09:00:00', bank_id: 'ACC_002', preset_cd: 'INC_SALARY', amount: 3500000, remark: '3월 급여', status: 'CONFIRM', source_cd: 'MANUAL' }
    ];
    applyFilters();
};

const applyFilters = () => {
    filteredJournals.value = journalList.value.filter(j => {
        const dateMatch = j.je_date.substring(0, 10) >= filters.startDate && j.je_date.substring(0, 10) <= filters.endDate;
        const bankMatch = filters.bankId ? j.bank_id === filters.bankId : true;
        const statusMatch = filters.status ? j.status === filters.status : true;
        
        let keywordMatch = true;
        if (filters.keyword) {
            const kw = filters.keyword.toLowerCase();
            keywordMatch = j.je_header_no.toLowerCase().includes(kw) || 
                           j.preset_cd.toLowerCase().includes(kw) || 
                           (j.remark && j.remark.toLowerCase().includes(kw));
        }

        return dateMatch && bankMatch && statusMatch && keywordMatch;
    });
};

const resetFilters = () => {
    filters.startDate = getFirstDayOfMonth();
    filters.endDate = getTodayStr();
    filters.bankId = '';
    filters.status = '';
    filters.keyword = '';
    searchData();
};

// ==========================================
// 3. Detail Modal Logic
// ==========================================
const detailModal = reactive({
    open: false, data: {}, lines: [], totalDebit: 0, totalCredit: 0
});

const openDetailModal = async (journal) => {
    detailModal.data = journal;
    
    // 더미 분개 라인
    if (journal.preset_cd === 'EXP_MEAL') {
        detailModal.lines = [
            { line_id: 1, dc_flag: 'D', acct_cd: '5110', acct_nm: '식비', remark: journal.remark, amount: journal.amount },
            { line_id: 2, dc_flag: 'C', acct_cd: '2110', acct_nm: '미지급금 (신용카드)', remark: journal.remark, amount: journal.amount }
        ];
    } else if (journal.preset_cd === 'INC_SALARY') {
        detailModal.lines = [
            { line_id: 1, dc_flag: 'D', acct_cd: '1110', acct_nm: '보통예금', remark: journal.remark, amount: journal.amount },
            { line_id: 2, dc_flag: 'C', acct_cd: '4110', acct_nm: '급여수익', remark: journal.remark, amount: journal.amount }
        ];
    } else {
        detailModal.lines = [
            { line_id: 1, dc_flag: 'D', acct_cd: '5120', acct_nm: '여비교통비', remark: journal.remark, amount: journal.amount },
            { line_id: 2, dc_flag: 'C', acct_cd: '1110', acct_nm: '보통예금', remark: journal.remark, amount: journal.amount }
        ];
    }

    detailModal.totalDebit = detailModal.lines.filter(l => l.dc_flag === 'D').reduce((sum, l) => sum + l.amount, 0);
    detailModal.totalCredit = detailModal.lines.filter(l => l.dc_flag === 'C').reduce((sum, l) => sum + l.amount, 0);
    detailModal.open = true;
};

const closeDetailModal = () => detailModal.open = false;

const deleteJournal = () => {
    if(confirm('이 전표를 삭제하시겠습니까?')) {
        alert('삭제 완료');
        closeDetailModal();
        searchData();
    }
};

const updateStatus = (status) => {
    if(confirm(`이 전표를 ${status} 상태로 변경하시겠습니까?`)) {
        alert('상태 변경 완료');
        closeDetailModal();
        searchData();
    }
};

const exportExcel = () => alert('조회된 목록을 엑셀로 다운로드합니다.');

// ==========================================
// 4. Utility Functions
// ==========================================
const formatDateTime = (dt) => dt ? dt.substring(0, 16) : '';
const getStatusName = (status) => ({ 'INIT': '초기 입력', 'POSTED': '확정', 'CONFIRM': '마감 완료' }[status] || status);
const getStatusClass = (status) => ({ 'INIT': 'bg-gray', 'POSTED': 'bg-green', 'CONFIRM': 'bg-purple' }[status] || 'bg-gray');
</script>

<style lang="scss" scoped>
/* 색상 변수 */
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
$purple: #8b5cf6;

.journal-inquiry-management {
    max-width: 1280px; margin: 0 auto; padding: 24px;
    font-family: 'Pretendard', sans-serif; color: $text-main;

    .page-header {
        margin-bottom: 24px;
        h2 { margin: 0 0 8px 0; font-size: 24px; font-weight: 800; }
        p { margin: 0; color: $text-sub; font-size: 14px; }
    }
}

.d-panel {
    background: $bg-white; border-radius: 12px; border: 1px solid $border-color;
    padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.02); margin-bottom: 20px;
}

/* =======================================
   💡 필터 섹션 CSS (Flexbox & flex-wrap)
======================================= */
.search-filter-section {
    .filter-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 16px 20px; /* 세로 16px, 가로 20px 간격 */
        align-items: flex-end; /* 수평 하단 정렬 (버튼과 Input 맞춤) */
    }

    .form-group {
        display: flex; 
        flex-direction: column; 
        gap: 8px;
        /* 기본적으로 줄어들고 늘어나도록 하되, 최소 너비를 설정 */
        flex: 1 1 160px; 
        
        label { 
            font-size: 13px; font-weight: 700; color: $text-sub; 
        }
        
        input[type="text"], input[type="date"], select {
            width: 100%;
            height: 40px; /* 고정 높이 */
            padding: 0 12px;
            border: 1px solid #ced4da;
            border-radius: 8px;
            font-size: 14px;
            box-sizing: border-box;
            outline: none;
            transition: border-color 0.2s;
            &:focus { border-color: $primary; box-shadow: 0 0 0 2px rgba($primary, 0.1); }
        }
    }

    /* 특정 그룹 유동성 조정 */
    .period-group {
        flex: 1.5 1 280px; /* 날짜창 2개가 찌그러지지 않도록 최소 너비 방어 */
        .date-range {
            display: flex; align-items: center; gap: 8px;
            input { flex: 1; font-family: monospace; font-size: 13px; }
            .tilde { color: $text-light; font-weight: 700; flex: 0 0 auto; }
        }
    }

    .keyword-group { 
        flex: 2 1 220px; /* 키워드 검색은 남는 공간을 더 많이 차지하도록 설정 */
    }
    
    .button-group {
        flex: 0 0 auto; /* 버튼은 내용물 크기만큼만 차지하고 찌그러지거나 늘어나지 않음 */
        flex-direction: row; 
        gap: 8px;
        height: 40px; /* Label 영역 공간을 비우기 위해 높이만 40px로 고정 */
        
        button {
            height: 100%; /* 부모 높이(40px) 꽉 채우기 */
            padding: 0 20px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            transition: 0.2s;
            display: flex; align-items: center; justify-content: center;
        }

        .btn-ghost { 
            background: $bg-white; color: $text-sub; border: 1px solid #ced4da; 
            &:hover { background: #f8fafc; border-color: $text-sub; } 
        }
        .btn-primary { 
            background: $primary; color: white; border: none; 
            &:hover { background: $primary-hover; } 
        }
    }
}

/* =======================================
   메인 리스트 및 모달 CSS 
======================================= */
.data-list-section {
    padding: 0; overflow: hidden;
    .list-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid $border-color; .summary { font-size: 14px; color: $text-sub; strong { color: $primary; font-size: 15px; font-weight: 800; } } .btn-secondary { background: $bg-white; border: 1px solid #ced4da; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; &:hover { background: #f1f3f5; } } }
    .data-table-wrapper { overflow-x: auto; max-height: 60vh; overflow-y: auto; }
    .data-table {
        width: 100%; border-collapse: collapse; text-align: left; min-width: 1000px;
        th { background: #f8fafc; padding: 14px 16px; font-size: 13px; font-weight: 700; color: $text-sub; border-bottom: 1px solid $border-color; position: sticky; top: 0; z-index: 10; box-shadow: 0 1px 0 $border-color; }
        td { padding: 14px 16px; vertical-align: middle; border-bottom: 1px solid $border-color; font-size: 14px; }
        .data-row { cursor: pointer; transition: 0.2s; &:hover { background: #f0fdf4; } }
        .col-date { width: 140px; } .col-no { width: 160px; font-size: 13px; } .col-account { width: 160px; font-weight: 600; } .col-preset { width: 140px; } .col-amt { width: 140px; } .col-remark { width: auto; max-width: 250px; } .col-status { width: 100px; text-align: center; } .col-action { width: 60px; text-align: center; }
        .preset-badge { background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; font-family: monospace; }
        .status-pill { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 800; &.bg-gray { background: #f1f5f9; color: #475569; } &.bg-green { background: #ecfdf5; color: #047857; } &.bg-purple { background: #f3e8ff; color: #7e22ce; } }
        .desc-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .text-right { text-align: right; } .font-bold { font-weight: 700; } .text-blue { color: $blue; } .text-light { color: $text-light; } .mono { font-family: monospace; }
        .btn-icon { background: none; border: none; font-size: 18px; cursor: pointer; transition: 0.2s; &:hover { transform: scale(1.1); } } .empty-state { text-align: center; padding: 60px; color: $text-light; }
    }
}

.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(2px); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.modal-container {
    background: $bg-white; width: 100%; display: flex; flex-direction: column; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.25); &.modal-lg { max-width: 850px; max-height: 90vh; }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px; border-bottom: 1px solid $border-color; h4 { margin: 0 0 6px 0; font-size: 20px; font-weight: 800; } .modal-sub { margin: 0; font-size: 14px; color: $primary; font-weight: 700; } .btn-close { background: none; border: none; font-size: 28px; line-height: 1; color: $text-light; cursor: pointer; &:hover { color: $text-main; } } }
    .modal-body { padding: 24px; overflow-y: auto; }
    .header-summary-card { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px; .summary-item { display: flex; flex-direction: column; gap: 4px; &.full { grid-column: 1 / -1; } .label { font-size: 12px; color: $text-sub; font-weight: 700; } .value { font-size: 15px; color: $text-main; font-weight: 600; &.mono { font-family: monospace; } } } }
    .journal-lines-wrapper { border: 1px solid $border-color; border-radius: 12px; overflow: hidden; .section-title { margin: 0; padding: 16px 20px; background: $bg-white; border-bottom: 1px solid $border-color; font-size: 16px; font-weight: 800; } .lines-table { width: 100%; border-collapse: collapse; font-size: 14px; th { background: #f8fafc; padding: 12px; border-bottom: 1px solid $border-color; color: $text-sub; } td { padding: 14px 12px; border-bottom: 1px solid $border-color; } .dc-badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 800; } .badge-d { background: #dbeafe; color: #1e40af; } .badge-c { background: #fee2e2; color: #991b1b; } tfoot td { background: #f8fafc; font-size: 15px; border-top: 2px solid $text-main; } } }
    .modal-footer { padding: 20px 24px; border-top: 1px solid $border-color; background: $bg-white; }
    .flex-between { display: flex; justify-content: space-between; align-items: center; } .right-actions { display: flex; gap: 12px; }
}

.btn-primary { background: $primary; color: white; border: none; padding: 10px 24px; font-size: 14px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: 0.2s; &:hover { background: $primary-hover; } }
.btn-secondary { background: white; color: $text-main; border: 1px solid #ced4da; padding: 10px 24px; font-size: 14px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: 0.2s; &:hover { background: #f1f3f5; } }
.btn-danger { background: white; color: $danger; border: 1px solid #fca5a5; padding: 10px 20px; font-size: 14px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: 0.2s; &:hover { background: #fef2f2; } }

.text-center { text-align: center; } .text-right { text-align: right; } .mono { font-family: monospace; } .font-bold { font-weight: 700; } .text-blue { color: $blue; } .text-red { color: $danger; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; } .fade-enter-from, .fade-leave-to { opacity: 0; }
</style>