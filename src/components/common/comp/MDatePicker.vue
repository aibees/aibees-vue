<template>
    <div class="m-date-picker" ref="rootRef">

        <!-- Trigger Button -->
        <button class="dp-trigger" @click="openPicker" type="button">
            <span class="dp-range-text">
                <span class="dp-val">{{ formatDisplay(internalStart) || '시작일' }}</span>
                <span class="dp-sep">→</span>
                <span class="dp-val">{{ formatDisplay(internalEnd) || '종료일' }}</span>
            </span>
            <svg class="dp-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M3 8h14" stroke="currentColor" stroke-width="1.5"/>
                <path d="M7 2v3M13 2v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        </button>

        <!-- Panel (Teleport) -->
        <Teleport to="body">
            <div v-if="isOpen" class="dp-mask" @mousedown.self="cancelPicker">
                <div class="dp-panel" ref="panelRef" :style="panelStyle">

                    <!-- Left: Quick select -->
                    <ul class="dp-quick-list">
                        <li v-for="q in QUICK_LIST" :key="q.key"
                            :class="{ active: activeQuick === q.key }"
                            @click="applyQuick(q)">
                            {{ q.label }}
                        </li>
                    </ul>

                    <!-- Right: Calendar -->
                    <div class="dp-cal">

                        <!-- Date chips -->
                        <div class="dp-chips">
                            <div class="dp-chip" :class="{ focus: pickStep === 0 }">
                                {{ formatDisplay(tempStart) || '시작일' }}
                            </div>
                            <svg class="dp-chip-arrow" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <div class="dp-chip" :class="{ focus: pickStep === 1 }">
                                {{ formatDisplay(tempEnd) || '종료일' }}
                            </div>
                        </div>

                        <!-- Month navigation -->
                        <div class="dp-nav">
                            <button class="dp-nav-btn" @click="shiftView(-12)">«</button>
                            <button class="dp-nav-btn" @click="shiftView(-1)">‹</button>
                            <span class="dp-nav-title">{{ viewYear }}년 {{ String(viewMonth).padStart(2, '0') }}월</span>
                            <button class="dp-nav-btn" @click="shiftView(1)">›</button>
                            <button class="dp-nav-btn" @click="shiftView(12)">»</button>
                        </div>

                        <!-- Months scroll area -->
                        <div class="dp-months" @mouseleave="hoverDate = null">
                            <div v-for="m in visibleMonths" :key="`${m.year}-${m.month}`" class="dp-month">
                                <div class="dp-month-label">{{ m.year }}년 {{ m.month }}월</div>
                                <div class="dp-weekdays">
                                    <span v-for="wd in WEEKDAYS" :key="wd">{{ wd }}</span>
                                </div>
                                <div class="dp-grid">
                                    <span v-for="n in m.startOffset" :key="`e${n}`" class="dp-empty"></span>
                                    <span v-for="day in m.days" :key="day.str"
                                        class="dp-cell"
                                        :class="cellClass(day.str)"
                                        @click="pickDate(day.str)"
                                        @mouseenter="hoverDate = day.str">
                                        <span class="dp-num">{{ day.d }}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="dp-footer">
                            <button class="dp-btn-cancel" @click="cancelPicker">취소</button>
                            <button class="dp-btn-confirm" @click="confirmPicker"
                                :disabled="!tempStart || !tempEnd">확인</button>
                        </div>
                    </div>

                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({ start: '', end: '' })
    }
});
const emit = defineEmits(['update:modelValue']);

// ==========================================
// Constants
// ==========================================
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const QUICK_LIST = [
    { key: 'today',     label: '오늘' },
    { key: 'yesterday', label: '어제' },
    { key: 'this-week', label: '이번주' },
    { key: 'last-week', label: '지난주' },
    { key: 'l7-inc',    label: '최근 7일 (오늘 포함)' },
    { key: 'l7-exc',    label: '최근 7일 (오늘 제외)' },
    { key: 'this-month',label: '이번달' },
    { key: 'last-month',label: '지난달' },
    { key: 'l30-inc',   label: '최근 30일 (오늘 포함)' },
    { key: 'l30-exc',   label: '최근 30일 (오늘 제외)' },
];

// ==========================================
// State
// ==========================================
const rootRef  = ref(null);
const panelRef = ref(null);
const isOpen   = ref(false);
const panelStyle = ref({});

const internalStart = ref(props.modelValue?.start ?? '');
const internalEnd   = ref(props.modelValue?.end   ?? '');

const tempStart  = ref('');
const tempEnd    = ref('');
const pickStep   = ref(0);   // 0 = picking start, 1 = picking end
const hoverDate  = ref(null);
const activeQuick = ref('');

