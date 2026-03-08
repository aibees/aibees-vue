<template>
    <div class="preset-management">

        <section class="dynamic-tabs-container">
            <div class="tabs-wrapper">
                <div v-for="group in presetGroups" :key="group.presetGroupCd" class="dynamic-tab"
                    :class="{ active: selectedGroupCode === group.presetGroupCd }"
                    @click="selectGroup(group.presetGroupCd, group.enabledFlag)">
                    <span class="tab-label">{{ group.presetGroupNm }}</span>
                    <button class="icon-edit-tab" @click.stop="openGroupModal('EDIT', group)" title="그룹 설정">
                        ⚙️
                    </button>
                </div>
                <button class="btn-add-tab" @click="openGroupModal('CREATE')">
                    + 새 그룹 추가
                </button>
            </div>
        </section>

        <section class="content-container">
            <div class="action-bar">
                <button class="btn-primary" :disabled="!selectedGroupCode" @click="openPresetModal('CREATE')">
                    + 프리셋 등록
                </button>
            </div>

            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th class="col-order">순번</th>
                            <th class="col-code">프리셋 코드</th>
                            <th class="col-name">프리셋 이름</th>
                            <th class="col-desc">설명</th>
                            <th class="col-status">상태</th>
                            <th class="col-action">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="main-row" v-for="(preset, idx) in filteredPresets" :key="preset.presetCd">
                            <td class="col-order mono">{{ idx + 1 }}</td>
                            <td class="col-code mono"><strong>{{ preset.presetCd }}</strong></td>
                            <td class="col-name font-bold">{{ preset.presetNm }}</td>
                            <td class="col-desc desc-text">{{ preset.description || '-' }}</td>
                            <td class="col-status">
                                <span :class="['status-pill', preset.enabledFlag === 'Y' ? 'is-active' : 'is-inactive']">
                                    {{ preset.enabledFlag === 'Y' ? '사용중' : '중지' }}
                                </span>
                            </td>
                            <td class="col-action">
                                <button class="btn-edit-sm" @click.stop="openPresetModal('EDIT', preset)">수정</button>
                            </td>
                        </tr>
                        <tr v-if="filteredPresets.length === 0">
                            <td colspan="6" class="empty-state">
                                {{ selectedGroupCode ? '등록된 프리셋이 없습니다.' : '먼저 그룹을 선택하거나 추가해 주세요.' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Transition name="fade">
            <div v-if="groupModal.open" class="modal-overlay" @click.self="closeGroupModal">
                <div class="modal-container modal-sm">
                    <header class="modal-header">
                        <h4>Preset 그룹 {{ groupModal.mode === 'CREATE' ? '추가' : '수정' }}</h4>
                        <button class="btn-close" @click="closeGroupModal">&times;</button>
                    </header>

                    <div class="modal-body">
                        <form id="groupForm" @submit.prevent="saveGroup">
                            <div class="form-grid-single">
                                <div class="form-group">
                                    <label>그룹 코드 <span class="required">*</span></label>
                                    <input type="text" v-model="groupModal.form.presetGroupCd"
                                        :disabled="groupModal.mode === 'EDIT'" placeholder="예: EXPENSE" required>
                                    <div class="help" v-if="groupModal.mode === 'EDIT'">* 코드는 수정할 수 없습니다.</div>
                                </div>
                                <div class="form-group">
                                    <label>그룹명 <span class="required">*</span></label>
                                    <input type="text" v-model="groupModal.form.presetGroupNm" placeholder="예: 지출 그룹"
                                        required>
                                </div>
                                <div class="form-group">
                                    <label>그룹 약어 (alias)</label>
                                    <input type="text" v-model="groupModal.form.alias" placeholder="예: EXP">
                                </div>
                                <div class="form-group-row">
                                    <div class="form-group flex-1">
                                        <label>정렬 순서</label>
                                        <input type="number" v-model.number="groupModal.form.order" placeholder="0">
                                    </div>
                                    <div class="form-group flex-1">
                                        <label>상태</label>
                                        <select v-model="groupModal.form.enabledFlag">
                                            <option value="Y">사용 (Y)</option>
                                            <option value="N">중지 (N)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <footer class="modal-footer flex-between">
                        <button v-if="groupModal.mode === 'EDIT'" type="button" class="btn-danger" @click="deleteGroup">그룹
                            삭제</button>
                        <div v-else></div>
                        <div class="action-buttons">
                            <button type="button" class="btn-secondary" @click="closeGroupModal">취소</button>
                            <button type="submit" form="groupForm" class="btn-primary">저장</button>
                        </div>
                    </footer>
                </div>
            </div>
        </Transition>

        <Transition name="fade">
            <div v-if="presetModal.open" class="modal-overlay" @click.self="closePresetModal">
                <div class="modal-container">
                    <header class="modal-header">
                        <h4>프리셋 {{ presetModal.mode === 'CREATE' ? '등록' : '수정' }}</h4>
                        <button class="btn-close" @click="closePresetModal">&times;</button>
                    </header>

                    <div class="modal-body">
                        <form id="presetForm" @submit.prevent="savePreset">
                            <div class="form-grid">
                                <div class="form-group full-width">
                                    <label>소속 그룹</label>
                                    <input type="text" :value="`${selectedGroup?.presetGroupNm} (${selectedGroupCode})`"
                                        disabled>
                                </div>
                                <div class="form-group">
                                    <label>프리셋 코드 <span class="required">*</span></label>
                                    <input type="text" v-model="presetModal.form.presetCd"
                                        :disabled="presetModal.mode === 'EDIT'" placeholder="예: EXP_CARD_MEAL" required>
                                </div>
                                <div class="form-group">
                                    <label>프리셋 이름 <span class="required">*</span></label>
                                    <input type="text" v-model="presetModal.form.presetNm" placeholder="예: 식비 - 신용카드"
                                        required>
                                </div>
                                <div class="form-group">
                                    <label>정렬 순서</label>
                                    <input type="number" v-model.number="presetModal.form.order" placeholder="0">
                                </div>
                                <div class="form-group">
                                    <label>상태</label>
                                    <select v-model="presetModal.form.enabledFlag">
                                        <option value="Y">사용 (Y)</option>
                                        <option value="N">중지 (N)</option>
                                    </select>
                                </div>
                                <div class="form-group full-width">
                                    <label>설명</label>
                                    <textarea v-model="presetModal.form.description" rows="2"
                                        placeholder="어떤 상황에 사용하는 프리셋인지 설명해주세요."></textarea>
                                </div>
                            </div>
                        </form>
                    </div>

                    <footer class="modal-footer flex-between">
                        <button v-if="presetModal.mode === 'EDIT'" type="button" class="btn-danger"
                            @click="deletePreset(presetModal.form.presetCd)">프리셋 삭제</button>
                        <div v-else></div>

                        <div class="action-buttons">
                            <button type="button" class="btn-secondary" @click="closePresetModal">취소</button>
                            <button type="submit" form="presetForm" class="btn-primary">저장</button>
                        </div>
                    </footer>
                </div>
            </div>
        </Transition>

    </div>
</template>

<script setup>
import mariaApi from '@scripts/util/mariaApi.js';

// --- 원본 데이터 State ---
const presetGroups = ref([]);
const presetMasters = ref([]);

// 현재 선택된 탭(그룹)의 Code
const selectedGroupCode = ref('');

onMounted(async () => {
    await getPresetGroupList();
});

const getPresetGroupList = async () => {
    const { data } = await mariaApi.get('/api/system-infos/preset/groups');
    presetGroups.value = data;

    if (presetGroups.value.length > 0) {
        selectedGroupCode.value = presetGroups.value[0].presetGroupCd;
        await getPresetHeaderList();
    }
};

const getPresetHeaderList = async () => {
    const searchParam = {
        presetGroupCd: selectedGroupCode.value
    }
    const { data } = await mariaApi.get('/api/system-infos/preset/headers', { params: searchParam });
    presetMasters.value = data;
}

const selectedGroup = computed(() => {
    return presetGroups.value.find(g => g.presetGroupCd === selectedGroupCode.value) || null;
});

const filteredPresets = computed(() => {
    return presetMasters.value
        .sort((a, b) => (a.order || 0) - (b.order || 0) || a.presetCd.localeCompare(b.presetCd));
});

// --- Methods ---
const selectGroup = async (code, flag) => {
    if (flag == 'Y') {
        selectedGroupCode.value = code;
        await getPresetHeaderList();
    }
};


// =====================================
// 1. Group Modal Logic
// =====================================
const groupModal = reactive({
    open: false, 
    mode: 'CREATE',
    form: {
        presetGroupId: '',
        presetGroupCd: '', 
        presetGroupNm: '', 
        alias: '', 
        enabledFlag: 'Y' 
    }
});

const openGroupModal = (mode, data = null) => {
    groupModal.mode = mode;
    if (mode === 'EDIT' && data) {
        groupModal.form = { ...data };
    } else {
        groupModal.form = {
            presetGroupCd: '', 
            presetGroupNm: '', 
            alias: '', 
            enabledFlag: 'Y'
        };
    }
    groupModal.open = true;
};

const closeGroupModal = () => groupModal.open = false;

const saveGroup = async () => {
    const payload = { ...groupModal.form, presetGroupCd: groupModal.form.presetGroupCd.trim().toUpperCase() };

    if (groupModal.mode === 'CREATE') {
        const result = await mariaApi.post('/api/system-infos/preset/groups', payload);
        if (result.success) {
            await getPresetGroupList();
            selectedGroupCode.value = payload.presetGroupCd; // 새로 만든 탭으로 포커스
        }

    } else {
        await mariaApi.put('/api/system-infos/preset/groups', payload);
        if (result.success) {
            await getPresetGroupList();
        }
    }
    closeGroupModal();
};

const deleteGroup = async () => {
    const code = groupModal.form.presetGroupCd;
    const childCount = presetMasters.value.filter(p => p.presetGroupCd === code).length;

    if (childCount > 0) {
        return alert(`이 그룹에 속한 프리셋이 ${childCount}개 있습니다. 프리셋을 먼저 삭제하거나 이동해 주세요.`);
    }

    await mariaApi.delete(`/api/system-infos/preset/groups/${groupModal.form.presetGroupId}`);

    closeGroupModal();
};


// =====================================
// 2. Preset Modal Logic
// =====================================
const presetModal = reactive({
    open: false, 
    mode: 'CREATE',
    form: {
        presetCd: '', 
        presetNm: '', 
        description: '', 
        order: 0, 
        enabledFlag: 'Y'
    }
});

const openPresetModal = (mode, data = null) => {
    presetModal.mode = mode;
    if (mode === 'EDIT' && data) {
        presetModal.form = { ...data };
    } else { // CREATE
        presetModal.form = { presetCd: '', presetNm: '', description: '', enabledFlag: 'Y', presetGroupCd: selectedGroupCode.value };
    }
    presetModal.open = true;
};

const closePresetModal = () => presetModal.open = false;

const savePreset = async () => {
    const payload = { ...presetModal.form, presetCd: presetModal.form.presetCd.trim().toUpperCase(), presetGroupCd: selectedGroupCode.value };

    if (presetModal.mode === 'CREATE') {
        const exists = presetMasters.value.some(p => p.presetCd === payload.presetCd);
        if (exists) {
            return alert('이미 존재하는 프리셋 코드입니다.')
        };

        await mariaApi.post('/api/system-infos/preset/headers', payload);
    } else {
        await mariaApi.put('/api/system-infos/preset/headers', payload);
    }
    await getPresetHeaderList();
    closePresetModal();
};

const deletePreset = async (code) => {
    await mariaApi.delete(`/api/system-infos/preset/headers/${code}`);
    await getPresetHeaderList();
    closePresetModal();
};
</script>

<style lang="scss" scoped>
/* 디자인 시스템 변수 (실제 프로젝트 변수에 맞춰 조정) */
$primary: #4a90e2;
$primary-hover: #357abd;
$text-main: #333333;
$text-sub: #666666;
$text-light: #999999;
$bg-main: #f8f9fa;
$bg-white: #ffffff;
$border-color: #e9ecef;
$danger: #e03131;

.preset-management {
    max-width: 1200px;
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

/* =======================================
   Dynamic Tabs (유동적 그룹 탭)
======================================= */
.dynamic-tabs-container {
    margin-bottom: 24px;
    border-bottom: 2px solid $border-color;

    .tabs-wrapper {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: flex-end;
    }

    .dynamic-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: transparent;
        border: none;
        font-size: 16px;
        color: $text-sub;
        cursor: pointer;
        position: relative;
        transition: all 0.2s ease;
        border-radius: 8px 8px 0 0;

        &:hover {
            color: $primary;
            background: rgba($primary, 0.03);
        }

        &.active {
            color: $primary;
            font-weight: 700;
            background: $bg-white;
            border: 1px solid $border-color;
            border-bottom: 2px solid $bg-white;
            margin-bottom: -2px;
            /* 아래 테두리를 덮기 위함 */
        }

        .tab-label {
            user-select: none;
        }

        .icon-edit-tab {
            background: none;
            border: none;
            padding: 2px;
            font-size: 12px;
            cursor: pointer;
            opacity: 0.3;
            transition: opacity 0.2s;
            filter: grayscale(100%);

            &:hover {
                opacity: 1;
                filter: grayscale(0%);
                transform: scale(1.1);
            }
        }

        &.active .icon-edit-tab {
            opacity: 0.7;
            filter: grayscale(0%);
        }
    }

    .btn-add-tab {
        padding: 10px 16px;
        margin-bottom: 4px;
        margin-left: 8px;
        background: $bg-white;
        border: 1px dashed #adb5bd;
        border-radius: 6px;
        color: #868e96;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
            border-color: $primary;
            color: $primary;
            background: #f8faff;
        }
    }
}

/* =======================================
   Content Area (Table)
======================================= */
.action-bar {
    display: flex;
    justify-content: end;
    align-items: center;
    margin-bottom: 16px;

    h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;

        .highlight {
            color: $primary;
            font-weight: 800;
        }
    }
}

