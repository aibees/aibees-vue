<template>
    <div class="lnb-content system-pay-method-manage">
        <section class="main-section">
            <!-- LEFT : List Panel -->
            <aside class="panel list-panel">
                <div class="panel-header">
                    <h2>결제수단 목록</h2>
                    <span class="badge">{{ activeTab === 'account' ? 'Account' : 'Card' }}</span>
                </div>

                <div class="tab">
                    <button class="tab-btn" :class="{ on: activeTab === 'account' }"
                        @click="switchTab('account')">계좌</button>
                    <button class="tab-btn" :class="{ on: activeTab === 'card' }" @click="switchTab('card')">카드</button>
                </div>

                <div class="search">
                    <input v-model="keyword" :placeholder="activeTab === 'account' ? '은행/별칭 검색' : '카드명/번호 검색'" />
                    <button class="btn btn--primary" @click="noop">검색</button>
                </div>

                <div class="list-actions">
                    <button class="btn btn--ghost w-full" @click="openCreate">
                        + {{ activeTab === 'account' ? '계좌 추가' : '카드 추가' }}
                    </button>
                </div>

                <ul class="item-list">
                    <li v-for="it in filteredItems" :key="it.id" :class="{ active: selected?.id === it.id }"
                        @click="selectItem(it)">
                        <div class="name">{{ it.displayName }}</div>
                        <div class="desc">{{ it.subText }}</div>
                        <div class="meta">
                            <span class="pill">{{ it.unitLabel }}</span>
                            <span class="status" :class="it.active ? 'on' : 'off'">{{ it.active ? '사용' : '중지' }}</span>
                        </div>
                    </li>

                    <li v-if="filteredItems.length === 0" class="empty-li">
                        검색 결과가 없습니다.
                    </li>
                </ul>
            </aside>

            <!-- RIGHT : Detail Panel -->
            <main class="panel detail-panel">
                <div class="panel-header">
                    <div>
                        <h2>{{ headerTitle }}</h2>
                        <div class="panel-sub">{{ headerSub }}</div>
                    </div>

                    <div class="panel-actions">
                        <button class="btn btn--ghost" @click="openCreate">신규</button>
                        <button class="btn btn--primary" @click="save">저장</button>
                    </div>
                </div>

                <div v-if="!selected" class="empty-state">
                    좌측에서 항목을 선택하거나 “신규”로 추가하세요.
                </div>

                <div v-else class="detail-body">
                    <!-- Common fields -->
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
                            <label>표시명(별칭)</label>
                            <input v-model="form.alias" placeholder="예: 월급통장, 생활비카드" />
                            <div class="help">좌측 목록에 표시되는 이름입니다.</div>
                        </div>

                        <!-- Account fields -->
                        <template v-if="activeTab === 'account'">
                            <div class="field">
                                <label>은행</label>
                                <input v-model="form.bankName" placeholder="예: 국민은행, 신한은행" />
                            </div>

                            <div class="field">
                                <label>계좌번호(마스킹 표시)</label>
                                <input v-model="form.accountNo" placeholder="예: 123-****-****-45" />
                                <div class="help">실서비스에서는 저장 시 암호화/토큰화를 권장합니다.</div>
                            </div>

                            <div class="field">
                                <label>연결 계정과목</label>
                                <select v-model="form.accountCode">
                                    <option value="">선택</option>
                                    <option v-for="a in accountOptions" :key="a.code" :value="a.code">
                                        {{ a.code }} {{ a.name }}
                                    </option>
                                </select>
                            </div>

                            <div class="field">
                                <label>기본 계좌</label>
                                <select v-model="form.isDefault">
                                    <option :value="false">아니오</option>
                                    <option :value="true">예</option>
                                </select>
                            </div>

                            <div class="field field--full">
                                <label>메모</label>
                                <textarea v-model="form.memo" placeholder="예: 생활비 이체, 공과금 자동이체"></textarea>
                            </div>
                        </template>

                        <!-- Card fields -->
                        <template v-else>
                            <div class="field">
                                <label>카드사</label>
                                <input v-model="form.cardCompany" placeholder="예: 삼성, 현대, 신한" />
                            </div>

                            <div class="field">
                                <label>카드번호(마스킹)</label>
                                <input v-model="form.cardNoMasked" placeholder="예: ****-****-****-1234" />
                                <div class="help">원본 카드번호는 저장하지 않는 것을 권장합니다(토큰/끝4자리만).</div>
                            </div>

                            <div class="field">
                                <label>결제일(일)</label>
                                <input type="number" min="1" max="31" v-model.number="form.payDay" />
                            </div>

                            <div class="field">
                                <label>연결 미지급금 계정</label>
                                <select v-model="form.payableAccountCode">
                                    <option value="">선택</option>
                                    <option v-for="a in payableOptions" :key="a.code" :value="a.code">
                                        {{ a.code }} {{ a.name }}
                                    </option>
                                </select>
                            </div>

                            <div class="field field--full">
                                <label>기본 라인적요(카드 사용 시)</label>
                                <input v-model="form.memoTpl" placeholder="예: {월} 카드사용({카드명})" />
                            </div>

                            <div class="field field--full">
                                <label>메모</label>
                                <textarea v-model="form.memo" placeholder="예: 생활비 카드, 구독 결제용"></textarea>
                            </div>
                        </template>
                    </div>

                    <!-- Bottom Preview Panel -->
                    <div class="preview-panel">
                        <div class="preview-head">
                            <div>
                                <div class="preview-title">설정 요약</div>
                                <div class="preview-sub">현재 입력값 기준 미리보기입니다.</div>
                            </div>
                            <span class="badge">Preview</span>
                        </div>

                        <div class="preview-body">
                            <div class="kv">
                                <span class="k">가계 단위</span>
                                <span class="v">{{ unitLabel(form.unit) }}</span>
                            </div>
                            <div class="kv">
                                <span class="k">상태</span>
                                <span class="v">
                                    <span class="status-pill" :class="form.active ? 'on' : 'off'">
                                        {{ form.active ? '사용' : '중지' }}
                                    </span>
                                </span>
                            </div>
                            <div class="kv">
                                <span class="k">표시명</span>
                                <span class="v mono">{{ form.alias || '-' }}</span>
                            </div>

                            <template v-if="activeTab === 'account'">
                                <div class="kv">
                                    <span class="k">은행/계좌</span>
                                    <span class="v mono">{{ (form.bankName || '-') }} / {{ (form.accountNo || '-') }}</span>
                                </div>
                                <div class="kv">
                                    <span class="k">계정과목</span>
                                    <span class="v mono">{{ form.accountCode || '-' }}</span>
                                </div>
                                <div class="kv">
                                    <span class="k">기본 계좌</span>
                                    <span class="v">{{ form.isDefault ? '예' : '아니오' }}</span>
                                </div>
                            </template>

                            <template v-else>
                                <div class="kv">
                                    <span class="k">카드</span>
                                    <span class="v mono">{{ (form.cardCompany || '-') }} / {{ (form.cardNoMasked || '-')
                                    }}</span>
                                </div>
                                <div class="kv">
                                    <span class="k">결제일</span>
                                    <span class="v mono">{{ form.payDay ? `${form.payDay}일` : '-' }}</span>
                                </div>
                                <div class="kv">
                                    <span class="k">미지급금</span>
                                    <span class="v mono">{{ form.payableAccountCode || '-' }}</span>
                                </div>
                            </template>
                        </div>
                    </div>

                    <div class="danger-zone">
                        <button class="btn btn--danger" type="button" @click="remove">
                            삭제
                        </button>
                        <div class="danger-hint">
                            * 실서비스에서는 “삭제” 대신 비활성(중지) 처리를 권장합니다.
                        </div>
                    </div>
                </div>
            </main>
        </section>
    </div>