const today = new Date();
const viewYear  = ref(today.getFullYear());
const viewMonth = ref(today.getMonth() + 1);

// ==========================================
// Helpers
// ==========================================
const toStr = (d) => {
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tz).toISOString().split('T')[0];
};

const todayStr = toStr(new Date());

const formatDisplay = (str) => {
    if (!str) return '';
    return str.replace(/-/g, '.') + '.';
};

// ==========================================
// Calendar generation
// ==========================================
const visibleMonths = computed(() => {
    const result = [];
    for (let i = 0; i < 2; i++) {
        let y = viewYear.value;
        let m = viewMonth.value + i;
        while (m > 12) { m -= 12; y++; }
        const startOffset = new Date(y, m - 1, 1).getDay();
        const total = new Date(y, m, 0).getDate();
        const days = Array.from({ length: total }, (_, idx) => {
            const d = idx + 1;
            const str = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            return { d, str };
        });
        result.push({ year: y, month: m, startOffset, days });
    }
    return result;
});

// ==========================================
// Cell class logic
// ==========================================
const cellClass = (dateStr) => {
    const classes = [];

    // Effective range (considering hover preview when picking end)
    let s = tempStart.value;
    let e = tempEnd.value;

    if (pickStep.value === 1 && s && hoverDate.value) {
        const h = hoverDate.value;
        s = s <= h ? s : h;
        e = s <= h ? h : tempStart.value;
        // Re-set s in case h < tempStart
        if (hoverDate.value < tempStart.value) {
            s = hoverDate.value;
            e = tempStart.value;
        } else {
            s = tempStart.value;
            e = hoverDate.value;
        }
    }

    if (s && e) {
        if (dateStr === s && dateStr === e) {
            classes.push('is-start', 'is-end', 'is-single');
        } else {
            if (dateStr === s) classes.push('is-start');
            if (dateStr === e) classes.push('is-end');
            if (dateStr > s && dateStr < e) classes.push('in-range');
        }
    } else if (s && !e) {
        if (dateStr === s) classes.push('is-start', 'is-end', 'is-single');
    }

    if (dateStr === todayStr) classes.push('is-today');
    return classes;
};

// ==========================================
// Pick date
// ==========================================
const pickDate = (dateStr) => {
    activeQuick.value = '';
    if (pickStep.value === 0) {
        tempStart.value = dateStr;
        tempEnd.value   = '';
        pickStep.value  = 1;
    } else {
        if (dateStr < tempStart.value) {
            tempEnd.value   = tempStart.value;
            tempStart.value = dateStr;
        } else {
            tempEnd.value = dateStr;
        }
        pickStep.value = 0;
    }
};

// ==========================================
// Quick select
// ==========================================
const applyQuick = (q) => {
    activeQuick.value = q.key;
    const d = new Date();
    const td = toStr(d);
    const dow = d.getDay();

    const ranges = {
        'today':      { s: td, e: td },
        'yesterday':  { s: toStr(new Date(d.getFullYear(), d.getMonth(), d.getDate()-1)),
                        e: toStr(new Date(d.getFullYear(), d.getMonth(), d.getDate()-1)) },
        'this-week':  { s: toStr(new Date(d.getFullYear(), d.getMonth(), d.getDate()-dow)),
                        e: toStr(new Date(d.getFullYear(), d.getMonth(), d.getDate()-dow+6)) },
        'last-week':  { s: toStr(new Date(d.getFullYear(), d.getMonth(), d.getDate()-dow-7)),
                        e: toStr(new Date(d.getFullYear(), d.getMonth(), d.getDate()-dow-1)) },
        'l7-inc':     { s: toStr(new Date(d.getFullYear(), d.getMonth(), d.getDate()-6)), e: td },
        'l7-exc':     { s: toStr(new Date(d.getFullYear(), d.getMonth(), d.getDate()-7)),
                        e: toStr(new Date(d.getFullYear(), d.getMonth(), d.getDate()-1)) },
        'this-month': { s: toStr(new Date(d.getFullYear(), d.getMonth(), 1)),
                        e: toStr(new Date(d.getFullYear(), d.getMonth()+1, 0)) },
        'last-month': { s: toStr(new Date(d.getFullYear(), d.getMonth()-1, 1)),
                        e: toStr(new Date(d.getFullYear(), d.getMonth(), 0)) },
        'l30-inc':    { s: toStr(new Date(d.getFullYear(), d.getMonth(), d.getDate()-29)), e: td },
        'l30-exc':    { s: toStr(new Date(d.getFullYear(), d.getMonth(), d.getDate()-30)),
                        e: toStr(new Date(d.getFullYear(), d.getMonth(), d.getDate()-1)) },
    };

    const r = ranges[q.key];
    if (!r) return;
    tempStart.value = r.s;
    tempEnd.value   = r.e;
    pickStep.value  = 0;

    // Navigate to start month
    const [y, m] = r.s.split('-').map(Number);
    viewYear.value  = y;
    viewMonth.value = m;
};

