<template>
  <div id="loginComponent">
    <div class="loginLogo">
        <img src="https://static.aibeesworld.com/image/asset/login_logo.png" />
    </div>
    <div class="loginform">
        <form>
            <input id="loginId" class="loginInput" placeholder="아이디 입력해주세요." />
            <input id="loginPw" type="password" class="loginInput" placeholder="비밀번호 입력해주세요." autocomplete="off" />
            <button id="loginButton" class="loginForm" @click="loginProcess();">로그인</button>
        </form>
    </div>
    <div class="loginAdditional">
        <hr style="width: 80%; border: 1.5px solid grey; margin: 30px auto 30px; color: lightgrey;" />
        로그인이 안된다면 <span @click="MngContractEvent()"><a id="contract" href="#">담당자에게 연락하기</a></span>
    </div>
  </div>
</template>

<script setup>
    // import declaration
    import { ref, onMounted } from 'vue';
    import { useStore } from 'vuex';
    import { useRouter } from 'vue-router';

    /******************************
     ******* Const  Variable ******
     ******************************/
    const sessionStore = useStore();
    const router = useRouter();

    /******************************
     ******* Vue  Lift Cycle ******
     ******************************/
    onMounted(() => {
        const escapeHandler = (e) => {
            if(e.key == 'Enter') { loginProcess(); }
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
    const loginProcess = () => {
        let loginId = document.getElementById('loginId').value;
        let loginPw = document.getElementById('loginPw').value;

        if(loginId == '' || loginPw == '') {
            alert("정상적으로 입력되지 않았습니다.");
            return false;
        } else {
            const loginParam = {
                userId : loginId,
                userPw : loginPw
            }
            // todo : server axios for check id / password
            
            const user = {
                id: loginId,
                userName: 'aibees',
                userToken: '182y37yqwie72'
            }
            sessionStore.commit("setUser", user);
            router.push('/account');
        }
    }
</script>

<style lang="scss" scoped>
    #loginComponent {
        display: block;
        width: 560px;
        height: 500px;
        background-color: beige;
        border-radius: 5px;
        margin: 320px auto 30px;

        
        .loginLogo {
            width: 100%;
            height: auto;
            margin: 20px auto 30px;

            img {
                width: inherit;
                height: auto;
                margin-top: 40px;
            }
        }
    }


    .loginform {
        .loginInput {
            width: 350px;
            height: 35px;
            border: none;
            border-radius: 5px;
            margin: 10px auto 0px;
            background-color: white;
            font-size: 15px;
            font-weight: 800;
            font-family: 'Malgun Gothic', '맑은 고딕';
            letter-spacing: 1px;
        }

        .loginForm {
            width: 358px;
            height: 40px;
            border: 2px solid black;
            border-radius: 3px;
            margin: 10px auto 0px;
            background-color: #64775c;
            font-size: 15px;
            font-weight: 800;
            letter-spacing: 1px;
            color: white;
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