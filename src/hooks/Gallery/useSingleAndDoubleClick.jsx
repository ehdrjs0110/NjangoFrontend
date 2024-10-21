import { useCallback, useRef } from 'react';

export function useSingleAndDoubleClick(singleClickCallback, doubleClickCallback, delay = 300) {
    const clickTimeout = useRef(null);

    const handleClick = useCallback(() => {
        if (clickTimeout.current) {
            clearTimeout(clickTimeout.current); // 클릭 타이머가 있으면 지워서 더블 클릭으로 처리
            clickTimeout.current = null;
            doubleClickCallback();
        } else {
            clickTimeout.current = setTimeout(() => {
                singleClickCallback();
                clickTimeout.current = null;
            }, delay);
        }
    }, [singleClickCallback, doubleClickCallback, delay]);

    return handleClick;
}
