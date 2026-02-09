<template>
    <div class="lnb-content system-preset">

        <!-- 상단 필터 카드 -->
        <section class="d-panel search-section">
            <div class="condition-row">
                <div class="field">
                    <label>검색</label>
                    <input v-model="filters.keyword" type="text" placeholder="Preset명 / 코드 / 설명으로 검색" />
                </div>

                <div class="field">
                    <label>상태</label>
                    <select v-model="filters.status">
                        <option value="">전체</option>
                        <option value="ACTIVE">사용</option>
                        <option value="INACTIVE">중지</option>
                    </select>
                </div>

                <div class="field">
                    <label>정렬</label>
                    <select v-model="filters.sort">
                        <option value="ORDER_ASC">정렬순 ↑</option>
                        <option value="ORDER_DESC">정렬순 ↓</option>
                        <option value="NAME_ASC">이름 ↑</option>
                        <option value="NAME_DESC">이름 ↓</option>
                        <option value="CODE_ASC">코드 ↑</option>
                        <option value="CODE_DESC">코드 ↓</option>
                    </select>
                </div>
            </div>

            <div class="filter-actions">
                <button class="btn btn--ghost" type="button" @click="resetFilters">
                    필터 초기화
                </button>
                <button class="btn btn--primary" type="button" @click="openCreateModal()">
                    Preset 추가
                </button>
            </div>
        </section>

        <!-- 메인 레이아웃 -->
        <section class="main-section">
            <!-- 그룹 패널 -->
            <aside class="d-panel group-panel">
                <div class="panel-header">
                    <div>
                        <h2>Preset 그룹</h2>
                    </div>
                </div>

                <div class="group-list">
                    <button v-for="g in presetGroups" :key="g.code" type="button" class="group-item"
                        :class="{ 'is-active': g.code === selectedGroupCode }" @click="selectedGroupCode = g.code">
                        <div class="group-main">
                            <div class="group-name">{{ g.label }}</div>
                            <div class="group-code">{{ g.code }}</div>
                        </div>
                    </button>
                </div>

                <div class="group-footer">
                    <div class="helper">
                        선택 그룹:
                        <strong>{{ selectedGroup?.label || '-' }}</strong>
                    </div>
                    <button class="btn btn--primary" type="button" @click="openGroupModal('c')">
                        그룹 추가
                    </button>
                    <button class="btn btn--ghost w-full" type="button" @click="openGroupModal('u')">
                        그룹 관리
                    </button>
                </div>
            </aside>

            <main class="d-panel preset-panel">
                <div class="panel-header">
                    <div>
                        <h2>Preset 목록</h2>
                    </div>

                    <div class="panel-actions">
                        <button class="btn btn--ghost" type="button" @click="toggleOnlyActive">
                            {{ filters.onlyActive ? '전체 보기' : '사용중만' }}
                        </button>
                        <button class="btn btn--primary" type="button" @click="openCreateModal(selectedGroupCode)">
                            + 추가
                        </button>
                    </div>
                </div>

                <!-- 테이블 -->
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 90px;">정렬</th>
                                <th style="width: 140px;">코드</th>
                                <th>이름</th>
                                <th>설명</th>
                                <th style="width: 110px;">상태</th>
                                <th style="width: 160px;" class="right">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="p in filteredPresets" :key="p.code">
                                <td class="mono">{{ p.order }}</td>
                                <td class="mono">
                                    <div class="code-cell">{{ p.code }}</div>
                                    <div class="small muted">Group: {{ p.groupCode }}</div>
                                </td>
                                <td>
                                    <div class="name-cell">{{ p.name }}</div>
                                    <div class="small muted">등록일: {{ p.createdAt }}</div>
                                </td>
                                <td class="desc-cell">{{ p.description || '-' }}</td>
                                <td>
                                    <span class="status-pill" :class="p.status === 'ACTIVE' ? 'is-active' : 'is-inactive'">
                                        {{ p.status === 'ACTIVE' ? '사용' : '중지' }}
                                    </span>
                                </td>
                                <td class="right">
                                    <div class="row-actions">
                                        <button class="link-btn" type="button" @click="openEditModal(p)">수정</button>
                                        <span class="dot">·</span>
                                        <button class="link-btn" type="button" @click="toggleStatus(p)">
                                            {{ p.status === 'ACTIVE' ? '중지' : '사용' }}
                                        </button>
                                        <span class="dot">·</span>
                                        <button class="link-btn danger" type="button" @click="removePreset(p)">
                                            삭제
                                        </button>
                                    </div>
                                </td>
                            </tr>

                            <tr v-if="filteredPresets.length === 0">
                                <td class="empty" colspan="6">조건에 해당하는 Preset이 없습니다.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="panel-footer">
                    <div class="footer-note">
                        * 전표 생성 규칙(차/대변 매핑)은 “전표 Preset 규칙 관리” 메뉴에서 연결하는 구조를 권장합니다.
                    </div>
                </div>
            </main>
        </section>

        <!-- Create/Edit Modal -->
        <div v-if="modal.open" class="modal-backdrop" @click.self="closeModal">
            <div class="modal">
                <div class="modal-header">
                    <div>
                        <div class="modal-title">
                            {{ modal.mode === 'create' ? 'Preset 추가' : 'Preset 수정' }}
                        </div>
                        <div class="modal-sub">
                            입력 화면에서는 Preset만 선택하고, 실제 전표 규칙은 별도 메뉴에서 정의됩니다.
                        </div>
                    </div>
                    <button class="icon-btn" type="button" @click="closeModal">×</button>
                </div>

                <div class="modal-body">
                    <div class="form-grid">
                        <div class="field">
                            <label>그룹</label>
                            <select v-model="modal.form.groupCode" :disabled="modal.mode === 'edit'">
                                <option v-for="g in presetGroups" :key="g.code" :value="g.code">{{ g.label }} ({{ g.code }})
                                </option>
                            </select>
                        </div>

                        <div class="field">
                            <label>상태</label>
                            <select v-model="modal.form.status">
                                <option value="ACTIVE">사용</option>
                                <option value="INACTIVE">중지</option>
                            </select>
                        </div>

                        <div class="field">
                            <label>정렬순서</label>
                            <input v-model.number="modal.form.order" type="number" min="0" />
                        </div>

                        <div class="field">
                            <label>Preset 코드</label>
                            <input v-model="modal.form.code" type="text" placeholder="예: EXP_CARD_MEAL"
                                :disabled="modal.mode === 'edit'" />
                            <div class="help">* 수정 불가(권장). 코드 변경이 필요하면 새로 생성 후 마이그레이션</div>
                        </div>

                        <div class="field field--full">
                            <label>Preset 이름</label>
                            <input v-model="modal.form.name" type="text" placeholder="예: 식비 - 신용카드 결제" />
                        </div>

                        <div class="field field--full">
                            <label>설명</label>
                            <textarea v-model="modal.form.description" placeholder="입력화면에서 사용자에게 보이는 설명 문구"></textarea>
                        </div>
                    </div>

                    <div class="preview-box">
                        <div class="preview-title">미리보기</div>
                        <div class="preview-row">
                            <span class="preview-label">표시</span>
                            <span class="preview-value">
                                {{ groupLabel(modal.form.groupCode) }} · {{ modal.form.name || '(이름 없음)' }}
                            </span>
                        </div>
                        <div class="preview-row">
                            <span class="preview-label">코드</span>
                            <span class="preview-value mono">{{ modal.form.code || '-' }}</span>
                        </div>
                        <div class="preview-row">
                            <span class="preview-label">상태</span>
                            <span class="preview-value">
                                <span class="status-pill"
                                    :class="modal.form.status === 'ACTIVE' ? 'is-active' : 'is-inactive'">
                                    {{ modal.form.status === 'ACTIVE' ? '사용' : '중지' }}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn--ghost" type="button" @click="closeModal">취소</button>
                    <button class="btn btn--primary" type="button" @click="saveModal">
                        {{ modal.mode === 'create' ? '추가' : '저장' }}
                    </button>
                </div>
            </div>
        </div>
        <!-- Group Manage Modal -->
        <transition name="fade">
            <div v-if="groupModalOption.create.open" class="modal-backdrop" @keydown.esc="closeGroupModal('c')">
                <div class="modal">
                    <div class="modal-header">
                        <div>새 Preset 그룹 생성</div>
                        <button class="icon-btn" type="button" @click="closeGroupModal('c')">×</button>
                    </div>

                    <div class="modal-body">
                        <div class="form-grid">

                            <div class="field field--full">
                                <label>Preset 그룹 코드</label>
                                <input v-model="groupModalOption.create.form.presetGroupCd" type="text" placeholder="예: EXP_CARD" />
                            </div>

                            <div class="field field--full">
                                <label>Preset 그룹 이름</label>
                                <input v-model="groupModalOption.create.form.presetGroupNm" type="text" placeholder="예: 식비 - 신용카드 결제" />
                            </div>

                            <div class="field">
                                <label>Preset 그룹 약어</label>
                                <input v-model="groupModalOption.create.form.presetGroupEg" type="text" placeholder="예: EXP" />
                            </div>

                            <div class="field">
                                <label>상태</label>
                                <select v-model="groupModalOption.create.form.enabledFlag">
                                    <option value="Y">사용</option>
                                    <option value="N">중지</option>
                                </select>
                            </div>

                            <div class="field">
                                <label>정렬순서</label>
                                <input v-model.number="modal.form.order" type="number" min="0" />
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button class="btn btn--ghost" type="button" @click="closeGroupModal('c')">취소</button>
                        <button class="btn btn--primary" type="button" @click="saveNewPresetGroupList">
                            저장
                        </button>
                    </div>
                </div>
            </div>
        </transition>

        <transition name="fade">
            <div v-if="groupModalOption.update.open" class="modal-backdrop" @keydown.esc="closeGroupModal('u')">
                <div class="modal">
                    <div class="modal-header">
                        <div>Preset 그룹 관리</div>
                        <button class="icon-btn" type="button" @click="closeGroupModal('u')">×</button>
                    </div>

                    <div class="modal-body">
                        <div class="form-grid">

                            <div class="field">
                                <label>상태</label>
                                <select v-model="modal.form.status">
                                    <option value="ACTIVE">사용</option>
                                    <option value="INACTIVE">중지</option>
                                </select>
                            </div>

                            <div class="field">
                                <label>정렬순서</label>
                                <input v-model.number="modal.form.order" type="number" min="0" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>


    <div v-if="groupModalOpen" class="modal-backdrop" @click.self="closeGroupModal">
        <div class="modal modal--lg group-modal">
            <div class="modal-header">
                <div>
                    <div class="modal-title">Preset 그룹 관리</div>
                    <div class="modal-sub">
                        그룹 추가/수정/정렬/사용여부를 관리합니다. (Preset은 그룹코드를 참조합니다)
                    </div>
                </div>
                <button class="icon-btn" type="button" @click="closeGroupModal">×</button>
            </div>

            <div class="modal-body">
                <div class="group-manage-layout">
                    <!-- LEFT: 그룹 리스트 -->
                    <aside class="gm-left">
                        <div class="gm-head">
                            <div class="gm-title">그룹 목록</div>
                            <button class="btn btn--primary btn--sm" type="button" @click="startCreateGroup">
                                + 그룹 추가
                            </button>
                        </div>

                        <div class="gm-list">
                            <button v-for="g in groupsSorted" :key="g.code" type="button" class="gm-item"
                                :class="{ 'is-active': g.code === groupEditor.selectedCode }"
                                @click="selectGroupForEdit(g.code)">
                                <div class="gm-item-main">
                                    <div class="gm-name">
                                        {{ g.label }}
                                        <span class="status-pill mini"
                                            :class="g.status === 'ACTIVE' ? 'is-active' : 'is-inactive'">
                                            {{ g.status === 'ACTIVE' ? '사용' : '중지' }}
                                        </span>
                                    </div>
                                    <div class="gm-code mono">{{ g.code }}</div>
                                </div>

                                <div class="gm-item-meta">
                                    <span class="cnt">Preset {{ countByGroup(g.code) }}</span>
                                    <span class="ord mono">#{{ g.order ?? 0 }}</span>
                                </div>
                            </button>

                            <div v-if="groupsSorted.length === 0" class="gm-empty">
                                그룹이 없습니다. “+ 그룹 추가”로 생성해 주세요.
                            </div>
                        </div>

                        <div class="gm-foot">
                            <div class="note muted small">
                                * 그룹 코드 변경은 권장하지 않습니다. 필요 시 신규 생성 후 Preset 이관을 권장합니다.
                            </div>
                        </div>
                    </aside>

                    <!-- RIGHT: 에디터 -->
                    <section class="gm-right">
                        <div class="gm-editor-head">
                            <div>
                                <div class="gm-title">그룹 편집</div>
                                <div class="gm-sub muted small">
                                    그룹 정보 변경 시, 연결된 Preset 표시/필터에도 즉시 반영됩니다.
                                </div>
                            </div>

                            <div class="gm-actions">
                                <button class="btn btn--ghost btn--sm" type="button" @click="revertGroupEditor"
                                    :disabled="!groupEditor.dirty">
                                    되돌리기
                                </button>
                                <button class="btn btn--ghost btn--sm" type="button" @click="removeSelectedGroup"
                                    :disabled="!groupEditor.selectedCode">
                                    삭제
                                </button>
                                <button class="btn btn--primary btn--sm" type="button" @click="saveGroupEditor"
                                    :disabled="!groupEditor.dirty">
                                    저장
                                </button>
                            </div>
                        </div>

                        <div v-if="!groupEditor.selectedCode && groupEditor.mode !== 'create'" class="gm-editor-empty">
                            좌측에서 그룹을 선택하거나 “+ 그룹 추가”를 눌러 주세요.
                        </div>

                        <div v-else class="gm-editor">
                            <div class="form-grid">
                                <div class="field">
                                    <label>그룹 코드</label>
                                    <input v-model="groupEditor.form.code" type="text" placeholder="예: EXPENSE"
                                        :disabled="groupEditor.mode === 'edit'" />
                                    <div class="help">* 수정 불가(권장). 변경이 필요하면 새 그룹 생성 후 이관</div>
                                </div>

                                <div class="field">
                                    <label>상태</label>
                                    <select v-model="groupEditor.form.status">
                                        <option value="ACTIVE">사용</option>
                                        <option value="INACTIVE">중지</option>
                                    </select>
                                </div>

                                <div class="field">
                                    <label>정렬순서</label>
                                    <input v-model.number="groupEditor.form.order" type="number" min="0" />
                                </div>

                                <div class="field field--full">
                                    <label>그룹명</label>
                                    <input v-model="groupEditor.form.label" type="text" placeholder="예: 지출" />
                                </div>
                            </div>

                            <div class="preview-box">
                                <div class="preview-title">미리보기</div>
                                <div class="preview-row">
                                    <span class="preview-label">표시</span>
                                    <span class="preview-value">
                                        {{ groupEditor.form.label || '(이름 없음)' }}
                                        <span class="status-pill mini"
                                            :class="groupEditor.form.status === 'ACTIVE' ? 'is-active' : 'is-inactive'">
                                            {{ groupEditor.form.status === 'ACTIVE' ? '사용' : '중지' }}
                                        </span>
                                    </span>
                                </div>
                                <div class="preview-row">
                                    <span class="preview-label">코드</span>
                                    <span class="preview-value mono">{{ (groupEditor.form.code || '-').toUpperCase()
                                    }}</span>
                                </div>
                                <div class="preview-row">
                                    <span class="preview-label">연결 Preset</span>
                                    <span class="preview-value">총 {{ countByGroup((groupEditor.form.code ||
                                        '').toUpperCase()) }}개</span>
                                </div>
                            </div>

                            <div v-if="groupEditor.mode === 'edit'" class="warn-box">
                                <div class="warn-title">삭제 주의</div>
                                <div class="warn-text">
                                    그룹 삭제는 연결된 Preset이 0개일 때만 가능하도록 권장합니다.
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn--ghost" type="button" @click="closeGroupModal">닫기</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import mariaApi from '@scripts/util/mariaApi.js';


