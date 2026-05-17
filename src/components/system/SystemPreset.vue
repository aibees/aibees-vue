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
                            <th class="col-mapping">매핑</th>
                            <th class="col-keyword">키워드</th>
                            <th class="col-action">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="([presetCategory, presets], catIdx) in [...groupedByCategory]" :key="presetCategory">
                            <tr class="category-divider-row" :style="{ backgroundColor: getCategoryColor(catIdx).bg }">
                                <td colspan="8" class="category-divider-cell">
                                    <div class="category-divider-inner">
                                        <span class="category-label" :style="{ color: getCategoryColor(catIdx).text }">{{ presetCategory }}</span>
                                        <span class="category-count" :style="{ backgroundColor: getCategoryColor(catIdx).text + '22', color: getCategoryColor(catIdx).text }">{{ presets.length }}개</span>
                                    </div>
                                </td>
                            </tr>
                            <tr class="main-row" v-for="(preset, idx) in presets" :key="preset.presetCd">
                                <td class="col-order mono">{{ idx + 1 }}</td>
                                <td class="col-code mono"><strong>{{ preset.presetCd }}</strong></td>
                                <td class="col-name font-bold">{{ preset.presetNm }}</td>
                                <td class="col-desc desc-text">{{ preset.description || '-' }}</td>
                                <td class="col-status">
                                    <span :class="['status-pill', preset.enabledFlag === 'Y' ? 'is-active' : 'is-inactive']">
                                        {{ preset.enabledFlag === 'Y' ? '사용중' : '중지' }}
                                    </span>
                                </td>
                                <td class="col-mapping" @click="goToMapping(preset.presetCd)">
                                    <span :class="['status-pill', preset.mappingCount > 0 ? 'is-active' : 'is-inactive']">{{
                                        preset.mappingCount > 0 ? '완료' : '미매핑' }}</span>
                                    <span><font-awesome-icons id="glass" :icon="['fa-solid', 'fa-right-from-bracket']" /></span>
                                </td>
                                <td class="col-keyword">
                                    <button class="btn-keyword-sm" @click.stop="openKeywordModal(preset)">
                                        🔑 키워드
                                    </button>
                                </td>
                                <td class="col-action">
                                    <button class="btn-edit-sm" @click.stop="openPresetModal('EDIT', preset)">수정</button>
                                </td>
                            </tr>
                        </template>
                        <tr v-if="groupedByCategory.size === 0">
                            <td colspan="8" class="empty-state">
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
                                <div class="form-group full-width">
                                    <label>카테고리</label>
                                    <select v-model="presetModal.form.presetCategory">
                                        <option value="">미분류</option>
                                        <option v-for="cat in options.categoryList" :key="cat.code" :value="cat.code">
                                            {{ cat.name }}
                                        </option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label>지출 / 수익 <span class="required">*</span></label>
                                    <select v-model="presetModal.form.inoutType" :disabled="presetModal.mode === 'EDIT'"
                                        @change="createPresetPrefix">
                                        <option value="INC">수익</option>
                                        <option value="EXP">지출</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label>계좌 / 카드<span class="required">*</span></label>
                                    <select v-model="presetModal.form.payType" :disabled="presetModal.mode === 'EDIT'"
                                        @change="createPresetPrefix">
                                        <option value="BANK">계좌</option>
                                        <option value="CARD">카드</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label>프리셋 코드 <span class="required">*</span></label>
                                    <div class="d-flex d-justify-between" style="gap: 0.7rem;">
                                        <input 
                                            type="text" 
                                            v-model="presetModal.form.presetPrefix"
                                            :disabled="presetModal.mode === 'EDIT'"
                                            style="text-align:center"
                                            required 
                                            readonly>
                                        <input 
                                            type="text" 
                                            v-model="presetModal.form.presetCd"
                                            :disabled="presetModal.mode === 'EDIT'" 
                                            style="text-align:center"
                                            required>
                                    </div>
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

        <!-- ===== 키워드 관리 모달 ===== -->
        <Transition name="fade">
            <div v-if="keywordModal.open" class="modal-overlay">
                <div class="modal-container modal-keyword">
                    <header class="modal-header">
                        <div>
                            <h4>🔑 키워드 매핑 관리</h4>
                            <p class="modal-sub">
                                <span class="mono-badge">{{ keywordModal.preset?.presetCd }}</span>
                                {{ keywordModal.preset?.presetNm }}
                            </p>
                        </div>
                        <button class="btn-close" @click="closeKeywordModal">&times;</button>
                    </header>

                    <div class="modal-body">
                        <!-- 키워드 추가 폼 -->
                        <div class="keyword-add-form">
                            <div class="keyword-add-title">+ 새 키워드 추가</div>
                            <div class="keyword-add-row">
                                <div class="form-group flex-grow">
                                    <label>키워드 텍스트 <span class="required">*</span></label>
                                    <input type="text" v-model="keywordModal.addForm.keywordText" placeholder="예: 주유소, 유류비"
                                        @keyup.enter="addKeyword">
                                </div>
                                <div class="form-group">
                                    <label>수입/지출</label>
                                    <select v-model="keywordModal.addForm.inoutType">
                                        <option value="">공통</option>
                                        <option value="0">수입 (0)</option>
                                        <option value="1">지출 (1)</option>
                                    </select>
                                </div>
                                <div class="form-group form-group-sm">
                                    <label>우선순위</label>
                                    <input type="number" v-model.number="keywordModal.addForm.priority" min="1" max="999">
                                </div>
                                <div class="form-group">
                                    <label>상태</label>
                                    <select v-model="keywordModal.addForm.enabledFlag">
                                        <option value="Y">활성 (Y)</option>
                                        <option value="N">비활성 (N)</option>
                                    </select>
                                </div>
                                <div class="form-group form-group-btn">
                                    <label>&nbsp;</label>
                                    <button class="btn-primary" @click="addKeyword">추가</button>
                                </div>
                            </div>
                        </div>

                        <!-- 키워드 목록 테이블 -->
                        <div class="keyword-table-wrapper">
                            <table class="keyword-table">
                                <thead>
                                    <tr>
                                        <th class="col-kw-no">No.</th>
                                        <th class="col-kw-text">키워드 텍스트</th>
                                        <th class="col-kw-inout">수입/지출</th>
                                        <th class="col-kw-priority">우선순위</th>
                                        <th class="col-kw-status">상태</th>
                                        <th class="col-kw-action">관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template v-if="keywordModal.keywords.length > 0">
                                        <tr v-for="(kw, idx) in keywordModal.keywords" :key="kw.keywordId">
                                            <!-- 조회 모드 -->
                                            <template v-if="keywordModal.editingId !== kw.keywordId">
                                                <td class="col-kw-no mono">{{ idx + 1 }}</td>
                                                <td class="col-kw-text">
                                                    <span class="keyword-chip">{{ kw.keywordText }}</span>
                                                </td>
                                                <td class="col-kw-inout">
                                                    <span
                                                        :class="['inout-badge', kw.inoutType == null ? 'badge-all' : kw.inoutType === '0' ? 'badge-income' : 'badge-expense']">
                                                        {{ kw.inoutType == null ? '전체' : kw.inoutType === '0' ? '수입' : '지출'
                                                        }}
                                                    </span>
                                                </td>
                                                <td class="col-kw-priority mono">{{ kw.priority }}</td>
                                                <td class="col-kw-status">
                                                    <span
                                                        :class="['status-pill', kw.enabledFlag === 'Y' ? 'is-active' : 'is-inactive']">
                                                        {{ kw.enabledFlag === 'Y' ? '활성' : '비활성' }}
                                                    </span>
                                                </td>
                                                <td class="col-kw-action">
                                                    <div class="action-btn-group">
                                                        <button class="btn-edit-sm" @click="startEdit(kw)">수정</button>
                                                        <button class="btn-icon-danger" @click="deleteKeyword(kw.keywordId)"
                                                            title="삭제">✕</button>
                                                    </div>
                                                </td>
                                            </template>
                                            <!-- 편집 모드 -->
                                            <template v-else>
                                                <td class="col-kw-no mono edit-row-indicator">✏️</td>
                                                <td class="col-kw-text">
                                                    <input type="text" v-model="keywordModal.editForm.keywordText"
                                                        class="inline-input" placeholder="키워드 텍스트">
                                                </td>
                                                <td class="col-kw-inout">
                                                    <select v-model="keywordModal.editForm.inoutType" class="inline-select">
                                                        <option value="">공통</option>
                                                        <option value="0">수입 (0)</option>
                                                        <option value="1">지출 (1)</option>
                                                    </select>
                                                </td>
                                                <td class="col-kw-priority">
                                                    <input type="number" v-model.number="keywordModal.editForm.priority"
                                                        class="inline-input inline-input-sm" min="1" max="999">
                                                </td>
                                                <td class="col-kw-status">
                                                    <select v-model="keywordModal.editForm.enabledFlag"
                                                        class="inline-select">
                                                        <option value="Y">활성</option>
                                                        <option value="N">비활성</option>
                                                    </select>
                                                </td>
                                                <td class="col-kw-action">
                                                    <div class="action-btn-group">
                                                        <button class="btn-primary btn-sm" @click="saveEdit">저장</button>
                                                        <button class="btn-secondary btn-sm" @click="cancelEdit">취소</button>
                                                    </div>
                                                </td>
                                            </template>
                                        </tr>
                                    </template>
                                    <tr v-else>
                                        <td colspan="6" class="empty-state">
                                            등록된 키워드가 없습니다. 위 폼을 통해 키워드를 추가해 보세요.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="keyword-info-box">
                            <span>💡</span>
                            <span>우선순위 숫자가 낮을수록 먼저 매칭됩니다. 수입/지출을 <strong>전체</strong>로 설정하면 구분 없이 매칭됩니다.</span>
                        </div>
                    </div>

                    <footer class="modal-footer">
                        <div class="keyword-count-label">
                            총 <strong>{{ keywordModal.keywords.length }}</strong>개의 키워드
                        </div>
                        <button type="button" class="btn-secondary" @click="closeKeywordModal">닫기</button>
                    </footer>
                </div>
            </div>
        </Transition>

    </div>