</template>
  
<script setup>
import { computed, reactive, ref, watch } from 'vue';

const activeTab = ref('account'); // account | card
const keyword = ref('');

const accountOptions = [
    { code: '210', name: '보통예금' },
    { code: '211', name: '적금' },
    { code: '111', name: '현금' },
];

const payableOptions = [
    { code: '410', name: '신용카드' },
    { code: '411', name: '삼성카드 미지급금' },
    { code: '412', name: '현대카드 미지급금' },
];

const accounts = reactive([
    {
        id: 1, unit: 'joint', active: true,
        alias: '생활비통장', bankName: '국민은행', accountNo: '123-****-****-45',
        accountCode: '210', isDefault: true, memo: '공과금 자동이체'
    },
    {
        id: 2, unit: 'me', active: true,
        alias: '월급통장', bankName: '신한은행', accountNo: '777-****-****-01',
        accountCode: '210', isDefault: false, memo: ''
    },
]);

const cards = reactive([
    {
        id: 101, unit: 'joint', active: true,
        alias: '생활비카드', cardCompany: '삼성',
        cardNoMasked: '****-****-****-1234',
        payDay: 14, payableAccountCode: '411',
        memoTpl: '{월} 카드사용(삼성)', memo: ''
    },
    {
        id: 102, unit: 'me', active: true,
        alias: '교통카드', cardCompany: '현대',
        cardNoMasked: '****-****-****-7788',
        payDay: 25, payableAccountCode: '412',
        memoTpl: '{월} 카드사용(현대)', memo: '대중교통 전용'
    },
]);

