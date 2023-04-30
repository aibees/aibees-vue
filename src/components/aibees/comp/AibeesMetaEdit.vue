<template>
    <div class="metaEdit-container" id="metaEditPopup">
        <div class="metaEdit-back"></div>
        <div class="metaEdit-editor">
            <div class="editor-inputGroup">
                <input id="item_title" v-model="input_title" />
            </div>
            <div class="editor-btnGroup">
                <button class="edit-button btn-color-green" @click="saveEditor()">저장</button>
                <button class="edit-button btn-color-grey" @click="closeEditor()">취소</button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, toRefs, watch, onMounted } from 'vue'
    const props = defineProps({
        curItem: Object
    });

    // variable
    const input_title = ref("");
    const {curItem} = toRefs(props);

    const saveEditor = () => {
        console.log(curItem.value);
    }
    
    const closeEditor = () => {
        document.getElementById('metaEditPopup').style.display = 'none';
    }

    watch(curItem, () => {
        input_title.value = curItem.value.name;
    })

</script>

<style lang="scss" scoped>
    .metaEdit-container {
        text-align: center;
        display:none;
        position: absolute;
        left:0;
        top:0;
        width: 100%;
        height : 100%;

        .metaEdit-back {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 1;
            opacity: 60%;
            width:100%;
            height: 100%;
            background-color: black;
            }

        .metaEdit-editor {
            margin:auto;
            margin-top: 20vh;
            border: none;
            border-radius: 10px;
            position: relative;
            width: 80%;
            height: 400px;
            background-color: rgb(211, 211, 211);
            z-index: 2;

            .editor-btnGroup {
                width: fit-content;
                position: absolute;
                bottom: 10px;
                left: 50%;
                transform: translate(-50%, 0%);

                .edit-button {
                    margin-left: 5px;
                    margin-right: 5px;
                    width: 100px;
                    height: 35px;
                    border: 3px solid black;
                    border-radius: 10px;
                    font-size: 15px;
                    font-weight: 700;
                    box-shadow: 1px 1px 1px black;
                }

                .btn-color-green {
                    background-color: rgb(3, 199, 90);
                    color: white;
                }
                .btn-color-green:active {
                    background-color: rgb(0, 87, 39);
                    box-shadow: none;
                }

                .btn-color-grey {
                    background-color: rgb(200, 200, 200);
                }
                .btn-color-grey:active {
                    background-color: rgb(99, 99, 99);
                    color: white;
                    box-shadow: none;
                }
            }
        }
    }
</style>