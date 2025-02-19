// src/components/Navbar.tsx
'use client';
import { Knewave, Inter } from 'next/font/google';
import Image from 'next/image';
import React from 'react';
import { CircleUserRound, Menu as MenuIcon } from 'lucide-react'

const knewave = Knewave({
    weight: '400',       // Knewave only has 400
    subsets: ['latin'],  // or 'latin-ext', etc.
});

const inter = Inter({
    subsets: ['latin'],
})

export default function Navbar() {
    return (
        <nav
            className='sticky top-0 z-10 text-[#fff] bg-[#1c1c1c]'
        >
            <div
                className='h-[100px] flex items-center justify-between px-[7.5rem]'
            >
                {/* Logo / Brand */}
                <div className='flex flex-row'>
                    <div className='rounded-full h-[32px] w-[32px] mr-4 bg-[#0A84FF]'>
                    </div>
                    <div className={`text-[20px] ${knewave.className}`} style={{ fontSize: '20px' }}>
                        Findmyrentals
                    </div>
                </div>


                {/* Search Bar */}

                <div className="flex items-center bg-[#2F2F2F] rounded-full px-4 py-2 w-[26.18rem]">
                    <div className='rounded-full p-2 bg-[#1c1c1c]'>
                        <Image src={`/icons/firrsearch.png`} height={15.43} width={15.43} alt='search-icon' />
                    </div>
                    <input
                        type="text"
                        placeholder="Search location"
                        className="bg-transparent outline-none border-none text-white placeholder-white ml-2 text-[14px]"
                    />
                </div>

                <button
                    type="button"
                    className="text-white text-sm bg-transparent hover:opacity-80 font-semibold hover:underline transition-all"
                >
                    Create listing
                </button>

                <div
                    className="flex items-centerbg-[#2F2F2F] text-white px-3 py-2 rounded-full bg-[#353537]"
                >
                    <button className=''>
                        {/* Hamburger Icon */}
                        <MenuIcon className="w-[1.25rem] h-[1.25rem] text-white" />
                    </button>

                    {/* User Icon in a small black circle */}
                    <button className="ml-4 w-5 h-5 rounded-full flex items-center justify-center">
                        <Image src={'/icons/userIcon.png'} alt='User Icon' width={38} height={38} className="" />
                    </button>
                </div>

            </div>
        </nav>
    );
}
