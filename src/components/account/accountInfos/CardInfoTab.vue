<template>
    <section class="content-container">
        <div class="action-bar">
            <h3>카드 목록</h3>
            <button class="btn-primary" @click.stop="openModal()">+ 신규 등록</button>
        </div>

        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="d-text-align-center">카드사</th>
                        <th class="d-text-align-center">카드명</th>
                        <th class="d-text-align-center">카드번호</th>
                        <th class="d-text-align-center">관리주체</th>
                        <th class="d-text-align-center">종류</th>
                        <th class="d-text-align-center">상태</th>
                        <th class="d-text-align-center">관리</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(card, index) in cardList" :key="card.cardId">
                        <tr class="main-row" :class="{ 'is-open': card.isExpanded }" @click="toggleRow(index)">
                            <td class="col-company">
                                {{ card.cardCdNm }}
                            </td>
                            <td class="col-name">
                                <div class="card-info-cell">
                                    <span class="card-nm">{{ card.cardNm }}</span>
                                    <span class="card-alias">{{ card.alias }}</span>
                                </div>
                            </td>
                            <td class="col-account">{{ card.cardNo }}</td>
                            <td class="col-acctCd">{{ card.householdTypeNm }}</td>
                            <td class="col-type"><span class="type-tag">{{ card.cardTypeNm }}</span></td>
                            <td class="col-status">
                                <span :class="['status-dot', card.enabledFlag === 'Y' ? 'on' : 'off']"></span>
                                {{ card.enabledFlag === 'Y' ? '사용중' : '중지' }}
                            </td>
                            <td class="col-action">
                                <button class="btn-edit-sm" @click.stop="openModal(card)">수정</button>
                            </td>
                        </tr>

                        <tr v-if="card.isExpanded" class="detail-row">
                            <td colspan="8" class="detail-cell">
                                <div class="detail-wrapper">
                                    <div class="detail-grid">
                                        <div class="detail-item">
                                            <span class="label">🗓 결제일</span>
                                            <span class="value font-bold text-primary">
                                                {{ card.paymentDay ? `매월 ${card.paymentDay}일` : '미지정' }}
                                            </span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="label">💳 사용 한도</span>
                                            <span class="value mono font-bold">
                                                {{ card.limitAmt ? card.limitAmt.toLocaleString() + '원' : '무제한' }}
                                            </span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="label">📅 발급일자</span>
                                            <span class="value mono">{{ card.startDate || '-' }}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="label">🔗 연결계좌</span>
                                            <span class="value mono">{{ card.bankNm + "(" + card.bankId?.replace('-', '').slice(-4) + ")"  }}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="label">🏠 가계단위</span>
                                            <span class="value">{{ card.householdTypeNm || '-' }}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="label">📅 만료일자</span>
                                            <span class="value mono">{{ card.endDate || '-' }}</span>
                                        </div>
                                        <div class="detail-item full-width">
                                            <span class="label">📝 메모</span>
                                            <div class="value memo-box">
                                                {{ card.memo || '등록된 메모가 없습니다.' }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </template>
                    <tr v-if="cardList.length === 0">
                        <td colspan="8" class="text-center empty-msg" style="padding: 40px; color: #999;">등록된 카드가 없습니다.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <Transition name="fade">
        <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
            <div class="modal-container">
                <header class="modal-header">
                    <h4>{{ formData.cardId ? '카드 정보 수정' : '신규 카드 등록' }}</h4>
                    <button class="btn-close" @click="closeModal">&times;</button>
                </header>

                <div class="modal-body">
                    <form id="cardForm" @submit.prevent="saveCardInfo">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>카드 명 <span class="required">*</span></label>
                                <input type="text" v-model="formData.cardNm" placeholder="예: 현대카드 ZERO" required>
                            </div>

                            <div class="form-group">
                                <label>카드사 (발급사)</label>
                                <div class="custom-autosearch" @click.stop>
                                    <input type="text" v-model="autoSearch.cardCd.keyword"
                                        @focus="openDropdown('cardCd', autoSearch.cardCd)"
                                        @input="handleInput('cardCd', autoSearch.cardCd)" placeholder="카드사 검색 (2글자 이상)"
                                        class="search-input">

                                    <div class="dropdown-list" v-show="autoSearch.cardCd.dropdown">
                                        <ul v-if="autoSearch.cardCd.filteredOption.length > 0">
                                            <li v-for="option in autoSearch.cardCd.filteredOption" :key="option.code"
                                                @click="selectOption(autoSearch.cardCd, option)">
                                                <span class="acc-text">({{ option.code }}) {{ option.name }}</span>
                                            </li>
                                        </ul>
                                        <div class="status-msg empty"
                                            v-else-if="autoSearch.cardCd.keyword && autoSearch.cardCd.keyword.length > 0">
                                            검색 결과가 없습니다.
                                        </div>
                                        <div class="status-msg info" v-else>
                                            검색어를 2글자 이상 입력해주세요.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>카드번호 (뒤 4자리 권장) <span class="required">*</span></label>
                                <input type="text" v-model="formData.cardNo" placeholder="예: 1234" required>
                            </div>

                            <div class="form-group">
                                <label>카드 종류</label>
                                <select v-model="formData.cardType">
                                    <option v-for="opt in options.cardType" :key="opt.code" :value="opt.code">{{ opt.name }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>결제일 (일)</label>
                                <input type="number" v-model.number="formData.paymentDay" min="1" max="31"
                                    placeholder="예: 14">
                            </div>

                            <div class="form-group">
                                <label>사용 한도</label>
                                <input type="number" v-model="formData.limitAmt" placeholder="비워두면 무제한">
                            </div>

                            <div class="form-group">
                                <label>발급일자</label>
                                <input type="date" v-model="formData.startDate">
                            </div>

                            <div class="form-group">
                                <label>만료일자</label>
                                <input type="date" v-model="formData.endDate">
                            </div>

                            <div class="form-group">
                                <label>가계단위</label>
                                <select v-model="formData.householdType">
                                    <option v-for="opt in options.household" :key="opt.code" :value="opt.code"
                                        :selected="opt.code == formData.householdType">{{ opt.name }}</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>연결 계좌</label>
                                <select v-model="formData.bankId">
                                    <option v-for="opt in options.bankList" :key="opt.code" :value="opt.code">{{ opt.name }}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group full-width mt-15">
                            <label>메모</label>
                            <textarea v-model="formData.memo" rows="3" placeholder="결제 계좌 정보 등 추가 메모를 입력하세요"></textarea>
                        </div>

                        <div class="checkbox-group mt-15">
                            <label class="checkbox-item">
                                <input type="checkbox" v-model="formData.mainFlag" true-value="Y" false-value="N">
                                <span>주사용카드 설정</span>
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
                    <button type="submit" form="cardForm" class="btn-primary">저장하기</button>
                </footer>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import mariaApi from '@scripts/util/mariaApi.js';
import { getResourceList } from '@scripts/util/common/SettingResource.js';

const isModalOpen = ref(false);
const cardList = ref([]);
const options = reactive({
    household: [],
    card: [],
    cardType: [],
    bankList: []
});

const initialForm = {
    cardId: null,
    cardNo: '',
    cardCd: '',
    cardNm: '',
    cardType: '신용카드', // 기본값
    bankId: '',
    limitAmt: null,
    paymentDay: null, // 결제일
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
    // 💡 백엔드 공통코드 스펙에 맞게 키워드를 조정하세요 (예: CARD_CODE, CARD_TYPE)
    options.card = (await getResourceList('ACCOUNT', 'CARD_CODE'))
        .map(resource => { return { code: resource.code, name: resource.name } });
    options.household = (await getResourceList('ACCOUNT', 'HOUSEHOLD'))
        .map(resource => { return { code: resource.code, name: resource.name } });
    options.cardType = (await getResourceList('ACCOUNT', 'CARD_TYPE'))
        .map(resource => { return { code: resource.code, name: resource.name } });

    await getBankList();
    await getInfoList();
});

const getBankList = async () => {
    const param = { enabledFlag : 'Y' };
    const { data } = await mariaApi.get('/api/account/info/bank-accounts', { params: param });
    options.bankList = data.map(d => { return { code: d.bankId, name: `${d.bankNm} (${d.bankAcct})` } });
}

const getInfoList = async () => {
    const { data } = await mariaApi.get('/api/account/info/card-accounts');
    cardList.value = data;
    
    cardList.value.forEach(c => {
        const cardOpt = options.card.filter(cd => cd.code == c.cardCd);
        if (cardOpt.length > 0) {
            c.cardCdNm = cardOpt[0].name;
        }
        const houseOpt = options.household.filter(cd => cd.code == c.householdType);
        if (houseOpt.length > 0) {
            c.householdTypeNm = houseOpt[0].name;
        }
        const cardTypeOpt = options.cardType.filter(cd => cd.code == c.cardType);
        if (cardTypeOpt.length > 0) {
            c.cardTypeNm = cardTypeOpt[0].name;
        }
    });
    
}

const toggleRow = (index) => {
    cardList.value[index].isExpanded = !cardList.value[index].isExpanded;
};

const openModal = (data = null) => {
    if (data) {
        Object.assign(formData, data);
        autoSearch.cardCd.keyword = `(${data.cardCd}) ${data.cardCdNm}`;
    } else {
        Object.assign(formData, initialForm);
        autoSearch.cardCd.keyword = '';
    }
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const saveCardInfo = async () => {
    // 💡 저장 API (백엔드 경로에 맞게 수정 필요)
    if (formData.cardId) {
        // update
        console.log(formData);
        await mariaApi.put('/api/account/info/card-accounts', formData);
    } else {
        // save
        await mariaApi.post('/api/account/info/card-accounts', formData);
    }

    closeModal();
    await getInfoList();
};

/**
 * AUTO-SEARCH (카드사 검색)
 */
let searchTimeout = null;
const autoSearch = reactive({
    cardCd: {
        keyword: '',
        dropdown: false,
        filteredOption: []
    }
})

const openDropdown = (type, obj) => {
    const keyword = obj.keyword;
    obj.dropdown = true;

    if (keyword && keyword.length > 0) {
        fetchOptions(type, obj);
    } else {
        obj.filteredOption = [];
    }
};

const handleInput = (type, obj) => {
    obj.dropdown = true;
    const keyword = obj.keyword;

    if (searchTimeout) clearTimeout(searchTimeout);

    if (keyword.length < 1) {
        obj.filteredOption = [];
        return false;
    }

    searchTimeout = setTimeout(() => {
        fetchOptions(type, obj);
    }, 300);
};

const fetchOptions = (type, obj) => {
    if ('cardCd' == type) {
        obj.filteredOption = options.card.filter(c => c.code.includes(obj.keyword) || c.name.includes(obj.keyword));
    }
}

const selectOption = (obj, opt) => {
    formData.cardCd = opt.code;
    obj.keyword = `(${opt.code}) ${opt.name}`;
    obj.dropdown = false;
    obj.filteredOption = [];
}
</script>

<style lang="scss" scoped>
@use '@@/common.scss' as *;

/* =======================================
   Variables & Mixins (기존과 동일)
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
.content-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    color: $text-main;
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

    .col-company {
        width: 7.5rem;
        text-align: center;
    }

    .col-name {
        width: auto;
    }

    .col-account {
        width: 7.5rem;
        font-family: monospace;
        font-size: 15px;
        text-align: center;
    }

    .col-acctCd {
        width: 120px;
        font-family: monospace;
        text-align: center;
        font-size: 15px;
    }

    .col-type {
        width: 100px;
        text-align: center;
    }

    .col-status {
        width: 90px;
        font-size: 13px;
        font-weight: 700;
        text-align: center;
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
            }
        }
    }

    /* 테이블 내부 요소들 */
    .card-info-cell {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .card-nm {
            font-weight: 700;
            font-size: 16px;
        }

        .card-alias {
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
    /* 상세 정보 Row (Accordion) - 💡 가독성 개선 버전 */
    .detail-row {
        background-color: #f8fafc;
        /* 기존보다 더 시원한 쿨그레이 톤 */
        box-shadow: inset 0 3px 6px -3px rgba(0, 0, 0, 0.05);
        /* 안쪽 그림자로 깊이감 부여 */

        .detail-cell {
            padding: 0;
            border-bottom: 2px solid $border-color;
            /* 닫힌 행과의 확실한 구분선 */
        }

        .detail-wrapper {
            padding: 24px 32px;
            border-left: 4px solid $primary;
            animation: slideDown 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            /* 간격을 살짝 좁혀 응집력 상승 */
        }

        /* 💡 개별 항목을 미니 카드처럼 디자인 */
        .detail-item {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 16px 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            transition: box-shadow 0.2s ease;

            &:hover {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
            }

            .label {
                font-size: 12px;
                color: #64748b;
                font-weight: 700;
            }

            .value {
                font-size: 15px;
                color: #0f172a;
                font-weight: 500;
            }

            /* 엑셀업로드 뱃지 스타일 */
            .badge-green {
                background: #dcfce7;
                color: #166534;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 700;
            }

            .badge-gray {
                background: #f1f5f9;
                color: #64748b;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 700;
            }

            /* 메모 영역 스타일 */
            &.full-width {
                grid-column: 1 / -1;
                background: transparent;
                border: none;
                border-top: 1px dashed #cbd5e1;
                border-radius: 0;
                padding: 20px 0 0 0;
                gap: 12px;

                &:hover {
                    box-shadow: none;
                }

                .memo-box {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 16px;
                    color: #475569;
                    font-size: 14px;
                    line-height: 1.5;
                }
            }
        }
    }
}

.text-primary {
    color: $primary;
}

.font-bold {
    font-weight: 700;
}

.text-center {
    text-align: center;
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
   Buttons & Utils
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

        &::-webkit-scrollbar {
            width: 6px;
        }

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

                &:hover {
                    background: #f0f7ff;
                }

                .acc-text {
                    font-size: 13px;
                    color: #111827;
                    font-weight: 500;
                }
            }
        }

        .status-msg {
            padding: 16px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;

            &.empty {
                color: #ef4444;
            }

            &.info {
                color: #3b82f6;
            }
        }
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}</style>