<template>
    <div class="excel-upload-management">
        <section class="top-action-bar d-panel">
            <div class="base-account-selector">
                <label>거래 귀속 계좌/카드 (bank_id) <span class="required">*</span></label>
                <select v-model="globalState.baseAccountId">
                    <option value="" disabled>일괄 적용될 계좌/카드를 선택하세요</option>
                    <optgroup v-for="group in myAccounts" :key="group.type" :label="group.type">
                        <option v-for="acc in group.items" :key="acc.id" :value="acc.id">
                            {{ acc.name }} ({{ acc.number || '번호없음' }})
                        </option>
                    </optgroup>
                </select>
            </div>

            <div class="action-buttons">
                <button class="btn-primary" @click="saveAllEntries"
                    :disabled="!globalState.baseAccountId || entries.length === 0 || !isAllValid">
                    💾 검증 완료 및 저장
                </button>
            </div>
        </section>

        <section class="upload-zone d-panel" v-if="entries.length === 0">
            <div class="drop-area" :class="{ 'is-dragover': isDragging }" @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop" @click="triggerFileInput">
                <input type="file" ref="fileInput" @change="handleFileSelect" accept=".xlsx, .xls, .csv" hidden />
                <div class="upload-icon">📄</div>
                <h3>여기로 엑셀 파일을 드래그하거나 클릭하여 업로드하세요.</h3>
                <p class="text-light">지원 확장자: .xlsx, .xls, .csv</p>
            </div>
        </section>

        <section class="compact-list-container d-panel" v-else>
            <div class="list-header-actions">
                <div class="summary">
                    총 <strong>{{ entries.length }}</strong>건 (오류: <span class="text-red">{{ errorCount }}</span>건) / 합계
                    <strong>{{ totalAmount.toLocaleString() }}</strong>원
                </div>
                <button class="btn-secondary btn-sm" @click="clearData">초기화 (다시 업로드)</button>
            </div>

            <div class="entry-grid-header">
                <div class="col-no">No.</div>
                <div class="col-status">검증</div>
                <div class="col-date">거래 일자 <span class="required">*</span></div>
                <div class="col-time">거래 시간 <span class="required">*</span></div>
                <div class="col-preset">프리셋 (Preset) <span class="required">*</span></div>
                <div class="col-amt">금액 (원) <span class="required">*</span></div>
                <div class="col-remark">적요 (메모)</div>
                <div class="col-action">관리</div>
            </div>

            <div class="entry-list-body">
                <TransitionGroup name="list">
                    <div class="entry-strip" v-for="(entry, index) in entries" :key="entry._id">

                        <div class="col-no mono text-light">{{ index + 1 }}</div>

                        <div class="col-status">
                            <span class="status-badge" :class="validateRow(entry) === 'OK' ? 'ok' : 'error'"
                                :title="validateRow(entry)">
                                {{ validateRow(entry) === 'OK' ? '✅' : '❌' }}
                            </span>
                        </div>

                        <div class="col-date">
                            <input type="date" v-model="entry.txDate" required class="compact-input"
                                :class="{ 'is-invalid': !entry.txDate }">
                        </div>

                        <div class="col-time">
                            <input type="time" step="1" v-model="entry.txTime" required class="compact-input"
                                :class="{ 'is-invalid': !entry.txTime }">
                        </div>

                        <div class="col-preset">
                            <select v-model="entry.presetCd" class="compact-input" :class="{ 'is-invalid': !entry.presetCd }">
                                <option value="" disabled>프리셋 코드를 매핑하세요</option>
                                <optgroup v-for="g in presetGroups" :key="g.presetGroupCd" :label="g.presetGroupNm">
                                    <option v-for="p in getPresetsByGroup(g.presetGroupCd)" :key="p.presetCd"
                                        :value="p.presetCd">
                                        [{{ p.presetCd }}] {{ p.presetNm }}
                                    </option>
                                </optgroup>
                            </select>
                        </div>

                        <div class="col-amt">
                            <input type="number" v-model.number="entry.amount" placeholder="0" min="0"
                                class="compact-input text-right font-bold text-blue"
                                :class="{ 'is-invalid': !entry.amount || entry.amount <= 0 }">
                        </div>

                        <div class="col-remark">
                            <input type="text" v-model="entry.remark" placeholder="내용 입력" class="compact-input">
                        </div>

                        <div class="col-action action-group">
                            <button class="btn-icon danger" @click="removeEntry(index)" title="이 행 삭제">✕</button>
                        </div>

                    </div>
                </TransitionGroup>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
