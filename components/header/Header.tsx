 'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import React from 'react';
import { useAccount } from 'wagmi';

const Header: React.FC = () => {
    const { isConnected } = useAccount();
    return (
        <header className="bg-gradient-to-r from-pink-100 to-pink-200 shadow-sm py-4">
            <div className="container mx-auto flex justify-between items-center px-4">
                {/* Logo */}
                <div className="text-2xl font-bold">
                    <Link href="/" className="shrink-0">
                        <div className="flex items-center">
                            <span className="ml-2 text-pink-700 text-xl font-extrabold tracking-tight">
                                TransactIN
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Navigation & Connect */}
                <div className="flex items-center gap-6">
                    {isConnected && (
                        <div className="flex items-center gap-4">
                            <Link
                                className="text-pink-800 hover:text-pink-900 font-medium transition"
                                href="/send-request"
                            >
                                Send Token
                            </Link>
                            <Link
                                className="text-pink-800 hover:text-pink-900 font-medium transition"
                                href="/dashboard"
                            >
                                Dashboard
                            </Link>
                        </div>
                    )}
                    <ConnectButton />
                </div>
            </div>
        </header>
    );
};

export default Header;
