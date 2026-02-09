<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>새 전표 입력 (New Slip)</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>날짜</label>
            <input type="date" v-model="localForm.date" class="input-control" />
          </div>
          <div class="form-group flex-grow">
            <label>적요 (Description)</label>
            <input type="text" v-model="localForm.description" placeholder="거래 내용 입력" class="input-control" />
          </div>
        </div>

        <table class="entry-table">
          <thead>
            <tr>
              <th width="15%">구분</th>
              <th width="25%">계정 과목</th>
              <th width="30%">금액</th>
              <th width="5%"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(line, index) in localForm.lines" :key="index">
              <td>
                <select v-model="line.type" class="select-control" :class="line.type">
                  <option value="debit">차변</option>
                  <option value="credit">대변</option>
                </select>
              </td>
              <td>
                <select v-model="line.accountId" class="select-control">
                  <option value="" disabled>선택</option>
                  <option v-for="acc in accountList" :key="acc.id" :value="acc.name">{{ acc.name }}</option>
                </select>
              </td>
              <td>
                <input type="number" v-model.number="line.amount" class="input-control text-right" placeholder="0" />
              </td>
              <td class="text-center">
                <button class="btn-icon delete" @click="removeLine(index)" v-if="localForm.lines.length > 2">
                  <span class="material-icons-outlined">remove_circle</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <button class="add-line-btn" @click="addLine">+ 행 추가</button>

        <div class="summary-box" :class="{ error: !isBalanced }">
          <div class="sum-row">
            <span>차변 합계: {{ formatCurrency(totalDebit) }}</span>
            <span>대변 합계: {{ formatCurrency(totalCredit) }}</span>
          </div>
          <div class="balance-msg" v-if="!isBalanced">
            대차 차액이 발생했습니다: {{ formatCurrency(Math.abs(totalDebit - totalCredit)) }}원
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="closeModal">취소</button>
        <button class="btn-save" :disabled="!isValid" @click="save">저장하기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';

const props = defineProps(['isOpen']);
const emit = defineEmits(['close', 'save']);

// 더미 계정 목록
const accountList = [
  { id: 1, name: '현금' }, { id: 2, name: '보통예금' }, { id: 3, name: '외상매출금' },
  { id: 4, name: '비품' }, { id: 5, name: '상품매출' }, { id: 6, name: '급여' },
  { id: 7, name: '임차료' }, { id: 8, name: '외상매입금' }
];

// 로컬 폼 데이터 (초기화용 함수)
const createInitialForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  description: '',
  lines: [
    { type: 'debit', accountId: '', amount: 0 },
    { type: 'credit', accountId: '', amount: 0 }
  ]
});

const localForm = reactive(createInitialForm());

// 모달이 열릴 때마다 폼 초기화
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    Object.assign(localForm, createInitialForm());
  }
});

// 계산 로직
const totalDebit = computed(() => localForm.lines.filter(l => l.type === 'debit').reduce((acc, cur) => acc + (cur.amount || 0), 0));
const totalCredit = computed(() => localForm.lines.filter(l => l.type === 'credit').reduce((acc, cur) => acc + (cur.amount || 0), 0));
const isBalanced = computed(() => totalDebit.value === totalCredit.value && totalDebit.value > 0);
const isValid = computed(() => isBalanced.value && localForm.description && localForm.lines.every(l => l.accountId));

// 액션
const addLine = () => localForm.lines.push({ type: 'debit', accountId: '', amount: 0 });
const removeLine = (idx) => localForm.lines.splice(idx, 1);
const closeModal = () => emit('close');
const save = () => {
  // 깊은 복사로 데이터 전달
  emit('save', JSON.parse(JSON.stringify(localForm)));
  closeModal();
};

const formatCurrency = (val) => new Intl.NumberFormat('ko-KR').format(val);
</script>

<style lang="scss" scoped>
/* 모달 스타일 */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5); z-index: 1000;
  display: flex; justify-content: center; align-items: center;
}
.modal-content {
  background: white; width: 600px; max-width: 90%; border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2); overflow: hidden; display: flex; flex-direction: column;
}
.modal-header {
  padding: 1rem 1.5rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0;
  display: flex; justify-content: space-between; align-items: center;
  h3 { margin: 0; font-size: 1.1rem; color: #334155; }
  .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
}
.modal-body { padding: 1.5rem; overflow-y: auto; max-height: 70vh; }
.modal-footer {
  padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; text-align: right;
  background: #f8fafc;
}

/* 폼 요소 스타일 (축약) */
.form-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; label { font-size: 0.8rem; font-weight: bold; color: #64748b;} }
.flex-grow { flex: 1; }
.input-control, .select-control { padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; width: 100%; box-sizing: border-box;}
.entry-table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; th { text-align: left; font-size: 0.8rem; color: #64748b; padding-bottom: 0.5rem; border-bottom: 2px solid #e2e8f0; } td { padding: 0.5rem 0; } }
.select-control.debit { color: #3b82f6; font-weight: bold; }
.select-control.credit { color: #ef4444; font-weight: bold; }
.add-line-btn { width: 100%; padding: 0.5rem; background: #f1f5f9; border: 1px dashed #cbd5e1; color: #64748b; cursor: pointer; border-radius: 6px; &:hover { background: #e2e8f0; } }
.summary-box { margin-top: 1.5rem; padding: 1rem; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0; text-align: right; font-size: 0.9rem; font-weight: bold; color: #15803d; 
  &.error { background: #fef2f2; border-color: #fecaca; color: #b91c1c; }
}
.sum-row { display: flex; justify-content: flex-end; gap: 1.5rem; }
.btn-save { background: #3b82f6; color: white; padding: 0.6rem 1.2rem; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; &:disabled { background: #cbd5e1; cursor: not-allowed; } }
.btn-cancel { background: white; border: 1px solid #cbd5e1; padding: 0.6rem 1.2rem; border-radius: 6px; margin-right: 0.5rem; cursor: pointer; }
.btn-icon { background: none; border: none; cursor: pointer; color: #94a3b8; &:hover { color: #ef4444; } }
</style>