import { createVNode, render } from 'vue';
import MariaToastComponent from '@/components/common/AToast.vue';

// 싱글톤 패턴으로 컨테이너 하나만 유지
let toastInstance = null;

const initToast = () => {
    if (toastInstance) return toastInstance;

    const container = document.createElement('div');
    document.body.appendChild(container);

    const vnode = createVNode(MariaToastComponent);
    render(vnode, container);

    // 컴포넌트 내부의 addToast 함수에 접근
    toastInstance = vnode.component.exposed;
    return toastInstance;
};

const MariaToast = {
    success(msg) { initToast().addToast('success', msg); },
    error(msg) { initToast().addToast('error', msg); },
    info(msg) { initToast().addToast('info', msg); }
};

export default MariaToast;