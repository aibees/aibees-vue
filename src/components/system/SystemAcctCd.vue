<template>
    <div class="page">
        <div class="container">
            <!-- Header -->
            <header class="header">
                <div class="header__left">
                    <h1>계정과목 Master</h1>
                    <p class="sub">
                        계정과목 트리를 관리합니다. (예: 200 부채 → 410 신용카드 → 411 삼성카드)
                    </p>
                </div>
                <div class="header__right">
                    <button class="btn btn--ghost" type="button" @click="exportJson">내보내기</button>
                    <button class="btn btn--primary" type="button" @click="openCreate()">계정 추가</button>
                </div>
            </header>

            <!-- Filters -->
            <section class="card filters">
                <div class="filters__row">
                    <div class="field">
                        <label>검색</label>
                        <input v-model="filters.q" placeholder="코드/이름/설명" />
                    </div>

                    <div class="field">
                        <label>분류</label>
                        <select v-model="filters.type">
                            <option value="">전체</option>
                            <option value="ASSET">자산</option>
                            <option value="LIABILITY">부채</option>
                            <option value="EQUITY">자본</option>
                            <option value="INCOME">수익</option>
                            <option value="EXPENSE">비용</option>
                        </select>
                    </div>

                    <div class="field">
                        <label>상태</label>
                        <select v-model="filters.status">
                            <option value="">전체</option>
                            <option value="ACTIVE">사용</option>
                            <option value="INACTIVE">중지</option>
                        </select>
                    </div>

                    <div class="field field--actions">
                        <button class="btn btn--ghost" type="button" @click="resetFilters">초기화</button>
                    </div>
                </div>

                <div class="filters__row filters__row--sub">
                    <label class="chk">
                        <input type="checkbox" v-model="filters.hideInactive" />
                        <span>중지 숨기기</span>
                    </label>
                    <label class="chk">
                        <input type="checkbox" v-model="filters.onlyLeaf" />
                        <span>말단(leaf)만</span>
                    </label>

                    <div class="spacer"></div>

                    <button class="btn btn--ghost btn--sm" type="button" @click="collapseAll">전체 접기</button>
                    <button class="btn btn--ghost btn--sm" type="button" @click="expandAll">전체 펼치기</button>
                </div>
            </section>

            <!-- Main -->
            <section class="layout">
                <!-- Left: Tree -->
                <aside class="card tree">
                    <div class="card__head">
                        <div>
                            <h2>계정 트리</h2>
                            <p class="hint">클릭하면 우측 상세가 바뀝니다.</p>
                        </div>
                        <div class="pill">Tree</div>
                    </div>

                    <div class="tree__body">
                        <div v-if="flatTree.length === 0" class="empty">
                            조건에 맞는 계정이 없습니다.
                        </div>

                        <button v-for="n in flatTree" :key="n.code" class="treeRow"
                            :class="{ 'is-selected': selectedCode === n.code }" type="button" @click="select(n.code)">
                            <span class="treeRow__indent" :style="{ width: `${n.depth * 14}px` }"></span>

                            <span class="treeRow__caret" :class="{ 'is-leaf': !n.hasChildren }"
                                @click.stop="n.hasChildren ? toggle(n.code) : null">
                                {{ n.hasChildren ? (expanded.has(n.code) ? '▾' : '▸') : '·' }}
                            </span>

                            <span class="typeTag" :class="typeClass(n.type)">{{ typeLabel(n.type) }}</span>

                            <span class="treeRow__title">
                                <span class="mono code">{{ n.code }}</span>
                                <span class="name">{{ n.name }}</span>
                            </span>

                            <span class="status" :class="n.status === 'ACTIVE' ? 'ok' : 'off'">
                                {{ n.status === 'ACTIVE' ? '사용' : '중지' }}
                            </span>
                        </button>
                    </div>

                    <div class="tree__foot">
                        <div class="sel">
                            선택:
                            <strong>{{ selectedNode ? `${selectedNode.code} ${selectedNode.name}` : '-' }}</strong>
                        </div>
                        <div class="tree__footBtns">
                            <button class="btn btn--ghost" type="button" :disabled="!selectedNode"
                                @click="openCreate(selectedCode)">
                                하위 추가
                            </button>
                            <button class="btn btn--primary" type="button" :disabled="!selectedNode"
                                @click="openEdit(selectedNode)">
                                수정
                            </button>
                        </div>
                    </div>
                </aside>

                <!-- Right: Detail -->
                <main class="card detail">
                    <div class="card__head">
                        <div>
                            <h2>계정 상세</h2>
                            <p class="hint">속성 확인 및 상태/삭제/수정</p>
                        </div>
                        <div class="pill">Detail</div>
                    </div>

                    <div v-if="!selectedNode" class="empty empty--detail">
                        왼쪽 트리에서 계정을 선택해주세요.
                    </div>

                    <div v-else class="detail__body">
                        <div class="detailTop">
                            <div class="detailTitle">
                                <span class="typeTag" :class="typeClass(selectedNode.type)">
                                    {{ typeLabel(selectedNode.type) }}
                                </span>
                                <div>
                                    <div class="mono big">{{ selectedNode.code }}</div>
                                    <div class="nm">{{ selectedNode.name }}</div>
                                </div>
                            </div>

                            <div class="detailActions">
                                <button class="btn btn--ghost" type="button" @click="toggleStatus(selectedNode)">
                                    {{ selectedNode.status === 'ACTIVE' ? '중지' : '사용' }}
                                </button>
                                <button class="btn btn--ghost danger" type="button" @click="remove(selectedNode)">
                                    삭제
                                </button>
                            </div>
                        </div>

                        <div class="kv">
                            <div class="kv__item">
                                <div class="k">상태</div>
                                <div class="v">
                                    <span class="statusPill" :class="selectedNode.status === 'ACTIVE' ? 'ok' : 'off'">
                                        {{ selectedNode.status === 'ACTIVE' ? '사용' : '중지' }}
                                    </span>
                                </div>
                            </div>
                            <div class="kv__item">
                                <div class="k">부모</div>
                                <div class="v mono">{{ selectedNode.parentCode || '-' }}</div>
                            </div>
                            <div class="kv__item">
                                <div class="k">Depth</div>
                                <div class="v mono">{{ depthOf(selectedNode.code) }}</div>
                            </div>
                            <div class="kv__item">
                                <div class="k">Leaf</div>
                                <div class="v">
                                    <span class="leafPill" :class="isLeaf(selectedNode.code) ? 'leaf' : 'parent'">
                                        {{ isLeaf(selectedNode.code) ? 'Leaf' : 'Parent' }}
                                    </span>
                                </div>
                            </div>
                            <div class="kv__item kv__item--full">
                                <div class="k">설명</div>
                                <div class="v">{{ selectedNode.description || '-' }}</div>
                            </div>
                        </div>

                        <div class="childBox">
                            <div class="childHead">
                                <h3>하위 계정</h3>
                                <span class="muted">{{ childrenOf(selectedNode.code).length }}개</span>
                            </div>

                            <div class="childTable">
                                <table>
                                    <thead>
                                        <tr>
                                            <th style="width: 140px;">코드</th>
                                            <th>이름</th>
                                            <th style="width: 110px;">상태</th>
                                            <th style="width: 150px;" class="right">관리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="c in childrenOf(selectedNode.code)" :key="c.code">
                                            <td class="mono">{{ c.code }}</td>
                                            <td>
                                                <div class="rowName">{{ c.name }}</div>
                                                <div class="rowDesc">{{ c.description || '-' }}</div>
                                            </td>
                                            <td>
                                                <span class="statusPill" :class="c.status === 'ACTIVE' ? 'ok' : 'off'">
                                                    {{ c.status === 'ACTIVE' ? '사용' : '중지' }}
                                                </span>
                                            </td>
                                            <td class="right">
                                                <button class="link" type="button" @click="openEdit(c)">수정</button>
                                                <span class="dot">·</span>
                                                <button class="link" type="button" @click="toggleStatus(c)">
                                                    {{ c.status === 'ACTIVE' ? '중지' : '사용' }}
                                                </button>
                                            </td>
                                        </tr>
                                        <tr v-if="childrenOf(selectedNode.code).length === 0">
                                            <td colspan="4" class="emptyRow">하위 계정이 없습니다.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="childFoot">
                                <button class="btn btn--primary" type="button" @click="openCreate(selectedNode.code)">
                                    + 하위 계정 추가
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="footnote">
                        * 운영 권장: 사용 중인 계정은 삭제 대신 “중지(비활성)”로 전환 후 히스토리 보존
                    </div>
                </main>
            </section>

            <!-- Modal -->
            <div v-if="modal.open" class="modalBack" @click.self="closeModal">
                <div class="modal">
                    <div class="modal__head">
                        <div>
                            <div class="modal__title">{{ modal.mode === 'create' ? '계정 추가' : '계정 수정' }}</div>
                            <div class="modal__sub">코드 변경은 운영상 위험하므로 수정 화면에서는 비활성 처리했습니다.</div>
                        </div>
                        <button class="x" type="button" @click="closeModal">×</button>
                    </div>

                    <div class="modal__body">
                        <div class="form">
                            <div class="field">
                                <label>분류</label>
                                <select v-model="modal.form.type">
                                    <option value="ASSET">자산</option>
                                    <option value="LIABILITY">부채</option>
                                    <option value="EQUITY">자본</option>
                                    <option value="INCOME">수익</option>
                                    <option value="EXPENSE">비용</option>
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
                                <label>부모 코드</label>
                                <input v-model="modal.form.parentCode" placeholder="없으면 비움" />
                            </div>

                            <div class="field">
                                <label>정렬</label>
                                <input v-model.number="modal.form.order" type="number" min="0" />
                            </div>

                            <div class="field">
                                <label>계정 코드</label>
                                <input v-model="modal.form.code" :disabled="modal.mode === 'edit'" placeholder="예: 411" />
                            </div>

                            <div class="field span2">
                                <label>계정명</label>
                                <input v-model="modal.form.name" placeholder="예: 삼성카드" />
                            </div>

                            <div class="field span2">
                                <label>설명</label>
                                <textarea v-model="modal.form.description" placeholder="선택 입력"></textarea>
                            </div>
                        </div>

                        <div class="preview">
                            <div class="preview__t">미리보기</div>
                            <div class="preview__row">
                                <span class="k">표시</span>
                                <span class="v">
                                    <span class="typeTag" :class="typeClass(modal.form.type)">{{ typeLabel(modal.form.type)
                                    }}</span>
                                    <span class="mono">{{ modal.form.code || '-' }}</span>
                                    {{ modal.form.name || '(이름 없음)' }}
                                </span>
                            </div>
                            <div class="preview__row">
                                <span class="k">부모</span>
                                <span class="v mono">{{ modal.form.parentCode || '-' }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="modal__foot">
                        <button class="btn btn--ghost" type="button" @click="closeModal">취소</button>
                        <button class="btn btn--primary" type="button" @click="saveModal">
                            {{ modal.mode === 'create' ? '추가' : '저장' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { computed, reactive, ref } from 'vue';

/** 데이터(더미) */
const accounts = reactive([
    { code: '100', parentCode: '', type: 'ASSET', name: '자산', description: '자산 루트', status: 'ACTIVE', order: 10 },
    { code: '110', parentCode: '100', type: 'ASSET', name: '현금성자산', description: '', status: 'ACTIVE', order: 10 },
    { code: '111', parentCode: '110', type: 'ASSET', name: '현금', description: '', status: 'ACTIVE', order: 10 },
    { code: '112', parentCode: '110', type: 'ASSET', name: '입출금통장', description: '', status: 'ACTIVE', order: 20 },

    { code: '200', parentCode: '', type: 'LIABILITY', name: '부채', description: '부채 루트', status: 'ACTIVE', order: 20 },
    { code: '410', parentCode: '200', type: 'LIABILITY', name: '신용카드', description: '', status: 'ACTIVE', order: 10 },
    { code: '411', parentCode: '410', type: 'LIABILITY', name: '삼성카드', description: '미지급금', status: 'ACTIVE', order: 10 },
    { code: '412', parentCode: '410', type: 'LIABILITY', name: '현대카드', description: '미지급금', status: 'INACTIVE', order: 20 },

    { code: '300', parentCode: '', type: 'EQUITY', name: '자본', description: '자본 루트', status: 'ACTIVE', order: 30 },
    { code: '400', parentCode: '', type: 'INCOME', name: '수익', description: '수익 루트', status: 'ACTIVE', order: 40 },
    { code: '500', parentCode: '', type: 'EXPENSE', name: '비용', description: '비용 루트', status: 'ACTIVE', order: 50 },
    { code: '510', parentCode: '500', type: 'EXPENSE', name: '식비', description: '', status: 'ACTIVE', order: 10 },
]);

/** UI 상태 */
const selectedCode = ref('');
const expanded = reactive(new Set()); // 펼친 노드 코드 Set

/** 필터 */
const filters = reactive({
    q: '',
    type: '',
    status: '',
    hideInactive: false,
    onlyLeaf: false,
});

/** 인덱스 */
const byCode = computed(() => {
    const m = new Map();
    accounts.forEach(a => m.set(a.code, a));
    return m;
});

function childrenOf(code) {
    return accounts
        .filter(a => a.parentCode === code)
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.code).localeCompare(String(b.code)));
}

function isLeaf(code) {
    return childrenOf(code).length === 0;
}

function depthOf(code) {
    let d = 1;
    let cur = byCode.value.get(code);
    while (cur && cur.parentCode) {
        d += 1;
        cur = byCode.value.get(cur.parentCode);
    }
    return d;
}

/** 필터 매칭 */
function matchNode(a) {
    if (filters.hideInactive && a.status === 'INACTIVE') return false;
    if (filters.type && a.type !== filters.type) return false;
    if (filters.status && a.status !== filters.status) return false;
    if (filters.onlyLeaf && !isLeaf(a.code)) return false;

    const q = filters.q.trim().toLowerCase();
    if (!q) return true;
    const hay = `${a.code} ${a.name} ${a.description || ''}`.toLowerCase();
    return hay.includes(q);
}

/**
 * 트리 표시를 안정적으로: flatten 방식
 * - 필터가 없으면: (root부터) expanded set 기반으로만 펼침
 * - 필터가 있으면: match 노드 + 조상 경로는 자동 포함/자동 펼침(가독성↑)
 */
const flatTree = computed(() => {
    const roots = accounts
        .filter(a => !a.parentCode)
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.code).localeCompare(String(b.code)));

    const hasAnyFilter =
        !!filters.q.trim() || !!filters.type || !!filters.status || filters.hideInactive || filters.onlyLeaf;

    // 필터 모드: match된 노드들의 조상들을 visible로 만들기
    const visible = new Set();
    const forceExpand = new Set();

    if (hasAnyFilter) {
        for (const a of accounts) {
            if (!matchNode(a)) continue;
            // 조상 포함
            let cur = a;
            visible.add(cur.code);
            while (cur.parentCode) {
                visible.add(cur.parentCode);
                forceExpand.add(cur.parentCode); // 조상은 펼쳐야 하위가 보임
                cur = byCode.value.get(cur.parentCode);
                if (!cur) break;
            }
        }
    }

    const out = [];
    const walk = (node, depth) => {
        if (hasAnyFilter && !visible.has(node.code)) return;

        // 필터가 없을 때도 hideInactive 적용
        if (!hasAnyFilter && filters.hideInactive && node.status === 'INACTIVE') return;

        const kids = childrenOf(node.code).filter(k => (filters.hideInactive ? k.status !== 'INACTIVE' : true));
        const hasChildren = kids.length > 0;

        out.push({
            ...node,
            depth,
            hasChildren,
        });

        const open = hasAnyFilter ? forceExpand.has(node.code) : expanded.has(node.code);
        if (hasChildren && open) kids.forEach(k => walk(k, depth + 1));
    };

    roots.forEach(r => walk(r, 0));
    return out;
});

