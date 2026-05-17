<template>
    <div class="cashflow-management">
        <h2 style="text-align: start; margin: 0 1.3rem;">{{ route.meta.title }}</h2>

        <!-- 상단 필터 바 -->
        <section class="top-filter-bar d-panel">
            <div class="filter-left">
                <div class="filter-group">
                    <label>조회 계좌</label>
                    <MMultiCheckBox v-model="filters.accountIds" :options="accountOptions" placeholder="계좌를 선택하세요"
                        allText="전체 계좌" />
                </div>

                <div class="filter-group">
                    <label>유형</label>
                    <MMultiCheckBox v-model="filters.presetNms" :options="presetOptions" placeholder="전체 유형" allText="전체" />
                </div>

                <div class="filter-group">
                    <label>조회 기간</label>
                    <MDatePicker :model-value="{ start: filters.startDate, end: filters.endDate }"
                        :disabled="filters.accountIds.length === 0" @update:model-value="onDateChange" />
                </div>
            </div>
        </section>

        <!-- 조회 전 안내 -->
        <div class="empty-guide" v-if="!cashflow.loaded">
            <div class="guide-inner">
                <div class="guide-icon">📊</div>
                <h3>현금흐름표</h3>
                <p>위에서 계좌와 기간을 선택하면<br>해당 기간의 수입·지출 내역과 잔액 변동을 확인할 수 있습니다.</p>
            </div>
        </div>

        <!-- 거래 내역 테이블 -->
        <section class="transaction-section d-panel" v-if="cashflow.loaded">
            <div class="section-header">
                <div class="section-title-wrap">
                    <h3>거래 내역</h3>
                    <span class="count-badge">총 {{ sortedTransactions.length }}건<span v-if="filters.presetNms.length > 0"
                            class="count-filtered"> / 전체 {{ cashflow.transactions.length }}건</span></span>
                </div>
                <div class="section-actions">
                    <div class="legend">
                        <span class="legend-item income"><span class="dot"></span> 수입</span>
                        <span class="legend-item expense"><span class="dot"></span> 지출</span>
                    </div>
                </div>
            </div>

            <div class="table-wrapper">
                <table class="cashflow-table">
                    <thead>
                        <tr>
                            <th class="col-date sortable" @click="toggleSort('jeDate')"
                                :class="{ sorted: sort.key === 'jeDate' }">
                                거래 일자
                                <SortIcon :active="sort.key === 'jeDate'" :dir="sort.dir" />
                            </th>
                            <th class="col-account sortable" @click="toggleSort('accountId')"
                                :class="{ sorted: sort.key === 'accountId' }">
                                계좌
                                <SortIcon :active="sort.key === 'accountId'" :dir="sort.dir" />
                            </th>
                            <th class="col-preset sortable" @click="toggleSort('presetNm')"
                                :class="{ sorted: sort.key === 'presetNm' }">
                                유형
                                <SortIcon :active="sort.key === 'presetNm'" :dir="sort.dir" />
                            </th>
                            <th class="col-remark sortable" @click="toggleSort('remark')"
                                :class="{ sorted: sort.key === 'remark' }">
                                적요 (내용)
                                <SortIcon :active="sort.key === 'remark'" :dir="sort.dir" />
                            </th>
                            <th class="col-income text-right sortable" @click="toggleSort('income')"
                                :class="{ sorted: sort.key === 'income' }">
                                수입 (원)
                                <SortIcon :active="sort.key === 'income'" :dir="sort.dir" />
                            </th>
                            <th class="col-expense text-right sortable" @click="toggleSort('expense')"
                                :class="{ sorted: sort.key === 'expense' }">
                                지출 (원)
                                <SortIcon :active="sort.key === 'expense'" :dir="sort.dir" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="tx in sortedTransactions" :key="tx.jeHeaderId" class="tx-row"
                            :class="tx.flowType === 'IN' ? 'row-income' : 'row-expense'">
                            <td class="col-date mono text-light">{{ formatDate(tx.jeDate) }}</td>
                            <td class="col-account">
                                <span class="account-badge">{{ accountNameMap[tx.accountId] ?? tx.accountId }}</span>
                            </td>
                            <td class="col-preset">
                                <span class="preset-badge" :class="tx.flowType === 'IN' ? 'badge-income' : 'badge-expense'">
                                    {{ tx.presetNm || tx.presetCd }}
                                </span>
                            </td>
                            <td class="col-remark desc-text">{{ tx.remark || '-' }}</td>
                            <td class="col-income text-right mono font-bold text-blue">
                                <span v-if="tx.flowType === 'IN'">+{{ tx.amount.toLocaleString() }}</span>
                                <span v-else class="text-muted">-</span>
                            </td>
                            <td class="col-expense text-right mono font-bold text-red">
                                <span v-if="tx.flowType === 'OUT'">-{{ tx.amount.toLocaleString() }}</span>
                                <span v-else class="text-muted">-</span>
                            </td>
                        </tr>

                        <tr v-if="cashflow.transactions.length === 0">
                            <td colspan="6" class="empty-state">해당 기간에 거래 내역이 없습니다.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- 하단 고정 합계 바 -->
        <div class="summary-footer" v-if="cashflow.loaded">
            <div class="summary-item">
                <span class="sf-label">합계</span>
            </div>
            <div class="summary-item opening">
                <span class="sf-label">기초 잔액</span>
                <span class="sf-value mono font-bold">{{ cashflow.openingBalance.toLocaleString() }}원</span>
            </div>
            <div class="summary-item income">
                <span class="sf-label">수입</span>
                <span class="sf-value mono text-blue">+{{ cashflow.totalIncome.toLocaleString() }}원</span>
            </div>
            <div class="summary-item expense">
                <span class="sf-label">지출</span>
                <span class="sf-value mono text-red">-{{ cashflow.totalExpense.toLocaleString() }}원</span>
            </div>
            <div class="summary-item net">
                <span class="sf-label">순 증감</span>
                <span class="sf-value mono font-bold" :class="netChangeClass">
                    {{ cashflow.netChange >= 0 ? '+' : '' }}{{ cashflow.netChange.toLocaleString() }}원
                    <span class="sf-pct" v-if="cashflow.openingBalance !== 0">({{ netChangePct }})</span>
                </span>
            </div>
            <div class="summary-item closing">
                <span class="sf-label">기말 잔액</span>
                <span class="sf-value mono font-bold">{{ cashflow.closingBalance.toLocaleString() }}원</span>
            </div>
        </div>

    </div>
