import React, { useRef, useEffect, useState, createContext, forwardRef } from "react";
import Button from "@/components/Button/Button";
import { CloseIcon } from "@/assets/icons/CloseIcon";

export const ModalContext = createContext();

const Modal = forwardRef(({ title, icon, type, children, closeModal }, modalRef) => {
    const [isClosing, setClosing] = useState(false);
    const innerWrapperRef = useRef();

    async function close() {
        setClosing(true);

        await new Promise((r) => setTimeout(r, 400));
        closeModal();

        setClosing(false);
    }

    const contextObject = {
        close,
    };

    useEffect(() => {
        function handleEsc(e) {
            if (e.keyCode === 27) {
                close();
            }
        }
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    function handleClickOutside(e) {
        const rect = innerWrapperRef.current.getBoundingClientRect();
        if (
            rect.left > e.clientX ||
            rect.right < e.clientX ||
            rect.top > e.clientY ||
            rect.bottom < e.clientY
        ) {
            close();
        }
    }

    return (
        <ModalContext.Provider value={contextObject}>
            <dialog
                id="modal"
                ref={modalRef}
                className={isClosing ? "closing" : ""}
                onClick={(e) => handleClickOutside(e)}
            >
                <div className={`modal-inner-wrapper ${type}`} ref={innerWrapperRef}>
                    {title && (
                        <div className="header">
                            <div className="title">
                                {icon}
                                <h2>{title}</h2>
                            </div>
                            <Button
                                icon={CloseIcon}
                                type="icon small"
                                onClick={close}
                                aria="close"
                            />
                        </div>
                    )}
                    <>{children}</>
                </div>
            </dialog>
        </ModalContext.Provider>
    );
});

export default Modal;
