<template>
    <div class="page">
        <div class="container">
            <!-- Header -->
            <header class="header">
                <div class="header__left">
                    <h1>고정비 관리</h1>
                    <p class="sub">
                        월/분기/연 단위로 반복되는 고정 지출을 등록하고, 예정·집행 상태를 관리합니다.
                    </p>
                </div>
                <div class="header__right">
                    <button class="btn btn--ghost" type="button" @click="exportJson">내보내기</button>
                    <button class="btn btn--primary" type="button" @click="openCreate">
                        고정비 추가
                    </button>
                </div>
            </header>

            <!-- Filters -->
            <section class="card filters">
                <div class="filters__row">
                    <div class="field">
                        <label>검색</label>
                        <input v-model="filters.q" placeholder="명칭/메모 검색" />
                    </div>

                    <div class="field">
                        <label>가계 단위</label>
                        <select v-model="filters.unit">
                            <option value="">전체</option>
                            <option value="joint">공동</option>
                            <option value="me">본인</option>
                            <option value="spouse">배우자</option>
                        </select>
                    </div>

                    <div class="field">
                        <label>주기</label>
                        <select v-model="filters.cycle">
                            <option value="">전체</option>
                            <option value="MONTHLY">월간</option>
                            <option value="QUARTERLY">분기</option>
                            <option value="YEARLY">연간</option>
                        </select>
                    </div>

                    <div class="field">
                        <label>상태</label>
                        <select v-model="filters.status">
                            <option value="">전체</option>
                            <option value="ACTIVE">사용</option>
                            <option value="PAUSED">중지</option>
                        </select>
                    </div>

                    <div class="field field--actions">
                        <button class="btn btn--ghost" type="button" @click="resetFilters">초기화</button>
                    </div>
                </div>

                <div class="filters__row filters__row--sub">
                    <label class="chk">
                        <input type="checkbox" v-model="filters.onlyDueThisMonth" />
                        <span>이번 달 예정만</span>
                    </label>
                    <label class="chk">
                        <input type="checkbox" v-model="filters.hidePaused" />
                        <span>중지 숨기기</span>
                    </label>

                    <div class="spacer"></div>

                    <div class="seg">
                        <button type="button" class="seg__btn" :class="{ on: viewMode === 'list' }"
                            @click="viewMode = 'list'">리스트</button>
                        <button type="button" class="seg__btn" :class="{ on: viewMode === 'calendar' }"
                            @click="viewMode = 'calendar'">월 캘린더(예시)</button>
                    </div>
                </div>
            </section>

            <!-- Summary KPI -->
            <section class="kpi-grid">
                <div class="card kpi">
                    <div class="kpi__head">
                        <div>
                            <div class="kpi__title">이번 달 예정 고정비</div>
                            <div class="kpi__sub">{{ ymLabel(selectedYm) }}</div>
                        </div>
                        <span class="pill">Due</span>
                    </div>
                    <div class="kpi__value">
                        <div class="big">{{ fmt(sumThisMonthDue) }}</div>
                        <div class="meta">
                            <span class="muted">건수</span>
                            <span class="mono">{{ countThisMonthDue }}건</span>
                        </div>
                    </div>
                    <div class="mini">
                        <div class="mini__row">
                            <span class="muted">집행 처리(예시)</span>
                            <span class="mono">{{ fmt(sumThisMonthPaid) }}</span>
                        </div>
                        <div class="mini__row">
                            <span class="muted">미집행</span>
                            <span class="mono">{{ fmt(Math.max(0, sumThisMonthDue - sumThisMonthPaid)) }}</span>
                        </div>
                    </div>
                </div>

                <div class="card kpi">
                    <div class="kpi__head">
                        <div>
                            <div class="kpi__title">월 환산 고정비(활성)</div>
                            <div class="kpi__sub">연/분기 포함 월 환산</div>
                        </div>
                        <span class="pill">Monthly</span>
                    </div>
                    <div class="kpi__value">
                        <div class="big">{{ fmt(sumMonthlyEquivalent) }}</div>
                        <div class="meta">
                            <span class="muted">활성</span>
                            <span class="mono">{{ activeCount }}건</span>
                        </div>
                    </div>
                    <div class="mini">
                        <div class="mini__row">
                            <span class="muted">최대 항목</span>
                            <span class="mono">{{ maxItemLabel }}</span>
                        </div>
                        <div class="mini__row">
                            <span class="muted">비중(예시)</span>
                            <span class="mono">{{ topShare.toFixed(1) }}%</span>
                        </div>
                    </div>
                </div>

                <div class="card kpi">
                    <div class="kpi__head">
                        <div>
                            <div class="kpi__title">알림(예시)</div>
                            <div class="kpi__sub">결제일 임박 / 자동이체</div>
                        </div>
                        <span class="pill">Alert</span>
                    </div>
                    <div class="alertList">
                        <div class="alert" v-for="a in alerts" :key="a.id">
                            <div class="alert__left">
                                <div class="alert__title">{{ a.title }}</div>
                                <div class="alert__sub">{{ a.sub }}</div>
                            </div>
                            <span class="badge" :class="a.type">{{ a.typeLabel }}</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Main -->
            <section class="card main">
                <div class="card__head">
                    <div>
                        <h2>고정비 목록</h2>
                        <p class="hint">
                            “집행 처리”는 실제 거래 입력(전표 생성)과 연결될 예정으로 가정합니다. (지금은 UI 예시)
                        </p>
                    </div>
                    <div class="pill">Manage</div>
                </div>

                <div v-if="viewMode === 'calendar'" class="calendarMock">
                    <div class="calendarMock__msg">
                        캘린더 뷰는 추후 구현(예시). 지금은 리스트 뷰를 기준으로 구성했습니다.
                    </div>
                </div>

                <div v-else class="tableWrap">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 160px;">명칭</th>
                                <th style="width: 110px;">가계</th>
                                <th style="width: 110px;">주기</th>
                                <th style="width: 120px;">결제일</th>
                                <th class="right" style="width: 160px;">금액</th>
                                <th style="width: 120px;">결제수단</th>
                                <th style="width: 120px;">상태</th>
                                <th class="right" style="width: 180px;">관리</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="item in filtered" :key="item.id">
                                <td>
                                    <div class="rowName">{{ item.name }}</div>
                                    <div class="rowDesc">{{ item.memo || '-' }}</div>
                                </td>
                                <td>{{ unitLabel(item.unit) }}</td>
                                <td>{{ cycleLabel(item.cycle) }}</td>
                                <td>
                                    <span class="mono">{{ dueLabel(item) }}</span>
                                    <span v-if="isDueThisMonth(item)" class="tag">이번달</span>
                                </td>
                                <td class="right mono">{{ fmt(item.amount) }}</td>
                                <td>{{ payMethodLabel(item.payMethod) }}</td>
                                <td>
                                    <span class="statusPill" :class="item.status === 'ACTIVE' ? 'ok' : 'off'">
                                        {{ item.status === 'ACTIVE' ? '사용' : '중지' }}
                                    </span>
                                </td>
                                <td class="right">
                                    <button class="link" type="button" @click="markPaid(item)">집행</button>
                                    <span class="dot">·</span>
                                    <button class="link" type="button" @click="openEdit(item)">수정</button>
                                    <span class="dot">·</span>
                                    <button class="link danger" type="button" @click="toggleStatus(item)">
                                        {{ item.status === 'ACTIVE' ? '중지' : '사용' }}
                                    </button>
                                </td>
                            </tr>

                            <tr v-if="filtered.length === 0">
                                <td colspan="8" class="emptyRow">조건에 맞는 고정비가 없습니다.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="footnote">
                    * 추천: 고정비는 “Preset 유형”과 연결하여 집행 시 자동 전표가 생성되도록 설계할 수 있습니다.
                </div>
            </section>

            <!-- Modal -->
            <div v-if="modal.open" class="modalBack" @click.self="closeModal">
                <div class="modal">
                    <div class="modal__head">
                        <div>
                            <div class="modal__title">{{ modal.mode === 'create' ? '고정비 추가' : '고정비 수정' }}</div>
                            <div class="modal__sub">반복 주기/결제일/수단을 설정해두면 집행 관리가 쉬워집니다.</div>
                        </div>
                        <button class="x" type="button" @click="closeModal">×</button>
                    </div>

                    <div class="modal__body">
                        <div class="form">
                            <div class="field span2">
                                <label>명칭</label>
                                <input v-model="modal.form.name" placeholder="예: 월세, 통신비, 넷플릭스" />
                            </div>

                            <div class="field">
                                <label>가계 단위</label>
                                <select v-model="modal.form.unit">
                                    <option value="joint">공동</option>
                                    <option value="me">본인</option>
                                    <option value="spouse">배우자</option>
                                </select>
                            </div>

                            <div class="field">
                                <label>상태</label>
                                <select v-model="modal.form.status">
                                    <option value="ACTIVE">사용</option>
                                    <option value="PAUSED">중지</option>
                                </select>
                            </div>

                            <div class="field">
                                <label>주기</label>
                                <select v-model="modal.form.cycle">
                                    <option value="MONTHLY">월간</option>
                                    <option value="QUARTERLY">분기</option>
                                    <option value="YEARLY">연간</option>
                                </select>
                            </div>

                            <div class="field">
                                <label>결제일(일)</label>
                                <input type="number" min="1" max="31" v-model.number="modal.form.dayOfMonth" />
                            </div>

                            <div class="field">
                                <label>금액</label>
                                <input type="number" min="0" v-model.number="modal.form.amount" />
                            </div>

                            <div class="field">
                                <label>결제수단</label>
                                <select v-model="modal.form.payMethod">
                                    <option value="CARD">카드</option>
                                    <option value="TRANSFER">자동이체</option>
                                    <option value="CASH">현금</option>
                                </select>
                            </div>

                            <div class="field span2">
                                <label>연결 Preset(선택)</label>
                                <select v-model="modal.form.presetId">
                                    <option value="">미지정</option>
                                    <option v-for="p in presetOptions" :key="p.id" :value="p.id">
                                        {{ p.name }}
                                    </option>
                                </select>
                                <div class="help">
                                    집행 버튼 클릭 시 “Preset 기반 전표 생성”과 연결될 수 있습니다.
                                </div>
                            </div>

                            <div class="field span2">
                                <label>메모</label>
                                <textarea v-model="modal.form.memo" placeholder="예: 카드 결제, 자동이체, 관리 포인트"></textarea>
                            </div>
                        </div>

                        <div class="preview">
                            <div class="preview__t">미리보기</div>
                            <div class="preview__row">
                                <span class="k">표시</span>
                                <span class="v">
                                    <span class="mono">{{ modal.form.name || '(명칭 없음)' }}</span>
                                    · {{ cycleLabel(modal.form.cycle) }}
                                    · 매월 {{ modal.form.dayOfMonth || '-' }}일
                                </span>
                            </div>
                            <div class="preview__row">
                                <span class="k">금액</span>
                                <span class="v mono">{{ fmt(modal.form.amount || 0) }}</span>
                            </div>
                            <div class="preview__row">
                                <span class="k">수단</span>
                                <span class="v">{{ payMethodLabel(modal.form.payMethod) }}</span>
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