// import mariaApi from '@scripts/util/mariaApi.js';

// ==========================================
// 1. 기초 마스터 데이터
// ==========================================
const myAccounts = ref([
    {
        type: '입출금 통장',
        items: [{ id: 'ACC_001', name: '신한 주거래통장' }, { id: 'ACC_002', name: '카카오뱅크 생활비' }]
    },
    {
        type: '신용/체크카드',
        items: [{ id: 'CARD_001', name: '현대카드 Zero' }]
    }
]);

const presetGroups = ref([
    { presetGroupCd: 'EXPENSE', presetGroupNm: '지출' },
    { presetGroupCd: 'INCOME', presetGroupNm: '수입' }
]);

const presetMasters = ref([
    { presetCd: 'EXP_MEAL', presetNm: '식비 결제', presetGroupCd: 'EXPENSE' },
    { presetCd: 'EXP_TRANS', presetNm: '교통비 결제', presetGroupCd: 'EXPENSE' },
    { presetCd: 'INC_SALARY', presetNm: '급여 입금', presetGroupCd: 'INCOME' }
]);

const getPresetsByGroup = (groupCd) => {
    return presetMasters.value.filter(p => p.presetGroupCd === groupCd);
};

// ==========================================
// 2. State Management
// ==========================================
const globalState = reactive({ baseAccountId: '' });
const entries = ref([]);
const isDragging = ref(false);
const fileInput = ref(null);
let entryIdCounter = 0;

// ==========================================
// 3. File Upload & Processing
// ==========================================
const triggerFileInput = () => fileInput.value.click();

const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) processExcelFile(file);
    event.target.value = ''; // 초기화
};

const handleDrop = (event) => {
    isDragging.value = false;
    const file = event.dataTransfer.files[0];
    if (file) processExcelFile(file);
};

// 실제로는 xlsx 라이브러리로 파싱해야 하지만, 여기서는 파싱되었다고 가정하고 Mock Data 세팅
const processExcelFile = (file) => {
    console.log('업로드된 파일:', file.name);

    // 시뮬레이션용 파싱 결과 (정상 데이터, 금액 누락 데이터, 프리셋 오타 데이터 섞음)
    entries.value = [
        { _id: `entry_${entryIdCounter++}`, txDate: '2026-03-08', txTime: '12:30:00', presetCd: 'EXP_MEAL', amount: 15000, remark: '점심 식대' },
        { _id: `entry_${entryIdCounter++}`, txDate: '2026-03-08', txTime: '18:45:00', presetCd: 'EXP_TRANS', amount: 2500, remark: '퇴근 택시' },
        { _id: `entry_${entryIdCounter++}`, txDate: '2026-03-09', txTime: '09:00:00', presetCd: '', amount: 5000, remark: '프리셋 누락 테스트' },
        { _id: `entry_${entryIdCounter++}`, txDate: '', txTime: '10:00:00', presetCd: 'INC_SALARY', amount: 0, remark: '날짜/금액 누락 테스트' }
    ];
};

const clearData = () => {
    if (confirm('작업 중인 내용을 지우고 파일을 다시 업로드하시겠습니까?')) {
        entries.value = [];
    }
};

const downloadTemplate = () => {
    alert('엑셀 템플릿 파일(.xlsx) 다운로드를 트리거합니다.');
    // location.href = '/api/system/preset/excel-template';
};

// ==========================================
// 4. Grid Validation & Save
// ==========================================
const removeEntry = (index) => entries.value.splice(index, 1);

