<template>
    <div class="prepaid-expense-management">
        <header class="page-header">
            <div class="title-area">
                <h2>선급비용 (기간 인식) 관리</h2>
                <p>결제는 한 번에, 비용은 기간 동안 월별로 나누어 인식(상각)하는 항목을 관리합니다.</p>
            </div>
        </header>

        <div class="main-split-layout">

            <aside class="pane list-pane d-panel">
                <div class="pane-header">
                    <h3>목록 <span class="count-badge">{{ filtered.length }}</span></h3>
                    <button class="btn-sm btn-outline" @click="openCreate">+ 신규 등록</button>
                </div>

                <div class="search-box">
                    <input type="text" v-model="keyword" placeholder="항목명 또는 메모 검색" @keyup.enter="noop" />
                    <button class="icon-btn">🔍</button>
                </div>

                <ul class="item-list">
                    <li v-for="it in filtered" :key="it.id" class="list-card"
                        :class="{ 'is-selected': selected?.id === it.id }" @click="selectItem(it)">
                        <div class="card-top">
                            <span class="name">{{ it.name }}</span>
                            <span class="status-dot" :class="it.active ? 'active' : 'inactive'"></span>
                        </div>
                        <div class="card-desc">
                            {{ ymLabel(it.startYm) }} ~ {{ ymLabel(it.endYm) }} ({{ it.months }}개월)
                        </div>
                        <div class="card-meta">
                            <span class="pill">{{ unitLabel(it.unit) }}</span>
                            <div class="amt-info">
                                <span class="label">잔액</span>
                                <span class="mono">{{ fmt(it.remainingAmount) }}</span>
                            </div>
                        </div>
                    </li>
                    <li v-if="filtered.length === 0" class="empty-msg">
                        검색 결과가 없습니다.
                    </li>
                </ul>
            </aside>

            <main class="pane detail-pane d-panel">

                <div v-if="!selected" class="empty-state">
                    <div class="empty-icon">📂</div>
                    <p>좌측에서 항목을 선택하거나 <strong>[+ 신규 등록]</strong> 버튼을 눌러 추가하세요.</p>
                </div>

                <div v-else class="detail-content">

                    <div class="detail-header">
                        <div class="titles">
                            <h3>{{ form.id ? form.name : '새 선급비용 등록' }}</h3>
                            <span class="badge" :class="form.active ? 'bg-blue' : 'bg-gray'">
                                {{ form.active ? '사용 중' : '중지됨' }}
                            </span>
                        </div>
                        <div class="actions">
                            <button class="btn-primary" @click="save">💾 저장</button>
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group col-full">
                            <label>항목명</label>
                            <input type="text" v-model="form.name" placeholder="예: 자동차보험(연납), 렌탈(1년), 연회비"
                                class="input-lg" />
                        </div>

                        <div class="form-group">
                            <label>가계 단위 / 상태</label>
                            <div class="flex-row">
                                <select v-model="form.unit">
                                    <option value="joint">공동</option>
                                    <option value="me">본인</option>
                                    <option value="spouse">배우자</option>
                                </select>
                                <select v-model="form.active">
                                    <option :value="true">사용 (Active)</option>
                                    <option :value="false">중지 (Inactive)</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>총 결제금액 / 결제일</label>
                            <div class="flex-row">
                                <input type="number" min="0" v-model.number="form.totalAmount"
                                    class="text-right mono font-bold" placeholder="0" />
                                <input type="date" v-model="form.paidDate" />
                            </div>
                        </div>

                        <div class="form-group">
                            <label>인식 기간 (시작월 ~ 종료월)</label>
                            <div class="flex-row">
                                <input type="month" v-model="form.startYm" />
                                <span class="tilde">~</span>
                                <input type="month" v-model="form.endYm" />
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="flex-between">
                                <span>월 상각금액</span>
                                <button class="btn-text-sm" @click="calcMonthly">자동 계산 🔄</button>
                            </label>
                            <input type="number" min="0" v-model.number="form.monthlyAmount"
                                class="text-right mono font-bold text-blue" />
                        </div>

                        <div class="form-group">
                            <label>결제수단 (대변)</label>
                            <select v-model="form.payMethodId">
                                <option value="">선택하세요</option>
                                <option v-for="p in payMethodOptions" :key="p.id" :value="p.id">{{ p.label }}</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>선급비용 계정 (BS, 차변)</label>
                            <select v-model="form.prepaidAccount">
                                <option value="">선택하세요</option>
                                <option v-for="a in bsAccountOptions" :key="a.code" :value="a.code">[{{ a.code }}] {{ a.name
                                }}</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>비용 계정 (PL, 차변)</label>
                            <select v-model="form.expenseAccount">
                                <option value="">선택하세요</option>
                                <option v-for="a in plAccountOptions" :key="a.code" :value="a.code">[{{ a.code }}] {{ a.name
                                }}</option>
                            </select>
                        </div>

                        <div class="form-group col-full">
                            <label>메모</label>
                            <textarea v-model="form.memo" placeholder="예: 1년치 선납, 매월 말일 상각 처리"></textarea>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <div class="bottom-split-grid">

                        <div class="inner-card schedule-card">
                            <div class="card-head">
                                <div class="title-box">
                                    <h4>📅 월별 상각 스케줄</h4>
                                    <button class="btn-text-sm" @click="regenSchedule">스케줄 재생성</button>
                                </div>
                            </div>

                            <div class="table-wrap">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>귀속월</th>
                                            <th class="text-right">상각금액</th>
                                            <th class="text-center">상각 처리</th>
                                            <th>비고</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="row in schedule" :key="row.ym"
                                            :class="{ 'is-recognized': row.recognized }">
                                            <td class="mono font-bold">{{ row.ym }}</td>
                                            <td class="text-right mono">{{ fmt(row.amount) }}</td>
                                            <td class="text-center">
                                                <input type="checkbox" v-model="row.recognized" class="custom-chk" />
                                            </td>
                                            <td class="text-muted">{{ row.note || '-' }}</td>
                                        </tr>
                                        <tr v-if="schedule.length === 0">
                                            <td colspan="4" class="empty-td">스케줄이 없습니다. 기간을 설정해주세요.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="schedule-summary">
                                <div class="sum-box">
                                    <span class="label">총액</span>
                                    <span class="value mono">{{ fmt(form.totalAmount) }}</span>
                                </div>
                                <div class="sum-box">
                                    <span class="label">누적 상각</span>
                                    <span class="value mono text-blue">{{ fmt(recognizedSum) }}</span>
                                </div>
                                <div class="sum-box" :class="remainingAmount > 0 ? 'bg-green' : 'bg-red'">
                                    <span class="label">남은 잔액 (BS)</span>
                                    <span class="value mono">{{ fmt(remainingAmount) }}</span>
                                </div>
                                <button class="btn-outline btn-sm" @click="recognizeThisMonth">당월 처리(테스트)</button>
                            </div>
                        </div>

                        <div class="inner-card voucher-card">
                            <div class="card-head">
                                <h4>📑 전표 분개 예시 (Voucher)</h4>
                            </div>

                            <div class="voucher-body">
                                <div class="voucher-block">
                                    <div class="v-title">① 결제 시점 (선급비용 자산 인식)</div>
                                    <div class="v-row head"><span>구분</span><span>계정과목</span><span
                                            class="text-right">금액</span></div>
                                    <div class="v-row">
                                        <span class="tag dr">차</span>
                                        <span class="mono">{{ form.prepaidAccount || '선급비용' }}</span>
                                        <span class="mono text-right font-bold text-blue">{{ fmt(form.totalAmount) }}</span>
                                    </div>
                                    <div class="v-row">
                                        <span class="tag cr">대</span>
                                        <span class="mono">{{ payMethodToAccount(form.payMethodId) || '결제수단' }}</span>
                                        <span class="mono text-right font-bold text-red">{{ fmt(form.totalAmount) }}</span>
                                    </div>
                                </div>

                                <div class="voucher-block">
                                    <div class="v-title">② 매월 말일 (비용 인식 / 자산 상각)</div>
                                    <div class="v-row head"><span>구분</span><span>계정과목</span><span
                                            class="text-right">금액</span></div>
                                    <div class="v-row">
                                        <span class="tag dr">차</span>
                                        <span class="mono">{{ form.expenseAccount || '비용계정' }}</span>
                                        <span class="mono text-right font-bold text-blue">{{ fmt(form.monthlyAmount)
                                        }}</span>
                                    </div>
                                    <div class="v-row">
                                        <span class="tag cr">대</span>
                                        <span class="mono">{{ form.prepaidAccount || '선급비용' }}</span>
                                        <span class="mono text-right font-bold text-red">{{ fmt(form.monthlyAmount)
                                        }}</span>
                                    </div>
                                    <div class="v-hint">* 상각 처리 시 위와 같은 분개 전표가 자동 생성됩니다.</div>
                                </div>
                            </div>

                            <div class="danger-zone">
                                <span class="hint">* 실서비스에서는 삭제 대신 '중지'를 권장합니다.</span>
                                <button class="btn-danger btn-sm" @click="remove" v-if="form.id">🗑 삭제</button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';

