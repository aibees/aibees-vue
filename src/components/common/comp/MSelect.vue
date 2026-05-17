<template>
    <div class="m-select" ref="selectRef" :class="{ 'is-open': isOpen, 'is-invalid': isInvalid }">
        <!-- 트리거 버튼 -->
        <div class="select-trigger" @click="toggleDropdown">
            <span class="select-value" :class="{ 'is-placeholder': !hasSelection }" :style="`text-align: ${textAlign}`">
                {{ displayLabel }}
            </span>
            <i class="select-arrow" :class="{ open: isOpen }"></i>
        </div>

        <!-- 드롭다운 패널 -->
        <transition name="select-fade">
            <div v-if="isOpen" ref="panelRef" class="select-panel" :class="{ 'is-grid': props.grid }">
                <!-- placeholder 항목 -->
                <div v-if="props.placeholder" class="select-option placeholder-item" @click="clearSelection">
                    {{ props.placeholder }}
                </div>

                <!-- grid 모드 컬럼 헤더 -->
                <div v-if="props.grid && (props.codeLabel || props.nameLabel)" class="grid-col-header">
                    <span class="grid-col-header-code">{{ props.codeLabel }}</span>
                    <span class="grid-col-header-name">{{ props.nameLabel }}</span>
                </div>

                <!-- 그룹 없는 flat 옵션 -->
                <template v-if="!hasGroups">
                    <div
                        v-for="(opt, idx) in props.option"
                        :key="idx"
                        class="select-option"
                        :class="{ active: opt.value === selectedData }"
                        :style="!props.grid ? `text-align: ${textAlign}` : ''"
                        @click="pick(opt.value, opt.name)">
                        <template v-if="props.grid && opt.code">
                            <span class="opt-code">{{ opt.code }}</span>
                            <span class="opt-name">{{ opt.name }}</span>
                        </template>
                        <template v-else>{{ opt.name }}</template>
                    </div>
                </template>

                <!-- optgroup 스타일 그룹 옵션 -->
                <template v-else>
                    <div v-for="(group, gIdx) in props.groups" :key="gIdx" class="select-group">
                        <div class="group-header">
                            <span class="group-dot"></span>
                            {{ group.label }}
                        </div>
                        <div
                            v-for="(opt, idx) in group.items"
                            :key="idx"
                            class="select-option grouped"
                            :class="{ active: opt.value === selectedData }"
                            :style="!props.grid ? `text-align: ${textAlign}` : ''"
                            @click="pick(opt.value, opt.name)">
                            <template v-if="props.grid && opt.code">
                                <span class="opt-code">{{ opt.code }}</span>
                                <span class="opt-name">{{ opt.name }}</span>
                            </template>
                            <template v-else>{{ opt.name }}</template>
                        </div>
                    </div>
                </template>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    id: String,
    /** flat 옵션: [{ value, code?, name }] */
    option: { type: Array, default: () => [] },
    /** 그룹 옵션: [{ label, items: [{ value, code?, name }] }] */
    groups: { type: Array, default: () => [] },
    /** 미선택 placeholder 텍스트 */
    placeholder: { type: String, default: '선택하세요' },
    /** 유효성 오류 상태 */
    isInvalid: { type: Boolean, default: false },
    textAlign: { type: String, default: 'left' },
    /** 2열 그리드 모드 (items에 code 필드 필요) */
    grid: { type: Boolean, default: false },
    /** grid 모드 컬럼 헤더 */
    codeLabel: { type: String, default: '' },
    nameLabel: { type: String, default: '' },
});

const selectedData = defineModel();
const emit = defineEmits(['change']);

const isOpen = ref(false);
const selectRef = ref(null);
const panelRef = ref(null);

// groups prop이 있는지 여부
const hasGroups = computed(() => props.groups && props.groups.length > 0);

// 현재 선택된 항목이 있는지
const hasSelection = computed(() => selectedData.value !== undefined && selectedData.value !== null && selectedData.value !== '');

// 화면에 표시할 라벨 계산
const displayLabel = computed(() => {
    if (!hasSelection.value) return props.placeholder;

    let found = null;
    if (hasGroups.value) {
        for (const group of props.groups) {
            found = group.items?.find(opt => opt.value === selectedData.value);
            if (found) break;
        }
    } else {
        found = props.option.find(opt => opt.value === selectedData.value);
    }

    if (!found) return props.placeholder;
    // grid 모드이고 code가 있으면 "code · name" 형태로 표시
    return (props.grid && found.code) ? `${found.code} · ${found.name}` : found.name;
});

const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
};

// grid 모드: 패널이 열리면 .opt-code 셀들의 최대 너비를 측정해서 CSS 변수로 주입
watch(isOpen, async (opened) => {
    if (!opened || !props.grid) return;
    await nextTick();
    const cells = selectRef.value?.querySelectorAll('.opt-code');
    if (!cells?.length) return;
    let max = 0;
    cells.forEach(el => { max = Math.max(max, el.scrollWidth); });
    panelRef.value?.style.setProperty('--grid-code-w', `${max}px`);
});

const pick = (value, name) => {
    selectedData.value = value;
    emit('change', value, name);
    isOpen.value = false;
};

const clearSelection = () => {
    selectedData.value = '';
    emit('change', '');
    isOpen.value = false;
};

const handleClickOutside = (e) => {
    if (selectRef.value && !selectRef.value.contains(e.target)) {
        isOpen.value = false;
    }
};

onMounted(() => document.addEventListener('mousedown', handleClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside));
</script>

