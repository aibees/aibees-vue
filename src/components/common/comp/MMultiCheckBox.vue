<template>
    <div class="m-multi-cb" ref="rootRef">

        <!-- Trigger -->
        <button class="mcb-trigger" :class="{ active: isOpen, 'has-value': modelValue.length > 0 }"
            @click="openDropdown" type="button">
            <span class="mcb-trigger-label">{{ triggerLabel }}</span>
            <svg class="mcb-chevron" :class="{ rotated: isOpen }"
                viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>

        <!-- Dropdown Panel (Teleport) -->
        <Teleport to="body">
            <div v-if="isOpen" class="mcb-mask" @mousedown.self="cancel" />
            <div v-if="isOpen" class="mcb-panel" ref="panelRef" :style="panelStyle">

                <!-- 전체 선택 -->
                <div class="mcb-item mcb-all" @click="toggleAll">
                    <span class="mcb-item-label">전체 선택</span>
                    <span class="mcb-checkbox" :class="{ checked: isAllSelected, indeterminate: isIndeterminate }">
                        <svg v-if="isAllSelected" viewBox="0 0 12 10" fill="none">
                            <path d="M1 5l3.5 3.5L11 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span v-else-if="isIndeterminate" class="indeterminate-bar"></span>
                    </span>
                </div>

                <div class="mcb-divider" />

                <!-- 옵션 리스트 -->
                <div class="mcb-list">
                    <div class="mcb-item" v-for="opt in options" :key="opt.value" @click="toggleItem(opt.value)">
                        <span class="mcb-item-label">{{ opt.label }}</span>
                        <span class="mcb-checkbox" :class="{ checked: temp.includes(opt.value) }">
                            <svg v-if="temp.includes(opt.value)" viewBox="0 0 12 10" fill="none">
                                <path d="M1 5l3.5 3.5L11 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                    </div>
                    <div v-if="options.length === 0" class="mcb-empty">선택 가능한 항목이 없습니다.</div>
                </div>

                <!-- Footer -->
                <div class="mcb-footer">
                    <button class="mcb-btn-cancel" @click="cancel">취소</button>
                    <button class="mcb-btn-confirm" @click="confirm">
                        확인
                        <span class="mcb-confirm-count" v-if="temp.length > 0">({{ temp.length }})</span>
                    </button>
                </div>

            </div>
        </Teleport>
    </div>
</template>

<script setup>
const props = defineProps({
    modelValue:  { type: Array,  default: () => [] },   // 선택된 value 배열
    options:     { type: Array,  default: () => [] },   // [{ value, label }]
    placeholder: { type: String, default: '선택하세요' },
    allText:     { type: String, default: '전체' },      // 전체 선택 시 표시 텍스트
});
const emit = defineEmits(['update:modelValue']);

// ==========================================
// State
// ==========================================
const rootRef  = ref(null);
const panelRef = ref(null);
const isOpen   = ref(false);
const panelStyle = ref({});
const temp     = ref([...props.modelValue]);  // 패널 내 임시 선택값

// ==========================================
// Computed
// ==========================================
const isAllSelected   = computed(() => props.options.length > 0 && temp.value.length === props.options.length);
const isIndeterminate = computed(() => temp.value.length > 0 && temp.value.length < props.options.length);

const triggerLabel = computed(() => {
    const sel = props.modelValue;
    if (sel.length === 0) return props.placeholder;
    if (sel.length === props.options.length) return props.allText;
    const first = props.options.find(o => o.value === sel[0])?.label ?? sel[0];
    return sel.length === 1 ? first : `${first} 외 ${sel.length - 1}개`;
});

// ==========================================
// Methods
// ==========================================
const toggleItem = (value) => {
    const idx = temp.value.indexOf(value);
    if (idx === -1) temp.value.push(value);
    else            temp.value.splice(idx, 1);
};

const toggleAll = () => {
    if (isAllSelected.value) {
        temp.value = [];
    } else {
        temp.value = props.options.map(o => o.value);
    }
};

const openDropdown = () => {
    temp.value = [...props.modelValue];
    isOpen.value = true;
    nextTick(() => positionPanel());
};