// ==========================================
// 1. 기초 데이터
// ==========================================
const keyword = ref('');

const payMethodOptions = reactive([
    { id: 'A1', label: '국민은행 생활비통장', accountCode: '1110 (보통예금)' },
    { id: 'C1', label: '삼성카드 (신용)', accountCode: '2110 (미지급금)' },
]);

const bsAccountOptions = reactive([
    { code: '1300', name: '선급비용(보험료)' },
    { code: '1310', name: '선급비용(구독/렌탈)' },
]);

const plAccountOptions = reactive([
    { code: '5110', name: '보험료(비용)' },
    { code: '5120', name: '지급임차료(렌탈비)' },
]);

// 예시 데이터
const items = reactive([
    {
        id: 1, unit: 'joint', active: true, name: '자동차보험(연납)', memo: '2025-12 결제, 12개월 상각',
        totalAmount: 1200000, paidDate: '2025-12-10', startYm: '2025-12', endYm: '2026-11',
        monthlyAmount: 100000, payMethodId: 'C1', prepaidAccount: '1300', expenseAccount: '5110',
    },
    {
        id: 2, unit: 'me', active: true, name: '정수기 렌탈(1년 선납)', memo: '',
        totalAmount: 360000, paidDate: '2025-11-20', startYm: '2025-11', endYm: '2026-10',
        monthlyAmount: 30000, payMethodId: 'A1', prepaidAccount: '1310', expenseAccount: '5120',
    },
]);

