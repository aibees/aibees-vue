<template>
    <div class="lnb-content account-entry">

        <!-- 상단 요약카드 -->
        <section class="d-panel summary-section">
            <div class="col">
                <div class="hint-list">
                    <div class="hint-item">총 건수: <strong>{{ lines.length }}</strong>건</div>
                    <div class="hint-item">정상 건수: <strong>{{ validCount }}</strong>건</div>
                    <div class="hint-item">오류 건수: <strong>{{ errorCount }}</strong>건</div>
                    <div class="hint-item">총 금액(정상만): <strong>{{ totalAmountText }}</strong></div>
                </div>
            </div>
            <div class="col">
                <div class="d-panel-actions d-justify-end">
                        <button type="button" class="btn btn--ghost" @click="openGuide = true">
                            가이드
                        </button>
                        <button type="button" class="btn btn--ghost" @click="openGuide = true">
                            초기화
                        </button>
                        <button type="button" class="btn btn--primary" @click="addLine()">
                            + 추가
                        </button>
                        <button type="button" class="btn btn--primary" @click="addLine()">
                            <font-awesome-icons id="glass" :icon="['fa-solid', 'fa-save']" />&nbsp;&nbsp;저장
                        </button>
                    </div>
            </div>
        </section>

        <section class="d-panel entry-container">
            <section class="entry-card">

                <!-- 라인 반복 -->
                <div class="line-card" v-for="(line, idx) in lines" :key="line._id"
                    :class="{ bad: lineErrors(idx).length > 0 }">
                    <div class="line-head">
                        <div class="line-title">
                            <span class="pill">#{{ idx + 1 }}</span>
                            <span v-if="lineErrors(idx).length === 0" class="status ok">정상</span>
                            <span v-else class="status warn">오류 {{ lineErrors(idx).length }}개</span>
                        </div>

                        <div class="line-actions">
                            <button type="button" class="btn-mini" @click="duplicateLine(idx)">복제</button>
                            <button type="button" class="btn-mini danger" @click="removeLine(idx)"
                                :disabled="lines.length === 1">
                                삭제
                            </button>
                        </div>
                    </div>

                    <!-- 기본 정보 -->
                    <div class="row row--meta">
                        <div class="field">
                            <label>날짜</label>
                            <input type="date" v-model="line.date" />
                        </div>

                        <div class="field">
                            <label>가계 단위</label>
                            <select v-model="line.householdUnit">
                                <option value="joint">공동</option>
                                <option value="me">본인</option>
                                <option value="spouse">배우자</option>
                            </select>
                        </div>

                        <div class="field">
                            <label>거래 큰 유형</label>
                            <select v-model="line.groupCode">
                                <option disabled value="">선택하세요</option>
                                <option v-for="group in presetGroups" :key="group.code" :value="group.code">
                                    {{ group.label }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- Preset 선택 -->
                    <div class="row row--preset">
                        <div class="field field--preset-select">
                            <label>세부 거래 유형 (Preset)</label>
                            <select v-model="line.presetCode">
                                <option disabled value="">유형을 선택하세요</option>
                                <option v-for="preset in getFilteredPresets(line.groupCode)" :key="preset.code"
                                    :value="preset.code">
                                    {{ preset.label }}
                                </option>
                            </select>

                            <p class="field-help" v-if="getSelectedPreset(line.groupCode, line.presetCode)">
                                {{ getSelectedPreset(line.groupCode, line.presetCode).description }}
                            </p>
                            <p class="field-help" v-else>
                                위의 "거래 큰 유형"을 먼저 선택한 뒤, 세부 유형을 선택하세요.
                            </p>
                        </div>

                        <div class="preset-tags" v-if="getSelectedPreset(line.groupCode, line.presetCode)">
                            <div class="tag">
                                <span class="tag-label">Preset 코드</span>
                                <span class="tag-value">{{ line.presetCode }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 금액 / 메모 -->
                    <div class="row row--amount">
                        <div class="field field--amount">
                            <label>금액</label>
                            <div class="amount-wrapper">
                                <span class="amount-prefix">₩</span>
                                <input type="number" min="0" step="100" v-model.number="line.amount"
                                    placeholder="예: 12000" />
                            </div>
                        </div>

                        <div class="field field--memo">
                            <label>메모</label>
                            <input type="text" v-model="line.memo" placeholder="예: 회사 점심, 12월 관리비, 월급 입금 등" />
                        </div>
                    </div>

                    <!-- 라인 에러 표시 -->
                    <div class="line-errors" v-if="lineErrors(idx).length">
                        <div class="err-title">입력 오류</div>
                        <ul>
                            <li v-for="(e, i) in lineErrors(idx)" :key="i">• {{ e }}</li>
                        </ul>
                    </div>
                </div>

                <!-- 하단 요약 + 버튼 -->
            </section>
        </section>

        <!-- 가이드 레이어 팝업 -->
        <div class="modal-backdrop" v-if="openGuide" @click.self="openGuide = false">
            <div class="modal">
                <div class="modal-header">
                    <div>
                        <div class="modal-title">다건 입력 가이드</div>
                        <div class="modal-sub">여러 줄을 추가하고 한 번에 저장할 수 있습니다.</div>
                    </div>
                    <button class="icon-btn" @click="openGuide = false">✕</button>
                </div>

                <div class="modal-body">
                    <ul class="guide-ul">
                        <li>“+ 추가”로 라인을 계속 늘릴 수 있습니다.</li>
                        <li>오류가 있는 라인이 하나라도 있으면 저장 버튼이 비활성화됩니다.</li>
                    </ul>
                </div>

                <div class="modal-footer">
                    <button class="btn btn--ghost" @click="openGuide = false">닫기</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';

const openGuide = ref(false);

// Preset 그룹 및 Preset 목록 (예시)
const presetGroups = [
    {
        code: 'EXPENSE',
        label: '지출',
        presets: [
            { code: 'EXP_CARD_MEAL', label: '식비 - 신용카드 결제', description: '식당, 카페 등에서 신용카드로 결제한 식비 지출' },
            { code: 'EXP_CARD_MART', label: '마트/장보기 - 신용카드', description: '대형마트, 온라인몰 등 식료품/생활용품 카드 결제' },
            { code: 'EXP_TRANSFER_RENT', label: '월세/관리비 - 계좌이체', description: '월세, 관리비 등을 계좌이체로 납부' },
        ],
    },
    {
        code: 'INCOME',
        label: '수입',
        presets: [
            { code: 'INC_SALARY_BANK', label: '급여 입금 - 통장', description: '월급, 상여 등 급여성 수입이 통장으로 입금' },
            { code: 'INC_INTEREST_BANK', label: '이자/배당 - 통장', description: '예금이자, 배당금 등이 통장으로 입금' },
        ],
    },
    {
        code: 'TRANSFER',
        label: '이체/내부이동',
        presets: [
            { code: 'TRF_BANK_TO_BANK', label: '통장 ↔ 통장 이체', description: 'A은행에서 B은행으로 계좌이체 등 내부 자금 이동' },
            { code: 'TRF_BANK_TO_SAVING', label: '통장 → 저축예금', description: '입출금통장에서 저축/적금 계좌로 이체' },
            { code: 'TRF_CARD_PAY', label: '신용카드 대금 출금', description: '통장에서 신용카드 대금이 자동이체로 빠져나가는 거래' },
        ],
    },
];

// ✅ 여러 줄(다건) 입력
const lines = reactive([createLine()]);

function createLine(seed = {}) {
    return {
        _id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        date: seed.date || '',
        householdUnit: seed.householdUnit || 'joint',
        groupCode: seed.groupCode || '',
        presetCode: seed.presetCode || '',
        amount: seed.amount ?? null,
        memo: seed.memo || '',
    };
}

function addLine(seed = {}) {
    // UX: 직전 라인의 date/unit을 이어받고 싶으면 seed로 주입
    const last = lines[lines.length - 1];
    lines.push(
        createLine({
            date: last?.date || '',
            householdUnit: last?.householdUnit || 'joint',
            groupCode: '',
            presetCode: '',
            amount: null,
            memo: '',
            ...seed,
        })
    );
}

function duplicateLine(idx) {
    const src = lines[idx];
    lines.splice(idx + 1, 0, createLine({ ...src }));
}

function removeLine(idx) {
    if (lines.length === 1) return;
    lines.splice(idx, 1);
}

function resetAll() {
    lines.splice(0, lines.length, createLine());
}

// 프리셋 조회 helper
function getFilteredPresets(groupCode) {
    const g = presetGroups.find((x) => x.code === groupCode);
    return g ? g.presets : [];
}
function getSelectedPreset(groupCode, presetCode) {
    const g = presetGroups.find((x) => x.code === groupCode);
    if (!g) return null;
    return g.presets.find((p) => p.code === presetCode) || null;
}

// 라인 검증
function lineErrors(idx) {
    const l = lines[idx];
    const errs = [];
    if (!l.date) errs.push('날짜를 입력하세요.');
    if (!l.groupCode) errs.push('거래 큰 유형을 선택하세요.');
    if (!l.presetCode) errs.push('세부 거래 유형(Preset)을 선택하세요.');
    if (!l.amount || l.amount <= 0) errs.push('금액을 올바르게 입력하세요.');
    return errs;
}

const errorCount = computed(() => lines.filter((_, idx) => lineErrors(idx).length > 0).length);
const validCount = computed(() => lines.length - errorCount.value);

const totalAmount = computed(() =>
    lines
        .filter((_, idx) => lineErrors(idx).length === 0)
        .reduce((a, c) => a + Number(c.amount || 0), 0)
);

const totalAmountText = computed(() => `${totalAmount.value.toLocaleString('ko-KR')}원`);

function onSubmitAll() {
    // 하나라도 오류 있으면 막기
    if (errorCount.value > 0) {
        alert('오류가 있는 라인이 있습니다. 수정 후 저장하세요.');
        return;
    }

    const payload = {
        mode: 'PRESET_MULTI',
        rows: lines.map(({ _id, ...rest }) => rest),
    };

    console.log('다건 저장 payload:', payload);
    alert(`다건 저장(가정): ${payload.rows.length}건`);

    // 저장 후: 금액/메모만 비우고 이어서 입력 가능하게(취향에 따라)
    lines.forEach((l) => {
        l.amount = null;
        l.memo = '';
        l.groupCode = '';
        l.presetCode = '';
    });
}
</script>

<style src="@@/account/accountEntry.scss" />
