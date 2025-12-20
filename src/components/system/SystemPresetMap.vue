<template>
    <div class="lnb-content system-preset-mapping">


        <section class="d-panel example-panel">
            <div class="d-panel-header">
                <div>
                    <h2>생성될 전표 예시</h2>
                    <div class="panel-sub">
                        현재 매핑 규칙 기준으로, 입력 금액을 넣으면 자동 분개가 이렇게 생성됩니다.
                    </div>
                </div>

                <div class="example-actions">
                    <div class="field-inline">
                        <label>입력금액</label>
                        <input type="number" v-model.number="exampleInputAmount" min="0" />
                    </div>
                    <button class="btn btn--ghost" type="button" @click="applyExampleAmount">
                        예시 금액 적용
                    </button>
                </div>
            </div>

            <div class="example-body">
                <table class="example-table">
                    <thead>
                        <tr>
                            <th style="width: 70px;">구분</th>
                            <th>계정과목</th>
                            <th style="width: 160px;" class="right">금액</th>
                            <th>적요(예시)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="line in previewLines" :key="line.key">
                            <td>
                                <span class="tag" :class="line.drcr === 'DR' ? 'dr' : 'cr'">
                                    {{ line.drcr === 'DR' ? '차' : '대' }}
                                </span>
                            </td>
                            <td class="mono">{{ line.account }}</td>
                            <td class="right mono">{{ fmt(line.amount) }}</td>
                            <td>{{ line.memo }}</td>
                        </tr>

                        <tr v-if="previewLines.length === 0">
                            <td colspan="4" class="empty">
                                매핑 라인을 추가하면 전표 예시가 표시됩니다.
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div class="example-sum">
                    <div class="sum-item">
                        <div class="k">차변 합계</div>
                        <div class="v mono">{{ fmt(sumDR) }}</div>
                    </div>
                    <div class="sum-item">
                        <div class="k">대변 합계</div>
                        <div class="v mono">{{ fmt(sumCR) }}</div>
                    </div>
                    <div class="sum-item" :class="isPreviewBalanced ? 'ok' : 'warn'">
                        <div class="k">차이</div>
                        <div class="v mono">{{ fmt(Math.abs(sumDR - sumCR)) }}</div>
                    </div>

                    <div class="sum-hint" :class="isPreviewBalanced ? 'ok' : 'warn'">
                        {{ isPreviewBalanced ? '차/대가 일치합니다.' : '⚠ 차/대가 일치하지 않습니다. 비율/고정금액을 점검하세요.' }}
                    </div>
                </div>
            </div>
        </section>
        <section class="main-section">
            <!-- LEFT : Preset List -->
            <aside class="d-panel preset-panel">
                <div class="d-panel-header">
                    <h2>Preset 목록</h2>
                </div>

                <div class="search">
                    <input v-model="presetKeyword" placeholder="Preset 검색" />
                    <button class="btn btn--primary">
                        검색
                    </button>
                </div>

                <div class="d-scrollable">
                    <ul class="group-list">
                        <li v-for="p in filteredPresets" :key="p.id" :class="{ active: selectedPreset?.id === p.id }"
                            @click="selectPreset(p)">
                            <div class="name">{{ p.name }}</div>
                            <div class="desc">{{ p.desc }}</div>
                            <!-- <div class="meta">
                                <span class="badge">{{ p.scope }}</span>
                                <span class="status" :class="p.active ? 'on' : 'off'">
                                    {{ p.active ? '사용' : '중지' }}
                                </span>
                            </div> -->
                        </li>
                    </ul>
                </div>
            </aside>

            <!-- RIGHT : Mapping -->
            <main class="d-panel rule-panel">
                <div class="d-panel-header">
                    <div>
                        <h2>{{ selectedPreset.name }}</h2>
                        <div class="panel-sub">{{ selectedPreset.desc }}</div>
                    </div>

                    <div class="panel-actions">
                        <button class="btn btn--ghost" @click="addRule">
                            라인 추가
                        </button>
                        <button class="btn btn--primary">
                            저장
                        </button>
                    </div>
                </div>

                <!-- Rule Table -->
                <table class="rule-table">
                    <thead>
                        <tr>
                            <th>차/대</th>
                            <th>계정과목</th>
                            <th>금액 타입</th>
                            <th>비율 / 금액</th>
                            <th>기본 라인적요</th>
                            <th>삭제</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(r, idx) in rules" :key="r.id">
                            <td>
                                <select v-model="r.drcr">
                                    <option value="DR">차변</option>
                                    <option value="CR">대변</option>
                                </select>
                            </td>

                            <td>
                                <select v-model="r.account">
                                    <option v-for="a in accountOptions" :key="a.code" :value="a.code">
                                        {{ a.code }} {{ a.name }}
                                    </option>
                                </select>
                            </td>

                            <td>
                                <select v-model="r.amountType">
                                    <option value="INPUT">입력금액</option>
                                    <option value="FIXED">고정금액</option>
                                    <option value="PERCENT">비율</option>
                                </select>
                            </td>

                            <td class="right">
                                <input type="text" v-model.number="r.value" />
                            </td>

                            <td>
                                <input v-model="r.memoTpl" placeholder="{월}/{Preset명}" />
                            </td>

                            <td>
                                <button class="link danger" @click="removeRule(idx)">
                                    삭제
                                </button>
                            </td>
                        </tr>

                        <tr v-if="rules.length === 0">
                            <td colspan="6" class="empty">
                                매핑 규칙이 없습니다. 라인을 추가하세요.
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Footer -->
                <!-- <div class="mapping-footer">
                    <div class="check">
                        <span class="balance" :class="isBalanced ? 'ok' : 'warn'">
                            {{ isBalanced ? '차/대변 합계 일치' : '⚠ 차/대변 불일치' }}
                        </span>
                    </div> 
                </div> -->
            </main>
        </section>
    </div>
