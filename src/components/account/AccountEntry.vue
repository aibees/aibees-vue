<template>
    <div id="journal-entry-management" class="d-container">

        <section class="top-action-bar d-panel">
            <div class="base-account-selector">
                <select v-model="filtered.accountId">
                    <option value="" disabled>출금되거나 결제된 계좌/카드를 선택하세요</option>
                    <optgroup v-for="group in options.baseAccountId" :key="group.type" :label="group.type">
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
                    :disabled="!filtered.accountId || entries.length === 0">
                    💾 전체 전표 저장
                </button>
            </div>
        </section>

        <section class="entry-cards-container d-panel">
            <TransitionGroup name="list">
                <div class="entry-card" v-for="(entry, index) in entries" :key="entry._id">
                    <div class="card-header" :class="{ 'entry-invalid-head': isInvalid(entry) }">
                        <div class="card-header-left">
                            <span class="entry-number">#{{ index + 1 }}</span>
                            <span class="entry-invalid" v-if="isInvalid(entry)">전표 데이터가 적합하지 않습니다.</span>
                        </div>
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
                                <input type="date" v-model="entry.jeDate" required>
                            </div>
                            <div class="form-group flex-1">
                                <label>거래 시간 (시:분:초) <span class="required">*</span></label>
                                <input type="time" step="1" v-model="entry.jeTimes" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>거래 유형 (그룹)</label>
                            <select v-model="entry.presetGroupCd" @change="changePresetGroup(entry)">
                                <option value="" disabled>그룹 선택</option>
                                <option v-for="g in options.presetGroups" :key="g.presetGroupCd" :value="g.presetGroupCd">
                                    {{ g.presetGroupNm }} [{{ g.presetGroupCd }}]
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>프리셋 (상세) <span class="required">*</span></label>
                            <select v-model="entry.presetCd" :disabled="!entry.presetGroupCd">
                                <option value="" disabled>프리셋 선택</option>
                                <option v-for="p in getPresetHeader(entry.presetGroupCd)" :key="p.presetCd"
                                    :value="p.presetCd">
                                    {{ p.presetNm }} ({{ p.presetCd }})
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
                            <label>적요 (메모) <span class="required">*</span></label>
                            <input type="text" v-model="entry.remark" placeholder="어디서, 무엇을 거래했는지 입력">
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
    import mariaApi from '@scripts/util/mariaApi.js'; // 환경에 맞게 수정

    let entryIdCounter = 0; // 화면 랜더링용 고유 ID (DB에는 안들어감)
    const entries = ref([]);
    const filtered = reactive({
        accountId: ''
    });
    const options = reactive({
        baseAccountId: [],
        presetGroups: [],
        presetHeader: []
    });

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

    onMounted(async () => {
        await getAccountInfos();
        await getPresetGroups();
        addEntry(); // 최초 화면 진입 시 빈 카드 1개 세팅
    });

    // ==========================================
    // 3. Methods
    // ==========================================

    // 계좌, 카드 정보 가져오기
    const getAccountInfos = async () => {
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
    }

    // 프리셋 그룹 가져오기
    const getPresetGroups = async () => {
        const param = {
            enabledFlag: 'Y'
        }
        const { data } = await mariaApi.get('/api/system-infos/preset/headers/groups');
        options.presetGroups = data;
    }

    const getPresetHeader = (groupCd) => {
        const header = options.presetGroups.filter(g => g.presetGroupCd == groupCd);
        if (header.length == 0) {
            return header;
        } else {
            return header[0].headerList; 
        }
    }

    const addEntry = () => {
        entries.value.push({
            _id: `entry_${entryIdCounter++}`, // 렌더링용 고유 키
            jeDate: getCurrentDateStr(),      // 기본값: 오늘 일자
            jeTimes: getCurrentTimeStr(),      // 기본값: 현재 시간
            presetGroupCd: '',
            sourceCd: 'MA',
            categoryCd: '01',
            presetCd: '',
            amount: 0,
            remark: ''
        });
    };

    const changePresetGroup = async (entry) => {
        entry.presetCd = '';
        
    }

    // 총 합계 계산 (화면 표시용)
    const totalAmount = computed(() => {
        return entries.value.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
    });

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

    const isInvalid = (data) => {
        if (data.presetGroupCd == '') {
            return true;
        }

        if (data.presetCd == '') {
            return true;
        }
        
        if (data.amount == 0 || data.amount == null) {
            return true;
        }

        if (data.remark == '') {
            return true;
        }
        return false;
    }

    const validateEntries = async () => {

        let valid = true;
        for (let i = 0; i < entries.value.length; i++) {
            const check = isInvalid(entries.value[i]);
            if (check) {
                console.log(`${i} => 오류 있음`);
                valid = false;
                break;
            }
        }
        console.log("valid :: " + valid);
        return valid;
    }

    const saveAllEntries = async () => {
        if (!await validateEntries()) {
            alert("오류 있음");
            return false;
        }

        entries.value.forEach(e => {
            e.bankId = filtered.accountId;
        });

        const result = await mariaApi.post('/api/account/journal', { jeHeaderList: entries.value });
    }

</script>

<style lang="scss" scoped>
@use '@@/common.scss' as *;
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

    .entry-invalid-head {
        background-color: #ffcaca;
    }

    .card-header {
        // background: #f8fafc;
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

        .entry-invalid {
            font-size: 0.85rem;
            font-weight: 600;
            padding-left: 0.8rem;
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