const selectedYm = ref('2025-12');
const viewMode = ref('list');

const fixedCosts = reactive([
    {
        id: 1,
        name: '월세',
        unit: 'joint',
        cycle: 'MONTHLY',
        dayOfMonth: 5,
        amount: 800000,
        payMethod: 'TRANSFER',
        status: 'ACTIVE',
        memo: '관리비 별도',
        presetId: 'P001',
        paidThisMonth: true,
    },
    {
        id: 2,
        name: '통신비',
        unit: 'me',
        cycle: 'MONTHLY',
        dayOfMonth: 19,
        amount: 65000,
        payMethod: 'CARD',
        status: 'ACTIVE',
        memo: '휴대폰+데이터',
        presetId: 'P010',
        paidThisMonth: false,
    },
    {
        id: 3,
        name: '넷플릭스',
        unit: 'joint',
        cycle: 'MONTHLY',
        dayOfMonth: 27,
        amount: 17000,
        payMethod: 'CARD',
        status: 'ACTIVE',
        memo: '',
        presetId: '',
        paidThisMonth: false,
    },
    {
        id: 4,
        name: '자동차 보험(연)',
        unit: 'joint',
        cycle: 'YEARLY',
        dayOfMonth: 12,
        amount: 780000,
        payMethod: 'TRANSFER',
        status: 'PAUSED',
        memo: '갱신월: 12월 (예시)',
        presetId: '',
        paidThisMonth: false,
    },
]);

