import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// This component is now just a wrapper for ToastContainer with custom styling
const Toast = () => {
    return (
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            // Custom styling for beautiful toasts
            toastClassName="rounded-md shadow-lg"
            bodyClassName="font-poppins text-sm"
            progressClassName="toast-progress-bar"
        />
    );
};

export default Toast;
