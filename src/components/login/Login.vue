<template>
    <div id="login-component">
        <div class="contents">
            <div class="login-title">
                <h1>준서하은쀼의<br>돈을 모아봄</h1>
            </div>
            <div class="loginform">
                <form>
                    <input id="loginId" class="loginInput" placeholder="아이디" />
                    <input id="loginPw" type="password" class="loginInput" placeholder="비밀번호" autocomplete="off" />
                    <div id="loginButton" class="loginForm" @click="login">로그인</div>
                </form>
            </div>
            <div class="loginLogo">
                <img src="https://static.aibeesworld.com/static/img/logo_image.png" />
            </div>
            <div class="loginAdditional">
                <hr style="width: 80%; border: 1.5px solid grey; margin: 30px auto 30px; color: lightgrey;" />
                로그인이 안된다면 <span @click="MngContractEvent()">담당자에게 연락하기</span>
            </div>
        </div>
    </div>

    <!-- 비밀번호 초기화 모달 -->
    <div v-if="passwordResetFlag" class="pw-reset-overlay">
        <div class="pw-reset-box">
            <div class="pw-reset-header">
                <span class="pw-reset-title">🔒 비밀번호 초기화</span>
            </div>
            <div class="pw-reset-desc">
                최초 로그인이 감지되었습니다.<br>새 비밀번호를 설정해주세요.
            </div>
            <div class="pw-reset-body">
                <div class="pw-input-wrap">
                    <label>새 비밀번호</label>
                    <input
                        v-model="newPassword"
                        type="password"
                        class="pw-input"
                        placeholder="새 비밀번호 입력"
                        autocomplete="new-password"
                    />
                </div>
                <div class="pw-input-wrap">
                    <label>비밀번호 확인</label>
                    <input
                        v-model="confirmPassword"
                        type="password"
                        class="pw-input"
                        :class="{ 'pw-input--error': confirmPassword && !isPasswordMatch }"
                        placeholder="비밀번호 재입력"
                        autocomplete="new-password"
                    />
                    <span v-if="confirmPassword && !isPasswordMatch" class="pw-error-msg">
                        비밀번호가 일치하지 않습니다.
                    </span>
                    <span v-if="confirmPassword && isPasswordMatch" class="pw-ok-msg">
                        비밀번호가 일치합니다.
                    </span>
                </div>
            </div>
            <div class="pw-reset-footer">
                <div
                    class="pw-btn pw-btn--confirm"
                    :class="{ 'pw-btn--disabled': !isPasswordMatch || !newPassword }"
                    @click="submitPasswordReset"
                >
                    확인
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { userSession } from '@scripts/util/user-session';
import mariaApi from '@scripts/util/mariaApi.js';

/******************************
 ******* Const  Variable ******
******************************/
const session = userSession();
const router = useRouter();

/******************************
 ******* Reactive  State ******
******************************/
const passwordResetFlag = ref(false);
const newPassword = ref('');
const confirmPassword = ref('');

/******************************
 ******* Computed  ************
******************************/
const isPasswordMatch = computed(() =>
    newPassword.value.length > 0 && newPassword.value === confirmPassword.value
);

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

    if (loginId == '' && loginPw == '') {
        alert("정상적으로 입력해주세요");
        return false;
    } else {
        const loginParam = {
            email: loginId,
            password: loginPw,
            serviceName: 'account'
            // loginKey : loginKey
        }

        const { data } = await mariaApi.post("/login", loginParam);
        
        if (!data) {
            alert("로그인 실패!!");
            return false;
        }

        if (data.passwordResetFlag) {
            passwordResetFlag.value = true;
            return;
        } else {
            session.loginUpdate(data);
            router.push("/home");
        }
    }
}

const submitPasswordReset = async () => {
    if (!isPasswordMatch.value || !newPassword.value) {
        return;
    };

    const param = {
        password: newPassword.value, 
        email: document.getElementById('loginId').value, 
        serviceName: 'account'
    };

    const { data } = await mariaApi.post("/api/user-infos/s/p", param);

    passwordResetFlag.value = false;
    newPassword.value = '';
    confirmPassword.value = '';

    alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
}
</script>

<style lang="scss" scoped>
@use '@@/__variables.scss' as *;

#login-component {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    max-width: 30rem;
    height: 100%;
    background-color: $color-bg;
    margin: auto;


    .contents {

        .loginLogo {
            width: 100%;
            height: auto;

            img {
                width: 50%;
                height: auto;
                margin: 2.5rem auto 0;
            }
        }

        .loginform {
            font-size: 0.8rem;
            font-weight: 800;
            font-family: 'Malgun Gothic', '맑은 고딕';

            .loginInput {
                width: 90%;
                height: 2.2rem;
                border: none;
                border-radius: $border-radius;
                margin: 10px auto 0px;
                padding: 0px 10px;
                background-color: white;
                letter-spacing: 1px;
            }

            .loginForm {
                width: 90%;
                height: 2.2rem;
                display: flex;
                justify-content: center;
                align-items: center;
                border: none;
                border-radius: $border-radius;
                margin: 10px auto 0px;
                background-color: $color-bg-point;
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
    }
}

/* 비밀번호 초기화 모달 */
.pw-reset-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.pw-reset-box {
    background: $color-white;
    border-radius: $border-radius;
    padding: 2rem 1.8rem 1.5rem;
    width: 90%;
    max-width: 360px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;

    .pw-reset-header {
        margin-bottom: 0.6rem;

        .pw-reset-title {
            font-size: 1rem;
            font-weight: $font-weight-bold;
            color: $color-black;
            letter-spacing: 0.5px;
        }
    }

    .pw-reset-desc {
        font-size: 0.78rem;
        color: $color-grey5;
        margin-bottom: 1.5rem;
        line-height: 1.6;
    }

    .pw-reset-body {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .pw-input-wrap {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;

            label {
                font-size: 0.75rem;
                font-weight: $font-weight-bold;
                color: $color-grey7;
            }

            .pw-input {
                width: 100%;
                height: $component-height;
                border: 1px solid $color-border-frame;
                border-radius: $border-radius;
                padding: 0 0.75rem;
                background-color: white;
                font-size: 0.82rem;
                letter-spacing: 1px;
                box-sizing: border-box;
                outline: none;
                transition: border-color 0.2s;

                &:focus {
                    border-color: $color-bg-point;
                }

                &.pw-input--error {
                    border-color: #e05c5c;
                }
            }

            .pw-error-msg {
                font-size: 0.72rem;
                color: #e05c5c;
            }

            .pw-ok-msg {
                font-size: 0.72rem;
                color: $color-bg-point;
            }
        }
    }

    .pw-reset-footer {
        margin-top: 1.6rem;

        .pw-btn {
            width: 100%;
            height: $button-height;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: $border-radius;
            font-size: 0.85rem;
            font-weight: $font-weight-bold;
            letter-spacing: 1px;
            cursor: pointer;
            transition: opacity 0.2s;

            &--confirm {
                background-color: $color-bg-point;
                color: white;

                &:hover:not(.pw-btn--disabled) {
                    opacity: 0.88;
                }
            }

            &--disabled {
                background-color: $color-grey3;
                color: white;
                cursor: not-allowed;
                pointer-events: none;
            }
        }
    }
}
</style>