const presetOptions = reactive([
    { id: 'P001', name: '주거비(월세)' },
    { id: 'P010', name: '통신비' },
    { id: 'P020', name: '구독서비스' },
]);

const filters = reactive({
    q: '',
    unit: '',
    cycle: '',
    status: '',
    hidePaused: false,
    onlyDueThisMonth: false,
});

function ymLabel(ym) {
    const [y, m] = ym.split('-');
    return `${y}년 ${Number(m)}월`;
}

function fmt(n) {
    const v = Math.round(Number(n || 0));
    return `${v.toLocaleString('ko-KR')}원`;
}

function unitLabel(u) {
    return u === 'joint' ? '공동' : u === 'me' ? '본인' : '배우자';
}

function cycleLabel(c) {
    return c === 'MONTHLY' ? '월간' : c === 'QUARTERLY' ? '분기' : '연간';
}

function payMethodLabel(m) {
    return m === 'CARD' ? '카드' : m === 'TRANSFER' ? '자동이체' : '현금';
}

function isDueThisMonth(item) {
    // 예시: 월간이면 항상 이번달 예정, 분기/연간은 간단히 "12월이면 예정" 같은 로직 대신,
    // 실제 구현에서는 nextDueDate 계산 로직을 두는 것을 권장합니다.
    const m = Number(selectedYm.value.split('-')[1]);
    if (item.status !== 'ACTIVE') return false;
    if (item.cycle === 'MONTHLY') return true;
    if (item.cycle === 'QUARTERLY') return [3, 6, 9, 12].includes(m);
    if (item.cycle === 'YEARLY') return m === 12;
    return false;
}

