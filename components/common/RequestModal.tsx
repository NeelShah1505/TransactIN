// components/Modal.tsx
import React from 'react';
import { Transaction } from './TransactionAccordian';
import LoadingSpinner from './LoadingSpinner';

interface ModalProps {
    onClose: () => void;
    isLoading: boolean;
    status: 'accept' | 'execute';
    handleRequestAccept: (secretPin: number) => Promise<void>;
    handleExecutionTx: (secretPin: number) => Promise<void>;
}

const RequestModal: React.FC<ModalProps> = ({
    onClose,
    status,
    handleRequestAccept,
    handleExecutionTx,
    isLoading
}) => {
    const [inputValue, setInputValue] = React.useState<number>(0);
    console.log(status)
    const handleSubmit = async () => {

        const secretPin = inputValue;
        if (status === 'accept') {
            console.log("accept called")
            await handleRequestAccept(secretPin);
        } else if (status === 'execute') {
            await handleExecutionTx(secretPin);
        }

        setInputValue(0); // Reset input after submission
        onClose(); // Close modal after submission
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-md">
                <h2 className="text-lg font-bold mb-4 text-center">Enter Secret Pin</h2>
                <div className="w-full mb-4 ">
                    <label className="text-left text-gray-700 text-xs mb-1">
                        Secret Pin:
                    </label>
                    <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.valueAsNumber)}
                        className="w-full bg-transparent p-3 border rounded-lg text-black border-[#2d2d2d]"
                        placeholder="Enter your secret pin"
                    />
                </div>

                <div className="flex justify-center">
                    {isLoading ? (
                        <button className="flex items-center justify-center w-full bg-black text-white rounded-lg p-2 disabled:opacity-80 cursor-not-allowed">
                            <LoadingSpinner /> Sending...
                        </button>
                    ) : (<button
                        onClick={handleSubmit}
                        // className="customButton w-full bg-black text-white rounded-lg p-2"
                        className="customButton bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
                    >
                        Submit
                    </button>)}
                    <button
                        onClick={onClose}
                        className="ml-2 bg-gray-300 text-gray-700 rounded px-4 py-2 hover:bg-gray-400"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestModal;
