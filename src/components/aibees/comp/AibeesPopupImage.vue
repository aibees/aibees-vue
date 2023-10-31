<template>
    <div id="popupImage" class="aibees-popup-image">
        <div class="popupImageBack"></div>
        <img id="popupImageSrc" src="" oncontextmenu="return false;" @clic="test()" />
        <button class="closePopup" @click="closePopupImage()">
            <font-awesome-icons v-bind:icon="['fa-solid', 'fa-xmark']" />
        </button>
    </div>
</template>

<script setup>
    const closePopupImage = () => {
        console.log("closePopupImage");
        if('block' == document.getElementById('popupImage').style.display) {
            document.getElementById('popupImageSrc').src = '';
            document.getElementById('popupImage').style.display = 'none';
        }
    }

    const test = () => {
        console.log("popupSrc : " + document.getElementById('popupImageSrc').src);
    }
</script>

<style lang="scss" scoped>
.aibees-popup-image {
    display:none;
    position: absolute;
    width:100%;
    height: 100%;
    left: 0;
    top: 0;

    .popupImageBack {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1;
        opacity: 60%;
        width:100%;
        height: 100%;
        background-color: black;
    }

    img {
        margin-top: 20vh;
        position: relative;
        width: 80%;
        height: auto;
        opacity: 100%;
        z-index: 2;
    }

    button {
        position: absolute;
        border: none;
        border-radius: 2px;
        top: 70px;
        right: 70px;
        z-index: 3;
    }
}
</style>