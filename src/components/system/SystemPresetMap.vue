<template>
    <div class="preset-mapping-management">

        <section class="top-section d-panel">
            <div class="preset-selector-row">
                <div class="form-group">
                    <label>프리셋 (Preset Header)</label>
                    <select v-model="selectedPresetCd" @change="loadMappingLines">
                        <option value="" disabled>매핑을 설정할 프리셋을 선택하세요</option>
                        <optgroup v-for="group in groupedPresets" :key="group.groupNm" :label="group.groupNm">
                            <option v-for="p in group.items" :key="p.presetCd" :value="p.presetCd">
                                [{{ p.presetCd }}] {{ p.presetNm }}
                            </option>
                        </optgroup>
                    </select>
                </div>

                <div class="preset-info-card" v-if="selectedPresetInfo">
                    <div class="info-item">
                        <span class="label">소속 그룹</span>
                        <span class="value">{{ selectedPresetInfo.groupNm }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">설명</span>
                        <span class="value">{{ selectedPresetInfo.description || '-' }}</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="bottom-section d-panel" v-if="selectedPresetCd">
            <div class="panel-header flex-between">
                <h3>분개 매핑 룰 (Mapping Lines)</h3>
                <div class="action-buttons">
                    <button class="btn-secondary" @click="openTestModal">
                        🧪 시뮬레이션 테스트
                    </button>
                    <button class="btn-primary" @click="saveMapping">
                        💾 매핑 저장
                    </button>
                </div>
            </div>

            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th class="col-line">No.</th>
                            <th class="col-dc">차/대 (D/C)</th>
                            <th class="col-acct">계정과목 (Account)</th>
                            <th class="col-type">금액 유형</th>
                            <th class="col-amt">비율/금액 값</th>
                            <th class="col-remark">기본 적요 (Remark)</th>
                            <th class="col-action">삭제</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(line, index) in mappingLines" :key="index">
                            <td class="col-line mono">{{ index + 1 }}</td>
                            <td class="col-dc">
                                <select v-model="line.dcFlag"
                                    :class="{ 'text-blue': line.dcFlag === 'D', 'text-red': line.dcFlag === 'C' }"
                                    @change="checkValidation">
                                    <option value="D">차변 (D)</option>
                                    <option value="C">대변 (C)</option>
                                </select>
                            </td>
                            <td class="col-acct">
                                <div class="custom-autosearch" @click.stop>
                                    <input 
                                        type="text" 
                                        v-model="line.searchKeyword" 
                                        @focus="openDropdown(line, index)"
                                        @input="handleInput(index, $event.target.value, line.dcFlag)"
                                        placeholder="계정과목 검색 (2글자 이상)"
                                        class="search-input"
                                    >
                                    
                                    <div class="dropdown-list" v-show="activeDropdown === index">
                                        <div class="status-msg" v-if="isSearching">
                                            ⏳ 검색 중...
                                        </div>
                                        <ul v-else-if="filteredAccounts.length > 0">
                                            <li 
                                                v-for="acc in filteredAccounts" 
                                                :key="acc.code" 
                                                @click="selectAccount(index, acc)"
                                            >
                                                <span class="acc-text">[{{ acc.code }}] {{ acc.name }}</span>
                                            </li>
                                        </ul>
                                        <div class="status-msg empty" v-else-if="line.searchKeyword && line.searchKeyword.length >= 2">
                                            검색 결과가 없습니다.
                                        </div>
                                        <div class="status-msg info" v-else>
                                            검색어를 2글자 이상 입력해주세요.
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="col-type">
                                <select v-model="line.amountType">
                                    <option value="PERCENT">비율 (%)</option>
                                    <option value="FIXED">고정 금액 (₩)</option>
                                </select>
                            </td>
                            <td class="col-amt">
                                <div class="input-with-unit">
                                    <input type="number" v-model.number="line.amount" placeholder="0">
                                    <span class="unit">{{ line.amountType === 'PERCENT' ? '%' : '원' }}</span>
                                </div>
                            </td>
                            <td class="col-remark">
                                <input type="text" v-model="line.defaultRemark" placeholder="예: 식비 결제">
                            </td>
                            <td class="col-action">
                                <button class="btn-icon-danger" @click="removeLine(index)" title="라인 삭제">✕</button>
                            </td>
                        </tr>
                        <tr v-if="mappingLines.length === 0">
                            <td colspan="7" class="empty-state">
                                하단의 [+ 라인 추가] 버튼을 눌러 분개 룰을 만들어 주세요.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="add-line-wrapper">
                <button class="btn-add-line" @click="addLine('D')">+ 차변(D) 추가</button>
                <button class="btn-add-line credit" @click="addLine('C')">+ 대변(C) 추가</button>
            </div>

            <div class="validation-warning" v-if="validationMsg">
                ⚠️ {{ validationMsg }}
            </div>
        </section>

        <div class="placeholder-section" v-else>
            <div class="empty-icon">☝️</div>
            <p>상단에서 매핑을 설정할 프리셋을 먼저 선택해 주세요.</p>
        </div>

        <Transition name="fade">
            <div v-if="isTestModalOpen" class="modal-overlay" @click.self="closeTestModal">
                <div class="modal-container modal-lg">
                    <header class="modal-header">
                        <div>
                            <h4>매핑 시뮬레이션</h4>
                            <p class="modal-sub">입력 금액을 바탕으로 생성될 실제 전표를 미리 확인합니다.</p>
                        </div>
                        <button class="btn-close" @click="closeTestModal">&times;</button>
                    </header>

                    <div class="modal-body">
                        <div class="test-input-card">
                            <label>가상 입력 금액 (Input Amount)</label>
                            <div class="input-with-unit large">
                                <input type="number" v-model.number="testAmount" placeholder="금액을 입력하세요">
                                <span class="unit">원</span>
                            </div>
                        </div>

                        <div class="journal-preview">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th style="width: 80px;">구분</th>
                                        <th>계정과목</th>
                                        <th>적요 (Remark)</th>
                                        <th style="width: 130px; text-align: right;">차변 (Debit)</th>
                                        <th style="width: 130px; text-align: right;">대변 (Credit)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(sim, idx) in simulatedLines" :key="idx">
                                        <td class="center">
                                            <span :class="['badge', sim.dcFlag === 'D' ? 'badge-blue' : 'badge-red']">
                                                {{ sim.dcFlag === 'D' ? '차변' : '대변' }}
                                            </span>
                                        </td>
                                        <td>{{ sim.acctCd ? `(${sim.acctCd}) ${sim.acctNm}` : '미지정' }}</td>
                                        <td>{{ sim.remark || '-' }}</td>
                                        <td class="right mono text-blue">{{ sim.dcFlag === 'D' ?
                                            sim.calcAmount.toLocaleString() : '' }}</td>
                                        <td class="right mono text-red">{{ sim.dcFlag === 'C' ?
                                            sim.calcAmount.toLocaleString() : '' }}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="3" class="right font-bold">합 계</td>
                                        <td class="right mono font-bold text-blue">{{ totalDebit.toLocaleString() }}</td>
                                        <td class="right mono font-bold text-red">{{ totalCredit.toLocaleString() }}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div class="diff-warning" v-if="totalDebit !== totalCredit">
                            🚨 차변과 대변의 합계가 <strong>{{ Math.abs(totalDebit - totalCredit).toLocaleString()
                            }}원</strong> 차이납니다. 매핑 비율을 확인하세요.
                        </div>
                        <div class="diff-success" v-else-if="totalDebit > 0 && totalDebit === totalCredit">
                            ✅ 대차가 완벽하게 일치합니다. 전표가 정상적으로 발행될 수 있습니다.
                        </div>
                    </div>

                    <footer class="modal-footer">
                        <button type="button" class="btn-primary" @click="closeTestModal">확인 완료</button>
                    </footer>
                </div>
            </div>
        </Transition>

    </div>
</template>

<script setup>
import mariaApi from '@scripts/util/mariaApi.js';

// ==========================================
// State & Computed
// ==========================================
const selectedPresetCd = ref('');
const mappingLines = ref([]);
const validationMsg = ref('');
const presetGroups = ref([]);

onMounted(async () => {
    document.addEventListener('click', closeDropdown);
    await getPresetGroupList();
});

onUnmounted(() => {
    document.removeEventListener('click', closeDropdown);
});

const getPresetGroupList = async () => {
    const { data } = await mariaApi.get('/api/system-infos/preset/headers/groups');
    presetGroups.value = data;
}

// 프리셋 그룹화
const groupedPresets = computed(() => {
    const groups = {};
    presetGroups.value.forEach(p => {
        groups[p.presetGroupNm] = p.headerList;
    });
    return Object.keys(groups).map(k => ({ groupNm: k, items: groups[k] }));
});

const selectedPresetInfo = computed(() => {
    return presetGroups.value.find(p => p.presetCd === selectedPresetCd.value) || null;
});

// ==========================================
// AutoSearch (계정 검색 API 연동) 관련
// ==========================================
const activeDropdown = ref(null);
const filteredAccounts = ref([]);
const isSearching = ref(false);
let searchTimeout = null;

const openDropdown = (line, index) => {
    activeDropdown.value = index;
    const keyword = mappingLines.value[index].searchKeyword;
    const dcFlag = line.dcFlag;
    
    // 포커스 시점에 2글자 이상이면 검색 진행, 아니면 초기화
    if (keyword && keyword.length >= 2) {
        fetchAccounts(keyword, dcFlag);
    } else {
        filteredAccounts.value = [];
    }
};

const handleInput = (index, keyword, dcFlag) => {
    activeDropdown.value = index;

    // 디바운스 적용 (300ms)
    if (searchTimeout) clearTimeout(searchTimeout);

    if (keyword.length < 2) {
        filteredAccounts.value = [];
        isSearching.value = false;
        return;
    }

    searchTimeout = setTimeout(() => {
        fetchAccounts(keyword, dcFlag);
    }, 300);
};

const fetchAccounts = async (keyword, dcFlag) => {
    isSearching.value = true;
    try {
        const searchParam = { searchTxt: keyword, dcFlag: dcFlag, enabledFlag: 'Y', finalFlag: 'Y' };
        const { data } = await mariaApi.get('/api/system-infos/acct/search', { params: searchParam });

        filteredAccounts.value = data.length > 0 ? data : [];
    } catch (error) {
        console.error('계정 검색 중 오류 발생:', error);
        filteredAccounts.value = [];
    } finally {
        isSearching.value = false;
    }
};

const selectAccount = (index, acc) => {
    const line = mappingLines.value[index];
    line.acctCd = acc.code;
    line.acctNm = acc.name;
    line.searchKeyword = `(${acc.code}) ${acc.name}`; // 화면에 표시될 텍스트
    
    activeDropdown.value = null;
    filteredAccounts.value = [];
};

const closeDropdown = () => {
    if (activeDropdown.value !== null) {
        const line = mappingLines.value[activeDropdown.value];
        // 드롭다운이 닫힐 때, 정상적인 계정이 선택되지 않은 채 텍스트만 바뀌었다면 원래 값으로 복원
        line.searchKeyword = line.acctCd ? `(${line.acctCd}) ${line.acctNm}` : '';
        
        activeDropdown.value = null;
        filteredAccounts.value = [];
    }
};

// ==========================================
// 4. Methods (Line Management)
// ==========================================
const loadMappingLines = async () => {
    const { data } = await mariaApi.get(`/api/system-infos/preset/mappings/${selectedPresetCd.value}`)
    mappingLines.value = data;
    mappingLines.value.forEach(m => {
        m.searchKeyword = `(${m.acctCd}) ${m.acctNm}`;
    })
    validationMsg.value = '';
};

const addLine = (dcFlag) => {
    mappingLines.value.push({
        lineNum: mappingLines.value.length + 1,
        dcFlag: dcFlag,
        acctCd: '',
        acctNm: '',
        searchKeyword: '',
        amountType: 'PERCENT',
        amount: 100,
        defaultRemark: ''
    });
    checkValidation();
};

const removeLine = (index) => {
    mappingLines.value.splice(index, 1);
    checkValidation();
};

const checkValidation = () => {
    const hasDebit = mappingLines.value.some(l => l.dcFlag === 'D');
    const hasCredit = mappingLines.value.some(l => l.dcFlag === 'C');

    if (mappingLines.value.length > 0 && (!hasDebit || !hasCredit)) {
        validationMsg.value = '차변과 대변이 각각 1개 이상 존재해야 정상적인 전표가 생성됩니다.';
    } else {
        validationMsg.value = '';
    }
};

const saveMapping = async () => {
    if (mappingLines.value.length === 0) return alert('저장할 매핑 라인이 없습니다.');
    if (mappingLines.value.some(l => !l.acctCd)) return alert('모든 라인에 계정과목을 검색하여 지정해야 합니다.');

    mappingLines.value.forEach((l, idx) => l.lineNum = idx + 1);

    const payload = {
        presetCd: selectedPresetCd.value,
        mapList: mappingLines.value.map(l => ({
            presetCd: selectedPresetCd.value,
            lineNum: l.lineNum,
            dcFlag: l.dcFlag,
            acctCd: l.acctCd,
            amountType: l.amountType,
            amount: l.amount,
            defaultRemark: l.defaultRemark
        })) // 서버 전송 시 UI용 상태(searchKeyword, acctNm) 제외
    };

    await mariaApi.post('/api/system-infos/preset/mappings', payload);
    await loadMappingLines();
};


// ==========================================
// 5. Test Simulation Modal
// ==========================================
const isTestModalOpen = ref(false);
const testAmount = ref(10000);

const openTestModal = () => {
    if (mappingLines.value.length === 0) return alert('먼저 매핑 룰을 등록해 주세요.');
    isTestModalOpen.value = true;
};

const closeTestModal = () => isTestModalOpen.value = false;

const simulatedLines = computed(() => {
    return mappingLines.value.map(line => {
        let calcVal = 0;
        if (line.amountType === 'PERCENT') {
            calcVal = (testAmount.value * (line.amount || 0)) / 100;
        } else if (line.amountType === 'FIXED') {
            calcVal = line.amount || 0;
        }

        return {
            dcFlag: line.dcFlag,
            acctCd: line.acctCd,
            acctNm: line.acctNm, // 모달에서 이름을 보여주기 위해 추가
            remark: line.defaultRemark,
            calcAmount: Math.floor(calcVal)
        };
    });
});

const totalDebit = computed(() => {
    return simulatedLines.value.filter(l => l.dcFlag === 'D').reduce((sum, l) => sum + l.calcAmount, 0);
});

const totalCredit = computed(() => {
    return simulatedLines.value.filter(l => l.dcFlag === 'C').reduce((sum, l) => sum + l.calcAmount, 0);
});
</script>

<style lang="scss" scoped>
$primary: #4a90e2;
$primary-hover: #357abd;
$text-main: #333333;
$text-sub: #666666;
$text-light: #999999;
$bg-main: #f8f9fa;
$bg-white: #ffffff;
$border-color: #e9ecef;
$danger: #e03131;
$blue: #2563eb;

.preset-mapping-management {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    font-family: 'Pretendard', sans-serif;
    color: $text-main;

    .d-panel {
        background: $bg-white;
        border-radius: 12px;
        border: 1px solid $border-color;
        padding: 20px 24px;
        margin-bottom: 24px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);

        .panel-header {
            margin-bottom: 16px;
            border-bottom: 2px solid $bg-main;
            padding-bottom: 12px;

            h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 700;
            }

            &.flex-between {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
        }
    }
}

