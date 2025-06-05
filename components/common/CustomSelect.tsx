"use client"
import Image from 'next/image';
import React, { FC } from 'react';
import { TbBackground } from 'react-icons/tb';
import Select from 'react-select';

interface Option {
    value: string;
    label: JSX.Element;
}

interface CustomSelectProps {
    selectedOption: string;
    setSelectedOption: (value: string) => void;
}

const options: Option[] = [
    {
        value: '421614',
        label: (
            <div className="flex items-center text-black ">
                <Image src="/assets/arbitrum-logo.png" className="mr-2" width="30" height="30" alt="arbitrum icon" />
                <span>Arbitrum Sepolia <span className='text-gray-500 ml-2'>(same chain)</span></span>
            </div>
        ),
    },
    {
        value: '84532',
        label: (
            <div className="flex items-center text-black">
                <Image src="/assets/base-icon.png" className="mr-2" width="30" height="30" alt="arbitrum icon" />
                <span>Base Sepolia <span className='text-gray-500 ml-2'>(cross chain)</span></span>
            </div>
        ),
    },
];

const CustomSelect: FC<CustomSelectProps> = ({ selectedOption, setSelectedOption }) => {
    return (
        <div className="w-full mb-4">

            <label className="text-left text-gray-700 text-xs mb-1">Select Receiver's Network:</label>
            <Select<Option>
                options={options}
                value={options.find(option => option.value === selectedOption)}
                onChange={(selected: any) => {
                    if (selected) {
                        setSelectedOption(selected.value);
                    }
                }}
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                    control: (base: any) => ({
                        ...base,
                        borderColor: '#2d2d2d',
                        borderRadius: "0.5rem",
                        boxShadow: 'none',
                        '&:hover': {
                            borderColor: '#10bb35',
                        },
                        padding: "0.75rem"

                    }),
                    option: (provided: any) => ({
                        ...provided,
                        display: 'flex',
                        alignItems: 'center',
                    }),
                    menu: (base: any) => ({
                        ...base,
                        zIndex: 9999,

                    }),
                }}
            />
        </div>
    );
};

export default CustomSelect;
