<template>
    <nav class="tab-menu">
        <button v-for="tab in props.tabs" :key="tab.value" :class="{ active: props.currentTab === tab.value }"
            @click="onClickTab(tab.value)">
            {{ tab.label }}
        </button>
    </nav>
</template>

<script setup>

    const props = defineProps({
        tabs: {
            type: Array,
            required: true
        },
        currentTab: {
            type: String,
            required: true
        }
    });

    const emit = defineEmits(['tab-click']);
    const onClickTab = (value) => {
        emit('tab-click', value);
    }
</script>

<style lang="scss" scoped>
@use '@@/__variables.scss' as *;
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
</style>