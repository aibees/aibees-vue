<template>
    <div class="user-management">
        <h2 class="page-title">{{ route.meta.title }}</h2>

        <!-- 상단 액션 바 -->
        <section class="action-bar">
            <div class="action-bar-left">
                <span class="user-count">전체 <strong>{{ userList.length }}</strong>명</span>
            </div>
            <div class="action-bar-right">
                <button class="btn-primary" @click="openAddModal">+ 사용자 추가</button>
            </div>
        </section>

        <!-- 테이블 -->
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="col-name">이름</th>
                        <th class="col-email">이메일</th>
                        <!-- <th class="col-gender">성별</th> -->
                        <th class="col-group">소속그룹</th>
                        <th class="col-pw">초기화여부</th>
                        <th class="col-pw">비밀번호</th>
                        <th class="col-option">옵션</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in userList" :key="user.userId" class="user-row">

                        <!-- 이름 -->
                        <td class="col-name">
                            <div class="user-name-cell">
                                <span class="user-avatar">{{ user.name?.charAt(0) }}</span>
                                <span>{{ user.name }}</span>
                            </div>
                        </td>

                        <!-- 이메일 (인라인 수정) -->
                        <td class="col-email">
                            <input class="inline-input" type="email" v-model="user.email"
                                :placeholder="user.email || '이메일 입력'" @change="onEmailChange(user)" />
                        </td>

                        <!-- 성별 -->
                        <!-- <td class="col-gender">
                            <span class="gender-badge" :class="user.gender === 'M' ? 'male' : 'female'">
                                {{ user.gender === 'M' ? '남' : '여' }}
                            </span>
                        </td> -->

                        <!-- 소속그룹 -->
                        <td class="col-group">
                            <span class="group-tag">{{ user.family || '-' }}</span>
                        </td>
                        <td class="col-pw">
                            {{ user.passwordResetFlag ? '초기화' : '' }}
                        </td>

                        <!-- 비밀번호 초기화 -->
                        <td class="col-pw">
                            <button class="btn-reset-pw" @click="resetPassword(user)">
                                🔑 초기화
                            </button>
                        </td>

                        <!-- 옵션 -->
                        <td class="col-option">
                            <button class="btn-option" @click.stop="openOptionModal(user)" title="옵션">
                                ⋯
                            </button>
                        </td>
                    </tr>

                    <tr v-if="userList.length === 0">
                        <td colspan="6" class="empty-state">등록된 사용자가 없습니다.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 사용자 추가 모달 -->
        <Transition name="fade">
            <div v-if="isAddModalOpen" class="modal-overlay" @click.self="closeAddModal">
                <div class="modal-container">
                    <header class="modal-header">
                        <h4>사용자 추가</h4>
                        <button class="btn-close" @click="closeAddModal">&times;</button>
                    </header>
                    <div class="modal-body">
                        <form id="addUserForm" @submit.prevent="submitAddUser">
                            <div class="form-grid">

                                <div class="form-group">
                                    <label>이름 <span class="required">*</span></label>
                                    <input type="text" v-model="addForm.name" placeholder="홍길동" required />
                                </div>

                                <!-- <div class="form-group">
                                    <label>성별 <span class="required">*</span></label>
                                    <div class="gender-select">
                                        <label class="gender-option" :class="{ active: addForm.gender === 'M' }">
                                            <input type="radio" v-model="addForm.gender" value="M" hidden />
                                            남성
                                        </label>
                                        <label class="gender-option" :class="{ active: addForm.gender === 'F' }">
                                            <input type="radio" v-model="addForm.gender" value="F" hidden />
                                            여성
                                        </label>
                                    </div>
                                </div> -->

                                <div class="form-group form-group-full">
                                    <label>이메일 <span class="required">*</span></label>
                                    <input type="email" v-model="addForm.email" placeholder="example@company.com"
                                        required />
                                </div>

                                <div class="form-group form-group-full">
                                    <label>소속그룹</label>
                                    <select v-model="addForm.family">
                                        <option value="">그룹 없음</option>
                                        <option v-for="g in groupOptions" :key="g" :value="g">{{ g }}</option>
                                    </select>
                                </div>

                            </div>
                        </form>
                    </div>
                    <footer class="modal-footer">
                        <button class="btn-secondary" @click="closeAddModal">취소</button>
                        <button type="submit" form="addUserForm" class="btn-primary">추가하기</button>
                    </footer>
                </div>
            </div>
        </Transition>

        <!-- 옵션 모달 -->
        <Transition name="fade">
            <div v-if="isOptionModalOpen" class="modal-overlay" @click.self="closeOptionModal">
                <div class="modal-container">
                    <header class="modal-header">
                        <h4>{{ selectedUser?.name }} 옵션</h4>
                        <button class="btn-close" @click="closeOptionModal">&times;</button>
                    </header>
                    <div class="modal-body">
                        <p class="modal-placeholder">
                            ⚙️ 옵션 기능은 추후 확정 예정입니다.
                        </p>
                    </div>
                    <footer class="modal-footer">
                        <button class="btn-secondary" @click="closeOptionModal">닫기</button>
                    </footer>
                </div>
            </div>
        </Transition>

    </div>
