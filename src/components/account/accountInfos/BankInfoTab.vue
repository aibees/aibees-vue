<template>
    <section class="content-container">
        <div class="action-bar">
            <h3>계좌 목록</h3>
            <button class="btn-primary" @click.stop="openModal()">+ 신규 등록</button>
        </div>

        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="d-text-align-center">주계좌</th>
                        <th class="d-text-align-center">은행</th>
                        <th class="d-text-align-center">계좌명</th>
                        <th class="d-text-align-center">계좌번호</th>
                        <th class="d-text-align-center">관리주체</th>
                        <th class="d-text-align-center">용도</th>
                        <th class="d-text-align-center">상태</th>
                        <th class="d-text-align-center">관리</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(bank, index) in bankList" :key="bank.bankId">
                        <tr class="main-row" :class="{ 'is-open': bank.isExpanded }" @click="toggleRow(index)">
                            <td class="col-badge">
                                <span v-if="bank.mainFlag === 'Y'" class="badge-main">주</span>
                            </td>
                            <td class="col-bank">
                                {{ bank.bankCdNm }}
                            </td>
                            <td class="col-name">
                                <div class="bank-info-cell">
                                    <span class="bank-nm">{{ bank.bankNm }}</span>
                                    <span class="bank-alias">{{ bank.alias }}</span>
                                </div>
                            </td>
                            <td class="col-account">{{ bank.bankAcct }}</td>
                            <td class="col-acctCd">{{ bank.householdTypeNm }}</td>
                            <td class="col-type"><span class="type-tag">{{ bank.bankTypeNm }}</span></td>
                            <td class="col-status">
                                <span :class="['status-dot', bank.enabledFlag === 'Y' ? 'on' : 'off']"></span>
                                {{ bank.enabledFlag === 'Y' ? '사용중' : '중지' }}
                            </td>
                            <td class="col-action">
                                <button class="btn-edit-sm" @click.stop="openModal(bank)">수정</button>
                            </td>
                        </tr>

                        <tr v-if="bank.isExpanded" class="detail-row">
                            <td colspan="6" class="detail-cell">
                                <div class="detail-wrapper">
                                    <div class="detail-grid">
                                        <div class="detail-item">
                                            <span class="label">사용 한도:</span>
                                            <span class="value">{{ bank.limitAmt ? bank.limitAmt.toLocaleString() + '원'
                                                : '무제한' }}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="label">시작일자:</span>
                                            <span class="value">{{ bank.startDate || '-' }}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="label">연결계정:</span>
                                            <span class="value">{{ bank.acctCd || '-' }}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="label">가계단위:</span>
                                            <span class="value">{{ bank.householdType || '-' }}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="label">엑셀업로드:</span>
                                            <span class="value">{{ bank.excelableFlag === 'Y' ? '가능' : '불가' }}</span>
                                        </div>
                                        <div class="detail-item full-width">
                                            <span class="label">메모:</span>
                                            <span class="value">{{ bank.memo || '등록된 메모가 없습니다.' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </section>

    <Transition name="fade">
        <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
            <div class="modal-container">
                <header class="modal-header">
                    <h4>{{ formData.bankId ? '계좌 정보 수정' : '신규 계좌 등록' }}</h4>
                    <button class="btn-close" @click="closeModal">&times;</button>
                </header>

                <div class="modal-body">
                    <form id="bankForm" @submit.prevent="saveBankInfo">
                        <div class="form-grid">
                            <!-- <div class="form-group full-width">
                                <label>별명 (Alias)</label>
                                <input type="text" v-model="formData.alias" placeholder="예: 생활비 통장">
                            </div> -->
                            <div class="form-group">
                                <label>계좌 명 <span class="required">*</span></label>
                                <input type="text" v-model="formData.bankNm" required>
                            </div>

                            <div class="form-group">
                                <label>귀속은행코드</label>
                                <div class="custom-autosearch" @click.stop>
                                    <input 
                                        type="text" 
                                        v-model="autoSearch.bankCd.keyword" 
                                        @focus="openDropdown('bankCd', autoSearch.bankCd)"
                                        @input="handleInput('bankCd', autoSearch.bankCd)"
                                        placeholder="귀속은행 검색 (2글자 이상)"
                                        class="search-input"
                                    >
                                    
                                    <div class="dropdown-list" v-show="autoSearch.bankCd.dropdown">
                                        <ul v-if="autoSearch.bankCd.filteredOption.length > 0">
                                            <li 
                                                v-for="option in autoSearch.bankCd.filteredOption" 
                                                :key="option.code" 
                                                @click="selectOption(autoSearch.bankCd, option)"
                                            >
                                                <span class="acc-text">({{ option.code }}) {{ option.name }}</span>
                                            </li>
                                        </ul>
                                        <div class="status-msg empty" v-else-if="autoSearch.bankCd.keyword && autoSearch.bankCd.keyword.length > 0">
                                            검색 결과가 없습니다.
                                        </div>
                                        <div class="status-msg info" v-else>
                                            검색어를 2글자 이상 입력해주세요.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>계좌번호 <span class="required">*</span></label>
                                <input type="text" v-model="formData.bankAcct" required>
                            </div>

                            <div class="form-group">
                                <label>사용용도</label>
                                <select v-model="formData.bankType">
                                    <option v-for="opt in options.bankType" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>사용 한도</label>
                                <input type="number" v-model="formData.limitAmt" placeholder="비워두면 무제한">
                            </div>

                            <div class="form-group">
                                <label>시작일자</label>
                                <input type="date" v-model="formData.startDate">
                            </div>

                            <div class="form-group">
                                <label>연결계정 (acctCd)</label>
                                <input type="text" v-model="formData.acctCd">
                            </div>

                            <div class="form-group">
                                <label>가계단위</label>
                                <select v-model="formData.householdType">
                                    <option v-for="opt in options.household" :key="opt.code" :value="opt.code" :selected="opt.code == formData.householdType">{{ opt.name }}</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group full-width mt-15">
                            <label>메모</label>
                            <textarea v-model="formData.memo" rows="3" placeholder="추가적인 메모를 입력하세요"></textarea>
                        </div>

                        <div class="checkbox-group mt-15">
                            <label class="checkbox-item">
                                <input type="checkbox" v-model="formData.mainFlag" true-value="Y" false-value="N">
                                <span>주계좌 설정</span>
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" v-model="formData.enabledFlag" true-value="Y" false-value="N">
                                <span>사용 활성화</span>
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" v-model="formData.displayFlag" true-value="Y" false-value="N">
                                <span>대쉬보드 노출</span>
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" v-model="formData.excelableFlag" true-value="Y" false-value="N">
                                <span>엑셀 업로드 허용</span>
                            </label>
                        </div>
                    </form>
                </div>

                <footer class="modal-footer">
                    <button type="button" class="btn-secondary" @click="closeModal">취소</button>
                    <button type="submit" form="bankForm" class="btn-primary">저장하기</button>
                </footer>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import mariaApi from '@scripts/util/mariaApi.js';
import { getResourceList } from '@scripts/util/common/SettingResource.js';

const isModalOpen = ref(false);
const bankList = ref([]);
const options = reactive({
    household: [],
    bank: [],
    acctType: []
});

const initialForm = {
    bankId: null, 
    bankAcct: '', 
    bankCd: '', 
    bankNm: '', 
    bankType: '입출금',
    limitAmt: null, 
    startDate: new Date().toISOString().slice(0, 10),
    enabledFlag: 'Y', 
    displayFlag: 'Y', 
    excelableFlag: 'Y', 
    mainFlag: 'N',
    alias: '', 
    memo: '', 
    acctCd: '', 
    householdType: ''
};

const formData = reactive({ ...initialForm });

onMounted(async () => {
    options.bank = (await getResourceList('ACCOUNT', 'BANK_CODE'))
                    .map(resource => { return { code: resource.code, name: resource.name } });
    options.household = (await getResourceList('ACCOUNT', 'HOUSEHOLD'))
                    .map(resource => { return { code: resource.code, name: resource.name } });
    options.bankType = (await getResourceList('ACCOUNT', 'ACCOUNT_TYPE'))
                    .map(resource => { return { code: resource.code, name: resource.name } });
    await getInfoList();
});

const getInfoList = async () => {
    const { data } = await mariaApi.get('/api/account/info/bank-accounts');
    bankList.value = data;
    bankList.value.forEach(b => {
        const bankOpt = options.bank.filter(cd => cd.code == b.bankCd);
        if (bankOpt.length > 0) {
            b.bankCdNm = bankOpt[0].name;
        }
        const houseOpt = options.household.filter(cd => cd.code == b.householdType);
        if (houseOpt.length > 0) {
            b.householdTypeNm = houseOpt[0].name;
        }
        const bankTypeOpt = options.bankType.filter(cd => cd.code == b.bankType);
        if (bankTypeOpt.length > 0) {
            b.bankTypeNm = bankTypeOpt[0].name;
        }
    });
}

const toggleRow = (index) => {
    bankList.value[index].isExpanded = !bankList.value[index].isExpanded;
};

const openModal = (data = null) => {
    if (data) {
        Object.assign(formData, data);
        autoSearch.bankCd.keyword = `(${data.bankCd}) ${data.bankCdNm}`;
    } else {
        Object.assign(formData, initialForm);
    }
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const saveBankInfo = async () => {
    if (formData.bankId) {
        // update
        console.log(formData);
        await mariaApi.put('/api/account/info/bank-accounts', formData);
    } else {
        // save
        await mariaApi.post('/api/account/info/bank-accounts', formData);
    }

    closeModal();
    await getInfoList();
};

/**
 * AUTO-SEARCH
 */
let searchTimeout = null;
const autoSearch = reactive({
    bankCd: {
        keyword: '',
        dropdown: false,
        filteredOption: []
    }
})

const openDropdown = (type, obj) => {
    const keyword = obj.keyword;
    obj.dropdown = true;
    
    // 포커스 시점에 2글자 이상이면 검색 진행, 아니면 초기화
    if (keyword && keyword.length > 0) {
        fetchOptions(type, obj);
    } else {
        obj.filteredOption = [];
    }
};

const handleInput = (type, obj) => {
    obj.dropdown = true;
    const keyword = obj.keyword;

    // 디바운스 적용 (300ms)
    if (searchTimeout) clearTimeout(searchTimeout);

    if (keyword.length < 1) {
        filteredAccounts.value = [];
        return false;
    }

    searchTimeout = setTimeout(() => {
        fetchOptions(type, obj);
    }, 300);
};

const fetchOptions = (type, obj) => {
    if ('bankCd' == type) {
        obj.filteredOption = options.bank.filter(b => b.code.includes(obj.keyword) || b.name.includes(obj.keyword));
    }
}

const selectOption = (obj, opt) => {
    formData.bankCd = opt.code;
    obj.keyword = `(${opt.code}) ${opt.name}`;
    obj.dropdown = false;
    obj.filteredoption = [];
}

</script>

<style lang="scss" scoped>
@use '@@/common.scss' as *;

/* =======================================
   Variables & Mixins
======================================= */
$primary: #4a90e2;
$primary-hover: #357abd;
$text-main: #333333;
$text-sub: #666666;
$text-light: #999999;
$bg-main: #f8f9fa;
$bg-white: #ffffff;
$border-color: #e9ecef;
$border-focus: #b3d4fc;

/* =======================================
   Layout & Typography
======================================= */
.account-management {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    color: $text-main;
}

/* =======================================
   Tab Menu
======================================= */
.tab-menu {
    display: flex;
    gap: 8px;
    margin-bottom: 32px;
    border-bottom: 2px solid $border-color;

    button {
        padding: 12px 24px;
        background: transparent;
        border: none;
        font-size: 16px;
        color: $text-sub;
        cursor: pointer;
        position: relative;
        transition: color 0.2s ease;

        &:hover {
            color: $primary;
        }

        &.active {
            color: $primary;
            font-weight: 700;

            &::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                width: 100%;
                height: 3px;
                background-color: $primary;
                border-radius: 3px 3px 0 0;
            }
        }
    }
}

/* =======================================
   Action Bar
======================================= */
.action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
    }
}