const selectedNode = computed(() => accounts.find(a => a.code === selectedCode.value) || null);

/** 액션 */
function select(code) {
    selectedCode.value = code;

    // 선택 시 조상 펼치기 (UX)
    let cur = byCode.value.get(code);
    while (cur && cur.parentCode) {
        expanded.add(cur.parentCode);
        cur = byCode.value.get(cur.parentCode);
    }
}

function toggle(code) {
    if (expanded.has(code)) expanded.delete(code);
    else expanded.add(code);
}

function expandAll() {
    accounts.forEach(a => {
        if (!isLeaf(a.code)) expanded.add(a.code);
    });
}
function collapseAll() {
    expanded.clear();
}

function resetFilters() {
    filters.q = '';
    filters.type = '';
    filters.status = '';
    filters.hideInactive = false;
    filters.onlyLeaf = false;
}

function toggleStatus(node) {
    node.status = node.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
}

function remove(node) {
    if (!isLeaf(node.code)) {
        alert('하위 계정이 있어 삭제할 수 없습니다. (중지 처리 권장)');
        return;
    }
    const ok = confirm(`삭제하시겠습니까?\n${node.code} ${node.name}`);
    if (!ok) return;
    const idx = accounts.findIndex(a => a.code === node.code);
    if (idx >= 0) accounts.splice(idx, 1);
    if (selectedCode.value === node.code) selectedCode.value = '';
}

