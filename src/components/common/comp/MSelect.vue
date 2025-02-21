<template>
    <div class="maria-select">
        <select
            :id="`${props.id}`"
            v-model="selectedData">
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
    option: Array
});

const selectedData = defineModel();


</script>

<style lang="scss" scoped>
.maria-select {
    height: 100%;
    select {
        width: 100%;
        height: 100%;
        border: none;
        text-align: center;
    }
}
</style>