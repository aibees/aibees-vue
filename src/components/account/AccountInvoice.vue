<template>
    <div class="invoice-management d-container">
        <h2 style="text-align: start; margin: 0 1.3rem;">{{ route.meta.title }}</h2>

        <!-- 상단 액션 바 -->
        <section class="top-action-bar d-panel">
            <div class="bar-left">
                <template v-if="receipts.length > 0">
                    <span class="attach-count">{{ receipts.length }}장 첨부</span>
                    <span class="attach-sep">·</span>
                    <span class="attach-done">{{ doneCount }}건 판독완료</span>
                    <template v-if="pendingCount > 0">
                        <span class="attach-sep">·</span>
                        <span class="attach-pending">{{ pendingCount }}건 대기</span>
                    </template>
                </template>
                <span class="attach-hint" v-else>영수증 이미지를 첨부하면 자동으로 판독합니다</span>
            </div>
            <div class="bar-right">
                <button class="btn-draft" :disabled="receipts.length === 0" @click="saveDraft">
                    💾 임시저장
                </button>
                <button class="btn-submit" :disabled="!canSubmit" @click="submitAll">
                    ✔ 제출
                </button>
            </div>
        </section>

        <!-- 드래그앤드롭 업로드 존 -->
        <section
            class="upload-zone d-panel"
            :class="{ 'drag-over': isDragOver }"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="onDrop"
            @click="triggerFileInput"
        >
            <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                multiple
                hidden
                @change="onFileChange"
            />
            <div class="upload-inner">
                <div class="upload-icon">🧾</div>
                <p class="upload-main">영수증 이미지를 드래그하거나 클릭해서 첨부</p>
                <p class="upload-sub">JPG · PNG · HEIC 지원 &nbsp;|&nbsp; 여러 장 동시 첨부 가능</p>
            </div>
        </section>

        <!-- 영수증 카드 목록 -->
        <TransitionGroup name="receipt" tag="div" class="receipt-list">
            <div
                class="receipt-card d-panel"
                v-for="(item, idx) in receipts"
                :key="item.id"
            >
                <!-- 카드 헤더 -->
                <div class="rc-header">
                    <div class="rc-header-left">
                        <span class="rc-num">#{{ idx + 1 }}</span>
                        <span class="rc-filename">{{ item.file.name }}</span>
                        <span class="rc-status" :class="`status-${item.status}`">
                            {{ STATUS_LABEL[item.status] }}
                        </span>
                    </div>
                    <div class="rc-header-right">
                        <button
                            class="btn-reocr"
                            v-if="item.status === 'done' || item.status === 'error'"
                            @click.stop="runOcr(item)"
                            title="재판독"
                        >🔄 재판독</button>
                        <button class="btn-remove" @click.stop="removeReceipt(idx)">✕</button>
                    </div>
                </div>

                <!-- 본문: 이미지 + 판독결과 -->
                <div class="rc-body">

                    <!-- 이미지 미리보기 -->
                    <div class="rc-image-wrap">
                        <img :src="item.preview" :alt="`영수증 ${idx + 1}`" class="rc-image" />
                    </div>

                    <!-- 판독 결과 패널 -->
                    <div class="rc-result">

                        <!-- 대기 -->
                        <div class="result-state" v-if="item.status === 'pending'">
                            <span class="state-icon">📋</span>
                            <span class="state-text">판독 대기 중입니다.</span>
                        </div>

                        <!-- 로딩 -->
                        <div class="result-state" v-else-if="item.status === 'loading'">
                            <span class="spinner"></span>
                            <span class="state-text">판독 중...</span>
                        </div>

                        <!-- 오류 -->
                        <div class="result-state result-error" v-else-if="item.status === 'error'">
                            <span class="state-icon">⚠️</span>
                            <span class="state-text">판독에 실패했습니다. 재판독을 시도해주세요.</span>
                        </div>

                        <!-- 완료 -->
                        <template v-else-if="item.status === 'done'">

                            <!-- 신뢰도 바 -->
                            <div class="confidence-wrap">
                                <span class="confidence-label">판독 신뢰도</span>
                                <div class="confidence-bar">
                                    <div
                                        class="confidence-fill"
                                        :class="confClass(item.result.confidence)"
                                        :style="{ width: item.result.confidence + '%' }"
                                    ></div>
                                </div>
                                <span class="confidence-pct">{{ item.result.confidence }}%</span>
                            </div>

                            <!-- 기본 필드 -->
                            <div class="result-grid">
                                <div class="result-field">
                                    <label>거래 일자</label>
                                    <input type="date" v-model="item.result.txDate" />
                                </div>
                                <div class="result-field">
                                    <label>거래 시간</label>
                                    <input type="time" v-model="item.result.txTime" />
                                </div>
                                <div class="result-field">
                                    <label>상호명</label>
                                    <input type="text" v-model="item.result.storeName" placeholder="상호명" />
                                </div>
                                <div class="result-field">
                                    <label>사업자번호</label>
                                    <input type="text" v-model="item.result.bizNo" placeholder="000-00-00000" />
                                </div>
                                <div class="result-field result-field-full">
                                    <label>합계 금액 (원) <span class="required">*</span></label>
                                    <input
                                        type="number"
                                        v-model.number="item.result.totalAmount"
                                        class="amount-input"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <!-- 품목 리스트 -->
                            <div class="result-items" v-if="item.result.items?.length > 0">
                                <div class="items-title">품목 내역</div>
                                <div class="item-row" v-for="(it, i) in item.result.items" :key="i">
                                    <input class="item-name"  type="text"   v-model="it.name"  placeholder="품목명" />
                                    <input class="item-qty"   type="number" v-model.number="it.qty"   placeholder="수량" />
                                    <input class="item-price" type="number" v-model.number="it.price" placeholder="단가" />
                                    <button class="btn-remove-item" @click="item.result.items.splice(i, 1)">✕</button>
                                </div>
                                <button class="btn-add-item" @click="item.result.items.push({ name: '', qty: 1, price: 0 })">
                                    + 품목 추가
                                </button>
                            </div>

                            <!-- 전표 생성 -->
                            <div class="result-footer">
                                <button
                                    class="btn-create-entry"
                                    :class="{ 'already-created': item.entryCreated }"
                                    :disabled="item.entryCreated"
                                    @click="createEntry(item)"
                                >
                                    <template v-if="item.entryCreated">✔ 전표 생성 완료</template>
                                    <template v-else>✚ 이 영수증으로 전표 생성</template>
                                </button>
                            </div>

                        </template>
                    </div>
                </div>
            </div>
        </TransitionGroup>

    </div>