function dueLabel(item) {
    if (item.cycle === 'MONTHLY') return `매월 ${item.dayOfMonth}일`;
    if (item.cycle === 'QUARTERLY') return `분기 ${item.dayOfMonth}일`;
    return `연 ${item.dayOfMonth}일`;
}

const filtered = computed(() => {
    const q = filters.q.trim().toLowerCase();

    return fixedCosts.filter((x) => {
        if (filters.hidePaused && x.status === 'PAUSED') return false;
        if (filters.unit && x.unit !== filters.unit) return false;
        if (filters.cycle && x.cycle !== filters.cycle) return false;
        if (filters.status && x.status !== filters.status) return false;
        if (filters.onlyDueThisMonth && !isDueThisMonth(x)) return false;

        if (!q) return true;
        const hay = `${x.name} ${x.memo || ''}`.toLowerCase();
        return hay.includes(q);
    });
});

/** KPI */
const activeItems = computed(() => fixedCosts.filter(x => x.status === 'ACTIVE'));
const activeCount = computed(() => activeItems.value.length);

const sumThisMonthDue = computed(() => {
    return activeItems.value
        .filter(isDueThisMonth)
        .reduce((acc, cur) => acc + (cur.amount || 0), 0);
});

const countThisMonthDue = computed(() => {
    return activeItems.value.filter(isDueThisMonth).length;
});

