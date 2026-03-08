<template>
    <div class="maria-toast-container">
        <TransitionGroup name="toast-list">
            <div v-for="toast in toasts" :key="toast.id" class="maria-toast" :class="toast.type">
                <div class="toast-icon">
                    <span v-if="toast.type === 'success'">✅</span>
                    <span v-else-if="toast.type === 'error'">🚨</span>
                    <span v-else>ℹ️</span>
                </div>
                <div class="toast-message">{{ toast.message }}</div>
                <button class="toast-close" @click="removeToast(toast.id)">×</button>
            </div>
        </TransitionGroup>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const toasts = ref([]);
let toastId = 0;

const addToast = (type, message, duration = 3000) => {
    const id = toastId++;
    toasts.value.push({ id, type, message });

    if (duration > 0) {
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }
};

const removeToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
};

// 외부(JS)에서 addToast 함수를 호출할 수 있도록 노출
defineExpose({ addToast });
</script>

<style lang="scss" scoped>
.maria-toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
    /* 컨테이너는 클릭 통과 */

    .maria-toast {
        pointer-events: auto;
        /* 토스트 자체는 클릭 가능 */
        min-width: 250px;
        max-width: 350px;
        padding: 12px 16px;
        border-radius: 8px;
        background: #ffffff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Pretendard', sans-serif;
        font-size: 14px;
        color: #333;
        border-left: 4px solid transparent;

        &.success {
            border-color: #2b8a3e;
        }

        &.error {
            border-color: #e03131;
        }

        &.info {
            border-color: #4a90e2;
        }

        .toast-icon {
            font-size: 16px;
        }

        .toast-message {
            flex-grow: 1;
            line-height: 1.4;
            word-break: break-all;
        }

        .toast-close {
            background: none;
            border: none;
            font-size: 18px;
            color: #999;
            cursor: pointer;

            &:hover {
                color: #333;
            }
        }
    }
}

/* 애니메이션 */
.toast-list-enter-active,
.toast-list-leave-active {
    transition: all 0.3s ease;
}

.toast-list-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.toast-list-leave-to {
    opacity: 0;
    transform: translateX(30px) scale(0.9);
}</style>