<template>
    <div class="d-frame lnb" v-if="!isMobile">
        <div class="title">
            {{ props.title }}
        </div>
        <div class="menu-lists">
            <ul>
                <li v-for="(mn, idx) in props.menu" :key="idx">
                    <div class="menu-container" @click="goTo(mn.linkTo)">
                        {{ mn.name }}
                    </div>
                    
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
    const router = useRouter();

    const props = defineProps({
        title: {
            type: String,
            required: true
        },
        menu: {
            type: Array,
            required: true
        }
    });

    const goTo = (linkTo) => {
        router.push({ name: linkTo });
    }

    const isMobile = ref(window.innerWidth < 1200)

    const handleResize = () => {
        isMobile.value = window.innerWidth < 1200;
    }

    onMounted(() => {
        window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
    });
</script>

<style lang="scss" scoped>
@use '@@/common.scss' as *;

.lnb {
    .title {
        width: 80%;
        padding: 12px 0;
        margin: auto;
        font-size: 19px;
        font-weight: 800;
        border-bottom: 3px solid #b3b3b3;
    }

    .menu-lists {
        ul {
            padding-inline: 0;
            margin-block: 0;
            list-style: none;
            
            li {
                height: 45px;

                .menu-container {
                    margin: auto;
                    display: flex;
                    justify-content: left;
                    text-align: left;
                    align-items: center;
                    width: 80%;
                    height: 100%;
                    text-align: center;
                }
            }

            li:hover {
                background: #c5efff;
            }
        }
    }
}
</style>