const selected = ref(null);

const form = reactive({
    id: null,
    unit: 'joint',
    active: true,
    alias: '',
    // account
    bankName: '',
    accountNo: '',
    accountCode: '',
    isDefault: false,
    // card
    cardCompany: '',
    cardNoMasked: '',
    payDay: null,
    payableAccountCode: '',
    memoTpl: '',
    memo: '',
});

const items = computed(() => (activeTab.value === 'account' ? accounts : cards));

const filteredItems = computed(() => {
    const q = keyword.value.trim().toLowerCase();
    const list = items.value.map(x => ({
        ...x,
        displayName: x.alias || (activeTab.value === 'account' ? x.bankName : x.cardCompany) || '(이름없음)',
        subText: activeTab.value === 'account'
            ? `${x.bankName || '-'} · ${x.accountNo || '-'}`
            : `${x.cardCompany || '-'} · ${x.cardNoMasked || '-'}`,
        unitLabel: unitLabel(x.unit),
    }));

    if (!q) return list;

    return list.filter(x => {
        const hay = `${x.displayName} ${x.subText}`.toLowerCase();
        return hay.includes(q);
    });
});

const headerTitle = computed(() => {
    if (!selected.value) return activeTab.value === 'account' ? '계좌 상세' : '카드 상세';
    return activeTab.value === 'account'
        ? `계좌: ${selected.value.alias || selected.value.bankName || ''}`
        : `카드: ${selected.value.alias || selected.value.cardCompany || ''}`;
});

const headerSub = computed(() => {
    return activeTab.value === 'account'
        ? '은행/계좌번호(마스킹), 계정과목 매핑, 기본계좌를 관리합니다.'
        : '카드번호(마스킹), 결제일, 미지급금 계정 매핑을 관리합니다.';
});

function unitLabel(u) {
    return u === 'joint' ? '공동' : u === 'me' ? '본인' : '배우자';
}

function switchTab(tab) {
    if (activeTab.value === tab) return;
    activeTab.value = tab;
    keyword.value = '';
    selected.value = null;
    resetForm();
}

function selectItem(it) {
    // it는 computed에서 displayName/subText가 붙어있으니 원본 찾아서 바인딩
    const src = items.value.find(x => x.id === it.id);
    selected.value = src;
    fillForm(src);
}

function openCreate() {
    selected.value = { id: null }; // 신규 표시용
    resetForm();
}

function fillForm(src) {
    resetForm();
    form.id = src.id;
    form.unit = src.unit;
    form.active = src.active;
    form.alias = src.alias || '';
    form.memo = src.memo || '';

    if (activeTab.value === 'account') {
        form.bankName = src.bankName || '';
        form.accountNo = src.accountNo || '';
        form.accountCode = src.accountCode || '';
        form.isDefault = !!src.isDefault;
    } else {
        form.cardCompany = src.cardCompany || '';
        form.cardNoMasked = src.cardNoMasked || '';
        form.payDay = src.payDay || null;
        form.payableAccountCode = src.payableAccountCode || '';
        form.memoTpl = src.memoTpl || '';
    }
}

function resetForm() {
    form.id = null;
    form.unit = 'joint';
    form.active = true;
    form.alias = '';
    form.bankName = '';
    form.accountNo = '';
    form.accountCode = '';
    form.isDefault = false;
    form.cardCompany = '';
    form.cardNoMasked = '';
    form.payDay = null;
    form.payableAccountCode = '';
    form.memoTpl = '';
    form.memo = '';
}

function save() {
    if (!form.alias.trim()) return alert('표시명(별칭)을 입력하세요.');

    if (activeTab.value === 'account') {
        if (!form.bankName.trim()) return alert('은행을 입력하세요.');
        if (!form.accountCode) return alert('연결 계정과목을 선택하세요.');
    } else {
        if (!form.cardCompany.trim()) return alert('카드사를 입력하세요.');
        if (form.payDay && (form.payDay < 1 || form.payDay > 31)) return alert('결제일(1~31)을 확인하세요.');
        if (!form.payableAccountCode) return alert('연결 미지급금 계정을 선택하세요.');
    }

    const target = activeTab.value === 'account' ? accounts : cards;

    if (!form.id) {
        const newId = Date.now();
        const obj = buildPayload(newId);
        target.unshift(obj);
        selected.value = obj;
    } else {
        const idx = target.findIndex(x => x.id === form.id);
        if (idx < 0) return alert('대상을 찾을 수 없습니다.');
        target[idx] = { ...target[idx], ...buildPayload(form.id) };
        selected.value = target[idx];
    }

    alert('저장(예시)');
}