const totalAmount = computed(() => entries.value.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0));

// 각 행별 검증 로직
const validateRow = (entry) => {
    if (!entry.txDate) return '날짜가 누락되었습니다.';
    if (!entry.txTime) return '시간이 누락되었습니다.';
    if (!entry.presetCd) return '프리셋 코드가 지정되지 않았습니다.';
    if (!entry.amount || entry.amount <= 0) return '금액은 0보다 커야 합니다.';
    return 'OK';
};

// 오류 건수 계산
const errorCount = computed(() => {
    return entries.value.filter(e => validateRow(e) !== 'OK').length;
});

// 전체 유효성 패스 여부 (저장 버튼 활성화 용도)
const isAllValid = computed(() => entries.value.length > 0 && errorCount.value === 0);

const saveAllEntries = async () => {
    if (!isAllValid.value) return alert('오류가 있는 행을 수정하거나 삭제한 후 저장해주세요.');
    if (!globalState.baseAccountId) return alert('거래 계좌/카드를 선택해 주세요.');

    const journalHeaders = entries.value.map(e => ({
        bankId: globalState.baseAccountId,
        jeDate: `${e.txDate} ${e.txTime}`,
        presetCd: e.presetCd,
        amount: e.amount,
        remark: e.remark,
        sourceCd: 'EXCEL_UPLOAD', // 엑셀 업로드 출처 명시
        status: 'INIT'
    }));

    console.log('Payload:', journalHeaders);

    try {
        // await mariaApi.post('/api/journals/batch', journalHeaders);
        alert(`${entries.value.length}건 엑셀 일괄 등록 완료!`);
        entries.value = []; // 성공 시 비움
    } catch (error) {
        console.error('저장 실패:', error);
    }
};
</script>

<style lang="scss" scoped>
$primary: #4b74ff;
$primary-hover: #3848c7;
$text-main: #111827;
$text-sub: #4b5563;
$text-light: #9ca3af;
$bg-main: #f5f6fa;
$bg-white: #ffffff;
$border-color: #e5e7eb;
$danger: #ef4444;
$blue: #2563eb;
$success: #10b981;

.excel-upload-management {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    font-family: 'Pretendard', sans-serif;
    color: $text-main;

    .page-header {
        margin-bottom: 20px;

        h2 {
            margin: 0 0 4px 0;
            font-size: 22px;
            font-weight: 800;
        }

        p {
            margin: 0;
            color: $text-sub;
            font-size: 13px;
        }
    }
}

.d-panel {
    background: $bg-white;
    border-radius: 10px;
    border: 1px solid $border-color;
    padding: 16px 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
    margin-bottom: 20px;
}

/* 상단 액션 바 */
.top-action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .base-account-selector {
        display: flex;
        align-items: center;
        gap: 12px;

        label {
            font-size: 13px;
            font-weight: 700;
            color: $text-sub;
            margin: 0;

            .required {
                color: $danger;
            }
        }

        select {
            padding: 8px 12px;
            border: 1px solid #ced4da;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            outline: none;
            width: 280px;

            &:focus {
                border-color: $primary;
            }
        }
    }

    .action-buttons {
        display: flex;
        gap: 10px;
    }
}

/* 파일 업로드 영역 */
.upload-zone {
    padding: 40px;
    display: flex;
    justify-content: center;
    align-items: center;

    .drop-area {
        width: 100%;
        max-width: 600px;
        padding: 60px 20px;
        text-align: center;
        border: 2px dashed #cbd5e1;
        border-radius: 12px;
        background: #f8fafc;
        cursor: pointer;
        transition: all 0.2s;

        .upload-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.8;
        }

        h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #334155;
        }

        p {
            margin: 0;
            font-size: 13px;
        }

        &:hover,
        &.is-dragover {
            background: #eff6ff;
            border-color: $primary;

            .upload-icon {
                transform: scale(1.1);
            }
        }
    }
}

