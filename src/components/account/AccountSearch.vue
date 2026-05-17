<template>
    <div class="journal-inquiry-management">
        <h2 style="text-align: start; margin: 0 1.3rem;">{{ route.meta.title }}</h2>

        <section class="search-filter-section d-panel">
            <div class="filter-wrap">
                <div class="form-group">
                    <label>조회 기간</label>
                    <MDatePicker
                        :model-value="{ start: filters.schStartDt, end: filters.schEndDt }"
                        @update:model-value="onDateChange"
                    />
                </div>

                <div class="form-group">
                    <label>계좌/카드</label>
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
                    검색 결과: 총 <strong>{{ journalList.length }}</strong>건
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
                        <tr v-for="journal in journalList" :key="journal.jeHeaderId" class="data-row"
                            @click="openDetailModal(journal)">
                            <td class="col-date mono">{{ formatDateTime(journal.jeDate) }}</td>
                            <td class="col-no mono text-light">{{ journal.jeHeaderNo }}</td>
                            <td class="col-account">{{ journal.bankNm }}</td>
                            <td class="col-preset"><span class="preset-badge">{{ journal.presetCd }}</span></td>
                            <td class="col-amt text-right font-bold text-blue">{{ journal.amount.toLocaleString() }}</td>
                            <td class="col-remark desc-text">{{ journal.remark || '-' }}</td>
                            <td class="col-status">
                                <span class="status-pill" :class="getStatusClass(journal.status)">
                                    {{ getStatusName(journal.status) }}
                                </span>
                            </td>
                            <td class="col-action">
                                <button class="btn-icon view" @click.stop="openDetailModal(journal)"
                                    title="상세보기">📄</button>
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
            <div v-if="detailModal.open" class="modal-overlay" @click.self="closeDetailModal">
                <div class="modal-container modal-lg">
                    <header class="modal-header">
                        <div>
                            <div clas="title">전표 상세 내역</div>
                            <span class="modal-sub mono">{{ detailModal.data.jeHeaderNo }}</span>
                        </div>
                        <button class="btn-close" @click="closeDetailModal">&times;</button>
                    </header>

                    <div class="modal-body">
                        <div class="header-summary-card">
                            <div class="summary-item">
                                <span class="label">전표 일자</span>
                                <span class="value mono">{{ formatDateTime(detailModal.data.jeDate) }}</span>
                            </div>
                            <div class="summary-item">
                                <span class="label">거래 계좌</span>
                                <span class="value">{{ getAccountName(detailModal.data.bankNm) }}</span>
                            </div>
                            <div class="summary-item">
                                <span class="label">프리셋 (유형)</span>
                                <span class="value">{{ detailModal.data.presetCd }}</span>
                            </div>
                            <div class="summary-item">
                                <span class="label">입력 출처</span>
                                <span class="value">{{ detailModal.data.sourceNm }}</span>
                            </div>
                            <div class="summary-item full">
                                <span class="label">상태</span>
                                <span class="value">{{ getStatusName(detailModal.data.status) || '-' }}</span>
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
                                    <tr v-for="line in detailModal.lines" :key="line.jeLineId">
                                        <td class="text-center">
                                            <span :class="['dc-badge', line.lineType === 'D' ? 'badge-d' : 'badge-c']">
                                                {{ line.lineType === 'D' ? '차변' : '대변' }}
                                            </span>
                                        </td>
                                        <td>[{{ line.acctCd }}] {{ line.acctNm }}</td>
                                        <td>{{ line.remark || '-' }}</td>
                                        <td class="text-right mono font-bold text-blue">{{ line.lineType === 'D' ?
                                            line.amountDr.toLocaleString() : '' }}</td>
                                        <td class="text-right mono font-bold text-red">{{ line.lineType === 'C' ?
                                            line.amountCr.toLocaleString() : '' }}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="3" class="text-right font-bold">합 계</td>
                                        <td class="text-right mono font-bold text-blue">{{
                                            detailModal.totalDebit.toLocaleString() }}</td>
                                        <td class="text-right mono font-bold text-red">{{
                                            detailModal.totalCredit.toLocaleString() }}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <footer class="modal-footer flex-between">
                        <div class="left-actions"></div>
                        <div class="right-actions">
                            <button v-if="detailModal.data.status === 'INIT'" class="btn-danger" @click="deleteJournal">전표 삭제</button>
                        </div>
                    </footer>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
    import mariaApi from '@scripts/util/mariaApi.js';
    import MDatePicker    from '@/components/common/comp/MDatePicker.vue';
    import MMultiCheckBox from '@/components/common/comp/MMultiCheckBox.vue';

    const route = useRoute();
    // ==========================================
    // 1. Mock Data & Masters
    // ==========================================
    const myAccounts = ref([]);

    // ==========================================
    // 2. State Management (Filters & List)
    // ==========================================
    const getTodayStr = () => new Date().toISOString().split('T')[0];
    const getFirstDayOfMonth = () => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth() - 2, 2).toISOString().split('T')[0];
    };

    const filters = reactive({
        schStartDt: getFirstDayOfMonth(),
        schEndDt: getTodayStr(),
        bankId: '',
        status: '',
        keyword: ''
    });

    const journalList = ref([]);

    // 더미 데이터 로드
    onMounted(() => {
        searchData();
    });

    const searchData = async () => {
        const { data } = await mariaApi.get('/api/account/journal', { params: filters })
        console.log(data);
        journalList.value = data;
    };

    const resetFilters = () => {
        filters.schStartDt = getFirstDayOfMonth();
        filters.schEndDt = getTodayStr();
        filters.bankId = '';
        filters.status = '';
        filters.keyword = '';
        searchData();
    };

    const getAccountName = (bankId) => {
        for (const group of myAccounts.value) {
            const acc = group.items.find(i => i.id === bankId);
            if (acc) return acc.name;
        }
        return bankId || '-';
    };

