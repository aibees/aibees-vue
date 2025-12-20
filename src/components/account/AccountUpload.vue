<template>
    <div class="lnb-content bulk-voucher-upload">
        <section class="page">
            <!-- Header -->
            <header class="page-header">
                <div>
                    <h1>엑셀 업로드 · 대량 전표 생성</h1>
                    <p class="subtitle">
                        파일 업로드 후 행별 수정/검증 → 선택 저장하면 Preset 규칙 기준으로 대량 전표가 생성될 수 있습니다.
                    </p>
                </div>

                <div class="header-actions">
                    <button class="btn btn--ghost" @click="openGuide = true">가이드</button>
                    <button class="btn btn--primary" :disabled="!canSave" @click="saveSelected">
                        선택 저장 ({{ selectedCount }}건)
                    </button>
                </div>
            </header>

            <!-- Top Upload Strip -->
            <section class="upload-strip panel">
                <div class="dropzone" :class="{ 'is-drag': isDragging }" @dragenter.prevent="onDragEnter"
                    @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop">
                    <div class="dz-left">
                        <div class="dz-title">파일 업로드</div>
                        <div class="dz-sub">.xlsx / .xls / .csv 지원 · 첫 행 헤더 권장</div>
                    </div>

                    <div class="dz-right">
                        <input ref="fileInput" type="file" class="file-input" accept=".xlsx,.xls,.csv"
                            @change="onFileChange" />
                        <button class="btn btn--primary" @click="pickFile">파일 선택</button>
                        <button class="btn btn--ghost" @click="resetAll" :disabled="rows.length === 0">초기화</button>
                    </div>
                </div>

                <div class="upload-meta" v-if="fileMeta">
                    <div class="meta-item">
                        <span class="k">파일</span>
                        <span class="v">{{ fileMeta.name }}</span>
                    </div>
                    <div class="meta-item">
                        <span class="k">크기</span>
                        <span class="v">{{ fileMeta.sizeText }}</span>
                    </div>
                    <div class="meta-item">
                        <span class="k">행</span>
                        <span class="v">{{ rows.length }}건</span>
                    </div>
                    <div class="meta-item">
                        <span class="k">오류</span>
                        <span class="v" :class="{ danger: errorCount > 0 }">{{ errorCount }}건</span>
                    </div>
                </div>
            </section>

            <!-- Bottom Panel: Rows List -->
            <section class="rows-panel panel" v-if="rows.length > 0">
                <div class="panel-head">
                    <div>
                        <h2>업로드 행 목록</h2>
                        <p class="panel-sub">
                            체크된 행만 저장됩니다. 오류 행은 빨간 표시되며 저장에서 자동 제외됩니다.
                        </p>
                    </div>

                    <div class="panel-actions">
                        <button class="btn btn--ghost" @click="toggleAll(true)">전체 선택</button>
                        <button class="btn btn--ghost" @click="toggleAll(false)">전체 해제</button>
                        <button class="btn btn--ghost" @click="revalidate">재검증</button>
                    </div>
                </div>

                <!-- Summary bar -->
                <div class="summary-bar">
                    <div class="pill pill--ok">정상 {{ validCount }}건</div>
                    <div class="pill pill--warn">오류 {{ errorCount }}건</div>
                    <div class="pill pill--info">선택 {{ selectedCount }}건</div>
                    <div class="pill pill--info">선택 합계 {{ selectedAmountText }}</div>
                </div>

                <div class="table-wrap">
                    <table class="tbl">
                        <thead>
                            <tr>
                                <th style="width: 52px;">선택</th>
                                <th style="width: 84px;">상태</th>
                                <th style="width: 130px;">date</th>
                                <th style="width: 120px;">unit</th>
                                <th style="width: 120px;">group</th>
                                <th style="width: 220px;">presetCode</th>
                                <th style="width: 150px;" class="right">amount</th>
                                <th>memo</th>
                                <th style="width: 80px;">삭제</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="(r, idx) in rows" :key="r._id"
                                :class="{ bad: r.errors.length > 0, off: !r.selected }">
                                <td class="center">
                                    <input type="checkbox" v-model="r.selected" :disabled="r.errors.length > 0"
                                        title="오류 행은 선택할 수 없습니다." />
                                </td>

                                <td class="center">
                                    <span class="status" :class="r.errors.length > 0 ? 'warn' : 'ok'">
                                        {{ r.errors.length > 0 ? '오류' : '정상' }}
                                    </span>
                                </td>

                                <!-- Inline edit cells -->
                                <td class="mono">
                                    <input class="cell-input" v-model="r.date" @blur="validateOne(r)"
                                        placeholder="YYYY-MM-DD" />
                                </td>

                                <td>
                                    <select class="cell-input" v-model="r.householdUnit" @change="validateOne(r)">
                                        <option value="joint">joint</option>
                                        <option value="me">me</option>
                                        <option value="spouse">spouse</option>
                                    </select>
                                </td>

                                <td>
                                    <select class="cell-input" v-model="r.groupCode" @change="validateOne(r)">
                                        <option value="EXPENSE">EXPENSE</option>
                                        <option value="INCOME">INCOME</option>
                                        <option value="TRANSFER">TRANSFER</option>
                                    </select>
                                </td>

                                <td class="mono">
                                    <input class="cell-input" v-model="r.presetCode" @blur="validateOne(r)"
                                        placeholder="예: EXP_CARD_MEAL" />
                                </td>

                                <td class="right mono">
                                    <input class="cell-input right" type="number" min="0" v-model.number="r.amount"
                                        @blur="validateOne(r)" />
                                </td>

                                <td>
                                    <input class="cell-input" v-model="r.memo" @blur="validateOne(r)"
                                        placeholder="메모(선택)" />
                                    <div class="err" v-if="r.errors.length">
                                        <div v-for="(e, i) in r.errors" :key="i">• {{ e }}</div>
                                    </div>
                                </td>

                                <td class="center">
                                    <button class="link danger" @click="removeRow(idx)">삭제</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Footer actions -->
                <div class="panel-foot">
                    <div class="foot-hint">
                        저장 시 서버에서 <strong>Preset 매핑 규칙</strong>으로 전표(차/대변)가 대량 생성될 수 있습니다.
                    </div>

                    <div class="foot-actions">
                        <button class="btn btn--ghost" @click="dumpPayload">payload 보기</button>
                        <button class="btn btn--primary" :disabled="!canSave" @click="saveSelected">
                            선택 저장 ({{ selectedCount }}건)
                        </button>
                    </div>
                </div>
            </section>

            <!-- Empty state -->
            <section class="empty panel" v-else>
                <div class="empty-title">업로드된 데이터가 없습니다.</div>
                <div class="empty-sub">상단에서 파일을 업로드하면 하단에 행 목록이 표시됩니다.</div>
            </section>
        </section>

        <!-- Layered Guide Popup -->
        <div class="modal-backdrop" v-if="openGuide" @click.self="openGuide = false">
            <div class="modal">
                <div class="modal-header">
                    <div>
                        <div class="modal-title">업로드 가이드</div>
                        <div class="modal-sub">템플릿 헤더/예시를 참고해 파일을 구성하세요.</div>
                    </div>
                    <button class="icon-btn" @click="openGuide = false">✕</button>
                </div>

                <div class="modal-body">
                    <div class="guide-block">
                        <div class="g-title">권장 헤더</div>
                        <pre class="code">date,householdUnit,groupCode,presetCode,amount,memo</pre>
                    </div>

                    <div class="guide-block">
                        <div class="g-title">예시(CSV)</div>
                        <pre class="code">2025-12-17,joint,EXPENSE,EXP_CARD_MEAL,12000,점심
  2025-12-17,me,INCOME,INC_SALARY_BANK,3200000,급여
  2025-12-18,joint,TRANSFER,TRF_CARD_PAY,500000,카드대금</pre>
                    </div>

                    <div class="guide-block">
                        <div class="g-title">검증 규칙(현재 화면 기준)</div>
                        <ul class="ul">
                            <li>date: YYYY-MM-DD</li>
                            <li>householdUnit: joint/me/spouse</li>
                            <li>groupCode: EXPENSE/INCOME/TRANSFER</li>
                            <li>presetCode: 필수</li>
                            <li>amount: 0보다 큰 숫자</li>
                        </ul>
                    </div>

                    <div class="guide-block warn">
                        <div class="g-title">실서비스 권장</div>
                        <div class="g-sub">
                            presetCode 실존 여부/권한/기간 잠금 등은 서버에서 최종 검증하고, 오류 행을 반환하는 구조가 안전합니다.
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn--ghost" @click="openGuide = false">닫기</button>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { computed, ref } from 'vue';
import * as XLSX from 'xlsx';