// ==========================================
// Panel open / close / confirm
// ==========================================
const openPicker = () => {
    tempStart.value  = internalStart.value;
    tempEnd.value    = internalEnd.value;
    pickStep.value   = 0;
    hoverDate.value  = null;
    activeQuick.value = '';

    if (internalStart.value) {
        const [y, m] = internalStart.value.split('-').map(Number);
        viewYear.value  = y;
        viewMonth.value = m;
    } else {
        viewYear.value  = today.getFullYear();
        viewMonth.value = today.getMonth() + 1;
    }

    isOpen.value = true;

    nextTick(() => positionPanel());
};

const positionPanel = () => {
    if (!rootRef.value) return;
    const rect = rootRef.value.getBoundingClientRect();
    const panelW = 620;
    const viewportW = window.innerWidth;

    let left = rect.left;
    if (left + panelW > viewportW - 12) {
        left = Math.max(12, rect.right - panelW);
    }

    panelStyle.value = {
        top:  `${rect.bottom + window.scrollY + 8}px`,
        left: `${left + window.scrollX}px`,
    };
};

const cancelPicker  = () => { isOpen.value = false; };

const confirmPicker = () => {
    if (!tempStart.value || !tempEnd.value) return;
    internalStart.value = tempStart.value;
    internalEnd.value   = tempEnd.value;
    emit('update:modelValue', { start: tempStart.value, end: tempEnd.value });
    isOpen.value = false;
};

const shiftView = (delta) => {
    let m = viewMonth.value + delta;
    let y = viewYear.value;
    while (m > 12) { m -= 12; y++; }
    while (m < 1)  { m += 12; y--; }
    viewMonth.value = m;
    viewYear.value  = y;
};

// ==========================================
// Sync modelValue from outside
// ==========================================
watch(() => props.modelValue, (v) => {
    internalStart.value = v?.start ?? '';
    internalEnd.value   = v?.end   ?? '';
}, { deep: true });

// Close on ESC
const handleKeydown = (e) => { if (e.key === 'Escape') cancelPicker(); };
onMounted(()   => document.addEventListener('keydown', handleKeydown));
onUnmounted(() => document.removeEventListener('keydown', handleKeydown));
</script>

<style lang="scss" scoped>
$primary:      #4b74ff;
$primary-light:#dbeafe;
$text-main:    #111827;
$text-sub:     #4b5563;
$text-light:   #9ca3af;
$border:       #e5e7eb;
$bg-white:     #ffffff;
$bg-hover:     #f1f5f9;

/* ==========================================
   Trigger Button
========================================== */
.dp-trigger {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
    height: 40px;
    background: $bg-white;
    border: 1px solid $border;
    border-radius: 10px;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
    font-family: inherit;
    white-space: nowrap;

    &:hover {
        border-color: #adb5bd;
    }

    &:focus-visible {
        outline: none;
        border-color: $primary;
        box-shadow: 0 0 0 2px rgba($primary, 0.15);
    }

    .dp-range-text {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        color: $text-main;

        .dp-val { font-family: monospace; font-weight: 600; letter-spacing: -0.02em; }
        .dp-sep { color: $text-light; font-size: 15px; }
    }

    .dp-icon {
        width: 18px;
        height: 18px;
        color: $text-light;
        flex-shrink: 0;
    }
}

/* ==========================================
   Backdrop (click-outside area)
========================================== */
.dp-mask {
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: transparent;
}

/* ==========================================
   Panel
========================================== */
.dp-panel {
    position: absolute;
    z-index: 9999;
    display: flex;
    width: 620px;
    background: $bg-white;
    border-radius: 16px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
    overflow: hidden;
    font-family: 'Pretendard', sans-serif;
}

/* ==========================================
   Quick Select Sidebar
========================================== */
.dp-quick-list {
    width: 170px;
    flex-shrink: 0;
    padding: 12px 0;
    list-style: none;
    margin: 0;
    border-right: 1px solid $border;
    overflow-y: auto;

    li {
        padding: 9px 16px;
        font-size: 14px;
        color: $text-sub;
        cursor: pointer;
        transition: background 0.12s, color 0.12s;
        border-radius: 0;
        font-weight: 500;

        &:hover:not(.active) {
            background: $bg-hover;
            color: $text-main;
        }

        &.active {
            background: $primary;
            color: #fff;
            font-weight: 700;
        }
    }
}