/* =======================================
   Data Table (Accordion List)
======================================= */
.data-table-wrapper {
    background-color: $bg-white;
    border: 1px solid $border-color;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    overflow: hidden;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;

    th {
        background-color: $bg-main;
        padding: 16px;
        font-size: 14px;
        font-weight: 600;
        color: $text-sub;
        border-bottom: 1px solid $border-color;
    }

    td {
        padding: 16px;
        vertical-align: middle;
        border-bottom: 1px solid $border-color;
    }

    /* 컬럼 너비 제어 */
    .col-badge {
        width: 70px;
        text-align: center;
    }

    .col-bank {
        width: 100px;
        text-align: center;
    }

    .col-name {
        width: 200px;
    }

    .col-account {
        width: auto;
        font-family: monospace;
        font-size: 15px;
    }

    .col-acctCd {
        width: 120px;
        font-family: monospace;
        text-align: center;
        font-size: 15px;
    }

    .col-type {
        width: 120px;
        text-align: center;
    }

    .col-status {
        width: 120px;
        font-size: 13px;
        font-weight: 700;
    }

    .col-action {
        width: 100px;
        text-align: center;
    }

    /* 메인 Row */
    .main-row {
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
            background-color: rgba($primary, 0.03);
        }

        &.is-open {
            background-color: rgba($primary, 0.06);
            border-bottom: none;

            td {
                border-bottom: none;
                /* 열렸을 때 선 제거 */
            }
        }
    }

    /* 테이블 내부 요소들 */
    .bank-info-cell {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .bank-nm {
            font-weight: 700;
            font-size: 16px;
        }

        .bank-alias {
            font-size: 13px;
            color: $text-light;
        }
    }

    .badge-main {
        display: inline-block;
        background-color: #e1f5fe;
        color: #0288d1;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 700;
    }

    .type-tag {
        background-color: #f1f3f5;
        color: #495057;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
    }

    .status-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 6px;

        &.on {
            background-color: #2b8a3e;
        }

        &.off {
            background-color: #e03131;
        }
    }

    /* 상세 정보 Row (Accordion) */
    .detail-row {
        background-color: #fafbfc;

        .detail-cell {
            padding: 0;
            /* td 자체의 패딩을 없애고 내부 div에 줌 */
        }

        .detail-wrapper {
            padding: 24px;
            border-left: 4px solid $primary;
            animation: slideDown 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }

        .detail-item {
            display: flex;
            flex-direction: column;
            gap: 6px;

            .label {
                font-size: 13px;
                color: $text-light;
                font-weight: 500;
            }

            .value {
                font-size: 15px;
                color: $text-main;
            }

            &.full-width {
                grid-column: 1 / -1;
                border-top: 1px dashed $border-color;
                padding-top: 16px;
                margin-top: 4px;
            }
        }
    }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* =======================================
   Modal (Layered Popup)