/* 상단 섹션 */
.preset-selector-row {
    display: flex;
    gap: 24px;
    align-items: stretch;

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;

        label {
            font-size: 13px;
            font-weight: 600;
            color: $text-sub;
        }

        select {
            padding: 12px;
            border: 1px solid #ced4da;
            border-radius: 8px;
            font-size: 15px;
            outline: none;

            &:focus {
                border-color: $primary;
                box-shadow: 0 0 0 3px rgba($primary, 0.1);
            }
        }
    }

    .preset-info-card {
        flex: 1;
        background: #f8faff;
        border: 1px dashed #b3d4fc;
        border-radius: 8px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        justify-content: center;

        .info-item {
            display: flex;
            gap: 12px;
            align-items: center;
            font-size: 14px;

            .label {
                color: #6b7280;
                font-weight: 600;
                width: 60px;
            }

            .value {
                color: #111827;
                font-weight: 700;
            }
        }
    }
}

/* 하단 섹션 (테이블) */
.data-table-wrapper {
    border: 1px solid $border-color;
    border-radius: 10px;
    overflow: visible; /* 드롭다운이 잘리지 않도록 visible로 변경 */
    margin-bottom: 16px;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;

    th {
        background: $bg-main;
        padding: 12px 10px;
        font-size: 13px;
        font-weight: 600;
        color: $text-sub;
        border-bottom: 1px solid $border-color;
    }

    td {
        padding: 12px 10px;
        vertical-align: middle;
        border-bottom: 1px solid $border-color;
    }

    /* 컬럼 사이즈 */
    .col-line { width: 40px; text-align: center; }
    .col-dc { width: 120px; }
    .col-acct { width: auto; }
    .col-type { width: 140px; }
    .col-amt { width: 160px; }
    .col-remark { width: 220px; }
    .col-action { width: 60px; text-align: center; }

    select,
    input[type="text"],
    input[type="number"] {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ced4da;
        border-radius: 6px;
        font-size: 14px;
        box-sizing: border-box;

        &:focus {
            outline: none;
            border-color: $primary;
        }
    }

    .text-blue { color: $blue; font-weight: 600; }
    .text-red { color: $danger; font-weight: 600; }
    .mono { font-family: monospace; font-size: 15px; }

    .input-with-unit {
        position: relative;

        input {
            padding-right: 30px;
            text-align: right;
            font-family: monospace;
            font-size: 15px;
        }

        .unit {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: $text-light;
            font-size: 13px;
            font-weight: 600;
            pointer-events: none;
        }
    }

    .empty-state {
        text-align: center;
        padding: 40px;
        color: $text-light;
        background: #fafbfc;
    }

    .btn-icon-danger {
        background: none;
        border: none;
        color: #adb5bd;
        font-size: 16px;
        cursor: pointer;
        transition: 0.2s;

        &:hover {
            color: $danger;
            transform: scale(1.1);
        }
    }
}

