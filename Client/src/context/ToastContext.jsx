import React, { createContext, useContext } from 'react';
import { toast } from 'react-toastify';
import Toast from '../components/Toast/Toast';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    // Toast functions using react-toastify
    const showToast = (message, type = 'info', duration = 3000) => {
        const options = {
            position: "top-right",
            autoClose: duration,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        };

        switch (type) {
            case 'success':
                toast.success(message, options);
                break;
            case 'error':
                toast.error(message, options);
                break;
            case 'warning':
                toast.warning(message, options);
                break;
            case 'info':
            default:
                toast.info(message, options);
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Toast />
        </ToastContext.Provider>
    );
};
