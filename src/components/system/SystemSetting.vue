<template>
    <div class="common-code-management">
        <section class="page-header">

            <div class="top-controls d-panel">
                <div class="filter-group">
                    <div class="input-box">
                        <label>시스템 코드</label>
                        <input type="text" v-model="filters.systemCd" placeholder="ex) SYS, ACC"
                            @keyup.enter="searchHeaders">
                    </div>
                    <div class="input-box">
                        <label>코드 유형 (Code Type)</label>
                        <input type="text" v-model="filters.codeType" placeholder="ex) BANK_CD"
                            @keyup.enter="searchHeaders">
                    </div>
                    <div class="input-box">
                        <label>코드 설명 (Desc)</label>
                        <input type="text" v-model="filters.codeDesc" placeholder="설명 검색" @keyup.enter="searchHeaders">
                    </div>
                    <button class="btn-primary" @click="searchHeaders">🔍 검색</button>
                </div>

                <div class="global-actions">
                    <span class="change-count" v-if="changedCount > 0">
                        수정 대기: <strong>{{ changedCount }}</strong>건
                    </span>
                    <!-- <button class="btn-save" @click="saveAll" :disabled="changedCount === 0">
                        💾 전체 저장
                    </button> -->
                </div>
            </div>
        </section>

        <div class="split-layout">

            <section class="pane header-pane d-panel">
                <div class="pane-header">
                    <h3>코드 그룹 (Header)</h3>
                    <div>
                        <button class="btn-sm btn-outline" @click="addHeaderRow">+ 행 추가</button>
                        <button class="btn-sm btn-save" @click="saveHeader">💾 저장</button>
                    </div>
                </div>

                <div class="table-wrapper">
                    <table class="edit-table">
                        <thead>
                            <tr>
                                <th style="width: 40px;">상태</th>
                                <th>시스템</th>
                                <th>공통코드타입</th>
                                <th>설명</th>
                                <th style="width: 50px;">삭제</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, idx) in header.data" :key="row.headerId"
                                :class="{ 'is-selected': header.selected?.headerId === row.headerId, 'is-deleted': row.trxType === 'D' }"
                                @click="selectHeader(row)">

                                <td class="col-status">
                                    <span v-if="row.trxType" class="trx-badge" :class="`badge-${row.trxType}`">{{
                                        row.trxType }}</span>
                                </td>

                                <td>
                                    <input type="text" v-model="row.systemCd" @input="markAsUpdated(row)"
                                        :readonly="row.trxType === 'D'">
                                </td>
                                <td>
                                    <input type="text" v-model="row.codeType" @input="markAsUpdated(row)"
                                        :readonly="row.trxType !== 'C'">
                                </td>
                                <td>
                                    <input type="text" v-model="row.codeDesc" @input="markAsUpdated(row)"
                                        :readonly="row.trxType === 'D'">
                                </td>

                                <td class="col-action">
                                    <button class="btn-icon-del" @click.stop="removeRow(header.data, row, idx)"
                                        title="삭제">✕</button>
                                </td>
                            </tr>
                            <tr v-if="header.data.length === 0">
                                <td colspan="5" class="empty-msg">조회된 코드 그룹이 없습니다.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="pane detail-pane d-panel">
                <div class="pane-header">
                    <div class="titles">
                        <h3>상세 코드 (Detail)</h3>
                    </div>
                    <div>
                        <button class="btn-sm btn-outline" @click="addDetailRow"
                            :disabled="!header.selected || header.selected?.trxType === 'C'">
                            + 행 추가
                        </button>
                        <button class="btn-sm btn-save" @click="saveDetail">💾 저장</button>
                    </div>
                </div>

                <div class="table-wrapper">
                    <table class="edit-table">
                        <thead>
                            <tr>
                                <th style="width: 40px;">상태</th>
                                <th>상세 코드 (Code)</th>
                                <th>코드명 (Name)</th>
                                <th style="width: 60px;">정렬</th>
                                <th style="width: 80px;">사용여부</th>
                                <th>속성(Attr 01)</th>
                                <th style="width: 50px;">삭제</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, idx) in detail.data" :key="idx"
                                :class="{ 'is-deleted': row.trxType === 'D' }">

                                <td class="col-status">
                                    <span v-if="row.trxType" class="trx-badge" :class="`badge-${row.trxType}`">{{
                                        row.trxType }}</span>
                                </td>

                                <td>
                                    <input type="text" v-model="row.code" @input="markAsUpdated(row)"
                                        :readonly="row.trxType !== 'C'">
                                </td>
                                <td>
                                    <input type="text" v-model="row.name" @input="markAsUpdated(row)"
                                        :readonly="row.trxType === 'D'">
                                </td>
                                <td>
                                    <input type="number" v-model.number="row.sort" @input="markAsUpdated(row)"
                                        :readonly="row.trxType === 'D'" class="text-center">
                                </td>
                                <td>
                                    <select v-model="row.enabledFlag" @change="markAsUpdated(row)"
                                        :disabled="row.trxType === 'D'">
                                        <option value="Y">Y</option>
                                        <option value="N">N</option>
                                    </select>
                                </td>
                                <td>
                                    <input type="text" v-model="row.attribute01" @input="markAsUpdated(row)"
                                        placeholder="속성1" :readonly="row.trxType === 'D'">
                                </td>

                                <td class="col-action">
                                    <button class="btn-icon-del" @click="removeRow(detail.data, row, idx)"
                                        title="삭제">✕</button>
                                </td>
                            </tr>
                            <tr v-if="detail.data.length === 0">
                                <td colspan="7" class="empty-msg">
                                    {{ header.selected?.headerId ? '등록된 상세 코드가 없습니다.' : '좌측에서 코드 그룹을 선택해주세요.' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
    import mariaApi from '@scripts/util/mariaApi.js';

    // 1. 상태 관리
    const filters = reactive({
        systemCd: '', 
        codeType: '', 
        codeDesc: ''
    });
    const header = reactive({
        base: [],
        data: [],
        selected: null
    });
    const detail = reactive({
        data: []
    });

    // 변경된 건수 계산 (C, U, D 상태인 모든 row)
    const changedCount = computed(() => {
        const hCount = header.data.filter(h => h.trxType).length;
        const dCount = detail.data.filter(d => d.trxType).length;
        return hCount + dCount;
    });

    // 2. Data Fetching (조회)
    onMounted(() => {
        searchHeaders();
    });

    /**
     * 헤더 조회
     */
    const searchHeaders = async () => {
        const { data } = await mariaApi.get('/api/settings/headers', { params: filters.value });
        
        header.data = data;
        header.data.forEach(h => h.trxType = '');
        header.base = JSON.parse(JSON.stringify(header.data)); // deepCopy
        // 초기화
        header.selected = null;
        detail.data = [];
    };

    const selectHeader = async (headerRow) => {
        if (headerRow.trxType === 'C') { // 신규 추가한 헤더는 DB에 없으므로 디테일도 비움
            detail.data = [];
            return;
        }

        if (headerRow.trxType === 'D') { // 삭제된 행은 클릭 방지
            return false;
        }; 

        const updateCnt = header.data.filter(h => h.trxType).length;
        if (updateCnt > 0) {
            const question = confirm("변경내용이 있으면 전부 초기화됩니다. 진행합니까?");
            if (!question) {
                return false;
            } else {
                header.data = JSON.parse(JSON.stringify(header.base));
            }
        }
        header.selected = headerRow;

        // API Call: detail 데이터 조회
        const { data } = await mariaApi.get(`/api/settings/details/${headerRow.headerId}`);
        detail.data = data;

    };

    // 3. Grid 행 추가 (Insert)
    const addHeaderRow = () => {
        if (header.data.filter(h => h.trxType).length > 0) {
            alert("1개씩만 가능합니다.");
            return false;
        }
        header.data.unshift({
            headerId: -1, // DB 저장 시 발급 (Auto Increment 등)
            systemCd: '',
            codeType: '',
            codeDesc: '',
            trxType: 'C' // 💡 신규 생성 상태
        });
    };

    const addDetailRow = () => {
        if (!header.selected) {
            return false;
        }

        detail.data.unshift({
            headerId: header.selected.headerId,
            code: '',
            name: '',
            sort: detail.data.length + 1,
            enabledFlag: 'Y',
            attribute01: '',
            trxType: 'C' // 💡 신규 생성 상태
        });
    };

    // 4. Grid 행 상태 업데이트 (Update)
    const markAsUpdated = (row) => {
        // 신규 생성(C)이거나 삭제(D) 상태가 아닐 때만 업데이트(U)로 변경
        if (!row.trxType) {
            row.trxType = 'U';
        }
    };

    // 5. Grid 행 삭제 (Delete)
    const removeRow = (list, row, index) => {
        if (row.trxType === 'C') {
            // 아직 DB에 안 간 신규 행은 그냥 배열에서 제거
            list.splice(index, 1);
            if (list === header.data && row.headerId === header.selected.headerId) {
                header.selected = null;
                detailList.value = [];
            }
        } else {
            // 이미 DB에 있는 행은 삭제 상태(D)로 토글
            row.trxType = row.trxType === 'D' ? 'U' : 'D';
        }
    };

    const saveHeader = async () => {
        const headerTarget = header.data.filter(h => h.trxType && h.trxType != '');

        if (headerTarget.length < 1) {
            alert("저장할 대상그룹이 없습니다.");
            return false;
        }

        const result = await mariaApi.post("/api/settings/headers", { reqList: headerTarget });

        if (result.success) {
            searchHeaders();
        }
    }

    const saveDetail = async () => {
        const detailTarget = detail.data.filter(d => d.trxType && d.trxType != '');

        if (detailTarget.length < 1) {
            return false;
        }

        const result = await mariaApi.post("/api/settings/details", { reqList: detailTarget });

        if (result.success) {
            selectHeader(header.selected);
        }
    }
</script>

<style lang="scss" scoped>
/* 색상 변수 */
$primary: #4b74ff;
$primary-hover: #3848c7;
$success: #10b981;
$warning: #f59e0b;
$danger: #ef4444;
$bg-light: #f8fafc;
$border: #e2e8f0;
$text-main: #1e293b;
$text-sub: #64748b;

.common-code-management {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
    font-family: 'Pretendard', sans-serif;
    color: $text-main;
}

.page-header {
    margin-bottom: 20px;

    .title-area h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 800;
    }

    .title-area p {
        margin: 0 0 16px 0;
        color: $text-sub;
        font-size: 14px;
    }
}

.d-panel {
    background: #fff;
    border: 1px solid $border;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);
}

