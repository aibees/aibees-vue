<template>
    <div class="d-custom n-label-input" ref="dropdownRef">

        <div v-if="!props.noLabel" class="d-custom-labels" :hidden="props.label === '' || props.label === undefined">
            {{ props.label }}
        </div>

        <div class="d-custom-inputs n-selects" :class="{ 'no-label': props.noLabel }" :style="`width: ${setWidth()}`">
            <div class="select-trigger" :id="`${props.id}`" @click="toggleDropdown">
                <span class="selected-text">{{ selectedName }}</span>
                <i class="arrow-icon" :class="{ 'open': isOpen }"></i>
            </div>

            <transition name="dropdown-fade">
                <ul v-if="isOpen" class="dropdown-list">
                    <li v-for="(data, idx) in props.option" :key="idx" @click="selectOption(data)"
                        :class="{ 'active': data.code === selectedData }">
                        {{ data.name }}
                    </li>
                </ul>
            </transition>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    id: String,
    label: String,
    noLabel: { type: Boolean, required: false, default: false },
    size: String,
    option: { type: Array, default: () => [] },
    defaults: { type: String, required: false, default: '' }
});

const selectedData = defineModel();
const emit = defineEmits(["selected"]);

const isOpen = ref(false);
const dropdownRef = ref(null);

// 선택된 데이터의 '이름(name)'을 찾아서 표시 (선택된 게 없으면 '선택' 표시)
const selectedName = computed(() => {
    const selectedOption = props.option.find(opt => opt.code === selectedData.value);
    return selectedOption ? selectedOption.name : '선택하세요';
});

const setWidth = () => {
    if (props.size === 'lg') return '350px';
    if (props.size === 'sm') return '150px';
    return '250px'; // default or 'md'
};

// 드롭다운 열기/닫기 토글
const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
};

// 옵션 선택 시 값 변경 및 드롭다운 닫기
const selectOption = (data) => {
    selectedData.value = data.code;
    emit('selected', selectedData.value);
    isOpen.value = false;
};

// 컴포넌트 외부를 클릭하면 드롭다운이 닫히도록 처리
const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>
<style lang="scss" src="@@/common/comp/MLabelSelect.scss" scoped />