// ==========================================
// 3. Detail Modal Logic
// ==========================================
const detailModal = reactive({
    open: false, 
    data: {}, 
    lines: [], 
    totalDebit: 0, 
    totalCredit: 0
});

    const openDetailModal = async (journal) => {
        const { data } = await mariaApi.get(`/api/account/journal/detail/${journal.jeHeaderId}`);

        detailModal.data = journal;
        detailModal.lines = data;
        detailModal.totalDebit = detailModal.lines.filter(l => l.lineType === 'D').reduce((sum, l) => sum + l.amountDr, 0);
        detailModal.totalCredit = detailModal.lines.filter(l => l.lineType === 'C').reduce((sum, l) => sum + l.amountCr, 0);
        detailModal.open = true;
    };

const closeDetailModal = () => detailModal.open = false;

const deleteJournal = () => {
    if (confirm('이 전표를 삭제하시겠습니까?')) {
        alert('삭제 완료');
        closeDetailModal();
        searchData();
    }
};

const updateStatus = (status) => {
    const check = confirm(`이 전표를 ${status} 상태로 변경하시겠습니까?`);
    if (!check) {
        return false;
    }



    alert('상태 변경 완료');
    closeDetailModal();
    searchData();
};

const exportExcel = () => alert('조회된 목록을 엑셀로 다운로드합니다.');

// ==========================================
// 4. Utility Functions
// ==========================================
    const onDateChange = ({ start, end }) => {
        filters.schStartDt = start;
        filters.schEndDt   = end;
        searchData();
    };

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
    max-width: 1280px;
    margin: 0 auto;
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

/* =======================================
   💡 필터 섹션 CSS (Flexbox & flex-wrap)
======================================= */
.search-filter-section {
    .filter-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 16px 20px;
        /* 세로 16px, 가로 20px 간격 */
        align-items: flex-end;
        /* 수평 하단 정렬 (버튼과 Input 맞춤) */
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        /* 기본적으로 줄어들고 늘어나도록 하되, 최소 너비를 설정 */
        flex: 1 1 160px;

        label {
            font-size: 13px;
            font-weight: 700;
            color: $text-sub;
        }

        input[type="text"],
        input[type="date"],
        select {
            width: 100%;
            height: 40px;
            /* 고정 높이 */
            padding: 0 12px;
            border: 1px solid #ced4da;
            border-radius: 8px;
            font-size: 14px;
            box-sizing: border-box;
            outline: none;
            transition: border-color 0.2s;

            &:focus {
                border-color: $primary;
                box-shadow: 0 0 0 2px rgba($primary, 0.1);
            }
        }
    }

    /* 특정 그룹 유동성 조정 */
    .period-group {
        flex: 1.5 1 280px;

        /* 날짜창 2개가 찌그러지지 않도록 최소 너비 방어 */
        .date-range {
            display: flex;
            align-items: center;
            gap: 8px;

            input {
                flex: 1;
                font-family: monospace;
                font-size: 13px;
            }

            .tilde {
                color: $text-light;
                font-weight: 700;
                flex: 0 0 auto;
            }
        }
    }

    .keyword-group {
        flex: 2 1 220px;
        /* 키워드 검색은 남는 공간을 더 많이 차지하도록 설정 */
    }

    .button-group {
        flex: 0 0 auto;
        /* 버튼은 내용물 크기만큼만 차지하고 찌그러지거나 늘어나지 않음 */
        flex-direction: row;
        gap: 8px;
        height: 40px;
        /* Label 영역 공간을 비우기 위해 높이만 40px로 고정 */

        button {
            height: 100%;
            /* 부모 높이(40px) 꽉 채우기 */
            padding: 0 20px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            transition: 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .btn-ghost {
            background: $bg-white;
            color: $text-sub;
            border: 1px solid #ced4da;

            &:hover {
                background: #f8fafc;
                border-color: $text-sub;
            }
        }

        .btn-primary {
            background: $primary;
            color: white;
            border: none;

            &:hover {
                background: $primary-hover;
            }
        }
    }
}

