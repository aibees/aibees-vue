<template>
  <div class="header">
    <div class="title">
        {{ title }}
    </div>
    <div class="logo">
        <img src="https://static.aibeesworld.com/image/logo/logo.png" />
    </div>
  </div>
</template>

<script setup>
    import { ref, toRefs, onMounted } from 'vue';
    const props = defineProps({
        prop_title: String
    });

    // variable
    let title = ref("");

    onMounted(() => {
        console.log(toRefs(props).prop_title.value);
        title.value = toRefs(props).prop_title.value;
    });
</script>

<style lang="scss" scoped>
.header {
    display: flex;
    justify-content: space-between;
    background-color: lightgrey;
    width: 100%;
    height: 50px;
    .title {
        padding-top: 13px;
        margin-left: 10px;
        font-size: 14px;
        font-weight: 800;
        color: black;
    }
    // .logo {

    // }
}

</style>