function buildPayload(id) {
    if (activeTab.value === 'account') {
        return {
            id,
            unit: form.unit,
            active: !!form.active,
            alias: form.alias.trim(),
            bankName: form.bankName.trim(),
            accountNo: form.accountNo.trim(),
            accountCode: form.accountCode,
            isDefault: !!form.isDefault,
            memo: form.memo.trim(),
        };
    }

    return {
        id,
        unit: form.unit,
        active: !!form.active,
        alias: form.alias.trim(),
        cardCompany: form.cardCompany.trim(),
        cardNoMasked: form.cardNoMasked.trim(),
        payDay: form.payDay ? Number(form.payDay) : null,
        payableAccountCode: form.payableAccountCode,
        memoTpl: form.memoTpl.trim(),
        memo: form.memo.trim(),
    };
}

function remove() {
    if (!selected.value || !selected.value.id) return alert('삭제할 항목을 선택하세요.');
    const target = activeTab.value === 'account' ? accounts : cards;
    const idx = target.findIndex(x => x.id === selected.value.id);
    if (idx < 0) return;

    target.splice(idx, 1);
    selected.value = null;
    resetForm();
    alert('삭제(예시)');
}

function noop() { }
</script>
  
<style lang="scss" scoped>
@use '@@/common.scss' as *;

.system-pay-method-manage {
    background: #f5f6fa;

    .main-section {
        display: flex;
        gap: 8px;
        align-items: flex-start; // ✅ 서로 높이 공유(Stretch) 방지
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
        width: 320px;
        min-width: 320px;

        .tab {
            display: flex;
            gap: 8px;
            padding: 6px 0 10px;

            .tab-btn {
                flex: 1;
                border-radius: 999px;
                border: 1px solid #d1d5db;
                padding: 8px 10px;
                background: #fff;
                font-weight: 800;
                cursor: pointer;

                &.on {
                    background: #edf2ff;
                    border-color: #c7d2fe;
                    color: #1d3a8a;
                }
            }
        }

        .search {
            display: flex;
            justify-content: space-between;
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
                    font-weight: 800;
                }

                .desc {
                    padding-top: 5px;
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

                    .status.on {
                        color: #15803d;
                        font-weight: 900;
                    }

                    .status.off {
                        color: #b91c1c;
                        font-weight: 900;
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

        .preview-panel {
            margin-top: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            background: #f9fafb;
            overflow: hidden;

            .preview-head {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 12px;
                border-bottom: 1px solid #e5e7eb;
                background: #ffffff;

                .preview-title {
                    font-weight: 900;
                    color: #111827;
                }

                .preview-sub {
                    margin-top: 2px;
                    font-size: 0.78rem;
                    color: #6b7280;
                }
            }

            .preview-body {
                padding: 10px 12px;
                display: grid;
                gap: 8px;

                .kv {
                    display: grid;
                    grid-template-columns: 90px 1fr;
                    gap: 10px;
                    align-items: center;

                    .k {
                        font-size: 0.78rem;
                        color: #6b7280;
                        font-weight: 800;
                    }

                    .v {
                        font-size: 0.85rem;
                        color: #111827;
                        font-weight: 800;
                    }
                }

                .mono {
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                    font-weight: 900;
                }

                .status-pill {
                    display: inline-flex;
                    padding: 3px 10px;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 900;
                    border: 1px solid #e5e7eb;

                    &.on {
                        background: #ecfdf3;
                        color: #166534;
                        border-color: #bbf7d0;
                    }

                    &.off {
                        background: #fef2f2;
                        color: #b91c1c;
                        border-color: #fecaca;
                    }
                }
            }
        }

        .danger-zone {
            margin-top: 12px;
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

    /* ====== 반응형: 450 x 800 ====== */
    @media (max-width: 520px) {
        .main-section {
            flex-direction: column;
            gap: 12px;
        }

        .list-panel {
            width: auto;
            min-width: 0;
        }

        .detail-panel {
            width: auto;
        }

        .detail-panel .form-grid {
            grid-template-columns: 1fr;
        }
    }
}</style>
  