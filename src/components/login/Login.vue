<template>
  <div id="loginComponent">
    <div class="loginLogo">
        <img src="https://static.aibeesworld.com/image/asset/login_logo.png" />
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
    import "vue3-toastify/dist/index.css";
    // import declaration
    import { ref, onMounted } from 'vue';
    import { userSession } from '../../scripts/util/user-session';
    import mariaApi from '../../scripts/util/mariaApi';
    import { useRouter } from 'vue-router';
    import MariaToast from '../../scripts/util/common/MariaToast';

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
            if(e.key == 'Enter') { login(); }
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
        const loginKey = '63aa510c3ff68c332e48e6006342b9f706744223ad84a4bb20ee38168fd7ee8d';
        let loginId = document.getElementById('loginId').value;
        let loginPw = document.getElementById('loginPw').value;

        if(loginId == '' || loginPw == '') {
            MariaToast.error('정상적으로 입력되지 않았습니다.');
            return false;
        } else {
            const loginParam = {
                email : loginId,
                password : loginPw
                // loginKey : loginKey
            }

            const {data} = await mariaApi.post("/login", loginParam);
            console.log(data);
            session.loginUpdate(data);
            router.push("/account");
        }
    }

    // const loginProcess = async () => {
    //     const loginKey = '63aa510c3ff68c332e48e6006342b9f706744223ad84a4bb20ee38168fd7ee8d';
    //     let loginId = document.getElementById('loginId').value;
    //     let loginPw = document.getElementById('loginPw').value;

    //     if(loginId == '' || loginPw == '') {
    //         alert("정상적으로 입력되지 않았습니다.");
    //         return false;
    //     } else {
    //         // alert(loginId + " / " + loginPw);
    //         // const loginData = {};

    //         // const loginParam = {
    //         //     email : loginId,
    //         //     password : loginPw,
    //         //     loginKey : loginKey
    //         // }
    //         // alert(loginParam);

    //         // // const { data } = await mariaApi.post("/user/ledger/login", loginParam);
    //         // // alert("loginResult :: " + data);
    //         // const callback = (res) => {
    //         //     console.log(res.data);
    //         //     const loginResultInfo = {
    //         //         accessToken: res.data.accessToken,
    //         //         name: res.data.name,
    //         //         admin: res.data.admin
    //         //     }
    //         //     loginData.loginInfo = loginResultInfo;

    //         //     session.loginUpdate(loginData);
    //         //     router.push('/account');
    //         // }

    //         // axiosPost(url, loginParam, callback);
    //     }
    // }
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
            border-radius: 5px;
            margin: 10px auto 0px;
            background-color: white;
            font-size: 15px;
            font-weight: 800;
            font-family: 'Malgun Gothic', '맑은 고딕';
            letter-spacing: 1px;
        }

        .loginForm {
            width: 350px;
            height: 30px;
            padding-top: 7px;
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