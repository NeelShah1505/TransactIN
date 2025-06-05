import React from "react";

const LoadingSpinner: React.FC = () => {
    return (
        <svg
            className="animate-spin h-5 w-5 mr-3 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V2c4.418 0 8 3.582 8 8h-2c0-3.314-2.686-6-6-6s-6 2.686-6 6H4zm16 0a8 8 0 01-8 8v2c-4.418 0-8-3.582-8-8h2c0 3.314 2.686 6 6 6s6-2.686 6-6h2z"
            />
        </svg>
    );
};

export default LoadingSpinner;