/**
 * Preset Groups
 */
const presetGroups = ref([]);
const groupModalOption = reactive({
    create: {
        open: false,
        form: {
            presetGroupCd: '',
            presetGroupNm: '',
            presetGroupEg: '',
            enabledFlag: 'Y',
            order: 0
        }
    },
    update: {
        open: false,
        form: {
            presetGroupCd: '',
            presetGroupNm: '',
            presetGroupEg: '',
            enabledFlag: 'Y',
            order: 0
        }
    }
});

/**
 * Preset Master
 */
const selectedGroupCode = ref('EXPENSE');

onMounted(async () => {
    await getPresetGroupList();
});

/**
 * getPresetGroupList
 * - Preset Group 전체 조회
 */
const getPresetGroupList = async () => {
    const { data } = await mariaApi.get('/api/system/preset/groups');
    console.log(data);

    presetGroups.value = data.map(d => {
        return {
            code: d.presetGroupCd,
            label: d.presetGroupNm
        }
    });
}

const saveNewPresetGroupList = async () => {
    const saveData = groupModalOption.create.form;
    const { data } = await mariaApi.post('/api/system/preset/groups', saveData);

    console.log(data);
}

/**
 * Preset Master (더미 데이터)
 * 실제 구현에서는 DB 테이블 + API로 관리
 */
