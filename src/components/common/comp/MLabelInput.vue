<template>
    <div class="maria-label-input" :style="`width:${setWidth()}`">
        <div class="labels" :hidden="props.label === '' || props.label === undefined">{{ props.label }}</div>
        <input 
            :id="`${props.id}`"
            :type="`${setType()}`" 
            v-model="typedData" />
    </div>
</template>

<script setup>

const props = defineProps({
    id: String,
    type: String,
    label: String,
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
    if (props.size === undefined) {
        return '300px';
    } else if (props.size === 'lg') {
        return '350px';
    } else if (props.size === 'md') {
        return '300px';
    } else if (props.size === 'sm') {
        return '250px';
    } else {
        return '300px';
    }
}
</script>

<style lang="scss" scoped>
.maria-label-input{
    display: flex;
    justify-content: left;
    height: 30px;

    .labels{
        width: fit-content;
        white-space: nowrap;
        padding-top: 4px;
        padding-left: 4px;
        padding-right: 4px;
        background-color: white;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
        border: 1px solid lightgrey;
    }

    input {
        width: 100%;
        border: 1px solid lightgrey;
        padding-block : 0;
        padding-inline: 0;
        padding-left: 5px;
    }
}
</style>