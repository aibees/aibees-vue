<template>
    <div class="account-code-management">
        <MNav :tabs="tabs" :currentTab="currentTab" @tab-click="handleTabChange" />

        <section class="content-container">
            <div class="action-bar">
                <h3>{{ currentTabName }} 계정 마스터 관리</h3>
                <button class="btn-primary" @click.stop="openModal()">+ 신규 계정 등록</button>
            </div>

            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th class="col-code">계정코드</th>
                            <th class="col-type">분류</th>
                            <th class="col-name">계정과목명</th>
                            <th class="col-parent">상위계정</th>
                            <th class="col-drcr">차대구분</th>
                            <th class="col-status">상태</th>
                            <th class="col-action">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="(acct, index) in treeList" :key="acct.acctCd">
                            <tr class="main-row" :class="{ 'is-open': acct.isExpanded }" @click="toggleRow(acct.acctCd)">
                                <td class="col-code">
                                    <strong :style="{ color: acct._depth === 0 ? '#333333' : '#666666' }">
                                        {{ acct.acctCd }}
                                    </strong>
                                </td>
                                <td class="col-type">
                                    <span
                                        :class="['type-badge', acct.finalFlag === 'Y' ? 'final' : (acct._depth === 0 ? 'group-main' : 'group-sub')]">
                                        {{ acct.finalFlag === 'Y' ? '기표' : `그룹(D${acct._depth + 1})` }}
                                    </span>
                                </td>

                                <td class="col-name" :style="{ paddingLeft: `${(acct._depth * 24) + 16}px` }">
                                    <span v-if="acct._depth > 0" class="tree-line">-</span>
                                    <span :class="{ 'font-bold': acct._depth > 1 }">{{ acct.acctNm }}</span>
                                </td>

                                <td class="col-parent">{{ acct.parentAcctCd || '-' }}</td>
                                <td class="col-drcr">
                                    <span class="drcr-text">{{ acct.dcFlag === 'D' ? '차변(D)' : '대변(C)' }}</span>
                                </td>
                                <td class="col-status">
                                    <span :class="['status-dot', acct.enabledFlag === 'Y' ? 'on' : 'off']"></span>
                                    {{ acct.enabledFlag === 'Y' ? '사용중' : '중지' }}
                                </td>
                                <td class="col-action">
                                    <button class="btn-edit-sm" @click.stop="openModal(acct)">수정</button>
                                </td>
                            </tr>

                            <tr v-if="acct.isExpanded" class="detail-row">
                                <td colspan="7" class="detail-cell">
                                    <div class="detail-wrapper">
                                        <div class="detail-grid">
                                            <div class="detail-item">
                                                <span class="label">정렬 순서:</span>
                                                <span class="value">{{ acct.sortOrder }}</span>
                                            </div>
                                            <div class="detail-item">
                                                <span class="label">추가 속성(Flag):</span>
                                                <span class="value">{{ acct.additional_flag || '-' }}</span>
                                            </div>
                                            <div class="detail-item full-width">
                                                <span class="label">계정 설명:</span>
                                                <span class="value">{{ acct.description || '등록된 설명이 없습니다.' }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </template>
                        <tr v-if="treeList.length === 0">
                            <td colspan="7" class="empty-state">등록된 계정과목이 없습니다.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Transition name="fade">
            <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
                <div class="modal-container">
                    <header class="modal-header">
                        <h4>{{ formData.isEdit ? '계정과목 수정' : '신규 계정과목 등록' }}</h4>
                        <button class="btn-close" @click="closeModal">&times;</button>
                    </header>

                    <div class="modal-body">
                        <form id="acctForm" @submit.prevent="saveAccountInfo">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>계정코드 <span class="required">*</span></label>
                                    <input type="text" v-model="formData.acctCd" :disabled="formData.isEdit"
                                        placeholder="예: 5110" required>
                                </div>

                                <div class="form-group">
                                    <label>계정과목명 <span class="required">*</span></label>
                                    <input type="text" v-model="formData.acctNm" placeholder="예: 월세" required>
                                </div>

                                <div class="form-group">
                                    <label>계정 유형</label>
                                    <select v-model="formData.acctType" disabled>
                                        <option v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.label }}
                                        </option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label>상위계정 (parentAcctCd)</label>
                                    <input type="text" v-model="formData.parentAcctCd" placeholder="최상위 그룹일 경우 비워둠">
                                </div>

                                <div class="form-group">
                                    <label>차대 구분 <span class="required">*</span></label>
                                    <select v-model="formData.dcFlag">
                                        <option value="D">차변 (Debit) - 자산/비용 증가</option>
                                        <option value="C">대변 (Credit) - 부채/자본/수익 증가</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label>정렬 순서</label>
                                    <input type="number" v-model="formData.sortOrder" placeholder="0">
                                </div>
                            </div>

                            <div class="form-group full-width mt-15">
                                <label>상세 설명 (Description)</label>
                                <textarea v-model="formData.memo" rows="2"
                                    placeholder="이 계정에 어떤 내역을 기록할지 설명해 주세요."></textarea>
                            </div>

                            <div class="checkbox-group mt-15">
                                <label class="checkbox-item">
                                    <input type="checkbox" v-model="formData.finalFlag" true-value="Y" false-value="N">
                                    <span><strong>기표가능 (final_flag)</strong> : 하위 계정이 없는 마지막 뎁스의 실제 입력용 계정입니까?</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" v-model="formData.enabledFlag" true-value="Y" false-value="N">
                                    <span><strong>사용 활성화 (enabled_flag)</strong> : 현재 가계부에서 사용 중입니까?</span>
                                </label>
                            </div>
                        </form>
                    </div>

                    <footer class="modal-footer">
                        <button type="button" class="btn-secondary" @click="closeModal">취소</button>
                        <button type="submit" form="acctForm" class="btn-primary">저장하기</button>
                    </footer>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
    import mariaApi from '@scripts/util/mariaApi.js';
    // tab
    const tabs = [
        { label: '자산', value: 'ASSET' },
        { label: '부채', value: 'LIABILITY' },
        { label: '자본', value: 'EQUITY' },
        { label: '수익', value: 'REVENUE' },
        { label: '비용', value: 'EXPENSE' }
    ];
    const currentTab = ref('EXPENSE');
    const currentTabName = computed(() => tabs.find(t => t.value === currentTab.value)?.label);

    const isModalOpen = ref(false);

    const accountList = ref([]);

    onMounted(async () => {
        await getAccountList();
    });

    const getAccountList = async () => {
        const searchParam = {
            acctType: currentTab.value
        }
        const { data } = await mariaApi.get('/api/system-infos/acct', {params: searchParam});
        data.forEach(d => {
            d.isExpanded = false;
        });
        accountList.value = data;
    }

    const handleTabChange = async (selectedTabValue) => {
        currentTab.value = selectedTabValue;
        await getAccountList();
    }

    // 계정과목 귀속 Tree 만들기
    const buildTreeList = (list, parentId = null, depth = 0) => {
        let result = [];
        const children = list
            .filter(item => item.parentAcctCd === parentId)
            .sort((a, b) => a.sortOrder - b.sortOrder || a.acctCd.localeCompare(b.acctCd));

        for (const child of children) {
            result.push({ ...child, _depth: depth });
            result = result.concat(buildTreeList(list, child.acctCd, depth + 1));
        }
        return result;
    };

    const treeList = computed(() => {
        const filteredByType = accountList.value.filter(acct => acct.acctType === currentTab.value);
        return buildTreeList(filteredByType, null, 0);
    });

    const initialForm = {
        isEdit: false, 
        acctCd: '', 
        acctNm: '', 
        parentAcctCd: '',
        enabledFlag: 'Y', 
        finalFlag: 'Y', 
        acctType: 'EXPENSE', 
        dcFlag: 'D',
        memo: '',
    };

    const formData = reactive({ ...initialForm });

    const toggleRow = (acctCd) => {
        // 원본 상태인 accountList에서 대상을 찾아 값을 변경합니다.
        const target = accountList.value.find(item => item.acctCd === acctCd);
        if (target) {
            target.isExpanded = !target.isExpanded;
        }
    };

    const openModal = (data = null) => {
        if (data) {
            Object.assign(formData, data);
            formData.isEdit = true;
        } else {
            Object.assign(formData, initialForm);
            formData.acctType = currentTab.value;
            formData.dcFlag = ['ASSET', 'EXPENSE'].includes(currentTab.value) ? 'D' : 'C';
            formData.isEdit = false;
        }
        isModalOpen.value = true;
    };

    const closeModal = () => {
        isModalOpen.value = false;
    };

    const saveAccountInfo = async () => {
        let result;
        if (formData.isEdit) {
            result = await mariaApi.put('/api/system-infos/acct', formData);
        } else {
            result = await mariaApi.post('/api/system-infos/acct', formData);
        }


        closeModal();
    };