/* 그리드 레이아웃 (엑셀 뷰) */
/* 비율: No(40) | Status(80) | Date(130) | Time(110) | Preset(220) | Amt(130) | Remark(1fr) | Action(50) */
.compact-list-container {
    padding: 0;
    overflow: hidden;

    .list-header-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        border-bottom: 1px solid $border-color;

        .summary {
            font-size: 14px;
            color: $text-sub;

            strong {
                color: $primary;
                font-size: 15px;
                font-weight: 800;
            }

            .text-red {
                color: $danger;
                font-weight: 800;
            }
        }
    }
}

.entry-grid-header {
    display: grid;
    grid-template-columns: 35px 50px 130px 140px 200px 130px 1fr 50px;
    gap: 8px;
    background: #f8fafc;
    padding: 10px 16px;
    border-bottom: 1px solid $border-color;
    font-size: 12px;
    font-weight: 700;
    color: $text-sub;
    align-items: center;

    .required {
        color: $danger;
    }

    .col-no,
    .col-status,
    .col-amt,
    .col-action {
        text-align: center;
    }
}

.entry-list-body {
    max-height: 55vh;
    overflow-y: auto;
    padding-bottom: 8px;
}

.entry-strip {
    display: grid;
    grid-template-columns: 35px 50px 130px 140px 200px 130px 1fr 50px;
    gap: 8px;
    padding: 8px 16px;
    border-bottom: 1px solid #f1f3f5;
    align-items: center;
    transition: 0.2s;

    &:hover {
        background-color: #f8faff;
    }

    .col-no {
        text-align: center;
        font-size: 13px;
    }

    .col-status {
        text-align: center;
        width: 50px;
    }

    .col-action {
        display: flex;
        justify-content: center;
    }

    .status-badge {
        display: inline-block;
        padding: 4px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 800;
        cursor: help;

        &.ok {
            background: #d1fae5;
            color: #065f46;
        }

        &.error {
            background: #fee2e2;
            color: #991b1b;
        }
    }

    /* 컴팩트 Input 스타일 */
    .compact-input {
        width: 100%;
        height: 32px;
        padding: 4px 8px;
        border: 1px solid transparent;
        border-radius: 4px;
        background: transparent;
        font-size: 13px;
        font-family: 'Pretendard', sans-serif;
        box-sizing: border-box;
        outline: none;
        transition: 0.2s;

        &:hover {
            border-color: #e2e8f0;
            background: #ffffff;
        }

        &:focus {
            border-color: $primary;
            background: #ffffff;
            box-shadow: 0 0 0 2px rgba(75, 116, 255, 0.1);
        }

        &.is-invalid {
            border-color: $danger;
            background: #fff5f5;
        }

        &[type="date"],
        &[type="time"] {
            font-family: monospace;
            font-size: 13px;
            letter-spacing: -0.5px;
        }
    }

    .text-right {
        text-align: right;
    }

    .font-bold {
        font-weight: 700;
    }

    .text-blue {
        color: $blue;
    }

    .text-light {
        color: $text-light;
    }

    .mono {
        font-family: monospace;
    }
}

/* 버튼 */
.btn-icon {
    width: 26px;
    height: 26px;
    border: none;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s;

    &.danger {
        color: #94a3b8;
        font-size: 15px;

        &:hover {
            background: #fef2f2;
            color: $danger;
        }
    }
}

.btn-primary {
    background: $primary;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 700;
    border-radius: 6px;
    cursor: pointer;
    transition: 0.2s;

    &:hover:not(:disabled) {
        background: $primary-hover;
    }

    &:disabled {
        background: #cbd5e1;
        cursor: not-allowed;
    }
}

.btn-ghost {
    background: white;
    color: $text-sub;
    border: 1px solid #ced4da;
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 700;
    border-radius: 6px;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
        background: #f1f3f5;
    }
}

.btn-secondary {
    background: white;
    color: $text-sub;
    border: 1px solid #ced4da;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background: #f1f3f5;
    }
}

.list-enter-active,
.list-leave-active {
    transition: all 0.2s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}</style>