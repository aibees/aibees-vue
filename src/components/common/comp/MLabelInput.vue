<template>
    <div class="d-custom n-label-input">
        <div v-if="!props.noLabel" class="d-custom-labels" :hidden="props.label === undefined || props.label === ''">{{ props.label }}</div>
        <div class="d-custom-inputs"
            :style="`width: ${setWidth()}`">
            <input 
                :id="`${props.id}`"
                :type="`${setType()}`"
                :placeholder="props.placeholder"
                :class="props.noLabel ? 'no-label' : ''"
                v-model="typedData" />
        </div>
    </div>
</template>

<script setup>
    const props = defineProps({
        id: {type: String, default: ''},
        type: String,
        noLabel: {type: Boolean, required: false, default: false},
        label: String,
        placeholder: String,
        size: String
    });

    const typedData = defineModel();

    const setType = () => {
        if (props.type === undefined) {
            return 'text';
        } else {
            return props.type;
        }
    }

    const setWidth = () => {
        if (props.size === undefined || props.size == '') {
            return '250px';
        } else if (props.size === 'lg') {
            return '350px';
        } else if (props.size === 'md') {
            return '250px';
        } else if (props.size === 'sm') {
            return '150px';
        } else {
            return '250px';
        }
    }
</script>

<style lang="scss" src="@@/common/comp/MLabelInput.scss" scoped />