/* ==========================================
   Calendar Section
========================================== */
.dp-cal {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Date chips bar */
.dp-chips {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px 0;

    .dp-chip {
        flex: 1;
        padding: 6px 10px;
        border: 1.5px solid $border;
        border-radius: 8px;
        font-size: 14px;
        font-family: monospace;
        font-weight: 600;
        color: $text-sub;
        text-align: center;
        transition: border-color 0.15s;

        &.focus {
            border-color: $primary;
            color: $primary;
        }
    }

    .dp-chip-arrow {
        width: 20px;
        height: 20px;
        color: $text-light;
        flex-shrink: 0;
    }
}

/* Month navigation */
.dp-nav {
    display: flex;
    align-items: center;
    padding: 6px 14px 6px;
    gap: 4px;

    .dp-nav-btn {
        background: none;
        border: none;
        font-size: 16px;
        color: $text-light;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        transition: background 0.12s, color 0.12s;
        line-height: 1;

        &:hover { background: $bg-hover; color: $text-main; }
    }

    .dp-nav-title {
        flex: 1;
        text-align: center;
        font-size: 15px;
        font-weight: 800;
        color: $text-main;
    }
}

/* Weekday header */
.dp-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding: 0 10px;
    margin-bottom: 2px;

    span {
        text-align: center;
        font-size: 11px;
        font-weight: 700;
        color: $text-light;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:first-child { color: #ef4444; } // 일요일
        &:last-child  { color: #2563eb; } // 토요일
    }
}

/* Months scroll area */
.dp-months {
    flex: 1;
    overflow-y: auto;
    padding: 0 10px 6px;

    .dp-month {
        margin-bottom: 10px;
    }

    .dp-month-label {
        font-size: 12px;
        font-weight: 800;
        color: $text-sub;
        padding: 2px 2px 4px;
        letter-spacing: -0.01em;
    }
}

/* Day grid */
.dp-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
}

.dp-empty { height: 28px; }

.dp-cell {
    position: relative;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;

    // Band bar (full-width background for range)
    &::before {
        content: '';
        position: absolute;
        inset: 3px 0;
        border-radius: 0;
        z-index: 0;
        background: transparent;
    }

    // Circle (for start/end dots)
    &::after {
        content: '';
        position: absolute;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        z-index: 1;
        background: transparent;
    }

    .dp-num {
        position: relative;
        z-index: 2;
        font-size: 13px;
        color: $text-main;
        font-weight: 500;
        line-height: 1;
    }

    &:hover:not(.is-start):not(.is-end) {
        .dp-num { color: $primary; font-weight: 700; }
    }

    // --- In range ---
    &.in-range {
        &::before { background: $primary-light; }
        .dp-num   { color: #1e40af; font-weight: 600; }
    }

    // --- Start ---
    &.is-start {
        &::before {
            background: $primary-light;
            left: 50%;
            right: 0;
            border-radius: 0;
        }
        &::after { background: $primary; }
        .dp-num  { color: #fff; font-weight: 700; }
    }

    // --- End ---
    &.is-end {
        &::before {
            background: $primary-light;
            left: 0;
            right: 50%;
            border-radius: 0;
        }
        &::after { background: $primary; }
        .dp-num  { color: #fff; font-weight: 700; }
    }

    // --- Single day (start = end) ---
    &.is-single {
        &::before { background: transparent !important; }
        &::after  { background: $primary; }
        .dp-num   { color: #fff; font-weight: 700; }
    }

    // --- Today marker ---
    &.is-today:not(.is-start):not(.is-end) {
        .dp-num {
            font-weight: 800;
            color: $primary;
            &::after {
                content: '';
                display: block;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: $primary;
                position: absolute;
                bottom: -3px;
                left: 50%;
                transform: translateX(-50%);
            }
        }
    }

    // First day of week: no left band tail
    &:nth-child(7n+1) {
        &.in-range::before, &.is-end::before { border-radius: 4px 0 0 4px; }
    }
    // Last day of week: no right band tail
    &:nth-child(7n) {
        &.in-range::before, &.is-start::before { border-radius: 0 4px 4px 0; }
    }
}

/* ==========================================
   Footer
========================================== */
.dp-footer {
    display: flex;
    gap: 10px;
    padding: 10px 14px;
    border-top: 1px solid $border;

    button {
        flex: 1;
        height: 44px;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: 0.15s;
        font-family: inherit;
    }

    .dp-btn-cancel {
        background: #f1f5f9;
        border: none;
        color: $text-sub;
        &:hover { background: #e2e8f0; }
    }

    .dp-btn-confirm {
        background: $primary;
        border: none;
        color: #fff;
        &:hover:not(:disabled) { background: #3848c7; }
        &:disabled { background: #cbd5e1; cursor: not-allowed; }
    }
}
</style>