</script>

<style lang="scss" scoped>
@use '@@/__variables.scss' as *;

.account-code-management {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    color: $text-main;
}

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

/* 💡 추가/수정된 부분: data-table-wrapper에 스크롤 속성 부여 */
.data-table-wrapper {
    background-color: $bg-white;
    border: 1px solid $border-color;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);

    /* 스크롤 제어 속성 추가 */
    max-height: 57vh;
    overflow-y: auto;
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

        /* 💡 추가된 부분: 테이블 헤더 고정 (Sticky) */
        position: sticky;
        top: 0;
        z-index: 10;
        /* Sticky 상태에서 border-bottom이 잘리는 현상 방지용 */
        box-shadow: 0 1px 0 $border-color;
    }

    td {
        padding: 16px;
        vertical-align: middle;
        border-bottom: 1px solid $border-color;
    }

    .col-code {
        width: 90px;
        font-family: monospace;
    }

    .col-type {
        width: 100px;
        text-align: center;
    }

    .col-name {
        width: auto;
        font-size: 15px;
    }

    .col-parent {
        width: 90px;
        color: $text-light;
        font-family: monospace;
        text-align: center;
        font-size: 15px;
    }

    .col-drcr {
        width: 100px;
        text-align: center;
        font-size: 15px;
    }

    .col-status {
        width: 100px;
        text-align: center;
        font-size: 15px;
    }

    .col-action {
        width: 90px;
        text-align: center;
        font-size: 15px;
    }

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

    .empty-state {
        text-align: center;
        padding: 40px;
        color: $text-light;
    }

    .type-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 700;

        &.group-main {
            background-color: #e9ecef;
            color: #495057;
        }

        &.group-sub {
            background-color: #f1f3f5;
            color: #868e96;
            border: 1px dashed #ced4da;
        }

        &.final {
            background-color: #e6fcf5;
            color: #0ca678;
        }
    }

    .tree-line {
        margin-right: 8px;
        font-family: monospace;
    }

    .font-bold {
        font-weight: 700;
    }

    .drcr-text {
        font-size: 13px;
        color: $text-sub;
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

    .detail-row {
        background-color: #fafbfc;

        .detail-cell {
            padding: 0;
        }

        .detail-wrapper {
            padding: 24px;
            border-left: 4px solid $primary;
            animation: slideDown 0.3s forwards;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
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

        &:disabled {
            background-color: #f1f3f5;
            cursor: not-allowed;
            color: #868e96;
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
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background-color: #f8fbff;
    border: 1px solid #d0ebff;
    border-radius: 8px;

    .checkbox-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;

        input[type="checkbox"] {
            margin-top: 3px;
            width: 18px;
            height: 18px;
            accent-color: $primary;
            cursor: pointer;
        }

        span {
            line-height: 1.4;

            strong {
                font-weight: 600;
                color: #333;
            }

            color: #555;
        }
    }
}

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

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}</style>