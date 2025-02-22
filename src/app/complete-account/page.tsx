"use client";

import { useState } from "react";
import { Inter } from "next/font/google";
import Image from "next/image";

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'


const inter = Inter({
    subsets: ["latin"],
})
export default function CompleteProfileMobile() {
    // Example states (optional)
    const [gender, setGender] = useState("");
    const [about, setAbout] = useState("");
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

    // Example language list
    const languages = [
        "English",
        "French",
        "Hindi",
        "Gujarati",
        "Punjabi",
        "Mandarin",
        "Telugu",
        "Urdu",
        "Spanish",
        "Korean",
        "Russian",
        "Filipino",
        "Tamil",
        "Malayalam",
        "Not listed",
        "Skip",
    ];

    const toggleLanguage = (lang: string) => {
        setSelectedLanguages((prev) =>
            prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
        );
    };

    return (
        <div className={`w-full min-h-screen md:hidden  flex flex-col ${inter.className}`}>

            <div className="relative  bg-[#1F1F21] text-white pt-10 pb-8 px-4">
                {/* Back button (absolute) */}
                <button
                    onClick={() => alert("Go back!")}
                    className="absolute top-4 left-4 text-white bg-[#353537] rounded-full p-3 flex items-center"
                >
                    <Image src={'/icons/backarrow.svg'} alt="back icon" width={15} height={15} />
                </button>

                {/* Centered title: "Profile" */}
                <h1 className="text-center text-base font-base">Profile</h1>

                {/* Avatar + text */}
                <div className="mt-1 mb-3 flex flex-col items-center">
                    <h2 className="mt-2 text-lg font-semibold">Complete your profile!</h2>
                    <p className="text-sm text-gray-300 mb-5">Stand out and Shine ✨</p>
                    <div className="w-20 h-20 rounded-full bg-gray-200 relative flex items-center justify-center">
                        <Image className="rounded-full right-1 bottom-2 bg-[#0A84FF] text-white absolute" src='/icons/plusicon.svg' alt="Add profile picture" width={15} height={15} />
                        <span className="text-3xl">🙂</span>
                    </div>

                    <button className="mt-4 text-grey-300 text-sm">
                        Add your profile picture
                    </button>
                </div>
            </div>

            {/* 
        BOTTOM WHITE SECTION 
        (rounded top corners)
      */}
            <div className="bg-white z-10 rounded-t-3xl -mt-4 px-4 pt-6 flex-1">
                {/* Gender Dropdown */}
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Gender
                    </label>
                    <div className="relative">
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="
                block w-full
                border border-gray-300
                rounded-md
                py-5 px-3
                bg-white
                text-gray-700
                focus:outline-none
                focus:ring-1 focus:ring-blue-500
                focus:border-blue-500
                appearance-none
              "
                        >
                            <option value="" disabled>
                                Select gender
                            </option>
                            <option className="text-sm" value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to disclose">
                                Prefer not to disclose
                            </option>
                        </select>
                        {/* Dropdown arrow */}
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg
                                className="w-4 h-4 text-gray-700"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Language Chips */}
                <div className="mb-6">
                    <label className="block mb-5 text-sm font-medium text-gray-700">
                        Select the languages that apply
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {languages.map((lang) => {
                            const isSelected = selectedLanguages.includes(lang);
                            return (
                                <button
                                    key={lang}
                                    onClick={() => toggleLanguage(lang)}
                                    className={`
                    px-4 py-2
                    my-1
                    rounded-full
                    text-sm
                    border
                    ${isSelected
                                            ? "bg-blue-500 border-blue-500 text-white"
                                            : "border-gray-800 text-gray-700 hover:bg-gray-100"
                                        }
                  `}
                                >
                                    {lang}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* About Textarea */}
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Your about ?
                    </label>
                    <textarea
                        rows={3}
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        placeholder="Eg: work, hobby, lifestyle, anything"
                        className="
              w-full
              border border-gray-300
              rounded-md
              p-3
              bg-[#F4F4F4]
              focus:outline-none
              focus:ring-1 focus:ring-blue-500
              focus:border-blue-500
            "
                    />
                </div>

                {/* Save Button */}
                <button
                    onClick={() => alert("Profile saved!")}
                    className="
            w-full
            bg-black
            text-white
            py-4
            rounded-full
            text-sm font-medium
            hover:bg-gray-800
          "
                >
                    Save
                </button>
            </div>
        </div>
    );
}
