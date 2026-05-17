<template>
    <div id="journal-upload-management" class="d-container">
        <h2 style="text-align: start; margin: 0 1.3rem;">{{ route.meta.title }}</h2>

        <section class="top-action-bar d-panel">
            <div class="left-controls">
                <div class="base-account-selector">
                    <label>거래 귀속 계좌/카드<span class="required">*</span></label>
                    <MSelect 
                        v-model="selectedAccount"
                        :groups="baseAccountGroups"
                        placeholder="선택하세요"
                        :grid="true"
                        code-label="계좌번호"
                        name-label="계좌명"
                    />
                </div>

                <div class="divider-v" v-if="tempFileList.length > 0"></div>

                <div class="temp-file-selector" v-if="tempFileList.length > 0">
                    <label>임시저장 불러오기</label>
                    <select v-model="selectedTempFile" @change="loadTempFile">
                        <option :value="null">파일을 선택하세요</option>
                        <option v-for="fileName in tempFileList" :key="fileName" :value="fileName">
                            {{ fileName }}
                        </option>
                    </select>
                </div>
            </div>
        </section>


        <div class="action-buttons">
            <button class="btn-ghost" @click="tempSave" :disabled="entries.length === 0">
                임시저장
            </button>
            <button class="btn-primary" @click="saveAllEntries"
                :disabled="!globalState.baseAccountId || entries.length === 0 || !isAllValid">
                💾 검증 완료 및 저장
            </button>
        </div>

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
                <div class="col-date">거래 일자</div>
                <div class="col-entry">입출금</div>
                <div class="col-preset">프리셋 (Preset) <span class="required">*</span></div>
                <div class="col-amt">금액 (원)</div>
                <div class="col-remark">적요 (메모)</div>
            </div>

            <div class="entry-list-body">
                <TransitionGroup name="list">
                    <div class="entry-strip" v-for="(entry, index) in entries" :key="index">
                        <!-- No. -->
                        <div class="col-no mono text-light">{{ index + 1 }}</div>

                        <!-- 검증 -->
                        <div class="col-status">
                            <span class="status-badge" :class="validateRow(entry) === 'OK' ? 'ok' : 'error'"
                                :title="validateRow(entry)">
                                {{ validateRow(entry) === 'OK' ? '✅' : '❌' }}
                            </span>
                        </div>

                        <!-- 거래일자 -->
                        <div class="col-date">
                            <div class="ymd">{{ entry.ymd }}</div>
                            <div class="times">{{ entry.times }}</div>
                            <!-- <input type="date" v-model="entry.ymd" required class="compact-input"
                                :class="{ 'is-invalid': !entry.ymd }"> -->
                        </div>

                        <!-- 입출금 -->
                        <div class="col-entry">
                            {{ entry.entryCd == '' ? entry.entryNm : (entry.entryCd == '1' ? '지출' : '수익' ) }}
                        </div>

                        <!-- 프리셋 -->
                        <div class="col-preset">
                            <!--   -->
                            <MSelect
                                v-model="entry.presetCd"
                                :groups="presetSelectGroups"
                                placeholder="프리셋 코드를 매핑하세요"
                                :is-invalid="!entry.presetCd"
                                :grid="true"
                                code-label="코드"
                                name-label="프리셋명"
                            />
                        </div>

                        <div class="col-amt">
                            <input type="text" :value="entry.amount ? entry.amount.toLocaleString() : ''" placeholder="0" readonly
                                class="compact-input text-right font-bold text-blue"
                                :class="{ 'is-invalid': !entry.amount || entry.amount <= 0 }">
                        </div>

                        <div class="col-remark">
                            <input type="text" v-model="entry.remark" placeholder="내용 입력" class="compact-input">
                        </div>

                    </div>
                </TransitionGroup>
            </div>
        </section>
    </div>
</template>