const presets = reactive([
    {
        groupCode: 'EXPENSE',
        code: 'EXP_CARD_MEAL',
        name: '식비 - 신용카드 결제',
        description: '식당/카페 등에서 카드로 결제한 식비',
        status: 'ACTIVE',
        order: 10,
        createdAt: '2025-01-01'
    },
    {
        groupCode: 'EXPENSE',
        code: 'EXP_CARD_MART',
        name: '마트/장보기 - 신용카드',
        description: '장보기/생활용품 카드 결제',
        status: 'ACTIVE',
        order: 20,
        createdAt: '2025-01-01'
    },
    {
        groupCode: 'EXPENSE',
        code: 'EXP_TRANSFER_RENT',
        name: '월세/관리비 - 계좌이체',
        description: '월세 및 관리비 이체',
        status: 'ACTIVE',
        order: 30,
        createdAt: '2025-01-02'
    },
    {
        groupCode: 'INCOME',
        code: 'INC_SALARY_BANK',
        name: '급여 입금 - 통장',
        description: '월급/상여 등 급여성 수입',
        status: 'ACTIVE',
        order: 10,
        createdAt: '2025-01-03'
    },
    {
        groupCode: 'INCOME',
        code: 'INC_INTEREST_BANK',
        name: '이자/배당 - 통장',
        description: '예금이자/배당금 등',
        status: 'INACTIVE',
        order: 20,
        createdAt: '2025-02-01'
    },
    {
        groupCode: 'TRANSFER',
        code: 'TRF_CARD_PAY',
        name: '신용카드 대금 출금',
        description: '통장에서 카드 대금 자동이체',
        status: 'ACTIVE',
        order: 10,
        createdAt: '2025-02-10'
    }
]);