function exportJson() {
    alert('내보내기(예시): 실제 구현 시 JSON/CSV 다운로드로 연결하세요.');
}

/** 라벨 */
function typeLabel(t) {
    const map = { ASSET: '자산', LIABILITY: '부채', EQUITY: '자본', INCOME: '수익', EXPENSE: '비용' };
    return map[t] || t;
}
function typeClass(t) {
    const map = {
        ASSET: 't-asset',
        LIABILITY: 't-liab',
        EQUITY: 't-eq',
        INCOME: 't-inc',
        EXPENSE: 't-exp',
    };
    return map[t] || '';
}

/** Modal */
const modal = reactive({
    open: false,
    mode: 'create', // create | edit
    editingCode: '',
    form: {
        code: '',
        parentCode: '',
        type: 'ASSET',
        name: '',
        description: '',
        status: 'ACTIVE',
        order: 10,
    }
});

function openCreate(parentCode = '') {
    modal.open = true;
    modal.mode = 'create';
    modal.editingCode = '';
    modal.form.code = '';
    modal.form.parentCode = parentCode || '';
    modal.form.type = parentCode ? (byCode.value.get(parentCode)?.type || 'ASSET') : 'ASSET';
    modal.form.name = '';
    modal.form.description = '';
    modal.form.status = 'ACTIVE';
    modal.form.order = 10;

    if (parentCode) expanded.add(parentCode);
}

