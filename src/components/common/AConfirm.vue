<template>
    <div class="maria-confirm-overlay">
        <div class="maria-confirm-box">
            <div class="confirm-message">{{ message }}</div>
            <div class="confirm-actions">
                <button class="btn-cancel" @click="onCancel">취소</button>
                <button class="btn-ok" @click="onConfirm">확인</button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    message: { type: String, default: '이 작업을 진행하시겠습니까?' },
    onConfirm: { type: Function },
    onCancel: { type: Function }
});
</script>

<style lang="scss" scoped>
.maria-confirm-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.maria-confirm-box {
    background: white;
    border-radius: 12px;
    padding: 24px;
    min-width: 300px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    text-align: center;
    font-family: sans-serif;

    .confirm-message {
        font-size: 16px;
        color: #333;
        margin-bottom: 24px;
        word-break: keep-all;
    }

    .confirm-actions {
        display: flex;
        gap: 10px;
        justify-content: center;

        button {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
        }

        .btn-cancel {
            background: #f1f3f5;
            color: #495057;
        }

        .btn-ok {
            background: #4a90e2;
            color: white;
        }
    }
}</style>