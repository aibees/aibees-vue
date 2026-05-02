<template>
    <div class="d-container fixed-expense-management">
        <header class="header-section">
            <div class="header-title">
            </div>
            <div class="actions">
                <button class="btn-primary" @click="openModal()">+ 새 고정비 등록</button>
            </div>
        </header>

        <section class="master-section d-panel">
            <div class="d-panel-header">
                <h3>고정비 마스터 목록</h3>
                <div class="filter-box">
                    <select class="filter-household" v-model="filtered.household">
                        <option value="">관리주체 전체</option>
                        <option v-for="h in options.household" :key="h.code" :value="h.code">
                            {{ h.name }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th class="col-no">No.</th>
                            <th class="text-center">명칭</th>
                            <th class="text-center">관리주체</th>
                            <th class="text-center">주기</th>
                            <th>기준 결제일</th>
                            <th class="text-right">기준 금액 (원)</th>
                            <th>결제수단 (bankId)</th>
                            <th class="text-center">상태</th>
                            <th class="text-center">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, idx) in filteredMasterList" :key="row.expenseId"
                            :class="{ 'is-disabled': row.status !== 'ACTIVE' }">
                            <td class="col-no mono text-light">{{ idx + 1 }}</td>
                            <td class="font-bold">{{ row.expenseNm }}</td>
                            <td class="text-center"><span class="badge-owner" :class="row.householdType">{{
                                row.householdTypeNm || row.householdType }}</span></td>
                            <td class="text-center"><span class="badge-outline">{{ row.payCycle }}</span></td>
                            <td class="mono">{{ row.payDay }}</td>
                            <td class="text-right mono font-bold text-blue">{{ row.amount.toLocaleString() }}</td>
                            <td class="text-sm text-muted">{{ getBankName(row.bankId) }}</td>
                            <td class="text-center">
                                <span class="status-dot" :class="row.status === 'ACTIVE' ? 'bg-green' : 'bg-gray'"></span>
                                &nbsp;<span class="text-sm font-bold ml-1">{{ row.status === 'ACTIVE' ? '활성' : '중지'
                                }}</span>
                            </td>
                            <td class="text-center action-cell">
                                <button class="btn-icon" @click="editExpense(row)" title="수정">✏️</button>
                            </td>
                        </tr>
                        <tr v-if="filteredMasterList.length === 0">
                            <td colspan="9" class="empty-state">등록된 고정비 마스터가 없습니다.</td>
                        </tr>
                    </tbody>
                    <tfoot v-if="filteredMasterList.length > 0">
                        <tr class="total-row">
                            <td colspan="5" class="total-label">합 계</td>
                            <td class="text-right mono total-value">{{ totalAmount.toLocaleString() }}</td>
                            <td colspan="3"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </section>


        <Transition name="fade">
            <div class="modal-overlay" v-if="isModalOpen">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>{{ formData.expenseId ? '고정비 마스터 수정' : '새 고정비 마스터 등록' }}</h3>
                        <button class="btn-close" @click="closeModal">&times;</button>
                    </div>

                    <div class="modal-body">
                        <form id="expenseForm" @submit.prevent="saveExpense">
                            <div class="form-grid">
                                <div class="form-group col-full">
                                    <label>항목 명칭 <span class="required">*</span></label>
                                    <input type="text" v-model="formData.expenseNm" placeholder="예: 아파트 관리비" required>
                                </div>

                                <div class="form-group">
                                    <label>관리주체 <span class="required">*</span></label>
                                    <select v-model="formData.householdType" required>
                                        <option value="" disabled>선택하세요</option>
                                        <option v-for="h in options.household" :key="h.code" :value="h.code">{{ h.name }}
                                        </option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label>결제 주기 <span class="required">*</span></label>
                                    <select v-model="formData.payCycle" required>
                                        <option value="MONTH">월간 (매월)</option>
                                        <option value="YEAR">연간 (매년)</option>
                                        <option value="WEEK">주간 (매주)</option>
                                        <option value="DAY">일간 (매일)</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label>기준 결제일 (Pay Day) <span class="required">*</span></label>
                                    <input type="text" v-model="formData.payDay" placeholder="예: 25일, 말일, 12-31" required>
                                </div>

                                <div class="form-group">
                                    <label>기준 결제 금액 (원) <span class="required">*</span></label>
                                    <input type="number" v-model.number="formData.amount" placeholder="0"
                                        class="text-right mono font-bold text-blue" required>
                                </div>

                                <div class="form-group">
                                    <label>결제수단 (계좌/카드)</label>
                                    <select v-model="formData.bankId">
                                        <option value="" disabled>선택하세요</option>
                                        <optgroup v-for="group in options.bank" :key="group.type"
                                            :label="group.type">
                                            <option v-for="acc in group.items" :key="acc.id" :value="acc.id">
                                                {{ acc.name }} ({{ acc.number || '번호없음' }})
                                            </option>
                                        </optgroup>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label>연동 프리셋</label>
                                    <select v-model="formData.presetCd">
                                        <option value="">미지정 (수동 처리)</option>
                                        <option v-for="p in options.preset" :key="p.code" :value="p.code">[{{ p.code }}] {{
                                            p.name }}</option>
                                    </select>
                                </div>

                                <div class="form-group col-full">
                                    <label>상태</label>
                                    <select v-model="formData.status">
                                        <option value="ACTIVE">활성 (사용중)</option>
                                        <option value="STOPPED">중지 (일시중지)</option>
                                        <option value="TERMINATED">종료 (더 이상 사용안함)</option>
                                    </select>
                                </div>

                                <div class="form-group col-full">
                                    <label>메모</label>
                                    <input type="text" v-model="formData.memo" placeholder="특이사항 메모">
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn-danger mr-auto" v-if="formData.expenseId" @click="deleteExpense">🗑
                            삭제</button>
                        <button type="button" class="btn-outline" @click="closeModal">취소</button>
                        <button type="submit" form="expenseForm" class="btn-primary">
                            💾 {{ formData.expenseId ? '수정 완료' : '등록 완료' }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import mariaApi from '@scripts/util/mariaApi.js';
import { getResourceList } from '@scripts/util/common/SettingResource.js';
import { userSession } from '@scripts/util/user-session';

// ==========================================
// 1. 공통 상태 및 옵션
// ==========================================
const session = userSession();
const filtered = reactive({
    household: '',
    todayStr: '',
    targetMonth: ''
});

const options = reactive({
    household: session.getUserFamily,
    bank: [],
    preset: []
});

const getYearMonthStr = (dateObj) => {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
};

const lastMonthStr = computed(() => {
    if (!filtered.targetMonth) return '';
    const [y, m] = filtered.targetMonth.split('-');
    let date = new Date(y, m - 1, 1);
    date.setMonth(date.getMonth() - 1);
    return getYearMonthStr(date);
});

onMounted(async () => {
    const today = new Date();
    filtered.targetMonth = getYearMonthStr(today);
    filtered.todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 마스터 옵션들 Fetch
    const household = await getResourceList('ACCOUNT', 'HOUSEHOLD');
    options.household = household.map(h => ({ code: h.code, name: h.name }));

    await getAccountInfos();

    options.preset = [
        { code: 'EXP_MAINTAIN', name: '관리비' },
        { code: 'EXP_SUB_MEDIA', name: '구독료' }
    ];

    await getFixedMasterList();
    fetchMonthlyData();
});

const getBankName = (bankId) => {
    const bank = options.bank.find(b => b.code === bankId);
    return bank ? bank.name : bankId;
};

// ==========================================
// 2. 마스터(Master) 목록 조회
// ==========================================
const masterList = ref([]);

const filteredMasterList = computed(() =>
    filtered.household
        ? masterList.value.filter(r => r.householdType === filtered.household)
        : masterList.value
);

const totalAmount = computed(() =>
    filteredMasterList.value.reduce((sum, r) => sum + (r.amount || 0), 0)
);

const getFixedMasterList = async () => {
    try {
        const { data } = await mariaApi.get('/api/account/fixed');
        masterList.value = data || [];
    } catch (e) {
        console.warn('API 연동 전 Mock 데이터 세팅');
        masterList.value = [
            { expenseId: 1, expenseNm: '아파트 관리비', householdType: 'JOINT', householdTypeNm: '공동', payCycle: 'MONTH', payDay: '25일', amount: 250000, bankId: 'ACC_SH_01', presetCd: 'EXP_MAINTAIN', status: 'ACTIVE' }
        ];
    }
}

// 계좌, 카드 정보 가져오기
const getAccountInfos = async () => {
    const params = {
        enabledFlag: 'Y'
    }

    const bankResult = await mariaApi.get('/api/account/info/bank-accounts', { params: params });
    options.bank.push({
        type: '입출금 통장',
        items: bankResult.data.map(b => { return { id: b.bankId, name: b.bankNm, number: b.bankAcct } })
    })
    const cardResult = await mariaApi.get('/api/account/info/card-accounts', { params: params });
    options.bank.push({
        type: '결제 카드',
        items: cardResult.data.map(c => { return { id: c.cardId, name: c.cardNm, number: c.cardNo } })
    })
}

// ==========================================
// 💡 3. 모달 (Modal) 관리 로직 (신규 구현)
// ==========================================
const isModalOpen = ref(false);

const initialForm = {
    expenseId: null,
    expenseNm: '',
    householdType: '',
    payCycle: 'MONTH',
    payDay: '',
    amount: null,
    payType: '',
    presetCd: '',
    status: 'ACTIVE',
    bankId: '',
    memo: ''
};

const formData = reactive({ ...initialForm });

const openModal = () => {
    Object.assign(formData, initialForm);
    isModalOpen.value = true;
};

const editExpense = (row) => {
    Object.assign(formData, row);
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const saveExpense = async () => {
    try {
        if (formData.expenseId) {
            // 수정 로직
            await mariaApi.put(`/api/account/fixed`, formData);
            alert('고정비 마스터가 수정되었습니다.');
        } else {
            // 등록 로직
            await mariaApi.post('/api/account/fixed', formData);
            alert('고정비 마스터가 등록되었습니다.');
        }
        closeModal();
        await getFixedMasterList(); // 등록/수정 후 목록 새로고침
    } catch (error) {
        console.error('저장 실패:', error);
        alert('저장에 실패했습니다.');
    }
};

const deleteExpense = async () => {
    if (confirm(`'${formData.expenseNm}' 마스터를 삭제하시겠습니까?\n(이미 집행된 내역이 있다면 삭제할 수 없습니다)`)) {
        try {
            await mariaApi.delete(`/api/account/fixed/${formData.expenseId}`);
            alert('삭제되었습니다.');
            closeModal();
            await getFixedMasterList();
        } catch (error) {
            console.error('삭제 실패:', error);
            alert('삭제에 실패했습니다.');
        }
    }
};



</script>

<style src="@@/account/accountFixed.scss" lang="scss" scoped  />