<script setup>
    import mariaApi from '@scripts/util/mariaApi.js';
    import { getResourceList } from '@scripts/util/common/SettingResource.js';
    import MSelect from '@/components/common/comp/MSelect.vue';

    const route = useRoute();
    // ==========================================
    // State Management
    // ==========================================
    const globalState = reactive({ baseAccountId: '' });
    const entries = ref([]);
    const isDragging = ref(false);
    const fileInput = ref(null);
    const selectedAccount = ref(null);
    const fileData = ref(null);

    const presetGroupList = ref([]);
    const tempFileList = ref([]);
    const selectedTempFile = ref(null);

    const options = reactive({
        cardCdList: [],
        bankCdList: [],
        baseAccountId: []
    });

    // MSelect groups 포맷으로 변환 (grid 모드: code/name 분리)
    const presetSelectGroups = computed(() =>
        presetGroupList.value.map(g => ({
            label: g.presetGroupNm,
            items: (g.headerList || []).map(p => ({
                value: p.presetCd,
                code: p.presetCd,
                name: p.presetNm
            }))
        }))
    );

    const baseAccountGroups = computed(() => {
        return options.baseAccountId.map(g => ({
            label: g.type,
            items: (g.items).map(p => ({
                value: p.id,
                code: p.number,
                name: p.name
            }))
        }))
    })

    // selectedAccount 변경 시 globalState 동기화 및 프리셋 목록 초기화
    watch(selectedAccount, async (newVal) => {
        if (!newVal) {
            globalState.baseAccountId = '';
            presetGroupList.value = [];
            return;
        }
        globalState.baseAccountId = newVal;
        presetGroupList.value = [];

        const cdType = getAccountType(newVal);
        await getPresetGroupList(cdType);
    })

    // 선택된 계좌 id가 bank/card 중 어느 그룹인지 반환
    const getAccountType = (accountId) => {
        const bankGroup = options.baseAccountId.find(g => g.type === '입출금 통장');
        const isBank = bankGroup?.items.some(item => item.id == accountId);
        return isBank ? 'bank' : 'card';
    }


    onMounted(async () => {
        await getMyAccountList();
        await getTempFileList();
    });

    const getTempFileList = async () => {
        try {
            const { data } = await mariaApi.get('/api/account/journal/temp/files');
            tempFileList.value = data || [];
        } catch (e) {
            console.error('임시저장 파일 목록 조회 실패:', e);
        }
    };

    const loadTempFile = async () => {
        if (!selectedTempFile.value) return;

        try {
            entries.value = [];
            const { data } = await mariaApi.get('/api/account/journal/temp', {
                params: { tempFileNm: selectedTempFile.value }
            });
            const loadedEntries = Array.isArray(data) ? data : (data?.jeHeaderList ?? []);
            entries.value = loadedEntries;
            console.log(entries.value);

            if (entries.value.length === 0) {
                alert('불러온 임시저장 파일에 데이터가 없습니다.');
                return;
            }

            // 계좌/카드가 선택된 경우 프리셋 목록도 로드
            if (!selectedAccount.value && presetGroupList.value.length === 0) {
                const tempAcctId = entries.value[0].acctId;
                
                // options.baseAccountId 에서 tempAcctId 에 해당하는 계좌를 찾아 selectedAccount 설정
                let found = false;
                for (const g of options.baseAccountId) {
                    for (const t of g.items) {
                        if (t.id == tempAcctId) {
                            selectedAccount.value = t.id;
                            globalState.baseAccountId = tempAcctId;
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }

                const cdType = getAccountType(tempAcctId);
                await getPresetGroupList(cdType);
            }
        } catch (e) {
            console.error('임시저장 파일 불러오기 실패:', e);
            alert('임시저장 파일을 불러오는 중 오류가 발생했습니다.');
        }
    };

    const getPresetGroupList = async (cdType) => {
        // if (selectedAccount.value == null || selectedAccount.value == '') {
        //     alert("선택된 계좌/카드 유형이 없습니다.");
        //     return false;
        // }

        const param = {
            payType: cdType.toUpperCase()
        }

        const { data } = await mariaApi.get('/api/system-infos/preset/headers/groups', { params: param });
        data.forEach(d => {
            presetGroupList.value.push(d);
        })
    }

    const getMyAccountList = async () => {
        const params = {
            enabledFlag: 'Y'
        }

        const bankResult = await mariaApi.get('/api/account/info/bank-accounts', {params: params });
        options.baseAccountId.push({
            type: '입출금 통장',
            items: bankResult.data.map(b => { return {id: b.bankId, name: b.bankNm, number: b.bankAcct} })
        })
        const cardResult = await mariaApi.get('/api/account/info/card-accounts', { params: params });
        options.baseAccountId.push({
            type: '결제 카드',
            items: cardResult.data.map(c => { return {id: c.cardId, name: c.cardNm, number: c.cardNo} })
        })

        console.log(options.baseAccountId)
    }

// ==========================================
// 3. File Upload & Processing
// ==========================================
const triggerFileInput = () => fileInput.value.click();

const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        processExcelFile(file);
    }
    event.target.value = ''; // 초기화
};