// ==========================================
// 2. 상태 관리 (선택 및 폼)
// ==========================================
const selected = ref(null);
const schedule = reactive([]);

const form = reactive({
    id: null, unit: 'joint', active: true, name: '', memo: '',
    totalAmount: 0, paidDate: '', startYm: '', endYm: '',
    monthlyAmount: 0, payMethodId: '', prepaidAccount: '', expenseAccount: '',
});

const filtered = computed(() => {
    const q = keyword.value.trim().toLowerCase();
    const list = items.map((x) => {
        const months = monthsBetween(x.startYm, x.endYm);
        const recognizedSum = 0;
        const remainingAmount = Math.max(0, Math.round((x.totalAmount || 0) - recognizedSum));
        return { ...x, months, recognizedSum, remainingAmount };
    });

    if (!q) return list;
    return list.filter((x) => (`${x.name} ${x.memo || ''}`).toLowerCase().includes(q));
});

// ==========================================
// 3. 액션 로직
// ==========================================
function selectItem(it) {
    const src = items.find((x) => x.id === it.id);
    selected.value = src;
    fillForm(src);
    regenSchedule();
}

function openCreate() {
    selected.value = { id: null };
    resetForm();
    schedule.splice(0);
}

function resetForm() {
    Object.assign(form, { id: null, unit: 'joint', active: true, name: '', memo: '', totalAmount: 0, paidDate: '', startYm: '', endYm: '', monthlyAmount: 0, payMethodId: '', prepaidAccount: '', expenseAccount: '' });
}

function fillForm(src) {
    resetForm();
    Object.assign(form, src);
}