</template>

<script setup>
import mariaApi from '@scripts/util/mariaApi.js';

// ==========================================
// 1. Variables
// ==========================================
const route = useRoute();

const isAddModalOpen = ref(false);
const isOptionModalOpen = ref(false);
const selectedUser = ref(null);

// 소속그룹 옵션 — TODO: API 연동 시 교체
const groupOptions = ref(['개발팀', '디자인팀', '경영지원팀', '마케팅팀', '재무팀']);

const initialAddForm = { name: '', email: '', gender: 'M', family: '' };
const addForm = reactive({ ...initialAddForm });

// 임시 목 데이터 — TODO: API 연동 시 교체
const userList = ref([]);

// ==========================================
// 2. Lifecycle
// ==========================================
onMounted(async () => {
    await getUserList();
});

// ==========================================
// 3. Functions
// ==========================================

const getUserList = async () => {
    const { data } = await mariaApi.get('/api/user-infos');
    console.log(data);
    userList.value = data;
};

const onEmailChange = (user) => {
    // TODO: 이메일 수정 API 연동
    console.log('이메일 변경:', user.userId, user.email);
};

const resetPassword = async (user) => {
    // TODO: 비밀번호 초기화 API 연동
    const bodyParam = {
        uuid: user.uuid,
        serviceName: user.serviceName
    }
    const result = await mariaApi.post(`/api/user-infos/r/p`, bodyParam);

        if (result.isSuccess) {
            await getUserList();
        }
};

// 사용자 추가 모달
const openAddModal = () => {
    Object.assign(addForm, initialAddForm);
    isAddModalOpen.value = true;
};

const closeAddModal = () => {
    isAddModalOpen.value = false;
};

const submitAddUser = async () => {
    // TODO: 사용자 추가 API 연동
    // await mariaApi.post('/api/system/users', { ...addForm });
    userList.value.push({
        userId: Date.now(),
        name: addForm.name,
        email: addForm.email,
        gender: addForm.gender,
        family: addForm.family,
    });
    closeAddModal();
};

// 옵션 모달
const openOptionModal = (user) => {
    selectedUser.value = user;
    isOptionModalOpen.value = true;
};

const closeOptionModal = () => {
    isOptionModalOpen.value = false;
    selectedUser.value = null;
};
</script>

<style lang="scss" scoped>
@use '@@/__variables.scss' as *;

.user-management {
    max-width: 1100px;
    margin: 0 auto;
    padding: 24px;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    color: $text-main;
}

.page-title {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 20px;
    text-align: start;
}

/* 액션 바 */
.action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .action-bar-left {
        .user-count {
            font-size: 14px;
            color: $text-sub;

            strong {
                color: $primary;
                font-weight: 700;
            }
        }
    }
}

/* 테이블 래퍼 */
.data-table-wrapper {
    background-color: $bg-white;
    border: 1px solid $border-color;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    max-height: 65vh;
    overflow-y: auto;
}

/* 테이블 */
.data-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;

    th {
        background-color: $bg-main;
        padding: 14px 16px;
        font-size: 13px;
        font-weight: 600;
        color: $text-sub;
        position: sticky;
        top: 0;
        z-index: 10;
        box-shadow: 0 1px 0 $border-color;
    }

    td {
        padding: 12px 16px;
        vertical-align: middle;
        border-bottom: 1px solid $border-color;
        font-size: 14px;
    }

    .col-name {
        width: 130px;
    }

    .col-email {
        width: auto;
    }

    .col-gender {
        width: 70px;
        text-align: center;
    }

    .col-group {
        width: 130px;
    }

    .col-pw {
        width: 110px;
        text-align: center;
    }

    .col-option {
        width: 70px;
        text-align: center;
    }

    .user-row {
        transition: background-color 0.15s ease;

        &:hover {
            background-color: rgba($primary, 0.03);
        }

        &:last-child td {
            border-bottom: none;
        }
    }

    .empty-state {
        text-align: center;
        padding: 48px;
        color: $text-light;
        font-size: 14px;
    }
}

