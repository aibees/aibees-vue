<template>
    <div class="d-frame lnb" v-if="!isMobile">
        <div class="menu-lists">
            <!-- 그룹 없는 경우: 기존 flat 렌더링 -->
            <ul v-if="!hasGroups">
                <li v-for="(mn, idx) in props.menu" :key="idx">
                    <div class="menu-container" :class="{ active: route.name === mn.linkTo }" @click="goTo(mn.linkTo)">
                        {{ mn.name }}
                    </div>
                </li>
            </ul>

            <!-- 그룹 있는 경우: 중분류 헤더 + 메뉴 -->
            <div v-else class="group-menu">
                <div class="menu-group" v-for="(grp, gi) in groupedMenu" :key="gi">
                    <div class="group-label">
                        <span>{{ grp.name }}</span>
                        <hr />
                    </div>
                    <ul>
                        <li v-for="(mn, idx) in grp.items" :key="idx">
                            <div class="menu-container" :class="{ active: route.name === mn.linkTo }" @click="goTo(mn.linkTo)">
                                {{ mn.name }}
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    const router = useRouter();
    const route  = useRoute();

    const hasGroups = computed(() => props.menu.some(mn => mn.group));

    const groupedMenu = computed(() => {
        if (!hasGroups.value) return [];
        const map = new Map();
        for (const mn of props.menu) {
            const g = mn.group || '';
            if (!map.has(g)) map.set(g, { name: g, items: [] });
            map.get(g).items.push(mn);
        }
        return [...map.values()];
    });

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

                    &.active {
                        font-weight: 800;
                    }
                }
            }

            li:hover {
                background: #c5efff;
            }
        }
    }

    .group-menu {
        .menu-group {
            & + .menu-group {
                margin-top: 4px;
            }
        }

        .group-label {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 10% 4px;

            span {
                font-size: 12px;
                font-weight: 800;
                color: #6b7280;
                white-space: nowrap;
                letter-spacing: 0.04em;
            }

            hr {
                flex: 1;
                border: none;
                border-top: 1px solid #e5e7eb;
                margin: 0;
            }
        }
    }
}
</style>