/* 최상단 검색 필터 */
.top-controls {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 16px 20px;

    .filter-group {
        display: flex;
        gap: 16px;
        align-items: flex-end;

        .input-box {
            display: flex;
            flex-direction: column;
            gap: 6px;

            label {
                font-size: 12px;
                font-weight: 700;
                color: $text-sub;
            }

            input {
                padding: 8px 12px;
                border: 1px solid $border;
                border-radius: 6px;
                font-size: 14px;
                width: 160px;
                outline: none;

                &:focus {
                    border-color: $primary;
                }
            }
        }
    }

    .global-actions {
        display: flex;
        align-items: center;
        gap: 16px;

        .change-count {
            font-size: 14px;
            color: $danger;
            font-weight: 600;

            strong {
                font-weight: 800;
            }
        }
    }
}

/* 메인 스플릿 레이아웃 */
.split-layout {
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 20px;
    align-items: flex-start;
}

.pane {
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 700px;

    .pane-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid $border;

        h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 800;
        }

        .sub-text {
            margin-left: 12px;
            font-size: 13px;
            color: $primary;
            font-weight: 600;
        }
    }

    .table-wrapper {
        overflow-y: auto;
        flex: 1;
    }
}

/* 💡 에디터블 그리드 테이블 */
.edit-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;

    th {
        background: $bg-light;
        padding: 10px 12px;
        font-size: 12px;
        font-weight: 700;
        color: $text-sub;
        border-bottom: 1px solid $border;
        position: sticky;
        top: 0;
        z-index: 5;
        box-shadow: 0 1px 0 $border;
    }

    td {
        padding: 4px 6px;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
        transition: 0.2s;
    }

    /* 행(Row) 상호작용 디자인 */
    tr {
        cursor: pointer;
    }

    tr.is-selected td {
        background-color: #eff6ff;
    }

    tr:hover:not(.is-selected) td {
        background-color: #f8fafc;
    }

    tr.is-deleted {
        opacity: 0.6;

        td input,
        td select {
            text-decoration: line-through;
            color: $danger;
        }
    }

    /* 💡 인라인 인풋 디자인 (평소엔 테두리 없음, 포커스 시 테두리 생성) */
    input[type="text"],
    input[type="number"],
    select {
        width: 100%;
        padding: 8px;
        border: 1px solid transparent;
        border-radius: 4px;
        background: transparent;
        font-size: 13px;
        box-sizing: border-box;
        outline: none;
        transition: 0.2s;
        color: $text-main;

        &:hover:not(:readonly):not(:disabled) {
            border-color: #cbd5e1;
            background: #fff;
        }

        &:focus:not(:readonly):not(:disabled) {
            border-color: $primary;
            background: #fff;
            box-shadow: 0 0 0 2px rgba($primary, 0.1);
        }

        &[readonly],
        &:disabled {
            color: $text-sub;
            cursor: not-allowed;
        }
    }

    .col-status {
        text-align: center;
    }

    .col-action {
        text-align: center;
    }

    .text-center {
        text-align: center;
    }

    /* 상태 뱃지 (C: 파랑, U: 주황, D: 빨강) */
    .trx-badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 900;

        &.badge-C {
            background: #dbeafe;
            color: #1e40af;
        }

        &.badge-U {
            background: #fef3c7;
            color: #b45309;
        }

        &.badge-D {
            background: #fee2e2;
            color: #b91c1c;
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
            font-weight: bold;
        }
    }

    .empty-msg {
        text-align: center;
        padding: 60px 0;
        color: #94a3b8;
        font-size: 14px;
    }
}

/* 버튼 유틸리티 */
.btn-primary {
    background: $primary;
    color: #fff;
    border: none;
    margin: 0px 3px;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;

    &:hover {
        background: $primary-hover;
    }
}

.btn-save {
    background: $success;
    color: #fff;
    border: none;
    margin: 0px 3px;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: 0.2s;

    &:hover:not(:disabled) {
        background: #059669;
        transform: translateY(-1px);
    }

    &:disabled {
        background: #cbd5e1;
        cursor: not-allowed;
    }
}

.btn-outline {
    background: #fff;
    color: $text-main;
    border: 1px solid $border;
    margin: 0px 3px;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;

    &:hover:not(:disabled) {
        background: #f1f5f9;
        border-color: #cbd5e1;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}</style>