function save() {
    if (!form.name.trim()) return alert('항목명을 입력하세요.');
    if (!form.startYm || !form.endYm) return alert('시작/종료월을 지정하세요.');

    const payload = { ...form, totalAmount: Number(form.totalAmount), monthlyAmount: Number(form.monthlyAmount) };

    if (!form.id) {
        payload.id = Date.now();
        items.unshift(payload);
    } else {
        const idx = items.findIndex((x) => x.id === form.id);
        items[idx] = { ...items[idx], ...payload };
    }
    selected.value = payload;
    alert('성공적으로 저장되었습니다.');
}

function remove() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const idx = items.findIndex((x) => x.id === selected.value.id);
    items.splice(idx, 1);
    selected.value = null; resetForm(); schedule.splice(0);
}

// ==========================================
// 4. 스케줄링 및 유틸
// ==========================================
function calcMonthly() {
    const m = monthsBetween(form.startYm, form.endYm);
    if (!m) return alert('시작월과 종료월을 설정해주세요.');
    form.monthlyAmount = Math.floor(Number(form.totalAmount || 0) / m);
    regenSchedule();
}

function regenSchedule() {
    schedule.splice(0);
    const months = buildMonths(form.startYm, form.endYm);
    const amt = Number(form.monthlyAmount || 0);

    months.forEach((ym, idx) => {
        schedule.push({ ym, amount: amt, recognized: false, note: idx === 0 ? '시작월' : (idx === months.length - 1 ? '종료월' : '') });
    });
}

function recognizeThisMonth() {
    const nowYm = '2025-12'; // 실제로는 dayjs().format('YYYY-MM')
    const row = schedule.find((x) => x.ym === nowYm);
    if (!row) return alert('해당 월 스케줄이 없습니다.');
    row.recognized = true;
}

const recognizedSum = computed(() => schedule.filter((x) => x.recognized).reduce((a, c) => a + Number(c.amount || 0), 0));
const remainingAmount = computed(() => Math.max(0, Math.round(Number(form.totalAmount || 0) - recognizedSum.value)));

function unitLabel(u) { return u === 'joint' ? '공동' : u === 'me' ? '본인' : '배우자'; }
function fmt(n) { return `${Math.round(Number(n || 0)).toLocaleString('ko-KR')}원`; }
function ymLabel(ym) { return ym ? ym.replace('-', '.') : '-'; }
function payMethodToAccount(id) { return payMethodOptions.find((x) => x.id === id)?.accountCode || '-'; }
function monthsBetween(sYm, eYm) {
    const s = parseYm(sYm), e = parseYm(eYm);
    if (!s || !e) return 0;
    return Math.max(0, (e.y - s.y) * 12 + (e.m - s.m) + 1);
}
function buildMonths(sYm, eYm) {
    const s = parseYm(sYm), e = parseYm(eYm);
    if (!s || !e) return [];
    let res = [], y = s.y, m = s.m;
    while (y < e.y || (y === e.y && m <= e.m)) {
        res.push(`${y}-${String(m).padStart(2, '0')}`);
        if (++m > 12) { m = 1; y++; }
    }
    return res;
}
function parseYm(ym) {
    if (!ym || ym.length < 7) return null;
    return { y: Number(ym.slice(0, 4)), m: Number(ym.slice(5, 7)) };
}
function noop() { }
</script>

<style lang="scss" scoped>
/* 🎨 공통 색상 및 테마 변수 */
$primary: #4b74ff;
$primary-hover: #3848c7;
$bg-main: #f5f6fa;
$bg-white: #ffffff;
$border: #e2e8f0;
$border-dark: #cbd5e1;
$text-main: #1e293b;
$text-sub: #64748b;
$text-light: #94a3b8;
$danger: #ef4444;
$success: #10b981;

.prepaid-expense-management {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
    font-family: 'Pretendard', sans-serif;
    color: $text-main;
    background: $bg-main;
    min-height: 100vh;
}

.page-header {
    margin-bottom: 20px;

    .title-area h2 {
        margin: 0 0 6px 0;
        font-size: 24px;
        font-weight: 800;
    }

    .title-area p {
        margin: 0;
        color: $text-sub;
        font-size: 14px;
    }
}

.d-panel {
    background: $bg-white;
    border-radius: 12px;
    border: 1px solid $border;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.main-split-layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
}

