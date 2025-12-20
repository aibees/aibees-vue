<template>
    <div class="with-lnb account">
        <ALnb :title="route.meta.title" :menu="menuList" />
        <div class="contents account-view">
            <router-view />
        </div>
    </div>
</template>

<script setup>
const route = useRoute();

let menuList = ref([]);

onMounted(() => {
    getsystemMenu();
});

const getsystemMenu = () => {
    menuList.value = [
        {
            'name': '가계부 입력',
            'linkTo': 'Account-entry'
        }
        ,
        {
            'name': '일괄 업로드',
            'linkTo': 'Account-upload'
        }
        ,
        {
            'name': '가계부 조회',
            'linkTo': 'Account-search'
        }
        ,
        {
            'name': '현금흐름표',
            'linkTo': 'Account-cashflow'
        }
        ,
        {
            'name': '고정비 관리',
            'linkTo': 'Account-fixed'
        }
        ,
        {
            'name': '선급비용 관리',
            'linkTo': 'Account-prepaid'
        },
        {
            'name': '계좌/카드 정보',
            'linkTo': 'Account-info'
        }
    ]
};
</script>

<style lang="scss" scoped></style>