</template>
  
<script setup>
import { computed, reactive, ref } from 'vue';

const presetKeyword = ref('');
const selectedPreset = ref({});

const presets = reactive([
    { id: 1, name: 'EXP_CARD_DEL', scope: '공동', active: true, desc: '카드/현금 식비' },
    { id: 2, name: 'EXP_TRANSFER_RENT', scope: '본인', active: true, desc: '대중교통' },
    
    { id: 3, name: 'EXP_CARD_DEL', scope: '공동', active: true, desc: '카드/현금 식비' },
    { id: 4, name: '교통비', scope: '본인', active: true, desc: '대중교통' },
    
    { id: 5, name: 'EXP_CARD_DEL', scope: '공동', active: true, desc: '카드/현금 식비' },
    { id: 6, name: '교통비', scope: '본인', active: true, desc: '대중교통' },
    
    { id: 1, name: 'EXP_CARD_DEL', scope: '공동', active: true, desc: '카드/현금 식비' },
    { id: 2, name: '교통비', scope: '본인', active: true, desc: '대중교통' },
    
    { id: 1, name: 'EXP_CARD_DEL', scope: '공동', active: true, desc: '카드/현금 식비' },
    { id: 2, name: '교통비', scope: '본인', active: true, desc: '대중교통' },
    
    { id: 1, name: 'EXP_CARD_DEL', scope: '공동', active: true, desc: '카드/현금 식비' },
    { id: 2, name: '교통비', scope: '본인', active: true, desc: '대중교통' },
    
    { id: 1, name: 'EXP_CARD_DEL', scope: '공동', active: true, desc: '카드/현금 식비' },
    { id: 2, name: '교통비', scope: '본인', active: true, desc: '대중교통' },
    
    { id: 1, name: 'EXP_CARD_DEL', scope: '공동', active: true, desc: '카드/현금 식비' },
    { id: 2, name: '교통비', scope: '본인', active: true, desc: '대중교통' },
    
    { id: 1, name: 'EXP_CARD_DEL', scope: '공동', active: true, desc: '카드/현금 식비' },
    { id: 2, name: '교통비', scope: '본인', active: true, desc: '대중교통' },
    
    { id: 1, name: 'EXP_CARD_DEL', scope: '공동', active: true, desc: '카드/현금 식비' },
    { id: 2, name: '교통비', scope: '본인', active: true, desc: '대중교통' },
    
    { id: 1, name: 'EXP_CARD_DEL', scope: '공동', active: true, desc: '카드/현금 식비' },
    { id: 2, name: '교통비', scope: '본인', active: true, desc: '대중교통' },
    
    { id: 1, name: 'EXP_CARD_DEL', scope: '공동', active: true, desc: '카드/현금 식비' },
    { id: 2, name: '교통비', scope: '본인', active: true, desc: '대중교통' },
    
    { id: 1, name: 'EXP_CARD_DEL', scope: '공동', active: true, desc: '카드/현금 식비' },
    { id: 2, name: '교통비', scope: '본인', active: true, desc: '대중교통' },
    { id: 3, name: '월세', scope: '공동', active: false, desc: '주거비' },
]);

