import { createVNode, render } from 'vue';
import MariaConfirmComponent from '@/components/common/AConfirm.vue';

export const MariaConfirm = (message = '저장하시겠습니까?') => {
    return new Promise((resolve) => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        const remove = () => {
            render(null, container);
            container.remove();
        };

        const onConfirm = () => { resolve(true); remove(); };
        const onCancel = () => { resolve(false); remove(); };

        const vnode = createVNode(MariaConfirmComponent, { message, onConfirm, onCancel });
        render(vnode, container);
    });
};