/**
 * 상태/필터
 */

const filters = reactive({
    keyword: '',
    status: '',
    sort: 'ORDER_ASC',
    onlyActive: false
});

const selectedGroup = computed(() => presetGroups.value.find((g) => g.code === selectedGroupCode.value) || null);

const filteredPresets = computed(() => {
    const list = presets.filter((p) => p.groupCode === selectedGroupCode.value);

    const keyword = filters.keyword.trim().toLowerCase();
    let result = list.filter((p) => {
        if (filters.onlyActive && p.status !== 'ACTIVE') return false;
        if (filters.status && p.status !== filters.status) return false;

        if (!keyword) return true;

        const hay = `${p.code} ${p.name} ${p.description || ''}`.toLowerCase();
        return hay.includes(keyword);
    });

    result = result.slice().sort((a, b) => {
        switch (filters.sort) {
            case 'ORDER_ASC':
                return (a.order ?? 0) - (b.order ?? 0);
            case 'ORDER_DESC':
                return (b.order ?? 0) - (a.order ?? 0);
            case 'NAME_ASC':
                return (a.name || '').localeCompare(b.name || '');
            case 'NAME_DESC':
                return (b.name || '').localeCompare(a.name || '');
            case 'CODE_ASC':
                return (a.code || '').localeCompare(b.code || '');
            case 'CODE_DESC':
                return (b.code || '').localeCompare(a.code || '');
            default:
                return 0;
        }
    });

    return result;
});