const sumThisMonthPaid = computed(() => {
    return activeItems.value
        .filter(isDueThisMonth)
        .filter(x => x.paidThisMonth)
        .reduce((acc, cur) => acc + (cur.amount || 0), 0);
});

// 월 환산: 월간=1, 분기= /3, 연간= /12
const sumMonthlyEquivalent = computed(() => {
    const toMonthly = (x) => {
        if (x.cycle === 'MONTHLY') return x.amount;
        if (x.cycle === 'QUARTERLY') return (x.amount || 0) / 3;
        if (x.cycle === 'YEARLY') return (x.amount || 0) / 12;
        return 0;
    };
    return activeItems.value.reduce((acc, cur) => acc + toMonthly(cur), 0);
});

const maxItem = computed(() => {
    if (activeItems.value.length === 0) return null;
    return activeItems.value.reduce((a, b) => (a.amount > b.amount ? a : b));
});

const maxItemLabel = computed(() => {
    if (!maxItem.value) return '-';
    return `${maxItem.value.name} (${fmt(maxItem.value.amount)})`;
});

const topShare = computed(() => {
    if (!maxItem.value) return 0;
    if (!sumMonthlyEquivalent.value) return 0;
    const monthly = maxItem.value.cycle === 'MONTHLY'
        ? maxItem.value.amount
        : maxItem.value.cycle === 'QUARTERLY'
            ? maxItem.value.amount / 3
            : maxItem.value.amount / 12;
    return (monthly / sumMonthlyEquivalent.value) * 100;
});

const alerts = computed(() => {
    // 예시: 이번달 예정 + 미집행
    const list = activeItems.value
        .filter(isDueThisMonth)
        .filter(x => !x.paidThisMonth)
        .slice(0, 3)
        .map((x, idx) => ({
            id: `a${idx}`,
            title: `${x.name} 집행 예정`,
            sub: `${dueLabel(x)} · ${fmt(x.amount)} · ${payMethodLabel(x.payMethod)}`,
            type: x.payMethod === 'CARD' ? 'warn' : 'info',
            typeLabel: x.payMethod === 'CARD' ? '카드' : '이체',
        }));

    if (list.length === 0) {
        return [{
            id: 'ok',
            title: '이번 달 미집행 알림 없음',
            sub: '예정 고정비가 없거나 모두 집행 처리되었습니다.',
            type: 'ok',
            typeLabel: 'OK',
        }];
    }
    return list;
});

/** actions */
function resetFilters() {
    filters.q = '';
    filters.unit = '';
    filters.cycle = '';
    filters.status = '';
    filters.hidePaused = false;
    filters.onlyDueThisMonth = false;
}

function exportJson() {
    alert('내보내기(예시): 실제 구현에서는 JSON/CSV 다운로드로 연결하세요.');
}

function markPaid(item) {
    if (item.status !== 'ACTIVE') return alert('중지된 항목은 집행 처리할 수 없습니다.');
    if (!isDueThisMonth(item)) return alert('이번 달 예정 항목이 아닙니다(예시).');
    item.paidThisMonth = true;
    alert(`집행 처리(예시): ${item.name}`);
}

function toggleStatus(item) {
    item.status = item.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
}

let idSeq = 1000;

/** Modal */
const modal = reactive({
    open: false,
    mode: 'create', // create | edit
    editingId: null,
    form: {
        name: '',
        unit: 'joint',
        status: 'ACTIVE',
        cycle: 'MONTHLY',
        dayOfMonth: 1,
        amount: 0,
        payMethod: 'CARD',
        presetId: '',
        memo: '',
    },
});

function openCreate() {
    modal.open = true;
    modal.mode = 'create';
    modal.editingId = null;
    modal.form = {
        name: '',
        unit: 'joint',
        status: 'ACTIVE',
        cycle: 'MONTHLY',
        dayOfMonth: 1,
        amount: 0,
        payMethod: 'CARD',
        presetId: '',
        memo: '',
    };
}

