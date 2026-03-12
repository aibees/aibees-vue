<template>
    <div class="account-management">
        <MNav :tabs="tabs" :currentTab="currentTab" @tab-click="handleTabChange"  />

        <div v-if="currentTab == 'BANK'">
            <BankInfoTab />
        </div>
        <div v-else>
            <CardInfoTab />
        </div>
    </div>
</template>

<script setup>
    import BankInfoTab from './accountInfos/BankInfoTab.vue';
    import CardInfoTab from './accountInfos/CardInfoTab.vue';

    const currentTab = ref('BANK');

    const tabs = [
        { label: '은행계좌관리', value: 'BANK' },
        { label: '카드관리', value: 'CARD' },
    ]
    const handleTabChange = async (selectedTabValue) => {
        currentTab.value = selectedTabValue;
    }

</script>

<style lang="scss" scoped>
/* =======================================
    Variables & Mixins
======================================= */
$primary: #4a90e2;
$primary-hover: #357abd;
$text-main: #333333;
$text-sub: #666666;
$text-light: #999999;
$bg-main: #f8f9fa;
$bg-white: #ffffff;
$border-color: #e9ecef;
$border-focus: #b3d4fc;

/* =======================================
    Layout & Typography
======================================= */
.account-management {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    color: $text-main;
}

/* =======================================
    Tab Menu
======================================= */
.tab-menu {
    display: flex;
    gap: 8px;
    margin-bottom: 32px;
    border-bottom: 2px solid $border-color;

    button {
        padding: 12px 24px;
        background: transparent;
        border: none;
        font-size: 16px;
        color: $text-sub;
        cursor: pointer;
        position: relative;
        transition: color 0.2s ease;

        &:hover {
            color: $primary;
        }

        &.active {
            color: $primary;
            font-weight: 700;

            &::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                width: 100%;
                height: 3px;
                background-color: $primary;
                border-radius: 3px 3px 0 0;
            }
        }
    }
}

/* =======================================
   Action Bar
======================================= */
.action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
    }
}

/* =======================================
   Data Table (Accordion List)
======================================= */
.data-table-wrapper {
    background-color: $bg-white;
    border: 1px solid $border-color;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    overflow: hidden;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;

    th {
        background-color: $bg-main;
        padding: 16px;
        font-size: 14px;
        font-weight: 600;
        color: $text-sub;
        border-bottom: 1px solid $border-color;
    }

    td {
        padding: 16px;
        vertical-align: middle;
        border-bottom: 1px solid $border-color;
    }

    /* 컬럼 너비 제어 */
    .col-badge {
        width: 70px;
        text-align: center;
    }

    .col-bank {
        width: 100px;
    }

    .col-name {
        width: 200px;
    }

    .col-account {
        width: auto;
        font-family: monospace;
        font-size: 15px;
    }

    .col-type {
        width: 120px;
    }

    .col-status {
        width: 120px;
    }

    .col-action {
        width: 100px;
        text-align: center;
    }

    /* 메인 Row */
    .main-row {
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
            background-color: rgba($primary, 0.03);
        }

        &.is-open {
            background-color: rgba($primary, 0.06);
            border-bottom: none;

            td {
                border-bottom: none;
                /* 열렸을 때 선 제거 */
            }
        }
    }

    /* 테이블 내부 요소들 */
    .bank-info-cell {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .bank-nm {
            font-weight: 700;
            font-size: 16px;
        }

        .bank-alias {
            font-size: 13px;
            color: $text-light;
        }
    }

    .badge-main {
        display: inline-block;
        background-color: #e1f5fe;
        color: #0288d1;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 700;
    }

    .type-tag {
        background-color: #f1f3f5;
        color: #495057;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
    }

    .status-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 6px;

        &.on {
            background-color: #2b8a3e;
        }

        &.off {
            background-color: #e03131;
        }
    }

    /* 상세 정보 Row (Accordion) */
    .detail-row {
        background-color: #fafbfc;

        .detail-cell {
            padding: 0;
            /* td 자체의 패딩을 없애고 내부 div에 줌 */
        }

        .detail-wrapper {
            padding: 24px;
            border-left: 4px solid $primary;
            animation: slideDown 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }

        .detail-item {
            display: flex;
            flex-direction: column;
            gap: 6px;

            .label {
                font-size: 13px;
                color: $text-light;
                font-weight: 500;
            }

            .value {
                font-size: 15px;
                color: $text-main;
            }

            &.full-width {
                grid-column: 1 / -1;
                border-top: 1px dashed $border-color;
                padding-top: 16px;
                margin-top: 4px;
            }
        }
    }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* =======================================
   Modal (Layered Popup)
======================================= */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-container {
    background-color: $bg-white;
    width: 100%;
    max-width: 680px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid $border-color;

    h4 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
    }

    .btn-close {
        background: transparent;
        border: none;
        font-size: 28px;
        line-height: 1;
        color: $text-light;
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
            color: $text-main;
        }
    }
}

.modal-body {
    padding: 24px;
    overflow-y: auto;
    /* 내용이 길면 내부 스크롤 */
}

.modal-footer {
    padding: 20px 24px;
    border-top: 1px solid $border-color;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    background-color: $bg-main;
}

/* =======================================
   Forms inside Modal
======================================= */
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &.full-width {
        grid-column: 1 / -1;
    }

    label {
        font-size: 14px;
        font-weight: 600;
        color: $text-main;

        .required {
            color: #e03131;
            margin-left: 2px;
        }
    }

    input,
    select,
    textarea {
        width: 100%;
        padding: 12px;
        font-size: 15px;
        border: 1px solid $border-color;
        border-radius: 8px;
        background-color: $bg-white;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;

        &:focus {
            outline: none;
            border-color: $primary;
            box-shadow: 0 0 0 3px rgba($primary, 0.1);
        }

        &::placeholder {
            color: $text-light;
        }
    }

    textarea {
        resize: vertical;
    }
}

.mt-15 {
    margin-top: 15px;
}

.checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    padding: 16px;
    background-color: #f8fbff;
    border: 1px solid #d0ebff;
    border-radius: 8px;

    .checkbox-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;

        input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: $primary;
            cursor: pointer;
        }
    }
}

/* =======================================
   Buttons
======================================= */
.btn-primary {
    background-color: $primary;
    color: $bg-white;
    border: none;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: $primary-hover;
    }
}

.btn-secondary {
    background-color: $bg-white;
    color: $text-sub;
    border: 1px solid $border-color;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: $bg-main;
    }
}

.btn-edit-sm {
    background-color: $bg-white;
    color: $text-sub;
    border: 1px solid $border-color;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: $primary;
        color: $bg-white;
        border-color: $primary;
    }
}

/* =======================================
   Transitions
======================================= */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}</style>