</template>

<script setup>
// ==========================================
// 1. Imports
// ==========================================
import mariaApi from '@scripts/util/mariaApi.js'; // TODO: API 연동 시 주석 해제
import MDatePicker    from '@/components/common/comp/MDatePicker.vue';
import MMultiCheckBox from '@/components/common/comp/MMultiCheckBox.vue';

// ==========================================
// 2. Variables
// ==========================================

// 정렬 아이콘 인라인 컴포넌트
const SortIcon = defineComponent({
    props: { active: Boolean, dir: String },
    template: `
        <span class="sort-icon">
            <svg viewBox="0 0 10 14" width="10" height="14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 1L2 5h6L5 1z"  :fill="active && dir === 'asc'  ? 'currentColor' : '#d1d5db'"/>
                <path d="M5 13L2 9h6l-3 4z" :fill="active && dir === 'desc' ? 'currentColor' : '#d1d5db'"/>
            </svg>
        </span>
    `
});

// Mock 상수
const MOCK_PRESETS = [
    { presetCd: 'INC_SALARY',    presetNm: '급여',      flowType: 'IN'  },
    { presetCd: 'INC_FREELANCE', presetNm: '프리랜서',   flowType: 'IN'  },
    { presetCd: 'INC_INTEREST',  presetNm: '이자수익',   flowType: 'IN'  },
    { presetCd: 'EXP_FOOD',      presetNm: '식비',       flowType: 'OUT' },
    { presetCd: 'EXP_TRANS',     presetNm: '교통비',     flowType: 'OUT' },
    { presetCd: 'EXP_HOUSERNT',  presetNm: '월세',       flowType: 'OUT' },
    { presetCd: 'EXP_UTIL',      presetNm: '공과금',     flowType: 'OUT' },
    { presetCd: 'EXP_MEDICAL',   presetNm: '의료비',     flowType: 'OUT' },
    { presetCd: 'EXP_CULTURE',   presetNm: '문화/여가',  flowType: 'OUT' },
    { presetCd: 'EXP_SHOPPING',  presetNm: '쇼핑',       flowType: 'OUT' },
    { presetCd: 'EXP_COMM',      presetNm: '통신비',     flowType: 'OUT' },
];