/* =======================================
   메인 리스트 및 모달 CSS 
======================================= */
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
            font-size: 14px;
            color: $text-sub;

            strong {
                color: $primary;
                font-size: 15px;
                font-weight: 800;
            }
        }

        .btn-secondary {
            background: $bg-white;
            border: 1px solid #ced4da;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;

            &:hover {
                background: #f1f3f5;
            }
        }
    }

    .data-table-wrapper {
        overflow-x: auto;
        max-height: 60vh;
        overflow-y: auto;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        min-width: 1000px;

        th {
            background: #f8fafc;
            padding: 14px 16px;
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
            padding: 14px 16px;
            vertical-align: middle;
            border-bottom: 1px solid $border-color;
            font-size: 14px;
        }

        .data-row {
            cursor: pointer;
            transition: 0.2s;

            &:hover {
                background: #f0fdf4;
            }
        }

        .col-date {
            width: 140px;
        }

        .col-no {
            width: 160px;
            font-size: 13px;
        }

        .col-account {
            width: 160px;
            font-weight: 600;
        }

        .col-preset {
            width: 140px;
        }

        .col-amt {
            width: 140px;
        }

        .col-remark {
            width: auto;
            max-width: 250px;
        }

        .col-status {
            width: 100px;
            text-align: center;
        }

        .col-action {
            width: 60px;
            text-align: center;
        }

        .preset-badge {
            background: #eef2ff;
            color: #4338ca;
            border: 1px solid #c7d2fe;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            font-family: monospace;
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

            &.bg-purple {
                background: #f3e8ff;
                color: #7e22ce;
            }
        }

        .desc-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .text-right {
            text-align: right;
        }

        .font-bold {
            font-weight: 700;
        }

        .text-blue {
            color: $blue;
        }

        .text-light {
            color: $text-light;
        }

        .mono {
            font-family: monospace;
        }

        .btn-icon {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            transition: 0.2s;

            &:hover {
                transform: scale(1.1);
            }
        }

        .empty-state {
            text-align: center;
            padding: 60px;
            color: $text-light;
        }
    }
}

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
        max-width: 850px;
        max-height: 90vh;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        border-bottom: 1px solid $border-color;

        .title {

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

    .header-summary-card {
        display: flex;
        justify-content: space-between;
        background: #f8fafc;
        padding: 1rem;
        border-radius: 0.7rem;
        border: 1px solid #e2e8f0;
        margin-bottom: 24px;

        .summary-item {
            display: flex;
            flex-direction: column;
            border-right: 1px solid #aaa;
            gap: 4px;
            flex: 1;

            .label {
                font-size: 0.65rem;
                color: $text-sub;
                font-weight: 600;
            }

            .value {
                font-size: 0.9rem;
                color: $text-main;
                font-weight: 700;

                &.mono {
                    font-family: monospace;
                }
            }
        }

        .summary-item:last-child {
            border: none;
        }
    }

    .journal-lines-wrapper {
        border: 1px solid $border-color;
        border-radius: 12px;
        overflow: hidden;

        .section-title {
            margin: 0;
            padding: 16px 20px;
            background: $bg-white;
            border-bottom: 1px solid $border-color;
            font-size: 16px;
            font-weight: 800;
        }

        .lines-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;

            th {
                background: #f8fafc;
                padding: 12px;
                border-bottom: 1px solid $border-color;
                color: $text-sub;
            }

            td {
                padding: 14px 12px;
                border-bottom: 1px solid $border-color;
            }

            .dc-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 800;
            }

            .badge-d {
                background: #dbeafe;
                color: #1e40af;
            }

            .badge-c {
                background: #fee2e2;
                color: #991b1b;
            }

            tfoot td {
                background: #f8fafc;
                font-size: 15px;
                border-top: 2px solid $text-main;
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

    &:hover {
        background: $primary-hover;
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

.btn-danger {
    background: white;
    color: $danger;
    border: 1px solid #fca5a5;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
        background: #fef2f2;
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

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}</style>