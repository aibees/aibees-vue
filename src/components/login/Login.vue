<template>
    <div id="loginComponent">
        <div class="loginLogo">
            <img src="https://static.aibeesworld.com/static/img/logo_image.png" />
        </div>
        <div class="loginform">
            <form>
                <input id="loginId" class="loginInput" placeholder="아이디 입력해주세요." />
                <input id="loginPw" type="password" class="loginInput" placeholder="비밀번호 입력해주세요." autocomplete="off" />
                <div id="loginButton" class="loginForm" @click="login">로그인</div>
            </form>
        </div>
        <div class="loginAdditional">
            <hr style="width: 80%; border: 1.5px solid grey; margin: 30px auto 30px; color: lightgrey;" />
            로그인이 안된다면 <span @click="MngContractEvent()">담당자에게 연락하기</span>
        </div>
    </div>
</template>

<script setup>
    import { userSession } from '@scripts/util/user-session';
    import mariaApi from '@scripts/util/mariaApi.js';

    /******************************
     ******* Const  Variable ******
    ******************************/
    const session = userSession();
    const router = useRouter();

    /******************************
     ******* Vue  Lift Cycle ******
    ******************************/
    onMounted(() => {
        const escapeHandler = (e) => {
            if (e.key == 'Enter') { login(); }
        }
        document.addEventListener('keydown', escapeHandler);
    })

    /******************************
     ******* Event  Function ******
    ******************************/
    const MngContractEvent = () => {
        alert("qwt0326@gmail.com");
    }

    /******************************
     ******* Main  Function *******
    ******************************/
    const login = async () => {
        let loginId = document.getElementById('loginId').value;
        let loginPw = document.getElementById('loginPw').value;

        if (loginId == '' || loginPw == '') {
            alert("정상적으로 입력해주세요");
            return false;
        } else {
            const loginParam = {
                email: loginId,
                password: loginPw
                // loginKey : loginKey
            }

            const { data } = await mariaApi.post("/login", loginParam);
            session.loginUpdate(data);
            router.push("/home");
        }
    }
</script>

<style lang="scss" scoped>
@use '@@/__variables.scss' as *;

#loginComponent {
    display: block;
    width: 560px;
    height: 100%;
    background-color: $color-bg;
    margin: auto;


    .loginLogo {
        width: 100%;
        height: auto;

        img {
            width: 50%;
            height: auto;
            margin: 40px auto 0;
        }
    }
}


.loginform {
    .loginInput {
        width: 350px;
        height: 35px;
        border: none;
        border-radius: $border-radius;
        margin: 10px auto 0px;
        padding: 0px 10px;
        background-color: white;
        font-size: 15px;
        font-weight: 800;
        font-family: 'Malgun Gothic', '맑은 고딕';
        letter-spacing: 1px;
    }

    .loginForm {
        width: 350px;
        height: 35px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: none;
        border-radius: $border-radius;
        margin: 10px auto 0px;
        background-color: $color-bg-point;
        font-size: 15px;
        font-weight: 800;
        letter-spacing: 1px;
        color: white;
        cursor: pointer;
    }
}

.loginAdditional {
    color: grey;
    font-size: 12px;

    #contract {
        margin-left: 10px;
        text-decoration: none;
        color: black;
        font-weight: 900px;
        font-size: 15px;
    }
}
</style>