/* ==============================
   좌측 리스트 패널
============================== */
.list-pane {
    width: 360px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 120px);

    .pane-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .count-badge {
            background: #e0e7ff;
            color: #3730a3;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
        }
    }

    .search-box {
        display: flex;
        margin-bottom: 16px;

        input {
            flex: 1;
            padding: 10px 12px;
            border: 1px solid $border;
            border-radius: 8px 0 0 8px;
            font-size: 14px;
            outline: none;

            &:focus {
                border-color: $primary;
            }
        }

        .icon-btn {
            background: #f1f5f9;
            border: 1px solid $border;
            border-left: none;
            padding: 0 12px;
            border-radius: 0 8px 8px 0;
            cursor: pointer;
        }
    }

    .item-list {
        list-style: none;
        padding: 0;
        margin: 0;
        overflow-y: auto;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .list-card {
            border: 1px solid $border;
            border-radius: 8px;
            padding: 12px 16px;
            cursor: pointer;
            transition: 0.2s;
            background: $bg-white;

            &:hover {
                border-color: $border-dark;
            }

            &.is-selected {
                border-color: $primary;
                background: #eff6ff;
                box-shadow: 0 2px 8px rgba($primary, 0.1);
            }

            .card-top {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 6px;

                .name {
                    font-weight: 800;
                    font-size: 15px;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;

                    &.active {
                        background: $success;
                    }

                    &.inactive {
                        background: $danger;
                    }
                }
            }

            .card-desc {
                font-size: 12px;
                color: $text-sub;
                margin-bottom: 10px;
            }

            .card-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .pill {
                    background: #f1f5f9;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 700;
                    color: $text-sub;
                }

                .amt-info {
                    font-size: 13px;

                    .label {
                        color: $text-light;
                        margin-right: 6px;
                    }

                    .mono {
                        font-weight: 800;
                    }
                }
            }
        }

        .empty-msg {
            text-align: center;
            padding: 40px 0;
            color: $text-light;
            font-size: 14px;
        }
    }
}

