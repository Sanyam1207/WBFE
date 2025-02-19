import Image from "next/image";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function TabsBar() {
    return (

        <div className={`${inter.className} flex items-center justify-between bg-[#1C1C1C] py-[1.5rem] px-[7.25rem]`}>
            {/* Left: Icon + text tabs */}
            <div className="flex space-x-8">

                <div className="flex flex-col items-center cursor-pointer mb-4">
                    <Image alt='Private Room' className='mb-4' src={'/icons/bed1.svg'} width={27} height={27} />
                    <span className="text-white text-sm">Private room</span>
                </div>

                <div className="flex flex-col items-center cursor-pointer">
                    <Image alt='Apartments' className='mb-4' src={'/icons/building1.svg'} width={27} height={27} />
                    <span className="text-white text-sm">Apartments</span>
                </div>

                <div className="flex flex-col items-center cursor-pointer">
                    <Image alt='Houses' className='mb-4' src={'/icons/home1.svg'} width={27} height={27} />
                    <span className="text-white text-sm">Houses</span>
                </div>

                <div className="flex flex-col items-center cursor-pointer">
                    <Image alt='Sharing' className='mb-4' src={'/icons/handshake1.svg'} width={27} height={27} />
                    <span className="text-white text-sm">Sharing</span>
                </div>

                <div className="flex flex-col items-center cursor-pointer">
                    <Image alt='Basement' className='mb-4' src={'/icons/home2.svg'} width={27} height={27} />
                    <span className="text-white text-sm">Houses</span>
                </div>
            </div>

            {/* Right: Filter and Show map buttons */}
            <div className="flex space-x-4 ">
                <button className="bg-[#2F2F2F] w-20 text-sm  text-white px-4 py-2 rounded-full hover:bg-gray-600 transition">
                    Filter
                </button>
                <button className="flex flex-row bg-[#2F2F2F] w-36 h-10 items-center justify-center text-sm text-white space-x-2 px-4 py-2 rounded-full hover:bg-gray-600 transition">
                    <Image alt='Map' src={'/icons/map.svg'} width={15} height={15} />
                    <div>
                        Show map
                    </div>

                </button>
            </div>
        </div>
    );
}