function openEdit(node) {
    modal.open = true;
    modal.mode = 'edit';
    modal.editingCode = node.code;
    modal.form.code = node.code;
    modal.form.parentCode = node.parentCode || '';
    modal.form.type = node.type;
    modal.form.name = node.name;
    modal.form.description = node.description || '';
    modal.form.status = node.status;
    modal.form.order = node.order ?? 0;
}

function closeModal() {
    modal.open = false;
}

function saveModal() {
    const code = modal.form.code.trim();
    const name = modal.form.name.trim();
    const parentCode = modal.form.parentCode.trim();

    if (!code) return alert('계정 코드를 입력하세요.');
    if (!name) return alert('계정명을 입력하세요.');

    if (parentCode) {
        const parent = byCode.value.get(parentCode);
        if (!parent) return alert('부모 코드가 존재하지 않습니다.');
        if (parent.type !== modal.form.type) {
            return alert('부모 계정과 분류(Type)가 달라질 수 없습니다. (부모 Type을 따르세요)');
        }
    }

    if (modal.mode === 'create') {
        if (byCode.value.get(code)) return alert('이미 존재하는 코드입니다.');
        accounts.push({
            code,
            parentCode,
            type: modal.form.type,
            name,
            description: modal.form.description.trim(),
            status: modal.form.status,
            order: Number(modal.form.order || 0)
        });
        if (parentCode) expanded.add(parentCode);
        select(code);
    } else {
        const idx = accounts.findIndex(a => a.code === modal.editingCode);
        if (idx < 0) return alert('대상을 찾을 수 없습니다.');
        // code/parent 변경 제한(권장)
        accounts[idx].type = modal.form.type;
        accounts[idx].name = name;
        accounts[idx].description = modal.form.description.trim();
        accounts[idx].status = modal.form.status;
        accounts[idx].order = Number(modal.form.order || 0);
        select(accounts[idx].code);
    }

    modal.open = false;
}
</script>
  