const fileInput = ref(null);
const isDragging = ref(false);
const openGuide = ref(false);

const fileMeta = ref(null);
const rows = ref([]); // UI rows

function pickFile() {
    fileInput.value?.click();
}

function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFile(file);
    e.target.value = '';
}

function onDragEnter() { isDragging.value = true; }
function onDragOver() { isDragging.value = true; }
function onDragLeave() { isDragging.value = false; }
function onDrop(e) {
    isDragging.value = false;
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    handleFile(file);
}

function handleFile(file) {
    fileMeta.value = { name: file.name, sizeText: humanSize(file.size) };

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext === 'csv') readCsv(file);
    else readXlsx(file);
}

function readCsv(file) {
    const reader = new FileReader();
    reader.onload = () => {
        const text = String(reader.result || '');
        // xlsx로 CSV도 파싱 가능
        const wb = XLSX.read(text, { type: 'string' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        ingestSheet(ws);
    };
    reader.readAsText(file, 'utf-8');
}

function readXlsx(file) {
    const reader = new FileReader();
    reader.onload = () => {
        const data = new Uint8Array(reader.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        ingestSheet(ws);
    };
    reader.readAsArrayBuffer(file);
}

/**
 * 업로드 파일을 “권장 헤더” 형태로 최대한 맞춰 읽습니다.
 * - 헤더가 다르면 아래 normalizeKey에서 흡수(날짜/일자 등)
 */
function ingestSheet(ws) {
    const raw = XLSX.utils.sheet_to_json(ws, { defval: '' }); // [{헤더:값}, ...]
    const normalized = raw.map((obj) => {
        const n = {};
        for (const [k, v] of Object.entries(obj)) {
            n[normalizeKey(k)] = String(v ?? '').trim();
        }
        return n;
    });

    const uiRows = normalized.map((r) => {
        const row = {
            _id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            selected: true,
            date: r.date || '',
            householdUnit: r.householdunit || r.householdUnit || 'joint',
            groupCode: r.groupcode || r.groupCode || '',
            presetCode: r.presetcode || r.presetCode || '',
            amount: toNumber(r.amount),
            memo: r.memo || '',
            errors: [],
        };
        row.errors = validateRow(row);
        if (row.errors.length > 0) row.selected = false; // 오류 행은 기본 선택 해제
        return row;
    });

    rows.value = uiRows;
}

function normalizeKey(k) {
    const s = String(k || '').trim().toLowerCase();
    const map = {
        '날짜': 'date',
        '일자': 'date',
        '거래일': 'date',
        'date': 'date',

        '가계단위': 'householdUnit',
        '단위': 'householdUnit',
        'unit': 'householdUnit',
        'householdunit': 'householdUnit',

        '큰유형': 'groupCode',
        '거래큰유형': 'groupCode',
        '유형': 'groupCode',
        'group': 'groupCode',
        'groupcode': 'groupCode',

        '프리셋': 'presetCode',
        '프리셋코드': 'presetCode',
        '세부유형': 'presetCode',
        'preset': 'presetCode',
        'presetcode': 'presetCode',

        '금액': 'amount',
        '거래금액': 'amount',
        'amount': 'amount',

        '메모': 'memo',
        '비고': 'memo',
        '적요': 'memo',
        'memo': 'memo',
    };
    return map[s] || s;
}

function validateRow(r) {
    const errs = [];

    if (!r.date || !/^\d{4}-\d{2}-\d{2}$/.test(r.date)) errs.push('date 형식(YYYY-MM-DD)');
    if (!['joint', 'me', 'spouse'].includes(r.householdUnit)) errs.push('unit(joint/me/spouse)');
    if (!['EXPENSE', 'INCOME', 'TRANSFER'].includes(r.groupCode)) errs.push('group(EXPENSE/INCOME/TRANSFER)');
    if (!r.presetCode) errs.push('presetCode 필수');
    if (!Number.isFinite(r.amount) || r.amount <= 0) errs.push('amount(0보다 큰 숫자)');

    return errs;
}

function validateOne(r) {
    r.amount = toNumber(r.amount);
    r.errors = validateRow(r);
    if (r.errors.length > 0) r.selected = false; // 오류가 생기면 자동 선택 해제
}

function revalidate() {
    rows.value.forEach((r) => validateOne(r));
}

function toggleAll(flag) {
    rows.value.forEach((r) => {
        if (r.errors.length === 0) r.selected = flag;
    });
}

function removeRow(idx) {
    rows.value.splice(idx, 1);
}

const validCount = computed(() => rows.value.filter(r => r.errors.length === 0).length);
const errorCount = computed(() => rows.value.filter(r => r.errors.length > 0).length);
const selectedCount = computed(() => rows.value.filter(r => r.selected && r.errors.length === 0).length);

const selectedAmountText = computed(() => {
    const sum = rows.value
        .filter(r => r.selected && r.errors.length === 0)
        .reduce((a, c) => a + Number(c.amount || 0), 0);
    return `${sum.toLocaleString('ko-KR')}원`;
});

const canSave = computed(() => selectedCount.value > 0 && errorCount.value === 0);

function saveSelected() {
    if (!canSave.value) {
        alert('오류 행이 있거나 선택된 정상 행이 없습니다.');
        return;
    }

    // ✅ 서버로 보낼 payload 예시:
    // - 서버가 presetCode 기준으로 “차/대변 매핑”을 찾아 전표 생성
    // - 반환: 생성된 전표 건수/실패 행 목록 등
    const payload = {
        mode: 'PRESET_BULK',
        rows: rows.value
            .filter(r => r.selected && r.errors.length === 0)
            .map(({ _id, selected, errors, ...rest }) => rest),
    };

    console.log('bulk-voucher payload:', payload);
    alert(`선택 저장(가정): ${payload.rows.length}건\n(서버에서 대량 전표 생성 가능)`);
}

function dumpPayload() {
    const payload = {
        mode: 'PRESET_BULK',
        rows: rows.value
            .filter(r => r.selected && r.errors.length === 0)
            .map(({ _id, selected, errors, ...rest }) => rest),
    };
    alert(JSON.stringify(payload, null, 2));
}

function resetAll() {
    fileMeta.value = null;
    rows.value = [];
    isDragging.value = false;
}

function toNumber(v) {
    const s = String(v ?? '').replace(/,/g, '').trim();
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
}

function humanSize(bytes) {
    const b = Number(bytes || 0);
    if (b < 1024) return `${b}B`;
    const kb = b / 1024;
    if (kb < 1024) return `${kb.toFixed(1)}KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)}MB`;
}
</script>
  
<style lang="scss" scoped>
.bulk-voucher-upload {
    background: #f5f6fa;
    min-height: 100vh;

    .page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 16px 16px 40px;
    }

    .panel {
        background: #ffffff;
        border-radius: 12px;
        border: 2px solid #c6beb080;
        box-shadow: 0 8px 20px #2a210f0f;
        padding: 12px 14px;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: flex-start;
        margin-bottom: 12px;

        h1 {
            margin: 0 0 6px;
            font-size: 1.25rem;
            line-height: 1.25;
        }

        .subtitle {
            margin: 0;
            font-size: 0.85rem;
            color: #6b7280;
        }

        .header-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
        }
    }

    /* Upload strip */
    .upload-strip {
        padding: 12px;

        .dropzone {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            border-radius: 12px;
            border: 1px dashed #cbd5e1;
            background: #f8fafc;
            padding: 12px 12px;

            &.is-drag {
                border-color: #4b74ff;
                box-shadow: 0 0 0 2px rgba(75, 116, 255, 0.12);
                background: #f3f6ff;
            }

            .dz-title {
                font-weight: 900;
                color: #111827;
            }

            .dz-sub {
                margin-top: 3px;
                font-size: 0.78rem;
                color: #6b7280;
            }

            .dz-right {
                display: flex;
                gap: 8px;
                align-items: center;
                flex-wrap: wrap;
            }

            .file-input {
                display: none;
            }
        }

        .upload-meta {
            margin-top: 10px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;

            .meta-item {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 999px;
                padding: 6px 10px;
                font-size: 0.8rem;

                .k {
                    color: #9ca3af;
                    margin-right: 6px;
                    font-weight: 800;
                }

                .v {
                    color: #111827;
                    font-weight: 900;
                }

                .danger {
                    color: #b91c1c;
                }
            }
        }
    }

    /* Rows panel */
    .rows-panel {
        margin-top: 12px;

        .panel-head {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: flex-start;

            h2 {
                margin: 0 0 4px;
                font-size: 1rem;
            }

            .panel-sub {
                margin: 0;
                font-size: 0.78rem;
                color: #6b7280;
            }

            .panel-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                align-items: center;
            }
        }

        .summary-bar {
            margin-top: 10px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;

            .pill {
                border-radius: 999px;
                padding: 6px 10px;
                font-size: 0.78rem;
                font-weight: 900;
                border: 1px solid #e5e7eb;
                background: #ffffff;

                &--ok {
                    background: #ecfdf3;
                    border-color: #bbf7d0;
                    color: #166534;
                }

                &--warn {
                    background: #fef2f2;
                    border-color: #fecaca;
                    color: #b91c1c;
                }

                &--info {
                    background: #eef2ff;
                    border-color: #c7d2fe;
                    color: #1d3a8a;
                }
            }
        }

        .table-wrap {
            margin-top: 10px;
            border: 1px solid #eef2f7;
            border-radius: 12px;
            overflow: auto;
        }

        .tbl {
            width: 100%;
            border-collapse: collapse;
            min-width: 1060px;

            th,
            td {
                border-bottom: 1px solid #e5e7eb;
                padding: 8px 10px;
                font-size: 0.82rem;
                vertical-align: top;
            }

            th {
                background: #f3f4f6;
                text-align: center;
                color: #4b5563;
                font-weight: 900;
            }

            .right {
                text-align: right;
            }

            .center {
                text-align: center;
            }

            .mono {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                font-weight: 900;
            }

            tr.bad {
                background: #fff7f7;
            }

            tr.off {
                opacity: 0.5;
            }

            .cell-input {
                width: 100%;
                border-radius: 10px;
                border: 1px solid #d1d5db;
                padding: 8px 10px;
                outline: none;
                background: #fff;
                font-size: 0.85rem;

                &:focus {
                    border-color: #4b74ff;
                    box-shadow: 0 0 0 2px rgba(75, 116, 255, 0.14);
                }

                &.right {
                    text-align: right;
                }
            }

            .status {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 48px;
                padding: 3px 10px;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 1000;
                border: 1px solid;

                &.ok {
                    background: #ecfdf3;
                    color: #166534;
                    border-color: #bbf7d0;
                }

                &.warn {
                    background: #fef2f2;
                    color: #b91c1c;
                    border-color: #fecaca;
                }
            }

            .err {
                margin-top: 6px;
                font-size: 0.76rem;
                color: #b91c1c;
                line-height: 1.3;
            }
        }

        .panel-foot {
            margin-top: 10px;
            display: flex;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
            align-items: center;

            .foot-hint {
                font-size: 0.8rem;
                color: #6b7280;

                strong {
                    color: #4b74ff;
                }
            }

            .foot-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                align-items: center;
            }
        }
    }

    .empty {
        margin-top: 12px;
        text-align: center;
        padding: 18px 12px;

        .empty-title {
            font-weight: 900;
            color: #111827;
        }

        .empty-sub {
            margin-top: 6px;
            font-size: 0.82rem;
            color: #6b7280;
        }
    }

    /* Buttons */
    .btn {
        border-radius: 999px;
        border: none;
        padding: 8px 14px;
        font-size: 0.85rem;
        cursor: pointer;
        font-weight: 700;

        &--primary {
            background: #4b74ff;
            color: #ffffff;
        }

        &--ghost {
            background: #ffffff;
            color: #4b5563;
            border: 1px solid #d1d5db;
        }

        &:disabled {
            opacity: 0.55;
            cursor: not-allowed;
        }
    }

    .link {
        border: none;
        background: transparent;
        cursor: pointer;
        font-weight: 900;
        padding: 6px 8px;
        border-radius: 8px;

        &.danger {
            color: #b91c1c;
        }
    }

    /* Modal */
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        z-index: 50;
    }

    .modal {
        width: 760px;
        max-width: 100%;
        background: #ffffff;
        border-radius: 14px;
        box-shadow: 0 20px 50px rgba(15, 23, 42, 0.2);
        overflow: hidden;

        .modal-header {
            padding: 14px 16px;
            display: flex;
            justify-content: space-between;
            gap: 12px;
            border-bottom: 1px solid #e5e7eb;

            .modal-title {
                font-size: 1.05rem;
                font-weight: 900;
                margin-bottom: 2px;
            }

            .modal-sub {
                font-size: 0.78rem;
                color: #6b7280;
            }

            .icon-btn {
                width: 36px;
                height: 36px;
                border-radius: 999px;
                border: 1px solid #e5e7eb;
                background: #ffffff;
                cursor: pointer;
                font-size: 18px;
                line-height: 1;
            }
        }

        .modal-body {
            padding: 14px 16px;

            .guide-block {
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 10px 12px;
                background: #f9fafb;
                margin-bottom: 10px;

                &.warn {
                    background: #fff7ed;
                    border-color: #fed7aa;
                }

                .g-title {
                    font-weight: 900;
                    margin-bottom: 6px;
                    color: #111827;
                }

                .g-sub {
                    font-size: 0.82rem;
                    color: #6b7280;
                    line-height: 1.35;
                }

                .code {
                    margin: 0;
                    padding: 10px;
                    border-radius: 10px;
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    overflow: auto;
                    font-size: 0.82rem;
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                }

                .ul {
                    margin: 0;
                    padding-left: 18px;
                    color: #6b7280;
                    font-size: 0.82rem;

                    li {
                        margin-bottom: 4px;
                    }
                }
            }
        }

        .modal-footer {
            padding: 12px 16px;
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            border-top: 1px solid #e5e7eb;
        }
    }

    /* Mobile */
    @media (max-width: 520px) {
        .page {
            padding: 14px 12px 30px;
        }

        .page-header {
            flex-direction: column;
            align-items: stretch;

            .header-actions {
                justify-content: flex-end;
            }
        }

        .upload-strip .dropzone {
            flex-direction: column;
            align-items: stretch;

            .dz-right {
                justify-content: flex-end;
            }
        }
    }
}</style>