<style lang="scss" scoped>
@use '@@/__variables.scss' as *;

.m-select {
    position: relative;
    width: 100%;
    box-sizing: border-box;

    // ── 트리거 ──────────────────────────────────
    .select-trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 32px;
        padding: 0 10px;
        background: transparent;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        cursor: pointer;
        user-select: none;
        transition: border-color 0.15s, background 0.15s;
        box-sizing: border-box;

        &:hover {
            border-color: #9ca3af;
            background: #ffffff;
        }

        .select-value {
            font-size: 13px;
            color: #111827;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;

            &.is-placeholder {
                color: #9ca3af;
            }
        }

        // 화살표
        .select-arrow {
            flex-shrink: 0;
            margin-left: 6px;
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 5px solid #9ca3af;
            transition: transform 0.2s ease;

            &.open {
                transform: rotate(180deg);
                border-top-color: $primary;
            }
        }
    }

    // 포커스 상태 (열렸을 때)
    &.is-open .select-trigger {
        border-color: $primary;
        background: #ffffff;
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.12);
    }

    // 오류 상태
    &.is-invalid .select-trigger {
        border-color: #ef4444;
        background: #fff5f5;
    }

    // ── 드롭다운 패널 ────────────────────────────
    .select-panel {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        min-width: 100%;
        max-height: auto;
        overflow-y: auto;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.10), 0 2px 6px rgba(0, 0, 0, 0.06);
        z-index: 999;
        box-sizing: border-box;

        &::-webkit-scrollbar {
            width: 4px;
        }
        &::-webkit-scrollbar-track {
            background: transparent;
        }
        &::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 99px;
        }
    }

    // ── 평면 옵션 아이템 ────────────────────────
    .select-option {
        padding: 8px 12px;
        font-size: 13px;
        color: #374151;
        cursor: pointer;
        transition: background 0.1s;
        white-space: nowrap;

        &:hover {
            background: #f1f5ff;
            color: $primary;
        }

        &.active {
            background: #eff4ff;
            color: $primary;
            font-weight: 700;

            &::before {
                content: '✓ ';
                font-size: 11px;
            }
        }

        // placeholder 역할 (clear 용)
        &.placeholder-item {
            color: #9ca3af;
            font-style: italic;
            border-bottom: 1px solid #f3f4f6;
        }

        // 그룹 내 옵션 들여쓰기
        &.grouped {
            padding-left: 20px;
        }
    }

    // ── grid 모드 (테이블 스타일) ─────────────────
    .select-panel.is-grid {
        min-width: max-content;
        padding: 0;
        overflow: hidden; // 패널 모서리 둥글게 유지

        // 컬럼 헤더 행
        .grid-col-header {
            display: grid;
            grid-template-columns: var(--grid-code-w, max-content) 1fr;
            background: #f1f5f9;
            border-bottom: 2px solid #e2e8f0;
            position: sticky;
            top: 0;
            z-index: 2;

            .grid-col-header-code,
            .grid-col-header-name {
                padding: 6px 10px;
                font-size: 11px;
                font-weight: 700;
                color: #6b7280;
                letter-spacing: 0.05em;
            }

            .grid-col-header-code {
                border-right: 1px solid #e2e8f0;
            }
        }

        // grid 모드 행 레이아웃
        .select-option {
            display: grid;
            grid-template-columns: var(--grid-code-w, max-content) 1fr;
            gap: 0;
            align-items: stretch;  // 셀 높이를 행 전체로
            padding: 0;
            border-bottom: 1px solid #f1f5f9;

            &:last-child { border-bottom: none; }

            &:hover {
                background: #f1f5ff;
                .opt-code { color: $primary; }
                .opt-name { color: $primary; }
            }

            &.active {
                background: #eff4ff;
                &::before { display: none; } // 일반 모드 체크 제거
                .opt-code {
                    color: $primary;
                    font-weight: 700;
                    &::after {
                        content: ' ✓';
                        font-size: 10px;
                    }
                }
                .opt-name { color: $primary; font-weight: 700; }
            }

            &.grouped {
                .opt-code { padding-left: 20px; }
            }

            &.placeholder-item {
                display: block;
                padding: 8px 12px;
                border-bottom: 2px solid #e5e7eb;
            }
        }

        .opt-code {
            display: flex;
            align-items: center;
            padding: 7px 10px;
            font-family: 'Consolas', 'D2Coding', monospace;
            font-size: 12px;
            color: #6b7280;
            border-right: 1px solid #e5e7eb;
            background: #fafafa;
            white-space: nowrap;
            transition: color 0.1s;
        }

        .opt-name {
            display: flex;
            align-items: center;
            padding: 7px 12px;
            font-size: 13px;
            color: #374151;
            white-space: nowrap;
            transition: color 0.1s;
        }

        // 그룹 헤더는 세로 구분선 없이 전체 span
        .group-header {
            grid-column: 1 / -1;
        }
    }

    // ── 그룹 헤더 ───────────────────────────────
    .select-group {
        & + .select-group {
            border-top: 1px solid #f3f4f6;
        }
    }

    .group-header {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 7px 12px 5px;
        font-size: 11px;
        font-weight: 700;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: #f8fafc;
        position: sticky;
        top: 0;
        z-index: 1;

        .group-dot {
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: $primary;
            flex-shrink: 0;
        }
    }
}

// ── 트랜지션 애니메이션 ──────────────────────────
.select-fade-enter-active,
.select-fade-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.select-fade-enter-from,
.select-fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>