<style lang="scss" scoped>
.page {
    background: #f5f6fa;
    min-height: 100vh;
    padding: 24px 0;
}

.container {
    width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
}

.header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 14px;

    h1 {
        margin: 0 0 4px;
        font-size: 1.5rem;
    }

    .sub {
        margin: 0;
        color: #6b7280;
        font-size: 0.86rem;
        max-width: 820px;
    }

    .header__right {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
    }
}

.card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #e9edf5;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
}

.card__head {
    padding: 14px 16px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
        margin: 0;
        font-size: 1rem;
    }

    .hint {
        margin: 3px 0 0;
        font-size: 0.78rem;
        color: #6b7280;
    }

    .pill {
        font-size: 0.75rem;
        padding: 2px 10px;
        border-radius: 999px;
        background: #e4ebff;
        color: #3848c7;
        font-weight: 800;
    }
}

.filters {
    padding: 14px 16px 12px;
    margin-bottom: 16px;

    .filters__row {
        display: flex;
        gap: 12px;
        align-items: flex-end;

        &--sub {
            margin-top: 10px;
            align-items: center;
        }
    }

    .field {
        display: flex;
        flex-direction: column;
        flex: 1;

        &--actions {
            flex: 0 0 120px;
            align-items: flex-end;
        }

        label {
            margin-bottom: 4px;
            font-size: 0.8rem;
            color: #4b5563;
        }

        input,
        select {
            border: 1px solid #d1d5db;
            border-radius: 10px;
            padding: 9px 10px;
            font-size: 0.92rem;
            outline: none;

            &:focus {
                border-color: #4b74ff;
                box-shadow: 0 0 0 1px rgba(75, 116, 255, 0.18);
            }
        }
    }

    .chk {
        display: inline-flex;
        gap: 8px;
        align-items: center;
        padding: 6px 10px;
        border: 1px solid #e5e7eb;
        background: #f9fafb;
        border-radius: 999px;
        font-size: 0.82rem;
        color: #374151;

        input {
            width: 14px;
            height: 14px;
        }
    }

    .spacer {
        flex: 1;
    }
}