function countByGroup(code) {
    return presets.filter((p) => p.groupCode === code).length;
}

function groupLabel(code) {
    return presetGroups.value.find((g) => g.code === code)?.label || code || '-';
}

function resetFilters() {
    filters.keyword = '';
    filters.status = '';
    filters.sort = 'ORDER_ASC';
    filters.onlyActive = false;
}

function toggleOnlyActive() {
    filters.onlyActive = !filters.onlyActive;
}

/**
 * 모달 (create/edit)
 */
const modal = reactive({



    open: false,
    mode: 'create', // 'create' | 'edit'
    form: {
        groupCode: 'EXPENSE',
        status: 'ACTIVE',
        order: 10,
        code: '',
        name: '',
        description: ''
    },
    editingKey: null
});

function openCreateModal(groupCode = selectedGroupCode.value) {
    modal.open = true;
    modal.mode = 'create';
    modal.editingKey = null;
    modal.form.groupCode = groupCode;
    modal.form.status = 'ACTIVE';
    modal.form.order = 10;
    modal.form.code = '';
    modal.form.name = '';
    modal.form.description = '';
}

function openEditModal(p) {
    modal.open = true;
    modal.mode = 'edit';
    modal.editingKey = p.code;
    modal.form.groupCode = p.groupCode;
    modal.form.status = p.status;
    modal.form.order = p.order ?? 0;
    modal.form.code = p.code;
    modal.form.name = p.name;
    modal.form.description = p.description || '';
}