function openEdit(item) {
    modal.open = true;
    modal.mode = 'edit';
    modal.editingId = item.id;
    modal.form = {
        name: item.name,
        unit: item.unit,
        status: item.status,
        cycle: item.cycle,
        dayOfMonth: item.dayOfMonth,
        amount: item.amount,
        payMethod: item.payMethod,
        presetId: item.presetId || '',
        memo: item.memo || '',
    };
}

function closeModal() {
    modal.open = false;
}

function saveModal() {
    if (!modal.form.name.trim()) return alert('명칭을 입력하세요.');
    if (!modal.form.amount || modal.form.amount < 0) return alert('금액을 확인하세요.');
    if (!modal.form.dayOfMonth || modal.form.dayOfMonth < 1 || modal.form.dayOfMonth > 31) {
        return alert('결제일(1~31)을 확인하세요.');
    }

    if (modal.mode === 'create') {
        fixedCosts.push({
            id: ++idSeq,
            ...modal.form,
            memo: modal.form.memo.trim(),
            paidThisMonth: false,
        });
    } else {
        const idx = fixedCosts.findIndex(x => x.id === modal.editingId);
        if (idx < 0) return alert('대상을 찾을 수 없습니다.');
        fixedCosts[idx] = {
            ...fixedCosts[idx],
            ...modal.form,
            memo: modal.form.memo.trim(),
        };
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

/* Header */
.header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 14px;

    h1 {
        margin: 0 0 4px;
        font-size: 1.5rem;
        font-weight: 1000;
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
        align-items: center;
        flex-wrap: wrap;
    }
}

/* Card */
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
        font-weight: 1000;
    }

    .hint {
        margin: 3px 0 0;
        font-size: 0.78rem;
        color: #6b7280;
    }
}

.pill {
    font-size: 0.75rem;
    padding: 2px 10px;
    border-radius: 999px;
    background: #e4ebff;
    color: #3848c7;
    font-weight: 1000;
}

/* Filters */
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

/* segmented */
.seg {
    display: inline-flex;
    border: 1px solid #d1d5db;
    border-radius: 999px;
    overflow: hidden;
    background: #fff;

    .seg__btn {
        border: none;
        background: transparent;
        padding: 7px 12px;
        font-weight: 1000;
        font-size: 0.82rem;
        cursor: pointer;
        color: #4b5563;

        &.on {
            background: #edf2ff;
            color: #1d3a8a;
        }
    }
}

/* KPI grid */
.kpi-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
}

.kpi {
    padding: 14px 16px 14px;

    .kpi__head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
        margin-bottom: 12px;
    }

    .kpi__title {
        font-weight: 1000;
        font-size: 0.98rem;
        color: #111827;
        margin-bottom: 2px;
    }

    .kpi__sub {
        font-size: 0.78rem;
        color: #6b7280;
    }

    .kpi__value {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 10px;
        margin-bottom: 10px;

        .big {
            font-size: 1.35rem;
            font-weight: 1100;
            color: #111827;
            letter-spacing: -0.2px;
        }

        .meta {
            display: inline-flex;
            gap: 6px;
            align-items: baseline;
        }

        .muted {
            color: #9ca3af;
            font-size: 0.78rem;
            font-weight: 1000;
        }

        .mono {
            font-weight: 1100;
        }
    }
}

.mini {
    margin-top: 10px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 10px;

    .mini__row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: center;
        font-size: 0.82rem;

        &+& {
            margin-top: 8px;
        }

        .muted {
            color: #6b7280;
            font-weight: 1000;
        }

        .mono {
            font-weight: 1100;
            color: #111827;
        }
    }
}

