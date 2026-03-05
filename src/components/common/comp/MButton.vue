<template>
    <button :class="setButtonClass()" :disabled="props.disabled">
        <div class="inner">
            <slot></slot>
        </div>
    </button>
</template>

<script setup>

    const props = defineProps({
        type: String,
        disabled: Boolean
    });

    const setButtonClass = () => {
        let classStr = 'n-button';

        if (props.type == 'save') {
            return classStr.concat(' save');
        }

        if (props.type == 'delete') {
            return classStr.concat(' delete');
        }

        if (props.type == 'primary') {
            return classStr.concat(' primary');
        }

        return classStr.concat(' outline');
    }
</script>

<style lang="scss" src="@@/common/comp/MButton.scss" />