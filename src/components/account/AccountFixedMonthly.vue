<template>
    <div>
        <section class="monthly-section d-panel">
            <div class="panel-header flex-between">
                <div class="left-wrap flex-align-center">
                    <h3>월별 고정비 현황</h3>
                    <input type="month" v-model="filtered.targetMonth" class="month-selector" @change="fetchMonthlyData">
                </div>
                <div class="right-wrap text-sm text-muted">
                    기준일: 오늘 ({{ filtered.todayStr }})
                </div>
            </div>

            <div class="data-table-wrapper">
                <table class="data-table monthly-table">
                    <thead>
                        <tr>
                            <th class="col-no">No.</th>
                            <th>항목 명칭</th>
                            <th class="text-center">관리주체</th>
                            <th>예정 결제일</th>
                            <th class="text-right">청구 금액 (원)</th>
                            <th class="text-center">결제 알림</th>
                            <th class="text-center">진행 상태</th>
                            <th class="text-center">액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, idx) in monthlyList" :key="item.id">
                            <td class="col-no mono text-light">{{ idx + 1 }}</td>
                            <td class="font-bold">{{ item.expenseNm }}</td>
                            <td class="text-center">
                                <span class="badge-owner" :class="item.householdType.toLowerCase()">
                                    {{ item.householdTypeNm }}
                                </span>
                            </td>
                            <td class="mono" :class="{ 'text-red font-bold': item.dDay > -3 && item.dDay <= 0 && !item.isPaid }">
                                {{ item.expectedDate }}
                            </td>
                            <td class="text-right mono font-bold" :class="item.isPaid ? 'text-light' : 'text-main'">
                                {{ item.amount.toLocaleString() }}
                            </td>
                            <td class="text-center">
                                <span v-if="item.isPaid" class="badge-status done">완료됨</span>
                                <span v-else-if="item.dDay === 0" class="badge-alert danger">🔥 오늘 결제</span>
                                <span v-else-if="item.dDay > -3 && item.dDay < 0" class="badge-alert warning">🚨 D{{ item.dDay }}</span>
                                <span v-else-if="item.dDay <= -3" class="badge-alert safe">D{{ item.dDay }}</span>
                                <span v-else class="badge-alert over">연체 (+{{ item.dDay }})</span>
                            </td>
                            <td class="text-center">
                                <span class="status-pill" :class="item.isPaid ? 'bg-green' : 'bg-gray'">
                                    {{ item.isPaid ? '결제완료' : '결제예정' }}
                                </span>
                            </td>
                            <td class="text-center">
                                <button class="btn-execute" @click="executeExpense(item)" :disabled="item.isPaid">
                                    {{ item.isPaid ? '✔ 집행됨' : '⚡ 전표 생성' }}
                                </button>
                            </td>
                        </tr>
                        <tr v-if="monthlyList.length === 0">
                            <td colspan="8" class="empty-state">
                                <div class="empty-content">
                                    <p>해당 월({{ filtered.targetMonth }})에 예정된 고정비 집행 내역이 없습니다.</p>
                                    <button class="btn-generate" @click="generateMonthlyExpenses">
                                        + 이번 달 고정비 내역 생성하기
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="summary-footer">
                <div class="summary-item">
                    <span class="label">이번 달 총 예정 금액</span>
                    <span class="value mono text-main">{{ currentMonthTotal.toLocaleString() }} 원</span>
                </div>
                <div class="summary-item">
                    <span class="label">결제 완료 금액</span>
                    <span class="value mono text-blue">{{ currentMonthPaid.toLocaleString() }} 원</span>
                </div>
                <div class="summary-item">
                    <span class="label">남은 결제 금액</span>
                    <span class="value mono text-red">{{ (currentMonthTotal - currentMonthPaid).toLocaleString() }} 원</span>
                </div>
                <div class="divider"></div>
                <div class="summary-item compare-item">
                    <span class="label">전월 확정 금액 ({{ lastMonthStr }})</span>
                    <div class="compare-values">
                        <span class="value mono text-light">{{ lastMonthTotal.toLocaleString() }} 원</span>
                        <span class="diff-badge" :class="diffAmount > 0 ? 'up' : (diffAmount < 0 ? 'down' : 'equal')">
                            {{ diffAmount > 0 ? '▲' : (diffAmount < 0 ? '▼' : '-') }} 
                            {{ Math.abs(diffAmount).toLocaleString() }}원 
                        </span>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
    import { ref, reactive, computed, onMounted } from 'vue';

    // ==========================================
    // 1. 초기화 및 유틸리티 설정
    // ==========================================
    // 오늘 날짜 문자열 반환 (예: 2026-04-06)
    const getTodayStr = () => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    };

    // 현재 월 문자열 반환 (예: 2026-04)
    const getCurrentMonthStr = () => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    };

    // 필터 및 상태 관리
    const filtered = reactive({
        targetMonth: getCurrentMonthStr(),
        todayStr: getTodayStr(),
    });

    // 전월 문자열 계산 (예: 2026-04 -> 2026-03)
    const lastMonthStr = computed(() => {
        if (!filtered.targetMonth) return '';
        const [year, month] = filtered.targetMonth.split('-');
        const date = new Date(year, month - 1 - 1, 1);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });

    // ==========================================
    // 2. 월별(Monthly) 데이터 로직
    // ==========================================
    const amountData = reactive({});
    const monthlyList = ref([]);
    const currentMonthTotal = ref(0);
    const currentMonthPaid = ref(0);
    const lastMonthTotal = ref(0);
    const diffAmount = computed(() => currentMonthTotal.value - lastMonthTotal.value);

    // 금액 합산 계산
    const calculateTotals = () => {
        currentMonthTotal.value = monthlyList.value.reduce((sum, item) => sum + item.amount, 0);
        currentMonthPaid.value = monthlyList.value.filter(i => i.isPaid).reduce((sum, item) => sum + item.amount, 0);
    };

    // 월별 데이터 조회 (Mock)
    const fetchMonthlyData = async () => {
        console.log(`조회 월: ${filtered.targetMonth}`);
        const param = { targetMonth: filtered.targetMonth }
        const { data } = await mariaApi.get('/api/account/fixed/monthly', {params: param});
        monthlyList.value = data;
        calculateTotals();
        
        // // 현재 달과 다른 달을 조회하면 임시로 빈 배열을 반환하여 '생성하기' 버튼을 노출시킴
        // if (filtered.targetMonth !== getCurrentMonthStr()) {
        //     monthlyList.value = [];
        //     calculateTotals();
        //     lastMonthTotal.value = 0;
        //     return;
        // }

        // // Mock 데이터 (D-Day 음수는 미래, 양수는 연체를 의미함)
        // monthlyList.value = [
        //     { id: 101, expenseNm: '아파트 관리비', householdType: 'JOINT', householdTypeNm: '공동', expectedDate: `${filtered.targetMonth}-25`, amount: 250000, isPaid: false, dDay: -19 },
        //     { id: 102, expenseNm: '인터넷 통신비', householdType: 'PERSONAL', householdTypeNm: '준서', expectedDate: `${filtered.targetMonth}-10`, amount: 35000, isPaid: true, dDay: -4 },
        //     { id: 103, expenseNm: '넷플릭스 구독', householdType: 'JOINT', householdTypeNm: '공동', expectedDate: `${filtered.targetMonth}-06`, amount: 17000, isPaid: false, dDay: 0 },
        //     { id: 104, expenseNm: '가스 요금', householdType: 'JOINT', householdTypeNm: '공동', expectedDate: `${filtered.targetMonth}-01`, amount: 45000, isPaid: false, dDay: 5 }
        // ];
        
        // calculateTotals();
        // lastMonthTotal.value = 340000; // Mock 전월 확정액
    };