.data-table-wrapper {
    background-color: $bg-white;
    border: 1px solid $border-color;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    max-height: 55vh;
    overflow-y: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;

    th {
        background: $bg-main;
        padding: 14px 16px;
        font-size: 13px;
        color: $text-sub;
        position: sticky;
        top: 0;
        z-index: 10;
        box-shadow: 0 1px 0 $border-color;
    }

    td {
        padding: 16px;
        vertical-align: middle;
        border-bottom: 1px solid $border-color;
        font-size: 14px;
    }

    .col-order {
        width: 80px;
        text-align: center;
        color: $text-light;
    }

    .col-code {
        width: 180px;
    }

    .col-name {
        width: auto;
    }

    .col-desc {
        width: auto;
    }

    .col-status {
        width: 100px;
        text-align: center;
    }

    .col-action {
        width: 90px;
        text-align: center;
    }

    .main-row {
        transition: background-color 0.2s ease;

        &:hover {
            background-color: rgba($primary, 0.02);
        }
    }

    .empty-state {
        text-align: center;
        padding: 50px;
        color: $text-light;
        font-size: 15px;
    }

    .mono {
        font-family: monospace;
    }

    .font-bold {
        font-weight: 700;
        color: #111;
    }

    .desc-text {
        color: $text-sub;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 280px;
    }

    .status-pill {
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;

        &.is-active {
            background: #ecfdf3;
            color: #166534;
        }

        &.is-inactive {
            background: #fef2f2;
            color: #b91c1c;
        }
    }
}