function closeModal() {
    modal.open = false;
}

function saveModal() {
    // 간단 검증
    if (!modal.form.groupCode) return alert('그룹을 선택하세요.');
    if (!modal.form.code.trim()) return alert('Preset 코드를 입력하세요.');
    if (!modal.form.name.trim()) return alert('Preset 이름을 입력하세요.');

    const code = modal.form.code.trim().toUpperCase();

    if (modal.mode === 'create') {
        const exists = presets.some((p) => p.code === code);
        if (exists) return alert('이미 존재하는 Preset 코드입니다.');

        presets.push({
            groupCode: modal.form.groupCode,
            code,
            name: modal.form.name.trim(),
            description: modal.form.description.trim(),
            status: modal.form.status,
            order: Number(modal.form.order || 0),
            createdAt: new Date().toISOString().slice(0, 10)
        });

        selectedGroupCode.value = modal.form.groupCode;
    } else {
        const idx = presets.findIndex((p) => p.code === modal.editingKey);
        if (idx === -1) return alert('대상을 찾을 수 없습니다.');

        presets[idx].status = modal.form.status;
        presets[idx].order = Number(modal.form.order || 0);
        presets[idx].name = modal.form.name.trim();
        presets[idx].description = modal.form.description.trim();
    }

    modal.open = false;
}

function toggleStatus(p) {
    p.status = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
}

function removePreset(p) {
    const ok = confirm(`삭제하시겠습니까?\n- ${p.code}\n- ${p.name}`);
    if (!ok) return;

    const idx = presets.findIndex((x) => x.code === p.code);
    if (idx >= 0) presets.splice(idx, 1);
}

function onExport() {
    alert('내보내기(예시): 실제 구현 시 CSV/JSON 다운로드로 연결하세요.');
}


    /******************************
     ******* Modal  Function ******
     ******************************/
    // Group Modal
    function openGroupModal(type) {
        if (type === 'c') {
            groupModalOption.create.form = {
                presetGroupCd: '',
                presetGroupNm: '',
                presetGroupEg: '',
                enabledFlag: 'Y'
            };
            groupModalOption.create.open = true;
        } else if (type === 'u') {
            groupModalOption.update.open = true;
        }

        // 모달 열 때 현재 선택 그룹을 에디터에 로드
        // if (selectedGroupCode.value) {
        //     selectGroupForEdit(selectedGroupCode.value);
        // } else if (presetGroups.value[0]?.code) {
        //     selectGroupForEdit(presetGroups.value[0].code);
        // }
    }
    function closeGroupModal(type) {
        if (type === 'c') {
            groupModalOption.create.open = false;
        } else if (type === 'u') {
            groupModalOption.update.open = false;
            groupModalOption.update.form = {
                presetGroupCd: '',
                presetGroupNm: '',
                presetGroupEg: '',
                enabledFlag: 'Y'
            };
        }
    }