</template>

<script setup>
// ==========================================
// 1. Imports
// ==========================================
import axios from 'axios';
// import mariaApi from '@scripts/util/mariaApi.js'; // TODO: API 연동 시 주석 해제

// ==========================================
// 2. Variables
// ==========================================
const STATUS_LABEL = {
    pending: '대기',
    loading: '판독중',
    done:    '판독완료',
    error:   '판독실패',
};

const route        = useRoute();
const fileInputRef = ref(null);
const isDragOver   = ref(false);
const receipts     = ref([]);
let   idSeq        = 0;

// ==========================================
// 3. Computed
// ==========================================
const doneCount = computed(() =>
    receipts.value.filter(r => r.status === 'done').length
);

const pendingCount = computed(() =>
    receipts.value.filter(r => r.status === 'pending' || r.status === 'loading').length
);

const canSubmit = computed(() =>
    receipts.value.length > 0 &&
    receipts.value.every(r => r.status === 'done' || r.status === 'error') &&
    receipts.value.some(r => r.entryCreated)
);

// ==========================================
// 4. Lifecycle
// ==========================================
onMounted(() => {

});

onUnmounted(() => {
    receipts.value.forEach(r => URL.revokeObjectURL(r.preview));
});

// ==========================================
// 5. Functions
// ==========================================

const confClass = (pct) => {
    if (pct >= 80) return 'conf-high';
    if (pct >= 50) return 'conf-mid';
    return 'conf-low';
};

const triggerFileInput = () => {
    fileInputRef.value?.click();
}

const onFileChange = (e) => {
    addFiles([...e.target.files]);
    e.target.value = ''; // 같은 파일 재선택 허용
};

const onDrop = (e) => {
    isDragOver.value = false;
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
    addFiles(files);
};

const addFiles = (files) => {
    for (const file of files) {
        receipts.value.push({
            id:           ++idSeq,
            file,
            preview:      URL.createObjectURL(file),
            status:       'pending',
            result:       null,
            entryCreated: false,
        });
        // push 후 배열 안의 reactive proxy를 전달해야 status/result 변경이 화면에 반영됨
        runOcr(receipts.value[receipts.value.length - 1]);
    }
};

const removeReceipt = (idx) => {
    URL.revokeObjectURL(receipts.value[idx].preview);
    receipts.value.splice(idx, 1);
};

const runOcr = async (item) => {
    item.status       = 'loading';
    item.result       = null;
    item.entryCreated = false;

    try {
        const fd = new FormData();
        fd.append('image', item.file);

        const { data } = await axios.post('http://127.0.0.1:5559/api/v1/ocr/invoice', fd);
        console.log(data.data);

        const parsed        = data?.data?.parsed ?? {};
        const confidenceAvg = data?.data?.confidence_avg ?? 0;

        // parsed 필드 중 실제 값이 하나라도 있으면 done, 모두 null이면 error
        const hasData = Object.values(parsed).some(v => v !== null && v !== '');

        item.result = {
            txDate:      parsed.date                          ?? '',
            txTime:      parsed.time                          ?? '',
            storeName:   parsed.store_name                    ?? '',
            bizNo:       parsed.business_registration_number  ?? '',
            totalAmount: parsed.total_amount != null ? Number(parsed.total_amount) : null,
            confidence:  Math.round(confidenceAvg * 100),
            items:       [],
        };
        item.status = hasData ? 'done' : 'error';

        console.log("status : " + item.status);
        console.log("result: ");
        console.log(item.result);

    } catch (e) {
        console.error(e);
        item.status = 'error';
    }
};

const createEntry = (item) => {
    // TODO: 실제 전표 생성 API 연동
    // await mariaApi.post('/api/account/entry', { ...item.result });
    item.entryCreated = true;
};

const saveDraft = () => {
    // TODO: 임시저장 API 연동
    alert('임시저장되었습니다.');
};

const submitAll = () => {
    // TODO: 일괄 제출 API 연동
    const cnt = receipts.value.filter(r => r.entryCreated).length;
    alert(`${cnt}건의 전표가 제출되었습니다.`);
};
</script>

<style src="@@/account/accountInvoice.scss" lang="scss" scoped />