.layout {
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 16px;
    align-items: start;
}

.tree {
    overflow: hidden;

    .tree__body {
        padding: 8px 8px 10px;
        border-top: 1px solid #eef2f7;
        max-height: 640px;
        overflow: auto;
    }

    .treeRow {
        width: 100%;
        border: 1px solid transparent;
        background: #fff;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 10px;
        cursor: pointer;
        text-align: left;

        &:hover {
            background: #f3f6ff;
            border-color: #e5e7eb;
        }

        &.is-selected {
            background: #edf2ff;
            border-color: rgba(75, 116, 255, 0.35);
        }

        .treeRow__indent {
            flex: 0 0 auto;
        }

        .treeRow__caret {
            width: 18px;
            text-align: center;
            color: #6b7280;
            font-weight: 900;
            user-select: none;

            &.is-leaf {
                color: #c7ced9;
            }
        }

        .treeRow__title {
            flex: 1;
            min-width: 0;
            display: inline-flex;
            gap: 10px;
            align-items: center;

            .code {
                font-weight: 900;
                color: #111827;
                width: 64px;
                flex: 0 0 auto;
            }

            .name {
                font-weight: 800;
                color: #111827;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }

        .status {
            font-size: 0.75rem;
            font-weight: 900;
            padding: 3px 10px;
            border-radius: 999px;
            border: 1px solid #e5e7eb;
            background: #fff;

            &.ok {
                color: #166534;
                background: #ecfdf3;
                border-color: #bbf7d0;
            }

            &.off {
                color: #b91c1c;
                background: #fef2f2;
                border-color: #fecaca;
            }
        }
    }

    .tree__foot {
        border-top: 1px solid #eef2f7;
        padding: 10px 12px 12px;

        .sel {
            font-size: 0.84rem;
            color: #6b7280;
            margin-bottom: 10px;

            strong {
                color: #111827;
            }
        }

        .tree__footBtns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
    }
}

.detail {
    padding-bottom: 12px;

    .empty--detail {
        margin: 12px 16px 16px;
        border: 1px dashed #d1d5db;
        border-radius: 12px;
        color: #9ca3af;
        padding: 18px 12px;
        text-align: center;
    }

    .detail__body {
        padding: 0 16px 10px;
    }

    .detailTop {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: flex-start;
        margin-bottom: 12px;
    }

    .detailTitle {
        display: flex;
        align-items: center;
        gap: 10px;

        .big {
            font-size: 1.05rem;
            font-weight: 900;
            color: #111827;
        }

        .nm {
            font-weight: 900;
            color: #111827;
            margin-top: 2px;
        }
    }

    .detailActions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .kv {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;

        .kv__item {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 10px;

            &--full {
                grid-column: 1 / -1;
            }

            .k {
                font-size: 0.78rem;
                color: #6b7280;
                margin-bottom: 4px;
            }

            .v {
                font-weight: 800;
                color: #111827;
                font-size: 0.92rem;
            }
        }
    }

    .childBox {
        margin-top: 12px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        overflow: hidden;

        .childHead {
            padding: 10px 12px;
            background: #f9fafb;
            display: flex;
            justify-content: space-between;
            align-items: center;

            h3 {
                margin: 0;
                font-size: 0.95rem;
            }

            .muted {
                color: #9ca3af;
                font-size: 0.82rem;
                font-weight: 800;
            }
        }

        .childTable {
            overflow: auto;

            table {
                width: 100%;
                border-collapse: collapse;
                min-width: 620px;

                th,
                td {
                    padding: 9px 10px;
                    border-bottom: 1px solid #e5e7eb;
                    text-align: left;
                }

                th {
                    background: #f3f4f6;
                    font-size: 0.78rem;
                    color: #4b5563;
                    font-weight: 900;
                }

                .right {
                    text-align: right;
                }

                .rowName {
                    font-weight: 900;
                    color: #111827;
                }

                .rowDesc {
                    font-size: 0.78rem;
                    color: #9ca3af;
                    margin-top: 2px;
                }

                .emptyRow {
                    text-align: center;
                    color: #9ca3af;
                    padding: 14px 10px;
                }
            }
        }

        .childFoot {
            padding: 10px 12px;
            display: flex;
            justify-content: flex-end;
            background: #fff;
        }
    }

    .footnote {
        margin: 10px 16px 0;
        font-size: 0.78rem;
        color: #9ca3af;
    }
}

.typeTag {
    font-size: 0.72rem;
    font-weight: 900;
    padding: 3px 10px;
    border-radius: 999px;
    border: 1px solid transparent;
    flex: 0 0 auto;

    &.t-asset {
        background: #ecfdf3;
        color: #166534;
        border-color: #bbf7d0;
    }

    &.t-liab {
        background: #fef2f2;
        color: #b91c1c;
        border-color: #fecaca;
    }

    &.t-eq {
        background: #eef2ff;
        color: #3730a3;
        border-color: #c7d2fe;
    }

    &.t-inc {
        background: #ecfdf3;
        color: #166534;
        border-color: #bbf7d0;
    }

    &.t-exp {
        background: #fef2f2;
        color: #b91c1c;
        border-color: #fecaca;
    }
}

.statusPill {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 900;
    border: 1px solid #e5e7eb;

    &.ok {
        color: #166534;
        background: #ecfdf3;
        border-color: #bbf7d0;
    }

    &.off {
        color: #b91c1c;
        background: #fef2f2;
        border-color: #fecaca;
    }
}

.leafPill {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 900;
    border: 1px solid #e5e7eb;

    &.leaf {
        background: #eef2ff;
        color: #3730a3;
        border-color: #c7d2fe;
    }

    &.parent {
        background: #f3f4f6;
        color: #6b7280;
    }
}

.btn {
    border-radius: 999px;
    border: none;
    padding: 9px 14px;
    font-size: 0.86rem;
    font-weight: 900;
    cursor: pointer;

    &:disabled {
        opacity: .55;
        cursor: not-allowed;
    }

    &--primary {
        background: #4b74ff;
        color: #fff;
    }

    &--ghost {
        background: #fff;
        border: 1px solid #d1d5db;
        color: #4b5563;
    }

    &.danger {
        border-color: #fecaca;
        color: #b91c1c;
    }

    &--sm {
        padding: 7px 12px;
        font-size: 0.82rem;
    }
}

.link {
    border: none;
    background: transparent;
    cursor: pointer;
    font-weight: 900;
    font-size: 0.82rem;
    color: #374151;

    &:hover {
        color: #1d3a8a;
        text-decoration: underline;
    }
}

.dot {
    color: #d1d5db;
    margin: 0 6px;
}

.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.empty {
    color: #9ca3af;
    text-align: center;
    padding: 18px 10px;
}

/* Modal */
.modalBack {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.52);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 50;
}

.modal {
    width: 760px;
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 25px 70px rgba(15, 23, 42, 0.25);

    .modal__head {
        padding: 14px 16px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        gap: 12px;

        .modal__title {
            font-weight: 900;
            font-size: 1.05rem;
            margin-bottom: 2px;
        }

        .modal__sub {
            font-size: .78rem;
            color: #6b7280;
        }

        .x {
            width: 36px;
            height: 36px;
            border-radius: 999px;
            border: 1px solid #e5e7eb;
            background: #fff;
            cursor: pointer;
            font-size: 18px;
            line-height: 1;
        }
    }

    .modal__body {
        padding: 14px 16px;
    }

    .form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;

        .field {
            display: flex;
            flex-direction: column;

            &.span2 {
                grid-column: 1 / -1;
            }

            label {
                font-size: 0.8rem;
                color: #4b5563;
                margin-bottom: 4px;
            }

            input,
            select,
            textarea {
                border: 1px solid #d1d5db;
                border-radius: 12px;
                padding: 10px 10px;
                font-size: 0.92rem;
                outline: none;

                &:focus {
                    border-color: #4b74ff;
                    box-shadow: 0 0 0 1px rgba(75, 116, 255, 0.18);
                }
            }

            textarea {
                min-height: 90px;
                resize: vertical;
            }
        }
    }

    .preview {
        margin-top: 12px;
        border: 1px solid #e5e7eb;
        background: #f9fafb;
        border-radius: 14px;
        padding: 10px 12px;

        .preview__t {
            font-weight: 900;
            font-size: 0.84rem;
            margin-bottom: 8px;
        }

        .preview__row {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-bottom: 6px;

            .k {
                width: 60px;
                color: #6b7280;
                font-size: 0.78rem;
                font-weight: 900;
            }

            .v {
                font-weight: 900;
                color: #111827;
                display: inline-flex;
                gap: 8px;
                align-items: center;
            }
        }
    }

    .modal__foot {
        padding: 12px 16px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }
}

/* ===== Mobile: 450x800 ===== */
@media (max-width: 520px) {
    .container {
        width: 100%;
        padding: 0 12px;
    }

    .header {
        flex-direction: column;
        align-items: stretch;
    }

    .layout {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .filters .filters__row {
        flex-direction: column;
        align-items: stretch;
    }

    .filters .field--actions {
        flex: 1;
        align-items: flex-end;
    }

    .tree .tree__body {
        max-height: 340px;
    }

    .tree .tree__foot .tree__footBtns {
        grid-template-columns: 1fr;
    }

    .detail .kv {
        grid-template-columns: 1fr;
    }

    .detail .childBox table {
        min-width: 560px;
    }

    /* 가로스크롤 */

    .modal {
        width: 100%;
    }

    .modal .form {
        grid-template-columns: 1fr;
    }
}
</style>