const accountOptions = [
    { code: '511', name: '식비' },
    { code: '111', name: '현금' },
    { code: '411', name: '신용카드 미지급금' },
    { code: '210', name: '보통예금' },
];

const rules = reactive([]);

const filteredPresets = computed(() =>
    presets.filter(p =>
        p.name.includes(presetKeyword.value)
    )
);

function selectPreset(p) {
    selectedPreset.value = p;
    rules.splice(0);
    // 예시 로딩
    rules.push(
        {
            id: 1,
            drcr: 'DR',
            account: '511',
            amountType: 'INPUT',
            value: null,
            memoTpl: '{월} 식비'
        },
        {
            id: 2,
            drcr: 'CR',
            account: '411',
            amountType: 'INPUT',
            value: null,
            memoTpl: '{월} 카드'
        }
    );
}

function addRule() {
    rules.push({
        id: Date.now(),
        drcr: 'DR',
        account: '',
        amountType: 'INPUT',
        value: null,
        memoTpl: ''
    });
}

function removeRule(idx) {
    rules.splice(idx, 1);
}

const isBalanced = computed(() => {
    const dr = rules.filter(r => r.drcr === 'DR').length;
    const cr = rules.filter(r => r.drcr === 'CR').length;
    return dr > 0 && cr > 0;
});

const exampleInputAmount = ref(100000); // 예시 입력금액
const appliedAmount = ref(100000);      // "적용" 버튼으로 확정된 금액

function applyExampleAmount() {
    appliedAmount.value = Number(exampleInputAmount.value || 0);
}

/** 텍스트 치환(간단 버전) */
function renderMemoTpl(tpl, ctx) {
    if (!tpl) return '';
    return tpl
        .replaceAll('{월}', ctx.ym || '')
        .replaceAll('{Preset명}', ctx.presetName || '')
        .replaceAll('{금액}', ctx.amountText || '');
}

/** 숫자 포맷 */
function fmt(n) {
    const v = Math.round(Number(n || 0));
    return `${v.toLocaleString('ko-KR')}원`;
}

/** 예시 미리보기 라인 생성 */
const previewLines = computed(() => {
    const preset = selectedPreset.value;
    if (!preset || !preset.name) return [];

    const base = Number(appliedAmount.value || 0);
    const ctx = {
        ym: '2025-12', // 원하시면 selectedYm 같은 상태로 교체
        presetName: preset.name,
        amountText: fmt(base),
    };

    return rules
        .filter(r => r.account) // 계정 미선택 라인은 제외
        .map((r, idx) => {
            let amount = 0;

            if (r.amountType === 'INPUT') {
                amount = base;
            } else if (r.amountType === 'FIXED') {
                amount = Number(r.value || 0);
            } else if (r.amountType === 'PERCENT') {
                // r.value: 10이면 10%, 0.1이면 10%로 쓸지 취향인데
                // 지금 UI input은 자유라서 "10" 입력 시 10%로 해석하도록 처리
                const raw = Number(r.value || 0);
                const rate = raw > 1 ? raw / 100 : raw;
                amount = base * rate;
            }

            const memo = renderMemoTpl(r.memoTpl, ctx) || `${ctx.ym} ${ctx.presetName}`;

            return {
                key: `${preset.id}-${idx}-${r.drcr}-${r.account}`,
                drcr: r.drcr,
                account: r.account,
                amount,
                memo,
            };
        });
});

const sumDR = computed(() =>
    previewLines.value
        .filter(x => x.drcr === 'DR')
        .reduce((a, c) => a + Number(c.amount || 0), 0)
);

const sumCR = computed(() =>
    previewLines.value
        .filter(x => x.drcr === 'CR')
        .reduce((a, c) => a + Number(c.amount || 0), 0)
);

const isPreviewBalanced = computed(() => {
    // 0원일 때도 true로 보이면 애매해서 "라인 존재" 조건도 추가
    if (previewLines.value.length === 0) return true;
    // 반올림 오차 대비(원 단위)
    return Math.round(sumDR.value) === Math.round(sumCR.value);
});

</script>
  
<style lang="scss" src="@@/system/systemPresetMap.scss" />