</template>

<script setup>
import mariaApi from '@scripts/util/mariaApi.js';
import { getResourceList } from '@scripts/util/common/SettingResource.js';
const router = useRouter();
// --- 원본 데이터 State ---
const presetGroups = ref([]);
const presetMasters = ref([]);

// 현재 선택된 탭(그룹)의 Code
const selectedGroupCode = ref('');

const options = reactive({
    categoryList: []
});

onMounted(async () => {
    options.categoryList = await getResourceList('ACCOUNT', 'PRESET_CATEGORY');
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

const categoryColorPalette = [
    { bg: '#fff7ed', text: '#c2410c' },  // 🍊 amber
    { bg: '#eff6ff', text: '#1d4ed8' },  // 💙 blue
    { bg: '#f0fdf4', text: '#15803d' },  // 💚 green
    { bg: '#fdf4ff', text: '#7e22ce' },  // 💜 purple
    { bg: '#f0fdfa', text: '#0f766e' },  // 🩵 teal
    { bg: '#fefce8', text: '#a16207' },  // 💛 yellow
    { bg: '#fff1f2', text: '#be123c' },  // 🌹 rose
    { bg: '#f0f9ff', text: '#0369a1' },  // 🩵 sky
    { bg: '#f5f3ff', text: '#6d28d9' },  // 🔮 violet
    { bg: '#fdf2f8', text: '#9d174d' },  // 🌸 pink
];
const getCategoryColor = (idx) => categoryColorPalette[idx % categoryColorPalette.length];

const groupedByCategory = computed(() => {
    let categoryMap = new Map();
    options.categoryList.forEach(c => { categoryMap[c.code] = c.name });

    const sorted = [...presetMasters.value]
        .sort((a, b) => (a.order || 0) - (b.order || 0) || a.presetCd.localeCompare(b.presetCd));
    const map = new Map();
    sorted.forEach(preset => {
        const cat = categoryMap[preset.presetCategory?.trim()] || '📂 미분류';
        if (!map.has(cat)) map.set(cat, []);
        map.get(cat).push(preset);
    });
    return map;
});


// --- Methods ---
const selectGroup = async (code, flag) => {
    if (flag == 'Y') {
        selectedGroupCode.value = code;
        await getPresetHeaderList();
    }
};

const goToMapping = (presetCd) => {
    router.push({
        path: '/system/preset-mapping',
        query: {
            presetCd: presetCd
        }
    })
}

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
        enabledFlag: 'Y',
        presetCategory: '',
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

const closeGroupModal = async () => {
    groupModal.open = false;
    await getPresetGroupList();
};

const saveGroup = async () => {
    const payload = { ...groupModal.form, presetGroupCd: groupModal.form.presetGroupCd.trim().toUpperCase() };

    if (groupModal.mode === 'CREATE') {
        const result = await mariaApi.post('/api/system-infos/preset/groups', payload);
        if (result.success) {
            await getPresetGroupList();
            selectedGroupCode.value = payload.presetGroupCd; // 새로 만든 탭으로 포커스
        }

    } else {
        const result = await mariaApi.put('/api/system-infos/preset/groups', payload);
        if (result.success) {

        }
    }
    await closeGroupModal();
};

const deleteGroup = async () => {
    const code = groupModal.form.presetGroupCd;
    const childCount = presetMasters.value.filter(p => p.presetGroupCd === code).length;

    if (childCount > 0) {
        return alert(`이 그룹에 속한 프리셋이 ${childCount}개 있습니다. 프리셋을 먼저 삭제하거나 이동해 주세요.`);
    }

    await mariaApi.delete(`/api/system-infos/preset/groups/${groupModal.form.presetGroupId}`);

    await closeGroupModal();
};


// =====================================
// 2. Preset Modal Logic
// =====================================
const presetModal = reactive({
    open: false,
    mode: 'CREATE',
    form: {
        presetPrefix: '',
        presetCd: '',
        presetNm: '',
        category: '',
        description: '',
        order: 0,
        enabledFlag: 'Y',
        inoutType: '',
        payType: '',
    }
});

const openPresetModal = (mode, data = null) => {
    presetModal.mode = mode;
    if (mode === 'EDIT' && data) {
        presetModal.form = { ...data };
        const cd = presetModal.form.presetCd.split('_');
        presetModal.form.presetPrefix = cd[0] + '_' + cd[1];
        presetModal.form.presetCd = cd[2];
    } else { // CREATE
        presetModal.form = {
            presetPrefix: '',
            presetCd: '',
            presetNm: '',
            category: '',
            description: '',
            enabledFlag: 'Y',
            inoutType: '',
            payType: '',
            presetGroupCd: selectedGroupCode.value
        };
    }
    presetModal.open = true;
};

const closePresetModal = () => presetModal.open = false;

const savePreset = async () => {
    const payload = { ...presetModal.form, presetCd: presetModal.form.presetPrefix + '_' + presetModal.form.presetCd.trim().toUpperCase(), presetGroupCd: selectedGroupCode.value };

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

const createPresetPrefix = () => {
    let prefix = ''
    if (presetModal.form.inoutType) {
        prefix = prefix + presetModal.form.inoutType + '_';
    }

    if (presetModal.form.payType) {
        const pt = presetModal.form.payType == 'BANK' ? 'ACC' : 'CRD';
        prefix = prefix + pt;
    }
    presetModal.form.presetPrefix = prefix;
}

// =====================================
// 3. Keyword Modal Logic
// =====================================
const keywordModal = reactive({
    open: false,
    preset: null,       // 현재 선택된 preset 객체
    keywords: [],       // 키워드 목록
    editingId: null,    // 현재 인라인 편집 중인 keywordId
    editForm: {
        keywordId: null,
        keywordText: '',
        inoutType: '',
        priority: 100,
        enabledFlag: 'Y'
    },
    addForm: {
        keywordText: '',
        inoutType: '',
        priority: 100,
        enabledFlag: 'Y'
    }
});

const openKeywordModal = async (preset) => {
    keywordModal.preset = preset;
    keywordModal.keywords = [];
    keywordModal.editingId = null;
    keywordModal.addForm = { keywordText: '', inoutType: '', priority: 100, enabledFlag: 'Y' };
    keywordModal.open = true;
    await loadKeywords(preset.presetCd);
};

const closeKeywordModal = () => {
    keywordModal.open = false;
    keywordModal.editingId = null;
};

const loadKeywords = async (presetCd) => {
    try {
        const param = {
            searchPresetCd: presetCd
        };
        const { data } = await mariaApi.get('/api/system-infos/preset/keywords', { params: param });
        keywordModal.keywords = data ?? [];
    } catch (e) {
        keywordModal.keywords = [];
    }
};

const addKeyword = async () => {
    if (!keywordModal.addForm.keywordText.trim()) {
        return alert('키워드 텍스트를 입력해 주세요.');
    }
    const payload = {
        presetCd: keywordModal.preset.presetCd,
        keywordText: keywordModal.addForm.keywordText.trim(),
        inoutType: keywordModal.addForm.inoutType === '' ? null : keywordModal.addForm.inoutType,
        priority: keywordModal.addForm.priority || 100,
        enabledFlag: keywordModal.addForm.enabledFlag
    };
    const result = await mariaApi.post('/api/system-infos/preset/keywords', payload);
    console.log(result);
    await loadKeywords(keywordModal.preset.presetCd);
};

const startEdit = (kw) => {
    keywordModal.editingId = kw.keywordId;
    keywordModal.editForm = {
        keywordId: kw.keywordId,
        keywordText: kw.keywordText,
        inoutType: kw.inoutType == null ? '' : kw.inoutType,
        priority: kw.priority,
        enabledFlag: kw.enabledFlag
    };
};

const cancelEdit = () => {
    keywordModal.editingId = null;
};

const saveEdit = async () => {
    if (!keywordModal.editForm.keywordText.trim()) {
        return alert('키워드 텍스트를 입력해 주세요.');
    }
    const payload = {
        keywordId: keywordModal.editForm.keywordId,
        presetCd: keywordModal.preset.presetCd,
        keywordText: keywordModal.editForm.keywordText.trim(),
        inoutType: keywordModal.editForm.inoutType === '' ? null : keywordModal.editForm.inoutType,
        priority: keywordModal.editForm.priority || 100,
        enabledFlag: keywordModal.editForm.enabledFlag
    };
    await mariaApi.post('/api/system-infos/preset/keywords', payload);
    keywordModal.editingId = null;
    await loadKeywords(keywordModal.preset.presetCd);
};

const deleteKeyword = async (keywordId) => {
    if (!confirm('이 키워드를 삭제하시겠습니까?')) return;
    await mariaApi.delete(`/api/system-infos/preset/keywords/${keywordId}`);
    await loadKeywords(keywordModal.preset.presetCd);
};
</script>

<style lang="scss" scoped>
@use '@@/common.scss' as *;

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
    max-height: 78vh;
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
        width: 3.6rem;
        text-align: center;
        color: $text-light;
    }

    .col-code {
        width: 10rem;
    }

    .col-name {
        min-width: 11rem;
    }

    .col-desc {
        min-width: 11rem;
    }

    .col-status {
        min-width: 7rem;
        text-align: center;
    }

    .col-mapping {
        min-width: 7rem;
        text-align: end;
    }

    .col-keyword {
        min-width: 7rem;
        text-align: center;
    }

    .col-action {
        min-width: 5.5rem;
        text-align: center;
    }

    .category-divider-row {
        cursor: default;

        .category-divider-cell {
            padding: 0;
            border-top: 2px solid darken($border-color, 6%);
        }

        .category-divider-inner {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 7px 16px;
        }

        .category-label {
            font-size: 12px;
            font-weight: 700;
            color: $text-sub;
            letter-spacing: 0.02em;
        }

        .category-count {
            font-size: 11px;
            color: $text-light;
            background: #dee2e6;
            padding: 1px 7px;
            border-radius: 999px;
            font-weight: 600;
        }
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

.btn-keyword-sm {
    background: #f0f7ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: 0.2s;
    white-space: nowrap;

    &:hover {
        background: #dbeafe;
        border-color: #93c5fd;
    }
}

/* =======================================
   Keyword Modal
======================================= */
.modal-container.modal-keyword {
    max-width: 780px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
}

.modal-sub {
    margin: 4px 0 0 0;
    font-size: 13px;
    color: $text-sub;

    .mono-badge {
        display: inline-block;
        background: #e9ecef;
        color: #495057;
        font-family: monospace;
        font-size: 12px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 4px;
        margin-right: 6px;
    }
}

/* 추가 폼 영역 */
.keyword-add-form {
    background: #f8faff;
    border: 1px solid #d0ebff;
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 20px;

    .keyword-add-title {
        font-size: 13px;
        font-weight: 700;
        color: #2563eb;
        margin-bottom: 12px;
    }

    .keyword-add-row {
        display: flex;
        gap: 10px;
        align-items: flex-end;
        flex-wrap: wrap;

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 5px;

            label {
                font-size: 12px;
                font-weight: 600;
                color: #495057;

                .required {
                    color: $danger;
                }
            }

            input,
            select {
                padding: 8px 10px;
                font-size: 13px;
                border: 1px solid #ced4da;
                border-radius: 7px;
                box-sizing: border-box;
                transition: border-color 0.2s;

                &:focus {
                    outline: none;
                    border-color: $primary;
                    box-shadow: 0 0 0 3px rgba($primary, 0.1);
                }
            }

            &.flex-grow {
                flex: 1;
                min-width: 180px;

                input {
                    width: 100%;
                }
            }

            &.form-group-sm {
                width: 80px;

                input {
                    width: 100%;
                    text-align: center;
                }
            }

            &.form-group-btn {
                .btn-primary {
                    padding: 8px 18px;
                    font-size: 13px;
                }
            }

            select {
                min-width: 100px;
            }
        }
    }
}

/* 키워드 테이블 */
.keyword-table-wrapper {
    border: 1px solid $border-color;
    border-radius: 10px;
    overflow: hidden;
    max-height: 340px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 10px;
    }
}

.keyword-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;

    th {
        background: $bg-main;
        padding: 11px 12px;
        font-size: 12px;
        font-weight: 600;
        color: $text-sub;
        position: sticky;
        top: 0;
        z-index: 5;
        box-shadow: 0 1px 0 $border-color;
    }

    td {
        padding: 11px 12px;
        vertical-align: middle;
        border-bottom: 1px solid $border-color;
        font-size: 13px;
    }

    tr:last-child td {
        border-bottom: none;
    }

    tr:hover td {
        background: rgba($primary, 0.02);
    }

    .col-kw-no {
        width: 40px;
        text-align: center;
        color: $text-light;
    }

    .col-kw-text {
        min-width: 160px;
    }

    .col-kw-inout {
        width: 90px;
        text-align: center;
    }

    .col-kw-priority {
        width: 80px;
        text-align: center;
    }

    .col-kw-status {
        width: 80px;
        text-align: center;
    }

    .col-kw-action {
        width: 120px;
        text-align: center;
    }

    .keyword-chip {
        display: inline-block;
        background: #f1f3f5;
        color: #212529;
        font-size: 13px;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 6px;
        border: 1px solid #dee2e6;
    }

    .inout-badge {
        display: inline-block;
        padding: 3px 9px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;

        &.badge-all {
            background: #f1f3f5;
            color: #495057;
        }

        &.badge-income {
            background: #eff6ff;
            color: #1d4ed8;
        }

        &.badge-expense {
            background: #fef2f2;
            color: #b91c1c;
        }
    }

    .mono {
        font-family: monospace;
        font-size: 14px;
    }

    .action-btn-group {
        display: flex;
        gap: 6px;
        justify-content: center;
    }

    .btn-icon-danger {
        background: none;
        border: none;
        color: #adb5bd;
        font-size: 15px;
        cursor: pointer;
        padding: 4px 6px;
        border-radius: 4px;
        transition: 0.2s;

        &:hover {
            color: $danger;
            background: #fff5f5;
        }
    }

    /* 인라인 편집 */
    .edit-row-indicator {
        color: #f59e0b;
        font-size: 13px;
    }

    .inline-input {
        width: 100%;
        padding: 6px 8px;
        font-size: 13px;
        border: 1px solid #a5d8ff;
        border-radius: 6px;
        box-sizing: border-box;
        background: #f0f9ff;

        &:focus {
            outline: none;
            border-color: $primary;
            box-shadow: 0 0 0 2px rgba($primary, 0.15);
        }

        &.inline-input-sm {
            text-align: center;
        }
    }

    .inline-select {
        width: 100%;
        padding: 6px 8px;
        font-size: 12px;
        border: 1px solid #a5d8ff;
        border-radius: 6px;
        background: #f0f9ff;

        &:focus {
            outline: none;
            border-color: $primary;
        }
    }

    .btn-sm {
        padding: 5px 12px;
        font-size: 12px;
    }

    .empty-state {
        text-align: center;
        padding: 36px;
        color: $text-light;
        font-size: 14px;
        background: #fafbfc;
    }
}

/* 안내 박스 */
.keyword-info-box {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    margin-top: 14px;
    padding: 10px 14px;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 8px;
    font-size: 12px;
    color: #92400e;
    line-height: 1.5;
}

/* 모달 푸터 */
.keyword-count-label {
    font-size: 13px;
    color: $text-sub;

    strong {
        color: $primary;
        font-size: 15px;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>