.alertList {
    display: grid;
    gap: 8px;

    .alert {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: flex-start;
        padding: 10px;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        background: #f9fafb;

        .alert__title {
            font-weight: 1100;
            color: #111827;
            font-size: 0.9rem;
        }

        .alert__sub {
            margin-top: 2px;
            color: #6b7280;
            font-size: 0.78rem;
        }

        .badge {
            font-size: 0.72rem;
            font-weight: 1100;
            padding: 3px 10px;
            border-radius: 999px;
            border: 1px solid;

            &.warn {
                background: #fef3c7;
                color: #92400e;
                border-color: #fcd34d;
            }

            &.info {
                background: #e4ebff;
                color: #1d3a8a;
                border-color: #c7d2fe;
            }

            &.ok {
                background: #ecfdf3;
                color: #166534;
                border-color: #bbf7d0;
            }
        }
    }
}

/* Main table */
.main {
    padding-bottom: 12px;
}

.tableWrap {
    padding: 0 16px 12px;
    overflow: auto;

    table {
        width: 100%;
        border-collapse: collapse;
        min-width: 980px;

        th,
        td {
            padding: 10px 10px;
            border-bottom: 1px solid #e5e7eb;
            text-align: left;
            vertical-align: middle;
        }

        th {
            background: #f3f4f6;
            font-size: 0.78rem;
            font-weight: 1100;
            color: #4b5563;
        }

        .right {
            text-align: right;
        }

        .mono {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-weight: 1100;
        }

        .rowName {
            font-weight: 1100;
            color: #111827;
        }

        .rowDesc {
            margin-top: 2px;
            font-size: 0.78rem;
            color: #9ca3af;
        }

        .emptyRow {
            text-align: center;
            color: #9ca3af;
            padding: 16px 10px;
        }
    }
}

.tag {
    display: inline-flex;
    margin-left: 6px;
    font-size: 0.72rem;
    font-weight: 1100;
    padding: 2px 8px;
    border-radius: 999px;
    background: #eef2ff;
    color: #3730a3;
    border: 1px solid #c7d2fe;
}

.statusPill {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 1100;
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

.link {
    border: none;
    background: transparent;
    cursor: pointer;
    font-weight: 1100;
    font-size: 0.82rem;
    color: #374151;

    &:hover {
        color: #1d3a8a;
        text-decoration: underline;
    }

    &.danger {
        color: #b91c1c;
    }
}

.dot {
    color: #d1d5db;
    margin: 0 6px;
}

.footnote {
    padding: 0 16px;
    color: #9ca3af;
    font-size: 0.78rem;
}

/* Calendar mock */
.calendarMock {
    padding: 12px 16px 12px;

    .calendarMock__msg {
        border: 1px dashed #d1d5db;
        border-radius: 12px;
        padding: 14px 12px;
        color: #9ca3af;
        text-align: center;
    }
}

/* Buttons */
.btn {
    border-radius: 999px;
    border: none;
    padding: 9px 14px;
    font-size: 0.86rem;
    font-weight: 1100;
    cursor: pointer;

    &--primary {
        background: #4b74ff;
        color: #fff;
    }

    &--ghost {
        background: #fff;
        border: 1px solid #d1d5db;
        color: #4b5563;
    }
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
            font-weight: 1100;
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

            .help {
                margin-top: 4px;
                font-size: 0.75rem;
                color: #9ca3af;
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
            font-weight: 1100;
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
                font-weight: 1100;
            }

            .v {
                font-weight: 1100;
                color: #111827;
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

/* Responsive: 450x800 */
@media (max-width: 520px) {
    .container {
        width: 100%;
        padding: 0 12px;
    }

    .header {
        flex-direction: column;
        align-items: stretch;
    }

    .filters .filters__row {
        flex-direction: column;
        align-items: stretch;
    }

    .filters .field--actions {
        flex: 1;
        align-items: flex-end;
    }

    .kpi-grid {
        grid-template-columns: 1fr;
    }

    .tableWrap table {
        min-width: 820px;
    }

    /* 모바일 가로 스크롤 */

    .modal {
        width: 100%;
    }

    .modal .form {
        grid-template-columns: 1fr;
    }
}</style>
  