const positionPanel = () => {
    if (!rootRef.value) return;
    const rect    = rootRef.value.getBoundingClientRect();
    const panelW  = Math.max(rect.width, 220);
    const viewW   = window.innerWidth;
    let left = rect.left + window.scrollX;
    if (left + panelW > viewW - 8) left = rect.right + window.scrollX - panelW;

    panelStyle.value = {
        top:      `${rect.bottom + window.scrollY + 6}px`,
        left:     `${left}px`,
        minWidth: `${panelW}px`,
    };
};

const cancel = () => {
    isOpen.value = false;
};

const confirm = () => {
    emit('update:modelValue', [...temp.value]);
    isOpen.value = false;
};

// 외부 modelValue 변경 동기화
watch(() => props.modelValue, (v) => { temp.value = [...v]; }, { deep: true });

// ESC 닫기
const onKeydown = (e) => { if (e.key === 'Escape') cancel(); };
onMounted(()   => document.addEventListener('keydown', onKeydown));
onUnmounted(() => document.removeEventListener('keydown', onKeydown));
</script>

<style lang="scss" scoped>
$primary:     #4b74ff;
$text-main:   #111827;
$text-sub:    #4b5563;
$text-light:  #9ca3af;
$border:      #e5e7eb;
$bg-white:    #ffffff;
$bg-hover:    #f1f5f9;

/* ==========================================
   Trigger
========================================== */
.mcb-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    height: 40px;
    padding: 0 12px;
    min-width: 160px;
    background: $bg-white;
    border: 1px solid $border;
    border-radius: 8px;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    color: $text-light;
    transition: border-color 0.15s, box-shadow 0.15s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &.has-value { color: $text-main; font-weight: 600; }

    &:hover    { border-color: #adb5bd; }
    &.active   { border-color: $primary; box-shadow: 0 0 0 2px rgba($primary, 0.12); }

    .mcb-trigger-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: left;
    }

    .mcb-chevron {
        width: 12px;
        height: 8px;
        color: $text-light;
        flex-shrink: 0;
        transition: transform 0.2s;
        &.rotated { transform: rotate(180deg); }
    }
}

/* ==========================================
   Mask
========================================== */
.mcb-mask {
    position: fixed;
    inset: 0;
    z-index: 9998;
}

/* ==========================================
   Panel
========================================== */
.mcb-panel {
    position: absolute;
    z-index: 9999;
    background: $bg-white;
    border: 1px solid $border;
    border-radius: 10px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: 'Pretendard', sans-serif;
}

/* ==========================================
   전체 선택 행
========================================== */
.mcb-all {
    background: #f8fafc;
    border-bottom: 1px solid $border;

    .mcb-item-label { font-weight: 700; color: $text-sub; }
}

.mcb-divider { height: 1px; background: $border; }

/* ==========================================
   옵션 리스트
========================================== */
.mcb-list {
    max-height: 240px;
    overflow-y: auto;
}

.mcb-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    cursor: pointer;
    transition: background 0.12s;
    gap: 10px;

    &:hover { background: $bg-hover; }

    .mcb-item-label {
        font-size: 14px;
        color: $text-main;
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.mcb-empty {
    padding: 16px 14px;
    font-size: 13px;
    color: $text-light;
    text-align: center;
}

/* ==========================================
   Checkbox
========================================== */
.mcb-checkbox {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    border: 1.5px solid $border;
    border-radius: 4px;
    background: $bg-white;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s, background 0.15s;

    svg { width: 12px; height: 10px; }

    &.checked {
        background: $primary;
        border-color: $primary;
    }

    &.indeterminate {
        background: $primary;
        border-color: $primary;

        .indeterminate-bar {
            display: block;
            width: 9px;
            height: 2px;
            background: white;
            border-radius: 1px;
        }
    }
}

/* ==========================================
   Footer
========================================== */
.mcb-footer {
    display: flex;
    gap: 8px;
    padding: 10px 14px;
    border-top: 1px solid $border;
    background: #f8fafc;

    button {
        flex: 1;
        height: 36px;
        border-radius: 7px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: 0.15s;
        font-family: inherit;
        border: none;
    }

    .mcb-btn-cancel {
        background: $bg-white;
        border: 1px solid $border !important;
        color: $text-sub;
        &:hover { background: #e2e8f0; }
    }

    .mcb-btn-confirm {
        background: $primary;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;

        &:hover { background: #3848c7; }

        .mcb-confirm-count {
            font-size: 12px;
            opacity: 0.85;
        }
    }
}
</style>
