<template>
    <div class="comm-auto-search-input">
        <input
            type="text"
            :id="`acctSearch_${props.inputId}`"
            @input="searchSuggest($event)"
            @focus="inputFocusCheck(true)"
            autocomplete="off"
        />
        <ul v-show="suggested.length > 0 && inputFocus">
            <li v-for="(sug, idx) in suggested" :key="idx" :id="idx">
                <a href="#" @click="selected(sug, props.inputId)">
                    <div>
                        {{ sug.acctCd }} | {{ sug.acctNm }}
                    </div>
                </a>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import mariaApi from '../../../scripts/util/mariaApi';

const suggested = ref([]);
const inputFocus = ref(false);
const emit = defineEmits(["searchConfirm"]);

const props = defineProps({
    inputId: String
})

const searchSuggest = async (ev) => {
    let searchTxt = ev.target.value;

    if (searchTxt.length < 1) {
        suggested.value = [];
        return false;
    }

    suggested.value = [];

    const { data } = await mariaApi.get(`/account/acct?searchTxt=${searchTxt}`);
    console.log(data);
    suggested.value = data;
}

const inputFocusCheck = (boo) => {
    inputFocus.value = boo;
}

const selected = (item, id) => {
    emit('searchConfirm', item, id);
    document.getElementById('acctSearch_' + id).value = item.acctCd;
    inputFocus.value = false;
}

</script>

<style lang="scss" scoped>
.comm-auto-search-input {
    height: 90%;

    input {
        text-align: center;
        border: none;
        height: 100%;
    }

    ul {
        position: absolute;
        max-height: 150px;
        overflow: scroll;
        list-style: none;
        padding-block: 0;
        padding-inline: 0;
        margin-block: 0;
        margin-inline: 0;
        text-align: left;
        border: 1px solid grey;
        border-radius: 7px;
        background-color: white;

        li {
            padding: 5px 20px 5px 10px;

            a {
                text-decoration: none;
                color: black;
            }
        }

        li:hover {
            font-weight: bolder;
            background-color: #9ed2ff;
        }
    }

}
</style>