const MOCK_REMARKS = {
    INC_SALARY:    ['3월 급여 입금', '월급 이체'],
    INC_FREELANCE: ['외주 프로젝트 대금', '사이드잡 수입'],
    INC_INTEREST:  ['정기예금 이자'],
    EXP_FOOD:      ['점심 - 국밥', '저녁 - 삼겹살', '편의점', '배달의민족', '마켓컬리'],
    EXP_TRANS:     ['티머니 충전', '택시', 'KTX 승차권'],
    EXP_HOUSERNT:  ['4월 월세 이체'],
    EXP_UTIL:      ['전기요금', '가스요금', '관리비'],
    EXP_MEDICAL:   ['내과 진료비', '약국'],
    EXP_CULTURE:   ['넷플릭스', '영화관', '헬스장 회비'],
    EXP_SHOPPING:  ['쿠팡 주문', '올리브영', '다이소'],
    EXP_COMM:      ['KT 휴대폰 요금'],
};

// 날짜 초기화 헬퍼
const toDateStr = (d) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
};
const getThisMonthRange = () => {
    const d = new Date();
    return {
        start: toDateStr(new Date(d.getFullYear(), d.getMonth(), 1)),
        end:   toDateStr(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
    };
};
const { start: initStart, end: initEnd } = getThisMonthRange();

// 라우트
const route = useRoute();

// 필터 상태
const filters = reactive({
    accountIds: [],       // 멀티 선택 계좌 ID 배열
    presetNms:  [],       // 멀티 선택 유형 배열 (클라이언트 필터)
    startDate:  initStart,
    endDate:    initEnd,
});

// 옵션 목록 (TODO: API 연동 시 onMounted에서 fetch)
const options = reactive({
    accounts: [
        { id: 'BANK_001', name: '신한 주거래통장',   number: '110-123-456789' },
        { id: 'BANK_002', name: '카카오뱅크 생활비', number: '333-22-1234567' },
        { id: 'BANK_003', name: 'KB국민 저축통장',   number: '004-25-0987654' },
    ],
});

// 현금흐름 데이터
const cashflow = reactive({
    loaded:         false,
    openingBalance: 0,
    closingBalance: 0,
    totalIncome:    0,
    totalExpense:   0,
    netChange:      0,
    transactions:   [],
});

// 정렬 상태
const sort = reactive({ key: 'jeDate', dir: 'asc' });

// 마운트 플래그 (watch 이중 호출 방지)
const isMounted = ref(false);

// ==========================================
// 3. Computed
// ==========================================
const accountOptions = computed(() =>
    options.accounts.map(acc => ({
        value: acc.id,
        label: `${acc.name} (${acc.number || '번호없음'})`,
    }))
);

const accountNameMap = computed(() => {
    const map = {};
    options.accounts.forEach(acc => { map[acc.id] = acc.name; });
    return map;
});

const presetOptions = computed(() => {
    const seen = new Set();
    const result = [];
    for (const tx of cashflow.transactions) {
        if (!seen.has(tx.presetNm)) {
            seen.add(tx.presetNm);
            result.push({ value: tx.presetNm, label: tx.presetNm });
        }
    }
    return result.sort((a, b) => a.label.localeCompare(b.label));
});

const selectedAccountName = computed(() => {
    if (filters.accountIds.length === 0)                       return '';
    if (filters.accountIds.length === options.accounts.length) return '전체 계좌';
    return filters.accountIds
        .map(id => options.accounts.find(a => a.id === id)?.name ?? id)
        .join(', ');
});

const sortedTransactions = computed(() => {
    let list = [...cashflow.transactions];

    // 유형 필터 (클라이언트)
    if (filters.presetNms.length > 0) {
        list = list.filter(tx => filters.presetNms.includes(tx.presetNm));
    }

    list.sort((a, b) => {
        let va, vb;
        switch (sort.key) {
            case 'jeDate':    va = a.jeDate;                            vb = b.jeDate;                            break;
            case 'accountId': va = a.accountId  ?? '';                  vb = b.accountId  ?? '';                  break;
            case 'presetNm':  va = a.presetNm   ?? '';                  vb = b.presetNm   ?? '';                  break;
            case 'remark':    va = a.remark     ?? '';                  vb = b.remark     ?? '';                  break;
            case 'income':    va = a.flowType === 'IN'  ? a.amount : 0; vb = b.flowType === 'IN'  ? b.amount : 0; break;
            case 'expense':   va = a.flowType === 'OUT' ? a.amount : 0; vb = b.flowType === 'OUT' ? b.amount : 0; break;
            case 'balance':   va = a.runningBalance;                    vb = b.runningBalance;                    break;
            default: return 0;
        }
        if (va < vb) return sort.dir === 'asc' ? -1 :  1;
        if (va > vb) return sort.dir === 'asc' ?  1 : -1;
        return 0;
    });

    return list;
});

const netChangePct = computed(() => {
    if (cashflow.openingBalance === 0) return '-';
    const pct  = (cashflow.netChange / cashflow.openingBalance) * 100;
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(1)}%`;
});

const netChangeClass = computed(() => {
    if (cashflow.netChange > 0) return 'positive';
    if (cashflow.netChange < 0) return 'negative';
    return 'neutral';
});

// ==========================================
// 4. Lifecycle
// ==========================================
watch(
    () => filters.accountIds,
    () => { if (isMounted.value) loadCashflow(); },
    { deep: true }
);

onMounted(() => {
    filters.accountIds = options.accounts.map(a => a.id); // 전체 계좌 기본 선택
    loadCashflow();
    isMounted.value = true;
});

// ==========================================
// 5. Functions
// ==========================================
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr)       => arr[rand(0, arr.length - 1)];

const formatDate = (dt) => dt ? dt.substring(0, 10) : '-';

const toggleSort = (key) => {
    if (sort.key === key) sort.dir = sort.dir === 'asc' ? 'desc' : 'asc';
    else { sort.key = key; sort.dir = 'asc'; }
};

const onDateChange = ({ start, end }) => {
    filters.startDate = start;
    filters.endDate   = end;
    loadCashflow();
};

const buildMockTransactions = (yearMonth, openingBalance) => {
    const [y, m]      = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const txList      = [];

    // 고정 거래
    txList.push(
        { jeHeaderId: 9001, jeDate: `${yearMonth}-25`,                                          presetCd: 'INC_SALARY',   presetNm: '급여',   flowType: 'IN',  amount: rand(280, 340) * 10000, remark: pick(MOCK_REMARKS['INC_SALARY'])   },
        { jeHeaderId: 9002, jeDate: `${yearMonth}-01`,                                          presetCd: 'EXP_HOUSERNT', presetNm: '월세',   flowType: 'OUT', amount: 60 * 10000,             remark: pick(MOCK_REMARKS['EXP_HOUSERNT']) },
        { jeHeaderId: 9003, jeDate: `${yearMonth}-${String(rand(5, 10)).padStart(2, '0')}`,     presetCd: 'EXP_UTIL',     presetNm: '공과금', flowType: 'OUT', amount: rand(5, 15) * 10000,    remark: pick(MOCK_REMARKS['EXP_UTIL'])     },
        { jeHeaderId: 9004, jeDate: `${yearMonth}-15`,                                          presetCd: 'EXP_COMM',     presetNm: '통신비', flowType: 'OUT', amount: rand(5, 8) * 10000,     remark: pick(MOCK_REMARKS['EXP_COMM'])     },
    );

    // 랜덤 거래 10~15건
    const randPresets = MOCK_PRESETS.filter(p =>
        !['INC_SALARY', 'EXP_HOUSERNT', 'EXP_UTIL', 'EXP_COMM'].includes(p.presetCd)
    );
    const randomCount = rand(10, 15);
    for (let i = 0; i < randomCount; i++) {
        const preset = pick(randPresets);
        txList.push({
            jeHeaderId: 9100 + i,
            jeDate:     `${yearMonth}-${String(rand(1, daysInMonth)).padStart(2, '0')}`,
            presetCd:   preset.presetCd,
            presetNm:   preset.presetNm,
            flowType:   preset.flowType,
            amount:     preset.flowType === 'IN' ? rand(3, 30) * 10000 : rand(1, 15) * 10000,
            remark:     pick(MOCK_REMARKS[preset.presetCd]),
        });
    }

    txList.sort((a, b) => a.jeDate.localeCompare(b.jeDate));

    let running = openingBalance;
    txList.forEach(tx => {
        running += tx.flowType === 'IN' ? tx.amount : -tx.amount;
        tx.runningBalance = running;
    });

    return txList;
};

const loadCashflow = async () => {
    if (filters.accountIds.length === 0 || !filters.startDate || !filters.endDate) {
        cashflow.loaded = false;
        return;
    }

    // TODO: API 연동 시 아래 mock 전체를 교체
    const { data } = await mariaApi.get('/api/account/cashflow', {
        params: { accountIds: filters.accountIds, startDate: filters.startDate, endDate: filters.endDate }
    });

    console.log(data);

    const seedMap    = { BANK_001: 3200000, BANK_002: 850000, BANK_003: 12500000 };
    const combinedTx = [];
    let totalOpening = 0;

    for (const accountId of filters.accountIds) {
        const opening = seedMap[accountId] ?? 2000000;
        totalOpening += opening;

        const allTx = [];
        const start = new Date(filters.startDate);
        const end   = new Date(filters.endDate);
        let   cur   = new Date(start.getFullYear(), start.getMonth(), 1);
        while (cur <= end) {
            const ym = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
            allTx.push(...buildMockTransactions(ym, 0));
            cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
        }

        const filtered = allTx
            .filter(t => t.jeDate >= filters.startDate && t.jeDate <= filters.endDate)
            .filter((t, i, arr) => arr.findIndex(x => x.jeHeaderId === t.jeHeaderId) === i);

        filtered.forEach(tx => { tx.accountId = accountId; }); // 계좌 구분 태그
        combinedTx.push(...filtered);
    }

    combinedTx.sort((a, b) =>
        a.jeDate.localeCompare(b.jeDate) || a.accountId.localeCompare(b.accountId)
    );

    let running = totalOpening;
    combinedTx.forEach(tx => {
        running += tx.flowType === 'IN' ? tx.amount : -tx.amount;
        tx.runningBalance = running;
    });

    const totalIncome  = combinedTx.filter(t => t.flowType === 'IN' ).reduce((s, t) => s + t.amount, 0);
    const totalExpense = combinedTx.filter(t => t.flowType === 'OUT').reduce((s, t) => s + t.amount, 0);
    const closing      = totalOpening + totalIncome - totalExpense;

    cashflow.openingBalance = totalOpening;
    cashflow.closingBalance = closing;
    cashflow.totalIncome    = totalIncome;
    cashflow.totalExpense   = totalExpense;
    cashflow.netChange      = closing - totalOpening;
    cashflow.transactions   = combinedTx;
    cashflow.loaded         = true;

    filters.presetNms = []; // 재조회 시 유형 필터 초기화
};
</script>

<style lang="scss" scoped>
/* 색상 변수 */
$primary:       #4b74ff;
$primary-hover: #3848c7;
$text-main:     #111827;
$text-sub:      #4b5563;
$text-light:    #9ca3af;
$bg-main:       #f5f6fa;
$bg-white:      #ffffff;
$border-color:  #e5e7eb;
$danger:        #ef4444;
$blue:          #2563eb;
$green:         #10b981;
$amber:         #f59e0b;

/* ==========================================
   레이아웃 기본
========================================== */
.cashflow-management {
    max-width: 1200px;
    margin: 0 auto;
    font-family: 'Pretendard', sans-serif;
    color: $text-main;
    padding-bottom: 60px;
}

.d-panel {
    background: $bg-white;
    border-radius: 12px;
    border: 1px solid $border-color;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
    margin-bottom: 20px;
}

/* ==========================================
   상단 필터 바
========================================== */
.top-filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 24px;
    flex-wrap: wrap;

    .filter-left {
        display: flex;
        align-items: flex-end;
        gap: 20px;
        flex-wrap: wrap;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 8px;

        label {
            font-size: 13px;
            font-weight: 700;
            color: $text-sub;
        }
    }

    :deep(.mcb-trigger) {
        min-width: 200px;
    }
}

/* ==========================================
   빈 상태 안내
========================================== */
.empty-guide {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 80px 24px;

    .guide-inner {
        text-align: center;

        .guide-icon {
            font-size: 52px;
            margin-bottom: 16px;
        }

        h3 {
            margin: 0 0 12px;
            font-size: 22px;
            font-weight: 800;
            color: $text-main;
        }

        p {
            margin: 0;
            color: $text-light;
            font-size: 14px;
            line-height: 1.8;
        }
    }
}

/* ==========================================
   증감 색상
========================================== */
.positive {
    color: $green !important;
    &.sub-badge { background: #d1fae5 !important; color: #065f46 !important; }
}
.negative {
    color: $danger !important;
    &.sub-badge { background: #fee2e2 !important; color: #991b1b !important; }
}
.neutral { color: $text-sub !important; }

/* ==========================================
   거래 내역 테이블 섹션
========================================== */
.transaction-section {
    padding: 0;
    overflow: hidden;

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid $border-color;

        .section-title-wrap {
            display: flex;
            align-items: center;
            gap: 10px;

            h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 800;
            }

            .count-badge {
                background: #eff6ff;
                color: $blue;
                border: 1px solid #bfdbfe;
                padding: 3px 10px;
                border-radius: 999px;
                font-size: 12px;
                font-weight: 800;

                .count-filtered {
                    color: $text-light;
                    font-weight: 600;
                    margin-left: 2px;
                }
            }
        }

        .section-actions {
            .legend {
                display: flex;
                align-items: center;
                gap: 16px;

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 13px;
                    font-weight: 600;
                    color: $text-sub;

                    .dot {
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                    }

                    &.income .dot  { background: $blue; }
                    &.expense .dot { background: $danger; }
                }
            }
        }
    }

    .table-wrapper { overflow-x: auto; }

    .cashflow-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        min-width: 780px;

        thead th {
            background: #f8fafc;
            padding: 13px 16px;
            font-size: 13px;
            font-weight: 700;
            color: $text-sub;
            border-bottom: 1px solid $border-color;
            position: sticky;
            top: 0;
            z-index: 10;
            box-shadow: 0 1px 0 $border-color;
        }

        tbody td {
            padding: 13px 16px;
            vertical-align: middle;
            border-bottom: 1px solid $border-color;
            font-size: 14px;
        }

        .tx-row {
            transition: background 0.15s;
            &:hover { background: #f8fafc; }

            &.row-income {
                border-left: 3px solid transparent;
                &:hover { background: #eff6ff; border-left-color: $blue; }
            }
            &.row-expense {
                border-left: 3px solid transparent;
                &:hover { background: #fff5f5; border-left-color: $danger; }
            }
        }

        /* 컬럼 너비 */
        .col-date    { width: 110px; }
        .col-account { width: 150px; }
        .col-preset  { width: 140px; }
        .col-remark  { width: auto; }
        .col-income  { width: 130px; }
        .col-expense { width: 130px; }
        .col-balance { width: 150px; }

        /* 계좌 뱃지 */
        .account-badge {
            display: inline-block;
            padding: 3px 9px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            background: #f1f5f9;
            color: $text-sub;
            white-space: nowrap;
            max-width: 140px;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* 정렬 헤더 */
        th.sortable {
            cursor: pointer;
            user-select: none;
            white-space: nowrap;
            &:hover  { background: #eef2f7; }
            &.sorted { color: $primary; background: #f0f4ff; }

            .sort-icon {
                display: inline-flex;
                align-items: center;
                margin-left: 4px;
                vertical-align: middle;
                color: $primary;
                opacity: 0.85;
            }
        }

        /* 유형 뱃지 */
        .preset-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            font-family: monospace;
            white-space: nowrap;

            &.badge-income  { background: #dbeafe; color: #1e40af; }
            &.badge-expense { background: #fee2e2; color: #991b1b; }
        }

        /* 유틸리티 */
        .text-right  { text-align: right; }
        .text-center { text-align: center; }
        .font-bold   { font-weight: 700; }
        .mono        { font-family: monospace; }
        .text-blue   { color: $blue; }
        .text-red    { color: $danger; }
        .text-light  { color: $text-light; }
        .text-sub    { color: $text-sub; }
        .text-muted  { color: #d1d5db; }

        .desc-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 280px;
        }

        .empty-state {
            text-align: center;
            padding: 60px;
            color: $text-light;
            font-size: 14px;
        }
    }
}

/* ==========================================
   하단 고정 합계 바
========================================== */
.summary-footer {
    position: sticky;
    bottom: 0;
    display: flex;
    align-items: center;
    background: $bg-white;
    border: 1px solid $border-color;
    border-radius: 12px;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
    overflow: hidden;

    .summary-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 12px 20px;
        border-right: 1px solid $border-color;

        &:last-child { border-right: none; }

        &:first-child {
            flex: 0 0 auto;
            padding: 12px 18px;
            background: #f8fafc;
            justify-content: center;

            .sf-label { font-size: 13px; font-weight: 800; color: $text-sub; }
        }

        .sf-label {
            font-size: 11px;
            font-weight: 700;
            color: $text-light;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }

        .sf-value {
            font-size: 15px;
            font-weight: 800;

            .sf-pct {
                font-size: 12px;
                font-weight: 700;
                margin-left: 3px;
                opacity: 0.8;
            }
        }

        &.opening { border-left: 3px solid #94a3b8; background: #f8fafc; }
        &.income  { border-left: 3px solid $blue; }
        &.expense { border-left: 3px solid $danger; }
        &.net     { border-left: 3px solid $amber; }
        &.closing { border-left: 3px solid $primary; background: #f8fafc; }
    }
}
</style>
