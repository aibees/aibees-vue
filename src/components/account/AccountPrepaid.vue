<template>
    <div class="lnb-content system-prepaid-expense">
        <section class="main-section">
            <!-- LEFT : List -->
            <aside class="panel list-panel">
                <div class="panel-header">
                    <h2>선급비용 목록</h2>
                    <span class="badge">Prepaid</span>
                </div>

                <div class="search">
                    <input v-model="keyword" placeholder="항목명/메모 검색" />
                    <button class="btn btn--primary" @click="noop">검색</button>
                </div>

                <div class="list-actions">
                    <button class="btn btn--ghost w-full" @click="openCreate">+ 선급비용 등록</button>
                </div>

                <ul class="item-list">
                    <li v-for="it in filtered" :key="it.id" :class="{ active: selected?.id === it.id }"
                        @click="selectItem(it)">
                        <div class="name">{{ it.name }}</div>
                        <div class="desc">
                            {{ ymLabel(it.startYm) }} ~ {{ ymLabel(it.endYm) }}
                            · {{ it.months }}개월
                        </div>
                        <div class="meta">
                            <span class="pill">{{ unitLabel(it.unit) }}</span>
                            <span class="mono">{{ fmt(it.remainingAmount) }}</span>
                        </div>
                    </li>

                    <li v-if="filtered.length === 0" class="empty-li">
                        검색 결과가 없습니다.
                    </li>
                </ul>
            </aside>

            <!-- RIGHT : Detail -->
            <main class="panel detail-panel">
                <div class="panel-header">
                    <div>
                        <h2>{{ selected ? selected.name : '선급비용 상세' }}</h2>
                        <div class="panel-sub">
                            결제는 한 번에, 비용은 기간 동안 월별로 나눠 인식합니다(상각).
                        </div>
                    </div>

                    <div class="panel-actions">
                        <button class="btn btn--ghost" @click="openCreate">신규</button>
                        <button class="btn btn--primary" @click="save">저장</button>
                    </div>
                </div>

                <div v-if="!selected" class="empty-state">
                    좌측에서 항목을 선택하거나 “선급비용 등록”으로 추가하세요.
                </div>

                <div v-else class="detail-body">
                    <!-- Top form -->
                    <div class="form-grid">
                        <div class="field">
                            <label>가계 단위</label>
                            <select v-model="form.unit">
                                <option value="joint">공동</option>
                                <option value="me">본인</option>
                                <option value="spouse">배우자</option>
                            </select>
                        </div>

                        <div class="field">
                            <label>상태</label>
                            <select v-model="form.active">
                                <option :value="true">사용</option>
                                <option :value="false">중지</option>
                            </select>
                        </div>

                        <div class="field field--full">
                            <label>항목명</label>
                            <input v-model="form.name" placeholder="예: 자동차보험(연납), 렌탈(1년), 연회비" />
                        </div>

                        <div class="field">
                            <label>총 결제금액</label>
                            <input type="number" min="0" v-model.number="form.totalAmount" />
                        </div>

                        <div class="field">
                            <label>결제일</label>
                            <input type="date" v-model="form.paidDate" />
                        </div>

                        <div class="field">
                            <label>시작월(YYYY-MM)</label>
                            <input v-model="form.startYm" placeholder="2025-12" />
                        </div>

                        <div class="field">
                            <label>종료월(YYYY-MM)</label>
                            <input v-model="form.endYm" placeholder="2026-11" />
                        </div>

                        <div class="field">
                            <label>월 상각금액</label>
                            <input type="number" min="0" v-model.number="form.monthlyAmount" />
                            <div class="help">자동 계산 버튼을 누르면 기간 기반으로 월 상각금액을 계산합니다.</div>
                        </div>

                        <div class="field">
                            <label>결제수단</label>
                            <select v-model="form.payMethodId">
                                <option value="">선택</option>
                                <option v-for="p in payMethodOptions" :key="p.id" :value="p.id">
                                    {{ p.label }}
                                </option>
                            </select>
                        </div>

                        <div class="field">
                            <label>선급비용 계정(BS)</label>
                            <select v-model="form.prepaidAccount">
                                <option value="">선택</option>
                                <option v-for="a in bsAccountOptions" :key="a.code" :value="a.code">
                                    {{ a.code }} {{ a.name }}
                                </option>
                            </select>
                        </div>

                        <div class="field">
                            <label>비용 계정(PL)</label>
                            <select v-model="form.expenseAccount">
                                <option value="">선택</option>
                                <option v-for="a in plAccountOptions" :key="a.code" :value="a.code">
                                    {{ a.code }} {{ a.name }}
                                </option>
                            </select>
                        </div>

                        <div class="field field--full">
                            <label>메모</label>
                            <textarea v-model="form.memo" placeholder="예: 1년치 선납, 매월 상각"></textarea>
                        </div>
                    </div>

                    <div class="inline-actions">
                        <button class="btn btn--ghost" @click="calcMonthly">월 상각 자동계산</button>
                        <button class="btn btn--ghost" @click="regenSchedule">상각 스케줄 재생성</button>
                    </div>

                    <!-- Schedule + Voucher preview -->
                    <div class="split">
                        <!-- Schedule -->
                        <section class="card-inner">
                            <div class="card-inner__head">
                                <div>
                                    <div class="title">월별 상각 스케줄</div>
                                    <div class="sub">체크된 월은 비용 인식(상각) 처리된 것으로 가정합니다(예시).</div>
                                </div>
                                <span class="badge">Schedule</span>
                            </div>

                            <div class="table-wrap">
                                <table class="tbl">
                                    <thead>
                                        <tr>
                                            <th style="width: 100px;">월</th>
                                            <th class="right" style="width: 140px;">상각금액</th>
                                            <th style="width: 110px;">상각</th>
                                            <th>비고</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="row in schedule" :key="row.ym">
                                            <td class="mono">{{ row.ym }}</td>
                                            <td class="right mono">{{ fmt(row.amount) }}</td>
                                            <td>
                                                <label class="chk">
                                                    <input type="checkbox" v-model="row.recognized" />
                                                    <span>처리</span>
                                                </label>
                                            </td>
                                            <td class="muted">{{ row.note || '-' }}</td>
                                        </tr>

                                        <tr v-if="schedule.length === 0">
                                            <td colspan="4" class="empty-row">스케줄이 없습니다.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="schedule-foot">
                                <div class="sum">
                                    <div class="sum-item">
                                        <span class="k">총액</span>
                                        <span class="v mono">{{ fmt(form.totalAmount) }}</span>
                                    </div>
                                    <div class="sum-item">
                                        <span class="k">누적 상각</span>
                                        <span class="v mono">{{ fmt(recognizedSum) }}</span>
                                    </div>
                                    <div class="sum-item" :class="remainingAmount > 0 ? 'ok' : 'warn'">
                                        <span class="k">잔액(BS)</span>
                                        <span class="v mono">{{ fmt(remainingAmount) }}</span>
                                    </div>
                                </div>

                                <button class="btn btn--primary" @click="recognizeThisMonth">
                                    이번달 상각 처리(예시)
                                </button>
                            </div>
                        </section>

                        <!-- Voucher preview -->
                        <section class="card-inner">
                            <div class="card-inner__head">
                                <div>
                                    <div class="title">전표 예시</div>
                                    <div class="sub">결제 시점/월 상각 시점의 분개 예시를 보여줍니다.</div>
                                </div>
                                <span class="badge">Voucher</span>
                            </div>

                            <div class="voucher">
                                <div class="block">
                                    <div class="block-title">① 결제 시점(선급비용 인식)</div>
                                    <table class="mini-tbl">
                                        <thead>
                                            <tr>
                                                <th style="width: 60px;">구분</th>
                                                <th>계정</th>
                                                <th class="right" style="width: 150px;">금액</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td><span class="tag dr">차</span></td>
                                                <td class="mono">{{ form.prepaidAccount || '-' }}</td>
                                                <td class="right mono">{{ fmt(form.totalAmount) }}</td>
                                            </tr>
                                            <tr>
                                                <td><span class="tag cr">대</span></td>
                                                <td class="mono">{{ payMethodToAccount(form.payMethodId) }}</td>
                                                <td class="right mono">{{ fmt(form.totalAmount) }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div class="block">
                                    <div class="block-title">② 월 상각(비용 인식)</div>
                                    <table class="mini-tbl">
                                        <thead>
                                            <tr>
                                                <th style="width: 60px;">구분</th>
                                                <th>계정</th>
                                                <th class="right" style="width: 150px;">금액</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td><span class="tag dr">차</span></td>
                                                <td class="mono">{{ form.expenseAccount || '-' }}</td>
                                                <td class="right mono">{{ fmt(form.monthlyAmount) }}</td>
                                            </tr>
                                            <tr>
                                                <td><span class="tag cr">대</span></td>
                                                <td class="mono">{{ form.prepaidAccount || '-' }}</td>
                                                <td class="right mono">{{ fmt(form.monthlyAmount) }}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div class="hint-line">
                                        * 실제 구현에서는 “처리” 체크 시 해당 월 전표를 생성하고, 결산 잠금 정책을 적용할 수 있습니다.
                                    </div>
                                </div>

                                <div class="block">
                                    <div class="block-title">③ 남은 기간 요약</div>
                                    <div class="kv">
                                        <span class="k">기간</span>
                                        <span class="v mono">{{ form.startYm }} ~ {{ form.endYm }}</span>
                                    </div>
                                    <div class="kv">
                                        <span class="k">월 상각</span>
                                        <span class="v mono">{{ fmt(form.monthlyAmount) }}</span>
                                    </div>
                                    <div class="kv">
                                        <span class="k">잔액</span>
                                        <span class="v mono">{{ fmt(remainingAmount) }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="danger-zone">
                                <button class="btn btn--danger" @click="remove">삭제</button>
                                <div class="danger-hint">
                                    * 실서비스에서는 삭제 대신 “중지(비활성)” 처리 권장
                                </div>
                            </div>
                        </section>
                    </div>

                </div>
            </main>
        </section>
    </div>
</template>
  
<script setup>
import { computed, reactive, ref } from 'vue';

const keyword = ref('');

const payMethodOptions = reactive([
    { id: 'A1', label: '국민은행 생활비통장(계좌)', accountCode: '210' },
    { id: 'C1', label: '삼성카드(신용)', accountCode: '411' }, // 카드면 “미지급금” 계정으로 나가는 형태 가정
]);

const bsAccountOptions = reactive([
    { code: '130', name: '선급비용(보험료)' },
    { code: '131', name: '선급비용(구독/렌탈)' },
]);

const plAccountOptions = reactive([
    { code: '511', name: '보험료(비용)' },
    { code: '512', name: '구독료(비용)' },
]);

// 예시 데이터(좌측 목록)
const items = reactive([
    {
        id: 1,
        unit: 'joint',
        active: true,
        name: '자동차보험(연납)',
        memo: '2025-12 결제, 12개월 상각',
        totalAmount: 1200000,
        paidDate: '2025-12-10',
        startYm: '2025-12',
        endYm: '2026-11',
        monthlyAmount: 100000,
        payMethodId: 'C1',
        prepaidAccount: '130',
        expenseAccount: '511',
    },
    {
        id: 2,
        unit: 'me',
        active: true,
        name: '렌탈(1년 선납)',
        memo: '',
        totalAmount: 360000,
        paidDate: '2025-11-20',
        startYm: '2025-11',
        endYm: '2026-10',
        monthlyAmount: 30000,
        payMethodId: 'A1',
        prepaidAccount: '131',
        expenseAccount: '512',
    },
]);

const selected = ref(null);

// 상세 form
const form = reactive({
    id: null,
    unit: 'joint',
    active: true,
    name: '',
    memo: '',
    totalAmount: 0,
    paidDate: '',
    startYm: '',
    endYm: '',
    monthlyAmount: 0,
    payMethodId: '',
    prepaidAccount: '',
    expenseAccount: '',
});

// 스케줄(우측 하단)
const schedule = reactive([]);

const filtered = computed(() => {
    const q = keyword.value.trim().toLowerCase();
    const list = items.map((x) => {
        const months = monthsBetween(x.startYm, x.endYm);
        const recognizedSum = 0; // 목록에서는 간단히 0으로 둠(실서비스는 인식된 건 합산)
        const remainingAmount = Math.max(0, Math.round((x.totalAmount || 0) - recognizedSum));
        return {
            ...x,
            months,
            recognizedSum,
            remainingAmount,
        };
    });

    if (!q) return list;
    return list.filter((x) => (`${x.name} ${x.memo || ''}`).toLowerCase().includes(q));
});

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
    form.id = null;
    form.unit = 'joint';
    form.active = true;
    form.name = '';
    form.memo = '';
    form.totalAmount = 0;
    form.paidDate = '';
    form.startYm = '';
    form.endYm = '';
    form.monthlyAmount = 0;
    form.payMethodId = '';
    form.prepaidAccount = '';
    form.expenseAccount = '';
}

function fillForm(src) {
    resetForm();
    form.id = src.id;
    form.unit = src.unit;
    form.active = !!src.active;
    form.name = src.name || '';
    form.memo = src.memo || '';
    form.totalAmount = Number(src.totalAmount || 0);
    form.paidDate = src.paidDate || '';
    form.startYm = src.startYm || '';
    form.endYm = src.endYm || '';
    form.monthlyAmount = Number(src.monthlyAmount || 0);
    form.payMethodId = src.payMethodId || '';
    form.prepaidAccount = src.prepaidAccount || '';
    form.expenseAccount = src.expenseAccount || '';
}

function save() {
    if (!form.name.trim()) return alert('항목명을 입력하세요.');
    if (!form.totalAmount || form.totalAmount < 0) return alert('총 결제금액을 확인하세요.');
    if (!form.startYm || !form.endYm) return alert('시작월/종료월을 입력하세요.');
    if (!form.prepaidAccount) return alert('선급비용(BS) 계정을 선택하세요.');
    if (!form.expenseAccount) return alert('비용(PL) 계정을 선택하세요.');

    const payload = {
        id: form.id || Date.now(),
        unit: form.unit,
        active: !!form.active,
        name: form.name.trim(),
        memo: form.memo.trim(),
        totalAmount: Number(form.totalAmount || 0),
        paidDate: form.paidDate,
        startYm: form.startYm,
        endYm: form.endYm,
        monthlyAmount: Number(form.monthlyAmount || 0),
        payMethodId: form.payMethodId,
        prepaidAccount: form.prepaidAccount,
        expenseAccount: form.expenseAccount,
    };

    if (!form.id) {
        items.unshift(payload);
        selected.value = payload;
        form.id = payload.id;
    } else {
        const idx = items.findIndex((x) => x.id === form.id);
        if (idx < 0) return alert('대상을 찾을 수 없습니다.');
        items[idx] = { ...items[idx], ...payload };
        selected.value = items[idx];
    }

    alert('저장(예시)');
}

function remove() {
    if (!selected.value || !selected.value.id) return alert('삭제할 항목을 선택하세요.');
    const idx = items.findIndex((x) => x.id === selected.value.id);
    if (idx < 0) return;
    items.splice(idx, 1);
    selected.value = null;
    resetForm();
    schedule.splice(0);
    alert('삭제(예시)');
}

/** 월 상각 자동 계산: 총액/개월수 */
function calcMonthly() {
    const m = monthsBetween(form.startYm, form.endYm);
    if (!m) return alert('시작월/종료월을 먼저 입력하세요.');
    form.monthlyAmount = Math.floor(Number(form.totalAmount || 0) / m);
    regenSchedule();
}

/** 스케줄 재생성 */
function regenSchedule() {
    schedule.splice(0);
    const months = buildMonths(form.startYm, form.endYm);
    const amt = Number(form.monthlyAmount || 0);

    months.forEach((ym, idx) => {
        schedule.push({
            ym,
            amount: amt,
            recognized: false,
            note: idx === 0 ? '시작월' : (idx === months.length - 1 ? '종료월' : ''),
        });
    });
}

/** 이번달 상각 처리(예시): 현재 달(2025-12) 기준 */
function recognizeThisMonth() {
    const nowYm = '2025-12'; // 실제 구현에서는 시스템 현재월/선택월
    const row = schedule.find((x) => x.ym === nowYm);
    if (!row) return alert('이번달에 해당하는 스케줄이 없습니다.');
    row.recognized = true;
    alert(`이번달 상각 처리(예시): ${nowYm}`);
}

/** 합계/잔액 */
const recognizedSum = computed(() => {
    return schedule.filter((x) => x.recognized).reduce((a, c) => a + Number(c.amount || 0), 0);
});

const remainingAmount = computed(() => {
    return Math.max(0, Math.round(Number(form.totalAmount || 0) - recognizedSum.value));
});

/** helpers */
function unitLabel(u) {
    return u === 'joint' ? '공동' : u === 'me' ? '본인' : '배우자';
}
function fmt(n) {
    const v = Math.round(Number(n || 0));
    return `${v.toLocaleString('ko-KR')}원`;
}
function ymLabel(ym) {
    if (!ym) return '-';
    const [y, m] = ym.split('-');
    return `${y}.${m}`;
}
function payMethodToAccount(payMethodId) {
    const p = payMethodOptions.find((x) => x.id === payMethodId);
    return p ? p.accountCode : '-';
}
function monthsBetween(startYm, endYm) {
    const s = parseYm(startYm);
    const e = parseYm(endYm);
    if (!s || !e) return 0;
    const diff = (e.y - s.y) * 12 + (e.m - s.m) + 1;
    return diff > 0 ? diff : 0;
}
function buildMonths(startYm, endYm) {
    const s = parseYm(startYm);
    const e = parseYm(endYm);
    if (!s || !e) return [];
    const res = [];
    let y = s.y, m = s.m;

    while (y < e.y || (y === e.y && m <= e.m)) {
        res.push(`${y}-${String(m).padStart(2, '0')}`);
        m += 1;
        if (m === 13) { m = 1; y += 1; }
    }
    return res;
}
function parseYm(ym) {
    if (!ym || ym.length < 7) return null;
    const y = Number(ym.slice(0, 4));
    const m = Number(ym.slice(5, 7));
    if (!y || !m || m < 1 || m > 12) return null;
    return { y, m };
}
function noop() { }
</script>
  
<style lang="scss" scoped>
@use '@@/common.scss' as *;

.system-prepaid-expense {
    background: #f5f6fa;

    .main-section {
        display: flex;
        gap: 8px;
        align-items: flex-start; // ✅ 패널 높이 독립
    }

    .panel {
        background: #ffffff;
        border-radius: 8px;
        border: 2px solid #c6beb080;
        padding: 10px 20px 12px;
        box-shadow: 0 8px 20px #2a210f0f;
        margin: 16px;

        .badge {
            font-size: 0.75rem;
            padding: 2px 8px;
            border-radius: 999px;
            background: #e4ebff;
            color: #3848c7;
            font-weight: 700;
        }

        .pill {
            font-size: 0.72rem;
            padding: 2px 8px;
            border-radius: 999px;
            background: #eef2ff;
            color: #3730a3;
            border: 1px solid #c7d2fe;
            font-weight: 800;
        }

        .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 8px 0;

            h2 {
                text-align: start;
                font-size: 1rem;
                margin: 0 0 3px;
            }

            .panel-sub {
                margin: 0;
                font-size: 0.78rem;
                color: #6b7280;
            }
        }
    }

    /* LEFT */
    .list-panel {
        width: 340px;
        min-width: 340px;

        .search {
            display: flex;
            gap: 8px;
            padding: 0 0 10px;

            input {
                flex: 1;
                padding: 8px;
                border-radius: 10px;
                border: 1px solid #d1d5db;
            }
        }

        .list-actions {
            padding-bottom: 10px;

            .w-full {
                width: 100%;
            }
        }

        .item-list {
            list-style: none;
            margin: 0;
            padding: 0;

            li {
                padding: 10px 14px;
                cursor: pointer;
                border-top: 1px solid #f1f5f9;

                &.active {
                    background: #eef2ff;
                }

                .name {
                    font-weight: 900;
                }

                .desc {
                    padding-top: 4px;
                    font-size: 0.8rem;
                    color: #6b7280;
                }

                .meta {
                    margin-top: 6px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.75rem;

                    .mono {
                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                        font-weight: 900;
                        color: #111827;
                    }
                }
            }

            .empty-li {
                padding: 16px 14px;
                color: #9ca3af;
                text-align: center;
            }
        }
    }

    /* RIGHT */
    .detail-panel {
        flex: 1;

        .panel-actions {
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
        }

        .empty-state {
            margin-top: 18px;
            padding: 18px;
            border: 1px dashed #d1d5db;
            border-radius: 10px;
            color: #9ca3af;
            text-align: center;
        }

        .detail-body {
            margin-top: 10px;
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;

            .field {
                display: flex;
                flex-direction: column;

                &--full {
                    grid-column: 1 / -1;
                }

                label {
                    font-size: 0.8rem;
                    margin-bottom: 4px;
                    color: #4b5563;
                    font-weight: 700;
                }

                input,
                select,
                textarea {
                    border-radius: 10px;
                    border: 1px solid #d1d5db;
                    padding: 9px 10px;
                    font-size: 0.92rem;
                    outline: none;
                    background: #ffffff;

                    &:focus {
                        border-color: #4b74ff;
                        box-shadow: 0 0 0 1px rgba(75, 116, 255, 0.18);
                    }
                }

                textarea {
                    min-height: 92px;
                    resize: vertical;
                }

                .help {
                    margin-top: 4px;
                    font-size: 0.75rem;
                    color: #9ca3af;
                }
            }
        }

        .inline-actions {
            margin-top: 10px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        .split {
            margin-top: 12px;
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 12px;
        }

        .card-inner {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            background: #f9fafb;
            overflow: hidden;

            .card-inner__head {
                padding: 10px 12px;
                border-bottom: 1px solid #e5e7eb;
                background: #ffffff;
                display: flex;
                justify-content: space-between;
                align-items: center;

                .title {
                    font-weight: 900;
                    color: #111827;
                }

                .sub {
                    margin-top: 2px;
                    font-size: 0.78rem;
                    color: #6b7280;
                }
            }
        }

        .table-wrap {
            padding: 10px 12px 0;
            overflow: auto;
        }

        .tbl {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            overflow: hidden;

            th,
            td {
                padding: 8px 10px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 0.82rem;
            }

            th {
                background: #f3f4f6;
                text-align: center;
                font-weight: 900;
                color: #4b5563;
            }

            .right {
                text-align: right;
            }

            .mono {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                font-weight: 900;
            }

            .empty-row {
                text-align: center;
                color: #9ca3af;
                padding: 18px 10px;
            }

            .muted {
                color: #6b7280;
            }
        }

        .chk {
            display: inline-flex;
            gap: 6px;
            align-items: center;
            font-size: 0.8rem;
            color: #374151;

            input {
                width: 14px;
                height: 14px;
            }
        }

        .schedule-foot {
            padding: 10px 12px 12px;
            display: flex;
            justify-content: space-between;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;

            .sum {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;

                .sum-item {
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    padding: 8px 10px;
                    min-width: 160px;

                    .k {
                        font-size: 0.75rem;
                        color: #6b7280;
                        font-weight: 900;
                    }

                    .v {
                        margin-top: 4px;
                        font-weight: 1000;
                        color: #111827;
                    }

                    &.ok {
                        border-color: #bbf7d0;
                        background: #ecfdf3;
                    }

                    &.warn {
                        border-color: #fecaca;
                        background: #fef2f2;
                    }
                }
            }
        }

        .voucher {
            padding: 10px 12px 12px;
            display: grid;
            gap: 10px;

            .block {
                background: #fff;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                padding: 10px;

                .block-title {
                    font-weight: 900;
                    margin-bottom: 8px;
                    color: #111827;
                }
            }

            .mini-tbl {
                width: 100%;
                border-collapse: collapse;

                th,
                td {
                    padding: 7px 8px;
                    border-bottom: 1px solid #e5e7eb;
                    font-size: 0.82rem;
                }

                th {
                    background: #f3f4f6;
                    text-align: center;
                    color: #4b5563;
                    font-weight: 900;
                }

                .right {
                    text-align: right;
                }

                .mono {
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                    font-weight: 900;
                }
            }

            .tag {
                display: inline-flex;
                justify-content: center;
                align-items: center;
                min-width: 30px;
                padding: 2px 8px;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 1000;
                border: 1px solid;

                &.dr {
                    background: #ecfdf3;
                    color: #166534;
                    border-color: #bbf7d0;
                }

                &.cr {
                    background: #fef2f2;
                    color: #b91c1c;
                    border-color: #fecaca;
                }
            }

            .hint-line {
                margin-top: 8px;
                font-size: 0.78rem;
                color: #9ca3af;
            }

            .kv {
                display: grid;
                grid-template-columns: 80px 1fr;
                gap: 10px;
                align-items: center;

                .k {
                    font-size: 0.78rem;
                    color: #6b7280;
                    font-weight: 900;
                }

                .v {
                    font-size: 0.85rem;
                    color: #111827;
                    font-weight: 900;
                }

                .mono {
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                }
            }
        }

        .danger-zone {
            padding: 0 12px 12px;
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: center;

            .danger-hint {
                font-size: 0.78rem;
                color: #9ca3af;
            }
        }
    }

    /* Buttons */
    .btn {
        border-radius: 999px;
        border: none;
        padding: 8px 14px;
        font-size: 0.85rem;
        cursor: pointer;
        font-weight: 700;

        &--primary {
            background: #4b74ff;
            color: #ffffff;
        }

        &--ghost {
            background: #ffffff;
            color: #4b5563;
            border: 1px solid #d1d5db;
        }

        &--danger {
            background: #b91c1c;
            color: #fff;
        }
    }

    /* Mobile */
    @media (max-width: 520px) {
        .main-section {
            flex-direction: column;
            gap: 12px;
        }

        .list-panel {
            width: auto;
            min-width: 0;
        }

        .detail-panel .form-grid {
            grid-template-columns: 1fr;
        }

        .detail-panel .split {
            grid-template-columns: 1fr;
        }
    }
}</style>