// ==========================================
// 3. 액션(Action) 함수
// ==========================================
// 전표 집행 (단건)
const executeExpense = (item) => {
    if (confirm(`[${item.expenseNm}] ${item.amount.toLocaleString()}원을 결제 완료 처리하시겠습니까?`)) {
        item.isPaid = true;
        calculateTotals();
        alert('전표 생성이 완료되었습니다.');
    }
};

// 고정비 데이터가 없을 때 마스터에서 생성 (Mock)
const generateMonthlyExpenses = () => {
    if (confirm(`${filtered.targetMonth}월 고정비 집행내역을 새로 생성하시겠습니까?\n(등록된 마스터 항목을 기준으로 생성됩니다)`)) {
        // 임시로 데이터를 생성하여 리스트에 주입
        monthlyList.value = [
            { id: Date.now(), expenseNm: '아파트 관리비', householdType: 'JOINT', householdTypeNm: '공동', expectedDate: `${filtered.targetMonth}-25`, amount: 250000, isPaid: false, dDay: -19 },
            { id: Date.now() + 1, expenseNm: '정수기 렌탈', householdType: 'PERSONAL', householdTypeNm: '개인', expectedDate: `${filtered.targetMonth}-15`, amount: 20000, isPaid: false, dDay: -9 },
        ];
        calculateTotals();
        lastMonthTotal.value = 340000;
        alert(`${filtered.targetMonth}월 고정비 내역이 성공적으로 생성되었습니다.`);
    }
};

