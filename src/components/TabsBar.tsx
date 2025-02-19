"use client";

import Image from "next/image";
import { Inter } from "next/font/google";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCategory } from "@/redux/slices/categorySlice";

const inter = Inter({ subsets: ["latin"] });

export default function TabsBar() {
  const dispatch = useDispatch();
  // Using plain hooks without extra typing; you can type state if desired.
  const selectedCategory = useSelector((state: any) => state.category.selectedCategory);

  // Define tab data
  const tabs = [
    { label: "Private room", icon: "/icons/bed1.svg", value: "privateRoom" },
    { label: "Apartments", icon: "/icons/building1.svg", value: "apartments" },
    { label: "Houses", icon: "/icons/home1.svg", value: "houses" },
    { label: "Sharing", icon: "/icons/handshake1.svg", value: "sharing" },
    { label: "Basement", icon: "/icons/home2.svg", value: "basement" },
  ];

  return (
    <div
      className={`${inter.className} flex items-center justify-between bg-[#1C1C1C] py-[1.5rem] px-[7.25rem]`}
    >
      {/* Left: Icon + text tabs */}
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <div
            key={tab.value}
            className="flex flex-col items-center cursor-pointer relative"
            onClick={() => dispatch(setSelectedCategory(tab.value))}
          >
            <Image alt={tab.label} className="mb-4" src={tab.icon} width={27} height={27} />
            <span className="text-white text-sm">{tab.label}</span>
            {/* Underline if this tab is selected */}
            {selectedCategory === tab.value && (
              <div className="absolute rounded-t-md -bottom-6 h-[10px] left-0 right-0 bg-[#0A84FF]" />
            )}
          </div>
        ))}
      </div>

      {/* Right: Filter and Show map buttons */}
      <div className="flex space-x-4">
        <button className="bg-[#2F2F2F] w-20 text-sm text-white px-4 py-2 rounded-full hover:bg-gray-600 transition">
          Filter
        </button>
        <button className="flex flex-row bg-[#2F2F2F] w-36 h-10 items-center justify-center text-sm text-white space-x-2 px-4 py-2 rounded-full hover:bg-gray-600 transition">
          <Image alt="Map" src={"/icons/map.svg"} width={15} height={15} />
          <div>Show map</div>
        </button>
      </div>
    </div>
  );
}