======================================= */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-container {
    background-color: $bg-white;
    width: 100%;
    max-width: 680px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid $border-color;

    h4 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
    }

    .btn-close {
        background: transparent;
        border: none;
        font-size: 28px;
        line-height: 1;
        color: $text-light;
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
            color: $text-main;
        }
    }
}

.modal-body {
    padding: 24px;
    overflow-y: auto;
    /* 내용이 길면 내부 스크롤 */
}

.modal-footer {
    padding: 20px 24px;
    border-top: 1px solid $border-color;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    background-color: $bg-main;
}

/* =======================================
   Forms inside Modal
======================================= */
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &.full-width {
        grid-column: 1 / -1;
    }

    label {
        font-size: 14px;
        font-weight: 600;
        color: $text-main;

        .required {
            color: #e03131;
            margin-left: 2px;
        }
    }

    input,
    select,
    textarea {
        width: 100%;
        padding: 12px;
        font-size: 15px;
        border: 1px solid $border-color;
        border-radius: 8px;
        background-color: $bg-white;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;

        &:focus {
            outline: none;
            border-color: $primary;
            box-shadow: 0 0 0 3px rgba($primary, 0.1);
        }

        &::placeholder {
            color: $text-light;
        }
    }

    textarea {
        resize: vertical;
    }
}

