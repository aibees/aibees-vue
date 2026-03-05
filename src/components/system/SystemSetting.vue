<template>
    <div class="lnb-content system-setting">
        <!-- 상단 필터 카드 -->
        <section class="d-panel d-search-section">
            <div class="d-condition-row">
                <MLabelSelect 
                    label="시스템"
                    size="sm"
                    :option="optionList.systemOption"
                    v-model="searchParam.systemCd"
                />

                <MLabelInput
                    label="타입코드"
                    v-model="searchParam.typeCode"
                />

                <MLabelInput
                    label="타입명"
                    v-model="searchParam.typeName"
                />
            </div>

            <div class="d-condition-actions">
                <MButton type="outline" @click="searchData">조회</MButton>
                <MButton type="primary">저장</MButton>
            </div>
        </section>
    </div>
</template>

<script setup>

/** 필터 */
const searchParam = reactive({
    systemCd: '',
    typeCode: '',
    typeName: ''
});

const optionList = reactive({
    systemOption: []
})

onMounted(() => {
    getSystemCdList();
});

const getSystemCdList = async () => {
    optionList.systemOption = [
        {
            code: 'COMMON', name: '공통'
        },
        {
            code: 'ACCOUNT', name: '가계부'
        }
    ]
}

const searchData = async () => {
    console.log(searchParam);
}

</script>
<style lang="scss" src="@@/system/systemSetting.scss" />