const groupsSorted = computed(() => {
    return presetGroups.value
        .map((g, idx) => ({
            code: (g.code || "").toUpperCase(),
            label: g.label,
            order: g.order ?? (idx + 1) * 10,
            status: g.status ?? "ACTIVE",
        }))
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

/**
 * Editor (create/edit)
 */
const groupEditor = reactive({
    mode: "edit", // 'create' | 'edit'
    selectedCode: "", // 현재 선택된 그룹 code
    form: {
        code: "",
        label: "",
        order: 10,
        status: "ACTIVE",
    },
    baseline: null,
    dirty: false,
});

function setGroupEditorBaseline() {
    groupEditor.baseline = {
        code: groupEditor.form.code,
        label: groupEditor.form.label,
        order: groupEditor.form.order,
        status: groupEditor.form.status,
    };
    groupEditor.dirty = false;
}

function selectGroupForEdit(code) {
    const upper = (code || "").toUpperCase();
    const g = groupsSorted.value.find((x) => x.code === upper);
    if (!g) return;

    groupEditor.mode = "edit";
    groupEditor.selectedCode = g.code;
    groupEditor.form.code = g.code;
    groupEditor.form.label = g.label;
    groupEditor.form.order = Number(g.order ?? 0);
    groupEditor.form.status = g.status ?? "ACTIVE";
    setGroupEditorBaseline();
}

function startCreateGroup() {
    groupEditor.mode = "create";
    groupEditor.selectedCode = ""; // create 모드에서는 기존 선택 해제
    groupEditor.form.code = "";
    groupEditor.form.label = "";
    groupEditor.form.order = (groupsSorted.value.at(-1)?.order || 0) + 10;
    groupEditor.form.status = "ACTIVE";
    setGroupEditorBaseline();
    // create 모드는 입력 즉시 dirty가 켜지는 게 자연스러우므로 baseline 후 강제 dirty on
    groupEditor.dirty = true;
}

function revertGroupEditor() {
    if (!groupEditor.baseline) return;
    groupEditor.form.code = groupEditor.baseline.code;
    groupEditor.form.label = groupEditor.baseline.label;
    groupEditor.form.order = groupEditor.baseline.order;
    groupEditor.form.status = groupEditor.baseline.status;
    groupEditor.dirty = false;
}

function saveGroupEditor() {
    // validation
    const code = (groupEditor.form.code || "").trim().toUpperCase();
    const label = (groupEditor.form.label || "").trim();
    if (!code) return alert("그룹 코드를 입력해 주세요.");
    if (!label) return alert("그룹명을 입력해 주세요.");

    if (groupEditor.mode === "create") {
        const exists = presetGroups.value.some((g) => (g.code || "").toUpperCase() === code);
        if (exists) return alert("이미 존재하는 그룹 코드입니다.");

        presetGroups.value.push({
            code,
            label,
            order: Number(groupEditor.form.order || 0),
            status: groupEditor.form.status,
        });

        // 생성한 그룹을 선택 그룹으로
        selectedGroupCode.value = code;
        selectGroupForEdit(code);
    } else {
        const idx = presetGroups.value.findIndex((g) => (g.code || "").toUpperCase() === groupEditor.selectedCode);
        if (idx < 0) return alert("대상을 찾을 수 없습니다.");

        // code는 edit에서 수정 불가
        presetGroups.value[idx] = {
            ...presetGroups.value[idx],
            label,
            order: Number(groupEditor.form.order || 0),
            status: groupEditor.form.status,
        };
        selectGroupForEdit(groupEditor.selectedCode);
    }
}
</script>

<style lang="scss" src="@@/system/systemPreset.scss" />