/* =======================================
   Modals & Forms
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
    max-width: 600px;
    display: flex;
    flex-direction: column;
    border-radius: 16px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);

    &.modal-sm {
        max-width: 450px;
    }

    /* 그룹 모달은 좀 더 작게 */
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid $border-color;

    h4 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
    }

    .btn-close {
        background: none;
        border: none;
        font-size: 24px;
        color: $text-light;
        cursor: pointer;

        &:hover {
            color: $text-main;
        }
    }
}

.modal-body {
    padding: 24px;
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid $border-color;
    background-color: $bg-main;
}

.flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.form-grid-single {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* 그룹 모달용 세로 폼 */

.form-group-row {
    display: flex;
    gap: 16px;

    .flex-1 {
        flex: 1;
    }
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;

    &.full-width {
        grid-column: 1 / -1;
    }

    label {
        font-size: 13px;
        font-weight: 600;
        color: #495057;

        .required {
            color: $danger;
        }
    }

    input,
    select,
    textarea {
        width: 100%;
        padding: 10px 12px;
        font-size: 14px;
        border: 1px solid #ced4da;
        border-radius: 8px;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;

        &:focus {
            outline: none;
            border-color: $primary;
            box-shadow: 0 0 0 3px rgba($primary, 0.1);
        }

        &:disabled {
            background-color: #f1f3f5;
            color: #868e96;
            cursor: not-allowed;
        }
    }

    textarea {
        resize: vertical;
        min-height: 80px;
    }

    .help {
        font-size: 12px;
        color: $text-light;
        margin-top: 2px;
    }
}

/* =======================================
   Buttons
======================================= */
.btn-primary {
    background: $primary;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
        background: $primary-hover;
    }

    &:disabled {
        background: #adb5bd;
        cursor: not-allowed;
    }
}

.btn-secondary {
    background: white;
    color: $text-sub;
    border: 1px solid #ced4da;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
        background: #f1f3f5;
    }
}

.btn-danger {
    background: transparent;
    color: $danger;
    border: none;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
        background: #fff5f5;
        border-radius: 6px;
    }
}

.btn-edit-sm {
    background: white;
    color: $text-sub;
    border: 1px solid #ced4da;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;

    &:hover {
        border-color: $primary;
        color: $primary;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}</style>