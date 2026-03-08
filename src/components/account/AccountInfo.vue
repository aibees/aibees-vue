<template>
    <div class="account-management">
        <MNav :tabs="tabs" v-model="currentTab" />

        <section class="content-container">
            <div class="action-bar">
                <h3>{{ currentTab === 'BANK' ? '계좌 목록' : '카드 목록' }}</h3>
                <button class="btn-primary" @click.stop="openModal()">+ 신규 등록</button>
            </div>

            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th class="col-badge">주계좌</th>
                            <th class="col-name">은행/명칭</th>
                            <th class="col-account">계좌번호</th>
                            <th class="col-type">용도</th>
                            <th class="col-status">상태</th>
                            <th class="col-action">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="(bank, index) in bankList" :key="bank.bankId">
                            <tr class="main-row" :class="{ 'is-open': bank.isExpanded }" @click="toggleRow(index)">
                                <td class="col-badge">
                                    <span v-if="bank.mainFlag === 'Y'" class="badge-main">주</span>
                                </td>
                                <td class="col-name">
                                    <div class="bank-info-cell">
                                        <span class="bank-nm">{{ bank.bankNm }}</span>
                                        <span class="bank-alias">{{ bank.alias }}</span>
                                    </div>
                                </td>
                                <td class="col-account">{{ bank.bankAcct }}</td>
                                <td class="col-type"><span class="type-tag">{{ bank.bankType }}</span></td>
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
                                <div class="form-group full-width">
                                    <label>별명 (Alias)</label>
                                    <input type="text" v-model="formData.alias" placeholder="예: 생활비 통장">
                                </div>

                                <div class="form-group">
                                    <label>계좌 명 <span class="required">*</span></label>
                                    <input type="text" v-model="formData.bankNm" required>
                                </div>

                                <div class="form-group">
                                    <label>귀속은행코드</label>
                                    <input type="text" v-model="formData.bankCd" placeholder="003">
                                </div>

                                <div class="form-group">
                                    <label>계좌번호 <span class="required">*</span></label>
                                    <input type="text" v-model="formData.bankAcct" required>
                                </div>

                                <div class="form-group">
                                    <label>사용용도</label>
                                    <select v-model="formData.bankType">
                                        <option value="입출금">입출금</option>
                                        <option value="예적금">예적금</option>
                                        <option value="투자">투자</option>
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
                                    <input type="text" v-model="formData.householdType">
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
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const currentTab = ref('BANK');
const isModalOpen = ref(false);

const tabs = [
    { label: '은행계좌관리', value: 'BANK' },
    { label: '카드관리', value: 'CARD' },
    ]

const bankList = ref([
    {
        bankId: 'BK001', bankAcct: '110-123-456789', bankCd: '088', bankNm: '신한마이홈',
        bankType: '입출금', limitAmt: null, startDate: '2023-01-01', enabledFlag: 'Y',
        displayFlag: 'Y', excelableFlag: 'Y', mainFlag: 'Y', alias: '월급통장',
        memo: '급여 이체 및 공과금 자동이체 전용 계좌', acctCd: '101', householdType: '공통',
        isExpanded: false
    },
    {
        bankId: 'BK002', bankAcct: '3333-01-02030', bankCd: '090', bankNm: '카카오뱅크',
        bankType: '예적금', limitAmt: 50000000, startDate: '2024-05-15', enabledFlag: 'Y',
        displayFlag: 'Y', excelableFlag: 'N', mainFlag: 'N', alias: '비상금',
        memo: '경조사비 및 비상시 사용 목적', acctCd: '202', householdType: '개인',
        isExpanded: false
    }
]);

const initialForm = {
    bankId: null, bankAcct: '', bankCd: '', bankNm: '', bankType: '입출금',
    limitAmt: null, startDate: new Date().toISOString().substr(0, 10),
    enabledFlag: 'Y', displayFlag: 'Y', excelableFlag: 'Y', mainFlag: 'N',
    alias: '', memo: '', acctCd: '', householdType: ''
};

const formData = reactive({ ...initialForm });

const toggleRow = (index) => {
    bankList.value[index].isExpanded = !bankList.value[index].isExpanded;
};

const openModal = (data = null) => {
    if (data) {
        Object.assign(formData, data);
    } else {
        Object.assign(formData, initialForm);
    }
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const saveBankInfo = () => {
    console.log('Saved:', formData);
    alert('저장되었습니다.');
    closeModal();
};
</script>

<style lang="scss" scoped>
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
        width: 60px;
        text-align: center;
    }

    .col-name {
        width: auto;
    }

    .col-account {
        width: 200px;
        font-family: monospace;
        font-size: 15px;
    }

    .col-type {
        width: 120px;
    }

    .col-status {
        width: 120px;
    }

    .col-action {
        width: 80px;
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
}</style>