.mt-15 {
    margin-top: 15px;
}

.checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    padding: 16px;
    background-color: #f8fbff;
    border: 1px solid #d0ebff;
    border-radius: 8px;

    .checkbox-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;

        input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: $primary;
            cursor: pointer;
        }
    }
}

/* =======================================
   Buttons
======================================= */
.btn-primary {
    background-color: $primary;
    color: $bg-white;
    border: none;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: $primary-hover;
    }
}

.btn-secondary {
    background-color: $bg-white;
    color: $text-sub;
    border: 1px solid $border-color;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: $bg-main;
    }
}

.btn-edit-sm {
    background-color: $bg-white;
    color: $text-sub;
    border: 1px solid $border-color;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: $primary;
        color: $bg-white;
        border-color: $primary;
    }
}

.custom-autosearch {
    position: relative;
    width: 100%;

    .search-input {
        width: 100%;
        padding: 12px;
        font-size: 15px;
        border: 1px solid $border-color;
        border-radius: 8px;
        background-color: $bg-white;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;

        &:focus {
            outline: none;
            border-color: $primary;
            box-shadow: 0 0 0 3px rgba($primary, 0.1);
        }
    }

    .dropdown-list {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        width: 100%;
        min-width: 200px;
        background: #ffffff;
        border: 1px solid #ced4da;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        max-height: 220px;
        overflow-y: auto;
        z-index: 999;

        &::-webkit-scrollbar { width: 6px; }
        &::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 10px;
        }

        ul {
            list-style: none;
            margin: 0;
            padding: 4px 0;

            li {
                padding: 10px 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: background 0.1s;

                &:hover { background: #f0f7ff; }
                .acc-text { font-size: 13px; color: #111827; font-weight: 500; }
            }
        }

        .status-msg {
            padding: 16px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
            
            &.empty { color: #ef4444; }
            &.info { color: #3b82f6; }
        }
    }
}

/* =======================================
   Transitions
======================================= */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>