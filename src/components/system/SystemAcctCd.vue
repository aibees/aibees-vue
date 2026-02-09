<template>
    <div class="lnb-content system-acctcd">
        <!-- 상단 필터 카드 -->
        <section class="d-panel search-section">
            <div class="condition-row">
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
            </div>

            <div class="filter-actions">
                <button class="btn btn--ghost" type="button" @click="resetFilters">
                    전체 접기
                </button>
                <button class="btn btn--ghost" type="button" @click="resetFilters">
                    전체 펼치기
                </button>
                <button class="btn btn--ghost" type="button" @click="resetFilters">
                    필터 초기화
                </button>
                <button class="btn btn--primary" type="button" @click="openCreateModal()">
                    계정 추가
                </button>
            </div>
        </section>

        <section class="main-section">

            <!-- Left: Tree -->
            <aside class="d-panel tree">
                <div class="tree-head">
                    <h2>계정 트리</h2>
                </div>

                <div class="tree-body">
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
            <main class="d-panel detail">
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
    </div>
    <div class="container">
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
  
<style lang="scss" src="@@/system/systemAcctcd.scss" />