/* =======================================
   Custom AutoSearch (계정 검색)
======================================= */
.custom-autosearch {
    position: relative;
    width: 100%;

    .search-input {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ced4da;
        border-radius: 6px;
        font-size: 14px;
        background: #fff;
        cursor: text;
        transition: border-color 0.2s;

        &:focus {
            outline: none;
            border-color: $primary;
            box-shadow: 0 0 0 3px rgba($primary, 0.1);
        }
    }

    .dropdown-list {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        width: 100%;
        min-width: 200px;
        background: #ffffff;
        border: 1px solid #ced4da;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        max-height: 220px;
        overflow-y: auto;
        z-index: 999;

        &::-webkit-scrollbar { width: 6px; }
        &::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 10px;
        }

        ul {
            list-style: none;
            margin: 0;
            padding: 4px 0;

            li {
                padding: 10px 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: background 0.1s;

                &:hover { background: #f0f7ff; }
                .acc-text { font-size: 13px; color: #111827; font-weight: 500; }
            }
        }

        .status-msg {
            padding: 16px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
            
            &.empty { color: #ef4444; }
            &.info { color: #3b82f6; }
        }
    }
}

/* 하단 라인 추가 버튼 */
.add-line-wrapper {
    display: flex;
    gap: 12px;

    .btn-add-line {
        flex: 1;
        padding: 12px;
        background: #eff6ff;
        border: 1px dashed #bfdbfe;
        color: $blue;
        font-weight: 700;
        border-radius: 8px;
        cursor: pointer;
        transition: 0.2s;

        &:hover { background: #dbeafe; }
        &.credit {
            background: #fef2f2;
            border-color: #fecaca;
            color: $danger;
            &:hover { background: #fee2e2; }
        }
    }
}

.validation-warning {
    margin-top: 16px;
    padding: 12px;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 8px;
    color: #92400e;
    font-size: 13px;
    font-weight: 700;
}

.placeholder-section {
    padding: 60px 20px;
    text-align: center;
    border: 2px dashed #ced4da;
    border-radius: 12px;
    background: #f8f9fa;
    color: $text-sub;

    .empty-icon { font-size: 40px; margin-bottom: 12px; }
    p { margin: 0; font-size: 15px; }
}

/* =======================================
   테스트 모달
======================================= */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    display: flex; justify-content: center; align-items: center;
    z-index: 9999;
}

.modal-container {
    background: $bg-white; width: 100%; display: flex; flex-direction: column;
    border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    &.modal-lg { max-width: 800px; }

    .modal-header {
        display: flex; justify-content: space-between; align-items: flex-start;
        padding: 24px; border-bottom: 1px solid $border-color;
        h4 { margin: 0 0 4px 0; font-size: 20px; font-weight: 800; }
        .modal-sub { margin: 0; font-size: 13px; color: $text-sub; }
        .btn-close {
            background: none; border: none; font-size: 28px; line-height: 1;
            color: $text-light; cursor: pointer;
            &:hover { color: $text-main; }
        }
    }

    .modal-body { padding: 24px; }

    .test-input-card {
        background: #f8faff; padding: 20px; border-radius: 12px;
        border: 1px solid #d0ebff; margin-bottom: 24px; text-align: center;
        label { display: block; font-size: 14px; font-weight: 700; color: $blue; margin-bottom: 12px; }
        .input-with-unit.large {
            display: inline-block; position: relative; width: 250px;
            input {
                width: 100%; padding: 12px 40px 12px 16px; font-size: 20px; font-weight: 800;
                border: 2px solid #a5d8ff; border-radius: 8px; text-align: right; outline: none; color: $text-main;
                &:focus { border-color: $blue; }
            }
            .unit { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); font-size: 16px; color: $text-sub; font-weight: 700; }
        }
    }

    .journal-preview {
        border: 1px solid $border-color; border-radius: 10px; overflow: hidden;
        .data-table {
            th { background: #f1f3f5; }
            td { padding: 12px; font-size: 14px; }
            .center { text-align: center; }
            .right { text-align: right; }
            .badge { padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; }
            .badge-blue { background: #dbeafe; color: #1e40af; }
            .badge-red { background: #fee2e2; color: #991b1b; }
            tfoot td { background: #fafbfc; font-size: 15px; border-top: 2px solid $border-color; }
        }
    }

    .diff-warning { margin-top: 16px; padding: 16px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; color: #991b1b; font-size: 14px; text-align: center; }
    .diff-success { margin-top: 16px; padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; color: #166534; font-size: 14px; font-weight: 700; text-align: center; }

    .modal-footer { padding: 16px 24px; border-top: 1px solid $border-color; background: $bg-main; display: flex; justify-content: flex-end; }
}

.action-buttons { display: flex; gap: 10px; }
.btn-primary { background: $primary; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: 0.2s; &:hover { background: $primary-hover; } }
.btn-secondary { background: white; color: $text-main; border: 1px solid #ced4da; padding: 10px 20px; font-size: 14px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: 0.2s; &:hover { background: #f1f3f5; } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>