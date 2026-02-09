<template>
  <div class="manager-container">
    <header class="page-header">
      <div>
        <h1>분개장 관리 (Journal Ledger)</h1>
        <p class="subtitle">모든 거래 내역을 확인하고 관리합니다.</p>
      </div>
      <button class="btn-create" @click="openModal">
        <span class="material-icons-outlined">edit_note</span>
        전표 작성하기
      </button>
    </header>

    <div class="journal-list">
      <div v-if="journalEntries.length === 0" class="empty-state">
        <p>입력된 전표가 없습니다. 새로운 전표를 작성해보세요!</p>
      </div>

      <div v-for="entry in sortedEntries" :key="entry.id" class="journal-card">
        <div class="card-left">
          <div class="date-box">
            <span class="day">{{ getDay(entry.date) }}</span>
            <span class="ym">{{ getYearMonth(entry.date) }}</span>
          </div>
        </div>
        
        <div class="card-body">
          <div class="entry-header">
            <h4>{{ entry.description }}</h4>
            <span class="entry-id">No. {{ entry.id }}</span>
          </div>
          
          <div class="mini-ledger">
            <div class="ledger-row" v-for="(line, idx) in entry.lines" :key="idx">
              <div class="acc-name">
                <span class="badge" :class="line.type">
                  {{ line.type === 'debit' ? '차' : '대' }}
                </span>
                {{ line.accountId }}
              </div>
              <div class="amount-area">
                <span v-if="line.type === 'debit'" class="debit-amt">{{ formatCurrency(line.amount) }}</span>
                <span v-else class="credit-amt">{{ formatCurrency(line.amount) }}</span>
              </div>
            </div>
            <div class="ledger-total">
              <span>합계</span>
              <span class="total-amt">₩ {{ formatCurrency(getEntryTotal(entry)) }}</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
           <button class="btn-icon" @click="deleteEntry(entry.id)" title="삭제">
             <span class="material-icons-outlined">delete</span>
           </button>
        </div>
      </div>
    </div>

    <JournalFormModal 
      :is-open="isModalOpen"
      @close="isModalOpen = false"
      @save="addEntry"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import JournalFormModal from './JournalFormModal.vue'; // 위에서 만든 컴포넌트 import

const isModalOpen = ref(false);
const journalEntries = ref([
  // 초기 샘플 데이터
  {
    id: 1,
    date: '2024-10-26',
    description: '사무실 임차료 지급',
    lines: [
      { type: 'debit', accountId: '임차료', amount: 1000000 },
      { type: 'credit', accountId: '보통예금', amount: 1000000 }
    ]
  },
  {
    id: 2,
    date: '2024-10-25',
    description: '상품 매출 발생',
    lines: [
      { type: 'debit', accountId: '현금', amount: 50000 },
      { type: 'credit', accountId: '상품매출', amount: 50000 }
    ]
  }
]);

// 날짜 내림차순 정렬
const sortedEntries = computed(() => {
  return [...journalEntries.value].sort((a, b) => new Date(b.date) - new Date(a.date));
});

// 기능 메서드
const openModal = () => isModalOpen.value = true;

const addEntry = (newEntryData) => {
  // 간단한 ID 생성 로직 (실무에선 DB ID 사용)
  const newId = journalEntries.value.length > 0 ? Math.max(...journalEntries.value.map(e => e.id)) + 1 : 1;
  
  journalEntries.value.unshift({
    id: newId,
    ...newEntryData
  });
};

const deleteEntry = (id) => {
  if(confirm('이 전표를 삭제하시겠습니까?')) {
    journalEntries.value = journalEntries.value.filter(e => e.id !== id);
  }
};

// 포맷팅 유틸리티
const getDay = (dateStr) => dateStr.split('-')[2];
const getYearMonth = (dateStr) => {
  const parts = dateStr.split('-');
  return `${parts[0]}.${parts[1]}`;
};
const getEntryTotal = (entry) => {
  // 차변 합계만 표시 (대차평형이므로)
  return entry.lines.filter(l => l.type === 'debit').reduce((acc, cur) => acc + cur.amount, 0);
};
const formatCurrency = (val) => new Intl.NumberFormat('ko-KR').format(val);
</script>

<style lang="scss" scoped>
/* 페이지 레이아웃 */
.manager-container {
  max-width: 900px; margin: 0 auto; padding: 2rem;
  font-family: 'Suit', sans-serif; color: #334155;
}

.page-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;
  h1 { margin: 0; font-size: 1.8rem; color: #1e293b; }
  .subtitle { margin: 5px 0 0; color: #64748b; font-size: 0.9rem; }
  
  .btn-create {
    display: flex; align-items: center; gap: 8px;
    background: #3b82f6; color: white; border: none; padding: 0.8rem 1.5rem;
    border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s;
    &:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3); }
  }
}

/* 리스트 스타일 */
.journal-list { display: flex; flex-direction: column; gap: 1.5rem; }
.empty-state { text-align: center; padding: 4rem; background: #f8fafc; border-radius: 12px; color: #94a3b8; }

.journal-card {
  display: flex; background: white; border-radius: 12px;
  border: 1px solid #e2e8f0; overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.03); transition: box-shadow 0.2s;
  
  &:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }

  /* 왼쪽 날짜 영역 */
  .card-left {
    background: #f1f5f9; width: 80px; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; border-right: 1px solid #e2e8f0;
    
    .date-box {
      text-align: center;
      .day { display: block; font-size: 1.8rem; font-weight: 800; color: #334155; line-height: 1; }
      .ym { display: block; font-size: 0.75rem; color: #64748b; margin-top: 4px; }
    }
  }

  /* 본문 영역 */
  .card-body { flex: 1; padding: 1.5rem; }

  .entry-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
    h4 { margin: 0; font-size: 1.1rem; color: #1e293b; }
    .entry-id { font-size: 0.75rem; color: #cbd5e1; }
  }

  /* 미니 테이블 */
  .mini-ledger {
    background: #fafafa; border-radius: 8px; padding: 0.8rem; border: 1px solid #f1f5f9;
    
    .ledger-row {
      display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #e2e8f0;
      &:last-child { border-bottom: none; }
      
      .acc-name { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
      .badge {
        font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: bold;
        &.debit { background: #dbeafe; color: #3b82f6; }
        &.credit { background: #fee2e2; color: #ef4444; }
      }
      
      .amount-area {
        font-family: monospace; font-size: 0.95rem; width: 140px; text-align: right;
        .debit-amt { color: #3b82f6; }
        .credit-amt { color: #ef4444; }
      }
    }

    .ledger-total {
      margin-top: 8px; padding-top: 8px; border-top: 2px solid #e2e8f0;
      display: flex; justify-content: space-between; font-weight: bold; font-size: 0.9rem;
    }
  }

  /* 삭제 버튼 영역 */
  .card-actions {
    width: 50px; display: flex; align-items: center; justify-content: center;
    border-left: 1px solid #f1f5f9;
    
    .btn-icon {
      background: none; border: none; color: #cbd5e1; cursor: pointer; padding: 8px;
      &:hover { color: #ef4444; background: #fef2f2; border-radius: 50%; }
    }
  }
}
</style>