const processExcelFile = async (file) => {
    if (!selectedAccount.value) {
        alert("업로드 타입 선택이 안되어있습니다.");
        return false;
    }
    if (file == null) {
        return false;
    }
    fileData.value = file;
    const formData = new FormData();
    formData.append('file', file);
    
    const accountType = getAccountType(selectedAccount.value);
    const cdType = accountType === 'bank' ? 'bankCd' : 'cardCd';
    formData.append(cdType, selectedAccount.value);

    const { data } = await mariaApi.post('/api/excel/journal', formData);
    entries.value = data || [];
    
    if (entries.value.length < 1) {
        alert("추출된 거래내역이 없습니다.");
    }
};

const handleDrop = (event) => {
    isDragging.value = false;
    const file = event.dataTransfer.files[0];
    if (file) processExcelFile(file);
};

const clearData = () => {
    if (confirm('작업 중인 내용을 지우고 파일을 다시 업로드하시겠습니까?')) {
        entries.value = [];
    }
};

// 💡 엑셀 양식 다운로드 함수
// const downloadTemplate = () => {
//     // public 폴더 기준 절대 경로를 적어줍니다.
//     const link = document.createElement('a');
//     link.href = '/assets/excel/upload_template.xlsx'; // public 폴더 안의 파일 경로
//     link.download = '일괄업로드_양식.xlsx'; // 다운로드될 때의 파일명
//     link.click();
// };

// ==========================================
// 4. Grid Validation & Save
// ==========================================
const removeEntry = (index) => entries.value.splice(index, 1);

const totalAmount = computed(() => entries.value.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0));

// 각 행별 검증 로직
const validateRow = (entry) => {
    if (!entry.ymd) return '날짜가 누락되었습니다.';
    if (!entry.times) return '시간이 누락되었습니다.';
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

/**
 * 임시저장
 */
const tempSave = async () => {
    console.log(selectedAccount.value);
    // try {
    //     const bodyParam = {
    //         tempList: entries.value,
    //         tempFileName: selectedTempFile.value || fileData.value.name.split('.')[0],
    //         acctId: `${selectedAccount.value}`
    //     }
    //     const result = await mariaApi.post('/api/account/journal/temp', bodyParam)

    //     if (result.success) {
    //         await getTempFileList();
    //     }
    // } catch(e) {
    //     console.error(e)
    // }
}

/**
 * 검증 완료 및 저장
 */
const saveAllEntries = async () => {
    if (!isAllValid.value) return alert('오류가 있는 행을 수정하거나 삭제한 후 저장해주세요.');
    if (!globalState.baseAccountId) return alert('거래 계좌/카드를 선택해 주세요.');

    const journalHeaders = entries.value.map(e => ({
        bankId: globalState.baseAccountId,
        jeDate: e.ymd,
        jeTimes: e.times,
        presetCd: e.presetCd,
        amount: e.amount,
        remark: e.remark,
        sourceCd: 'MA', 
        categoryCd: 'BULK',
        status: 'INIT'
    }));

    try {

        const { data } = await mariaApi.post('/api/account/journal', {
            jeHeaderList: journalHeaders,
            tempFileNm: selectedTempFile.value || fileData.value.name.split('.')[0]
        });

        alert(`${entries.value.length}건 엑셀 일괄 등록 완료!`);
        entries.value = []; // 성공 시 비움
    } catch (error) {
        console.error('저장 실패:', error);
    }
};

// ==========================================
// 4. Handler
// ==========================================

</script>

<style lang="scss" scoped>
@use '@@/common.scss' as *;

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

/* 상단 액션 바 */
.top-action-bar {
    display: flex;
    flex-direction: column;
    align-items: left;

    .left-controls {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .divider-v {
        width: 1px;
        height: 28px;
        background: $border-color;
    }

    .base-account-selector,
    .temp-file-selector {
        display: flex;
        align-items: center;
        gap: 12px;

        label {
            font-size: 13px;
            font-weight: 700;
            color: $text-sub;
            margin: 0;
            white-space: nowrap;

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
            width: fit-content;

            &:focus {
                border-color: $primary;
            }
        }
    }

    .temp-file-selector {
        select {
            color: $text-main;
            font-weight: 500;
            min-width: 180px;
        }
    }

    
}
.action-buttons {
    margin: 0rem 1.3rem;
    display: flex;
    gap: 10px;
    justify-content: end;
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
    grid-template-columns: 35px 50px 100px 60px 200px 130px 1fr 50px;
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
    grid-template-columns: 35px 50px 100px 60px 200px 130px 1fr 50px;
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

    .col-date {
        .ymd {
            text-align: center;
            font-size: 14px;
            font-weight: 700;
            color: $text-main;
        }
        .times {
            text-align: center;
            font-size: 12px;
            color: $text-sub;
        }
    }

    .col-entry {
        text-align: center;
        font-size: 14px;
        font-weight: 600;
    }

    .col-preset {
        width: 16rem;
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
}
</style>