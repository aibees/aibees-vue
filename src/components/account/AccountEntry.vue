<template>
    <div class="journal-entry-management">

        <section class="top-action-bar d-panel">
            <div class="base-account-selector">
                <label>거래 귀속 계좌/카드 (bank_id) <span class="required">*</span></label>
                <select v-model="globalState.baseAccountId">
                    <option value="" disabled>출금되거나 결제된 계좌/카드를 선택하세요</option>
                    <optgroup v-for="group in myAccounts" :key="group.type" :label="group.type">
                        <option v-for="acc in group.items" :key="acc.id" :value="acc.id">
                            {{ acc.name }} ({{ acc.number || '번호없음' }})
                        </option>
                    </optgroup>
                </select>
            </div>

            <div class="action-buttons">
                <div class="summary-text" v-if="entries.length > 0">
                    총 <strong>{{ entries.length }}</strong>건 / 합계 <strong>{{ totalAmount.toLocaleString() }}</strong>원
                </div>
                <button class="btn-primary btn-large" @click="saveAllEntries"
                    :disabled="!globalState.baseAccountId || entries.length === 0">
                    💾 전체 전표 저장
                </button>
            </div>
        </section>

        <section class="entry-cards-container">
            <TransitionGroup name="list">
                <div class="entry-card" v-for="(entry, index) in entries" :key="entry._id">
                    <div class="card-header">
                        <span class="entry-number">#{{ index + 1 }}</span>
                        <div class="card-actions">
                            <button class="btn-icon-copy" @click="copyEntry(index)" title="이 전표 복사하기">
                                📋 복사
                            </button>
                            <button class="btn-icon-danger" @click="removeEntry(index)" title="이 전표 삭제">
                                ✕
                            </button>
                        </div>
                    </div>

                    <div class="card-body form-grid">
                        <div class="form-group-row full-width">
                            <div class="form-group flex-1">
                                <label>거래 일자 <span class="required">*</span></label>
                                <input type="date" v-model="entry.txDate" required>
                            </div>
                            <div class="form-group flex-1">
                                <label>거래 시간 (시:분:초) <span class="required">*</span></label>
                                <input type="time" step="1" v-model="entry.txTime" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>거래 유형 (그룹)</label>
                            <select v-model="entry.presetGroupCd" @change="entry.presetCd = ''">
                                <option value="" disabled>그룹 선택</option>
                                <option v-for="g in presetGroups" :key="g.presetGroupCd" :value="g.presetGroupCd">
                                    {{ g.presetGroupNm }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>프리셋 (상세) <span class="required">*</span></label>
                            <select v-model="entry.presetCd" :disabled="!entry.presetGroupCd">
                                <option value="" disabled>프리셋 선택</option>
                                <option v-for="p in getPresetsByGroup(entry.presetGroupCd)" :key="p.presetCd"
                                    :value="p.presetCd">
                                    {{ p.presetNm }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>금액 <span class="required">*</span></label>
                            <div class="input-with-unit">
                                <input type="number" v-model.number="entry.amount" placeholder="0" min="0">
                                <span class="unit">원</span>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>적요 (메모)</label>
                            <input type="text" v-model="entry.remark" placeholder="어디서, 무엇을 거래했는지 입력 (선택)">
                        </div>
                    </div>
                </div>
            </TransitionGroup>

            <button class="btn-add-card" @click="addEntry()">
                <span class="icon">+</span> 새로운 전표 항목 추가하기
            </button>
        </section>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import mariaApi from '@scripts/util/mariaApi.js'; // 환경에 맞게 수정

// ==========================================
// 1. 기초 마스터 데이터 (Mock Data)
// ==========================================
// DB: bank_id 에 매핑될 계좌/카드 목록
const myAccounts = ref([
    {
        type: '입출금 통장',
        items: [
            { id: 'ACC_001', name: '신한 주거래통장', number: '110-123-456789' },
            { id: 'ACC_002', name: '카카오뱅크 생활비', number: '3333-01-1234567' }
        ]
    },
    {
        type: '신용/체크카드',
        items: [
            { id: 'CARD_001', name: '현대카드 Zero', number: '1234' },
            { id: 'CARD_002', name: '신한카드 Mr.Life', number: '5678' }
        ]
    }
]);

// DB: preset_cd 에 매핑될 프리셋 데이터
const presetGroups = ref([
    { presetGroupCd: 'EXPENSE', presetGroupNm: '지출 (비용)' },
    { presetGroupCd: 'INCOME', presetGroupNm: '수입 (수익)' },
    { presetGroupCd: 'TRANSFER', presetGroupNm: '이체 (자산이동)' }
]);

const presetMasters = ref([
    { presetCd: 'EXP_MEAL', presetNm: '식비 결제', presetGroupCd: 'EXPENSE' },
    { presetCd: 'EXP_TRANS', presetNm: '교통비 결제', presetGroupCd: 'EXPENSE' },
    { presetCd: 'INC_SALARY', presetNm: '급여 입금', presetGroupCd: 'INCOME' },
    { presetCd: 'TRF_SAVE', presetNm: '적금 이체', presetGroupCd: 'TRANSFER' }
]);

// ==========================================
// 2. State Management
// ==========================================
const globalState = reactive({
    baseAccountId: '' // DB: bank_id
});

const entries = ref([]);
let entryIdCounter = 0; // 화면 랜더링용 고유 ID (DB에는 안들어감)

// 날짜/시간 유틸리티 함수
const getCurrentDateStr = () => {
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().split('T')[0];
};

const getCurrentTimeStr = () => {
    // HH:mm:ss 포맷으로 반환
    const now = new Date();
    return now.toTimeString().split(' ')[0];
};

// ==========================================
// 3. Methods
// ==========================================
onMounted(() => {
    addEntry(); // 최초 화면 진입 시 빈 카드 1개 세팅
});

const getPresetsByGroup = (groupCd) => {
    if (!groupCd) return [];
    return presetMasters.value.filter(p => p.presetGroupCd === groupCd);
};

// 카드 신규 추가
const addEntry = () => {
    entries.value.push({
        _id: `entry_${entryIdCounter++}`, // 렌더링용 고유 키
        txDate: getCurrentDateStr(),      // 기본값: 오늘 일자
        txTime: getCurrentTimeStr(),      // 기본값: 현재 시간
        presetGroupCd: '',
        presetCd: '',
        amount: null,
        remark: ''
    });
};

// 💡 카드 복사 기능 (Duplicate)
const copyEntry = (index) => {
    const target = entries.value[index];
    // 깊은 복사 후 고유 ID만 새로 발급하여 바로 아랫줄에 삽입
    const copiedData = {
        ...target,
        _id: `entry_${entryIdCounter++}`
    };
    entries.value.splice(index + 1, 0, copiedData);
};

// 카드 삭제
const removeEntry = (index) => {
    entries.value.splice(index, 1);
};

// 총 합계 계산 (화면 표시용)
const totalAmount = computed(() => {
    return entries.value.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
});

// 서버 전송 (DB 저장)
const saveAllEntries = async () => {
    // 1. 유효성 검사 (Validation)
    if (!globalState.baseAccountId) {
        return alert('거래 계좌/카드를 선택해 주세요.');
    }

    const invalidEntry = entries.value.find(e => !e.txDate || !e.txTime || !e.presetCd || !e.amount || e.amount <= 0);
    if (invalidEntry) {
        return alert('모든 전표의 날짜, 시간, 프리셋, 금액(0보다 커야함)을 정확히 입력해 주세요.');
    }

    // 2. Payload 구성 (DB 컬럼 구조에 맞게 매핑)
    const journalHeaders = entries.value.map(e => {
        // 일자와 시간을 DB의 datetime 형식('YYYY-MM-DD HH:mm:ss')으로 결합
        const jeDateFull = `${e.txDate} ${e.txTime}`;

        return {
            bankId: globalState.baseAccountId, // bank_id
            jeDate: jeDateFull,                // je_date
            presetCd: e.presetCd,              // preset_cd
            amount: e.amount,                  // amount
            remark: e.remark,                  // remark

            // 간접 관리 필드 (프론트에서 고정값으로 넘기거나 백엔드에서 강제 세팅)
            sourceCd: 'MANUAL',                // 수기 분개임을 명시
            status: 'INIT'                     // 초기 입력 상태
            // je_header_no, statement_id, transaction_date 등은 백엔드에서 생성하도록 위임
        };
    });

    console.log('서버로 전송될 Payload (List<JournalHeaderReq>):', journalHeaders);

    // 3. API 전송
    try {
        // 백엔드 컨트롤러가 List 형태를 직접 받거나, 래핑 객체를 받도록 설정되어 있다고 가정
        // await mariaApi.post('/api/journals/manual-batch', journalHeaders);
        alert(`${entries.value.length}건의 전표가 성공적으로 저장되었습니다.`);

        // 성공 시 폼 초기화
        entries.value = [];
        addEntry();
    } catch (error) {
        console.error('저장 실패:', error);
    }
};
</script>

<style lang="scss" scoped>
/* 시스템 기본 변수 */
$primary: #4b74ff;
$primary-hover: #3848c7;
$text-main: #111827;
$text-sub: #4b5563;
$text-light: #9ca3af;
$bg-main: #f5f6fa;
$bg-white: #ffffff;
$border-color: #e5e7eb;
$danger: #ef4444;

.journal-entry-management {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
    font-family: 'Pretendard', sans-serif;
    color: $text-main;

    .page-header {
        margin-bottom: 24px;

        h2 {
            margin: 0 0 8px 0;
            font-size: 24px;
            font-weight: 800;
        }

        p {
            margin: 0;
            color: $text-sub;
            font-size: 14px;
        }
    }
}

/* 상단 액션 바 (고정 영역) */
.d-panel {
    background: $bg-white;
    border-radius: 12px;
    border: 1px solid $border-color;
    padding: 20px 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.top-action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    position: sticky;
    top: 20px;
    z-index: 100;

    .base-account-selector {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 320px;

        label {
            font-size: 13px;
            font-weight: 700;
            color: $text-sub;

            .required {
                color: $danger;
            }
        }

        select {
            padding: 12px;
            border: 1px solid #ced4da;
            border-radius: 8px;
            font-size: 15px;
            outline: none;
            font-weight: 600;

            &:focus {
                border-color: $primary;
                box-shadow: 0 0 0 3px rgba($primary, 0.1);
            }
        }
    }

    .action-buttons {
        display: flex;
        align-items: center;
        gap: 16px;

        .summary-text {
            font-size: 14px;
            color: $text-sub;

            strong {
                color: $primary;
                font-size: 16px;
                font-weight: 800;
            }
        }
    }
}

/* 메인 카드 영역 */
.entry-cards-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 60px;
}

.entry-card {
    background: $bg-white;
    border: 1px solid $border-color;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    transition: all 0.3s ease;

    &:focus-within {
        border-color: $primary;
        box-shadow: 0 4px 12px rgba(75, 116, 255, 0.15);
    }

    .card-header {
        background: #f8fafc;
        padding: 10px 20px;
        border-bottom: 1px solid $border-color;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .entry-number {
            font-size: 14px;
            font-weight: 800;
            color: $text-sub;
        }

        .card-actions {
            display: flex;
            gap: 12px;
            align-items: center;

            .btn-icon-copy {
                background: #eef2ff;
                border: 1px solid #c7d2fe;
                color: #4338ca;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 700;
                cursor: pointer;
                transition: 0.2s;

                &:hover {
                    background: #e0e7ff;
                }
            }

            .btn-icon-danger {
                background: none;
                border: none;
                color: #adb5bd;
                font-size: 18px;
                cursor: pointer;
                transition: 0.2s;

                &:hover {
                    color: $danger;
                    transform: scale(1.1);
                }
            }
        }
    }

    .card-body {
        padding: 20px;
    }
}

/* 폼 요소 */
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 20px;

    .form-group-row {
        display: flex;
        gap: 16px;

        .flex-1 {
            flex: 1;
        }
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;

        &.full-width {
            grid-column: 1 / -1;
        }

        label {
            font-size: 13px;
            font-weight: 600;
            color: $text-sub;

            .required {
                color: $danger;
            }
        }

        input,
        select {
            width: 100%;
            padding: 12px;
            border: 1px solid #ced4da;
            border-radius: 8px;
            font-size: 14px;
            box-sizing: border-box;
            outline: none;
            transition: 0.2s;

            &:focus {
                border-color: $primary;
            }

            &:disabled {
                background: #f3f4f6;
                color: $text-light;
                cursor: not-allowed;
            }

            /* 시간 입력칸에서 초 단위 포맷이 예쁘게 보이도록 폰트 고정 */
            &[type="time"] {
                font-family: monospace;
                font-size: 15px;
            }

            &[type="date"] {
                font-family: monospace;
                font-size: 15px;
            }
        }

        .input-with-unit {
            position: relative;

            input {
                padding-right: 30px;
                text-align: right;
                font-family: monospace;
                font-size: 16px;
                font-weight: 700;
                color: $primary;
            }

            .unit {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: $text-light;
                font-size: 14px;
                font-weight: 600;
                pointer-events: none;
            }
        }
    }
}

/* 카드 추가 버튼 */
.btn-add-card {
    width: 100%;
    padding: 16px;
    background: transparent;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    color: #64748b;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;

    .icon {
        font-size: 18px;
        font-weight: 900;
    }

    &:hover {
        background: #f0fdf4;
        border-color: #86efac;
        color: #16a34a;
    }
}

/* 일반 버튼 */
.btn-primary {
    background: $primary;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    transition: 0.2s;

    &.btn-large {
        padding: 14px 28px;
        font-size: 15px;
    }

    &:hover:not(:disabled) {
        background: $primary-hover;
    }

    &:disabled {
        background: #9ca3af;
        cursor: not-allowed;
        opacity: 0.7;
    }
}

/* Vue 애니메이션 (리스트 추가/제거) */
.list-enter-active,
.list-leave-active {
    transition: all 0.3s ease;
}

.list-enter-from {
    opacity: 0;
    transform: translateY(-20px) scale(0.98);
}

.list-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
}</style>