"use client"; // Ensure you are using this if necessary

import React, { useState, FC } from "react";
import { FiCopy, FiCheck } from "react-icons/fi"; // Import copy and check icons from react-icons

interface AddressWithCopyProps {
    address: string; // Address should be a string
    short?: boolean; // Optional prop to determine if the address should be truncated
}

const AddressWithCopy: FC<AddressWithCopyProps> = ({ address, short }) => {
    const [isCopied, setIsCopied] = useState<boolean>(false); // State to track copy status

    const truncatedAddress = short
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : address;

    const copyAddress = () => {
        navigator.clipboard.writeText(address);
        setIsCopied(true);

        // Reset the copy status after 3 seconds
        setTimeout(() => {
            setIsCopied(false);
        }, 3000);
    };

    return (
        <div className="flex items-center">
            <span className="mr-2 break-words ml-2">{truncatedAddress}</span>
            {isCopied ? (
                <FiCheck className="text-green-500" />
            ) : (
                <FiCopy className="cursor-pointer" onClick={copyAddress} />
            )}
        </div>
    );
};

export default AddressWithCopy;