/* ==============================
   우측 상세 패널
============================== */
.detail-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 120px);

    .empty-state {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: $text-sub;

        .empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
        }

        strong {
            color: $primary;
        }
    }

    .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid $bg-main;

        .titles {
            display: flex;
            align-items: center;
            gap: 12px;

            h3 {
                margin: 0;
                font-size: 20px;
                font-weight: 800;
            }

            .badge {
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 800;
                color: #fff;

                &.bg-blue {
                    background: $primary;
                }

                &.bg-gray {
                    background: $text-light;
                }
            }
        }
    }

    /* 폼 그리드 */
    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;

        .col-full {
            grid-column: 1 / -1;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;

            label {
                font-size: 13px;
                font-weight: 700;
                color: $text-sub;

                &.flex-between {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
            }

            input,
            select,
            textarea {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid $border;
                border-radius: 8px;
                font-size: 14px;
                outline: none;
                transition: 0.2s;
                background: $bg-white;
                color: $text-main;

                &:focus {
                    border-color: $primary;
                    box-shadow: 0 0 0 2px rgba($primary, 0.1);
                }
            }

            textarea {
                height: 80px;
                resize: none;
            }

            .flex-row {
                display: flex;
                gap: 8px;
                align-items: center;

                input,
                select {
                    flex: 1;
                }

                .tilde {
                    color: $text-light;
                    font-weight: bold;
                }
            }

            .input-lg {
                font-size: 16px;
                font-weight: 700;
                padding: 12px;
            }
        }
    }

    .divider {
        height: 1px;
        background: $border;
        margin: 24px 0;
    }

    /* 하단 스플릿 (스케줄 vs 전표) */
    .bottom-split-grid {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 24px;

        .inner-card {
            border: 1px solid $border;
            border-radius: 12px;
            background: #fff;
            display: flex;
            flex-direction: column;
            overflow: hidden;

            .card-head {
                padding: 16px;
                border-bottom: 1px solid $bg-main;
                background: #f8fafc;

                h4 {
                    margin: 0;
                    font-size: 15px;
                    font-weight: 800;
                    color: $text-main;
                }

                .title-box {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
            }
        }

        /* 상각 스케줄 테이블 */
        .schedule-card {
            .table-wrap {
                overflow-y: auto;
                max-height: 250px;
            }

            .data-table {
                width: 100%;
                border-collapse: collapse;

                th {
                    background: #fff;
                    padding: 10px 16px;
                    font-size: 12px;
                    font-weight: 700;
                    color: $text-sub;
                    border-bottom: 1px solid $border;
                    position: sticky;
                    top: 0;
                }

                td {
                    padding: 10px 16px;
                    font-size: 13px;
                    border-bottom: 1px solid #f1f5f9;
                }

                tr.is-recognized td {
                    background: #f8fafc;
                    color: $text-light;
                    text-decoration: line-through;
                }

                .custom-chk {
                    width: 16px;
                    height: 16px;
                    accent-color: $primary;
                    cursor: pointer;
                }

                .empty-td {
                    text-align: center;
                    padding: 30px;
                    color: $text-light;
                }
            }

            .schedule-summary {
                padding: 16px;
                background: #f8fafc;
                border-top: 1px solid $border;
                display: flex;
                gap: 12px;
                align-items: center;
                flex-wrap: wrap;

                .sum-box {
                    flex: 1;
                    background: #fff;
                    border: 1px solid $border;
                    border-radius: 8px;
                    padding: 8px 12px;
                    display: flex;
                    flex-direction: column;

                    .label {
                        font-size: 11px;
                        color: $text-sub;
                        font-weight: 700;
                    }

                    .value {
                        font-size: 15px;
                        font-weight: 900;
                        margin-top: 2px;
                    }

                    &.bg-green {
                        border-color: #a7f3d0;
                        background: #ecfdf5;

                        .value {
                            color: #065f46;
                        }
                    }

                    &.bg-red {
                        border-color: #fecaca;
                        background: #fef2f2;

                        .value {
                            color: #991b1b;
                        }
                    }
                }
            }
        }

        /* 전표 분개 뷰 */
        .voucher-card {
            .voucher-body {
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                flex: 1;
            }

            .voucher-block {
                border: 1px solid $border;
                border-radius: 8px;
                overflow: hidden;

                .v-title {
                    background: #f1f5f9;
                    padding: 8px 12px;
                    font-size: 12px;
                    font-weight: 800;
                    border-bottom: 1px solid $border;
                }

                .v-row {
                    display: grid;
                    grid-template-columns: 40px 1fr 100px;
                    padding: 8px 12px;
                    font-size: 13px;
                    align-items: center;
                    border-bottom: 1px solid #f1f5f9;

                    &:last-child {
                        border-bottom: none;
                    }

                    &.head {
                        font-weight: 700;
                        color: $text-sub;
                        background: #fff;
                    }
                }

                .tag {
                    display: inline-block;
                    padding: 2px 0;
                    text-align: center;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 900;

                    &.dr {
                        background: #dbeafe;
                        color: #1e40af;
                    }

                    &.cr {
                        background: #fee2e2;
                        color: #991b1b;
                    }
                }

                .v-hint {
                    padding: 8px 12px;
                    font-size: 11px;
                    color: $text-light;
                    background: #fff;
                }
            }

            .danger-zone {
                padding: 16px;
                border-top: 1px solid $border;
                display: flex;
                justify-content: space-between;
                align-items: center;

                .hint {
                    font-size: 12px;
                    color: $text-light;
                }
            }
        }
    }
}

/* 유틸리티 및 버튼 */
.mono {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
}

.font-bold {
    font-weight: 700;
}

.text-right {
    text-align: right;
}

.text-center {
    text-align: center;
}

.text-blue {
    color: $primary;
}

.text-red {
    color: $danger;
}

.text-muted {
    color: $text-sub;
}

.btn-primary {
    background: $primary;
    color: #fff;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
        background: $primary-hover;
    }
}

.btn-outline {
    background: #fff;
    border: 1px solid $border-dark;
    color: $text-main;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;

    &:hover {
        background: #f1f5f9;
    }
}

.btn-danger {
    background: #fff;
    border: 1px solid $danger;
    color: $danger;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;

    &:hover {
        background: #fef2f2;
    }
}

.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
}

.btn-text-sm {
    background: none;
    border: none;
    color: $primary;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    padding: 0;

    &:hover {
        text-decoration: underline;
    }
}</style>