// 초기 진입 시 데이터 로드
onMounted(() => {
    fetchMonthlyData();
});
</script>

<style lang="scss" scoped>
/* 베이스 및 패널 스타일 */
.d-panel {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    padding: 24px;
    margin-bottom: 24px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.panel-header {
    margin-bottom: 20px;
    
    h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1f2937;
    }

    .month-selector {
        margin-left: 16px;
        padding: 6px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s;
        
        &:focus {
            border-color: #3b82f6;
        }
    }
}

/* 유틸리티 클래스 */
.flex-between { display: flex; justify-content: space-between; align-items: center; }
.flex-align-center { display: flex; align-items: center; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-sm { font-size: 0.875rem; }
.text-muted { color: #6b7280; }
.text-light { color: #9ca3af; }
.text-main { color: #111827; }
.text-blue { color: #3b82f6; }
.text-red { color: #ef4444; }
.font-bold { font-weight: 600; }
.mono { font-family: "JetBrains Mono", "Courier New", monospace; }

/* 테이블 스타일 */
.data-table-wrapper {
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
        padding: 14px 16px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 0.95rem;
    }
    
    th {
        background-color: #f9fafb;
        color: #4b5563;
        font-weight: 600;
        text-align: left;
    }

    .col-no { width: 60px; text-align: center; }
}

/* 뱃지 및 라벨 */
.badge-owner {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
    
    &.joint { background-color: #e0e7ff; color: #4338ca; }
    &.personal { background-color: #f3f4f6; color: #4b5563; }
}

.badge-alert {
    font-size: 0.85rem;
    font-weight: 600;
    
    &.done { color: #9ca3af; }
    &.danger { color: #ef4444; }
    &.warning { color: #f59e0b; }
    &.safe { color: #10b981; }
    &.over { color: #b91c1c; font-weight: 700; }
}

.status-pill {
    padding: 6px 10px;
    border-radius: 9999px;
    font-size: 0.8rem;
    font-weight: 600;
    
    &.bg-green { background-color: #d1fae5; color: #065f46; }
    &.bg-gray { background-color: #f3f4f6; color: #4b5563; }
}

/* 액션 버튼 */
.btn-execute {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: background-color 0.2s;

    &:hover:not(:disabled) { background-color: #2563eb; }
    &:disabled {
        background-color: #f3f4f6;
        color: #9ca3af;
        cursor: not-allowed;
    }
}

/* Empty State */
.empty-state {
    padding: 40px 0 !important;
}

.empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #6b7280;

    p { margin-bottom: 16px; }

    .btn-generate {
        background-color: #10b981;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
        
        &:hover { background-color: #059669; }
    }
}

/* 푸터 (Summary) */
.summary-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 24px;
    padding-top: 24px;
    margin-top: 8px;
    
    .summary-item {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        
        .label { font-size: 0.85rem; color: #6b7280; margin-bottom: 4px; }
        .value { font-size: 1.15rem; font-weight: 700; }
    }

    .divider {
        width: 1px;
        height: 40px;
        background-color: #e5e7eb;
    }
    
    .compare-values {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .diff-badge {
            font-size: 0.85rem;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            
            &.up { background-color: #fee2e2; color: #ef4444; }
            &.down { background-color: #d1fae5; color: #10b981; }
            &.equal { background-color: #f3f4f6; color: #6b7280; }
        }
    }
}
</style>