/* 이름 셀 */
.user-name-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: rgba($primary, 0.12);
        color: $primary;
        font-size: 13px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
}

/* 인라인 이메일 입력 */
.inline-input {
    width: 100%;
    padding: 7px 10px;
    font-size: 14px;
    border: 1px solid transparent;
    border-radius: 6px;
    background-color: transparent;
    color: $text-main;
    box-sizing: border-box;
    transition: border-color 0.2s, background-color 0.2s;

    &:hover {
        background-color: $bg-main;
        border-color: $border-color;
    }

    &:focus {
        outline: none;
        background-color: $bg-white;
        border-color: $primary;
        box-shadow: 0 0 0 3px rgba($primary, 0.1);
    }

    &::placeholder {
        color: $text-light;
    }
}

/* 성별 뱃지 */
.gender-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 700;

    &.male {
        background-color: #dbeafe;
        color: #1d4ed8;
    }

    &.female {
        background-color: #fce7f3;
        color: #be185d;
    }
}

/* 소속그룹 태그 */
.group-tag {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    background-color: #f1f5f9;
    color: $text-sub;
    border: 1px solid $border-color;
}

/* 버튼 공통 */
.btn-primary {
    background-color: $primary;
    color: $bg-white;
    border: none;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: $primary-hover;
    }
}

.btn-secondary {
    background-color: $bg-white;
    color: $text-sub;
    border: 1px solid $border-color;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: $bg-main;
    }
}

.btn-reset-pw {
    background-color: $bg-white;
    color: $text-sub;
    border: 1px solid $border-color;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;

    &:hover {
        background-color: #fff3cd;
        border-color: #ffc107;
        color: #856404;
    }
}

.btn-option {
    background-color: transparent;
    border: 1px solid $border-color;
    color: $text-sub;
    width: 34px;
    height: 34px;
    border-radius: 6px;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
        background-color: $bg-main;
        border-color: $text-sub;
        color: $text-main;
    }
}

/* 모달 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-container {
    background-color: $bg-white;
    width: 100%;
    max-width: 480px;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid $border-color;

    h4 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
    }

    .btn-close {
        background: transparent;
        border: none;
        font-size: 26px;
        line-height: 1;
        color: $text-light;
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
            color: $text-main;
        }
    }
}

.modal-body {
    padding: 24px;

    .modal-placeholder {
        text-align: center;
        color: $text-light;
        font-size: 15px;
        margin: 16px 0;
    }
}

/* 폼 */
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &.form-group-full {
        grid-column: 1 / -1;
    }

    label {
        font-size: 13px;
        font-weight: 600;
        color: $text-sub;

        .required {
            color: #e03131;
            margin-left: 2px;
        }
    }

    input[type="text"],
    input[type="email"],
    select {
        width: 100%;
        padding: 10px 12px;
        font-size: 14px;
        border: 1px solid $border-color;
        border-radius: 8px;
        background-color: $bg-white;
        color: $text-main;
        box-sizing: border-box;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:focus {
            outline: none;
            border-color: $primary;
            box-shadow: 0 0 0 3px rgba($primary, 0.1);
        }

        &::placeholder {
            color: $text-light;
        }
    }

    select {
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        padding-right: 32px;
    }
}

/* 성별 토글 선택 */
.gender-select {
    display: flex;
    gap: 8px;

    .gender-option {
        flex: 1;
        text-align: center;
        padding: 9px 0;
        font-size: 14px;
        font-weight: 500;
        border: 1px solid $border-color;
        border-radius: 8px;
        cursor: pointer;
        color: $text-sub;
        background-color: $bg-white;
        transition: all 0.15s ease;

        &:hover {
            border-color: $primary;
            color: $primary;
        }

        &.active {
            background-color: $primary;
            border-color: $primary;
            color: $bg-white;
            font-weight: 600;
        }
    }
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid $border-color;
    display: flex;
    justify-content: flex-end;
    background-color: $bg-main;
}

/* 트랜지션 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}</style>
