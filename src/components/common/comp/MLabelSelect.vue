<template>
    <div class="maria-label-select" :style="`width:${setWidth()}`">
        <div class="labels" :hidden="props.label === '' || props.label === undefined">{{ props.label }}</div>
        <select
            :id="`${props.id}`"
            v-model="selectedData" 
            @change="changedValue">
            <option v-for="(data, idx) in props.option" 
                :key="idx" 
                :value="data.value"
                :selected="data.value === selectedData">
            {{ data.name }}
            </option>
        </select>
    </div>
</template>

<script setup>

const props = defineProps({
    id: String,
    label: String,
    size: String,
    option: Array
});

const selectedData = defineModel();
const emit = defineEmits(["selected"]);

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

const changedValue = () => {
    console.log('change Value');
    emit('selected', selectedData);
}
</script>

<style lang="scss" scoped>
.maria-label-select{
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

    select {
        width: 100%;
        border: 1px solid lightgrey;
        padding-block : 0;
        padding-inline: 0;
        padding-left: 5px;
    }
}
</style>