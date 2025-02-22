'use client'
import ShowListingCard from '@/components/ShowListingCard';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import OfferChips from '@/components/OfferChips';

const inter = Inter({
    subsets: ['latin'],
})

const walkingDistance = [
    "Fully Furnished",
    "Kitchen with steel appliances",
    "Sharing Washroom",
    "Intersection Main and Danforth",
    "First come first basis",
]
const description = [
    "Fully Furnished",
    "Kitchen with steel appliances",
    "Sharing Washroom",
    "Intersection Main and Danforth",
]

const offers = [
    "Couple friendly",
    "Parking",
    "Heating",
    "Pet Friendly",
    "Utilities",
    "Rooftop",
    "Gym",
    "Pool",
    "Balcony",
]

const address = "265 Mainstreet, Toronto"
const price = 1200
const availableFrom = "15 June 2023"
const leaseDuration = "12 months"
const features = ["Private Room", "House", "2 Rooms", "1 Bath"]


export default function ShowListing() {
    return (
        <div className={`${inter.className} bg-black`}>

            {/* Show Card Listing */}
            <div className="bg-[#F4F4F4]">
                <ShowListingCard

                    images={[
                        "https://i.pinimg.com/736x/c8/42/c8/c842c87b22e9b538c8b6fe5024029f46.jpg",
                        "https://i.pinimg.com/736x/c8/42/c8/c842c87b22e9b538c8b6fe5024029f46.jpg",
                        "https://i.pinimg.com/736x/c8/42/c8/c842c87b22e9b538c8b6fe5024029f46.jpg",
                    ]}


                />
            </div>

            <div>
                <div className="px-4 pt-6 pb-7 bg-[#1F1F21] text-[#FFFFFF]">
                    {/* Address & Price */}
                    <div className="flex justify-between items-center ">
                        <h2 className="font-semibold mb-4 text-base">{address}</h2>
                        <p className="font-semibold text-base">${price}/month</p>
                    </div>
                    {/* Availability */}
                    <p className="mt-1 mb-5 text-xs text-white">
                        Available from: <span className="font-base text-sm"> {availableFrom} for {leaseDuration}</span>
                    </p>

                    {/* Features (chips) */}
                    <div className="flex flex-wrap gap-2 mb-2 mt-3">
                        {features.map((feature, idx) => (
                            <span
                                key={idx}
                                className="bg-[#353537] text-white text-xs px-4 py-2 rounded-full"
                            >
                                {feature}
                            </span>
                        ))}
                    </div>
                </div>

                <div className=" p-4 rounded-t-3xl  bg-white z-10 text-[#2C3C4E]">
                    {/* Description */}
                    <div className="">
                        <h3 className="text-sm mt-5 font-semibold">Description:</h3>
                        <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                            {description.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Walking Distance */}
                    <div className="mt-4">
                        <h3 className="text-sm font-semibold">Walking distance to:</h3>
                        <ul className="list-disc list-inside text-xs  mt-1 space-y-1">
                            {walkingDistance.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <hr className="mt-5 mb-4 w-[90vw]" />

                    <div className="bg-white p-2 rounded-md w-full max-w-md">
                        {/* <!-- Title --> */}
                        <h2 className="text-base font-semibold text-[#2C3C4E] mb-3">
                            What this places offers:
                        </h2>

                        {/* <!-- Chips Container --> */}
                        <OfferChips features={offers} />
                    </div>
                    <hr className="my-4" />


                </div>
            </div>


            <div className="px-4 space-y-6 z-10 bg-white">
                {/* Location Label */}
                <div className="text-sm font-semibold text-[#2C3C4E]">
                    Location
                </div>

                {/* Map Placeholder */}
                <div className="w-full h-30 bg-gray-200 flex items-center justify-center">
                    <Image src={'/icons/mapimg.png'} alt='map' height={1000} width={1000} className='w-full' />
                </div>
                <hr className='my-4' />

                {/* Hosted By Section */}
                <div className="flex items-center space-x-3 text-[#2C3C4E]">
                    {/* Avatar Placeholder */}
                    <div className="h-10 w-10 bg-gray-200 rounded-full" />

                    {/* Text Section */}
                    <div className="flex flex-col">
                        {/* First row: "Hosted by..." */}
                        <div className="text-sm font-semibold">
                            Hosted by : <span className='font-bold'>Pratik Parmar</span>
                        </div>
                        {/* Second row: "Listed on..." */}
                        <div className="text-xs ">
                            Listed on 27 Oct, 2024
                        </div>
                    </div>
                </div>

                <hr className='my-4' />

                {/* Similar Listings Title */}
                <div className="text-sm font-semibold text-center text-[#2C3C4E]">Similar Listings</div>

                {/* CREATING THIS FOR THE CLIENT CURRENTLY HARDCODED
                    CHANGE THE CODE FOR THE CORRECT CAROUSEL  */}

                {/* Similar Listings Row */}
                <div className="flex overflow-x-auto space-x-4 w-full">
                    {/* Carousel Item 1 */}
                    <div className="flex-shrink-0 flex flex-row w-80 h-24 border rounded-md bg-white">
                        {/* Left side: Image placeholder */}
                        <div className="w-1/2 h-full bg-gray-200 flex items-center justify-center">
                            <Image src={'/icons/similarlisting.png'} alt='similar listing' width={100} height={100} className='h-full w-full' />
                        </div>

                        {/* Right side: Address, Price, Date */}
                        <div className="w-1/2 flex flex-col bg-[#F4F4F4] justify-center p-2">
                            {/* Address (truncated) */}
                            <div className="text-sm mb-1 font-semibold truncate">
                                265 Mainstreet, Toronto, Canada
                            </div>
                            {/* Price */}
                            <div className="text-sm font-semibold">$1200</div>
                            {/* Date (with icon placeholder) */}
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <div className="w-4 h-4 bg-gray-300 rounded" />
                                <div className='text-[#2C3C4E] mt-1'>Jun 15 / 12 Months</div>
                            </div>
                        </div>
                    </div>

                    {/* Carousel Item 2 */}
                    <div className="flex-shrink-0 flex flex-row w-80 h-24 border rounded-md bg-white">
                        {/* Left side: Image placeholder */}
                        <div className="w-1/2 h-full bg-gray-200 flex items-center justify-center">
                            <Image src={'/icons/similarlisting.png'} alt='similar listing' width={100} height={100} className='h-full w-full' />
                        </div>

                        {/* Right side: Address, Price, Date */}
                        <div className="w-1/2 flex flex-col bg-[#F4F4F4] justify-center p-2">
                            {/* Address (truncated) */}
                            <div className="text-sm mb-1 font-semibold truncate">
                                265 Mainstreet, Toronto, Canada
                            </div>
                            {/* Price */}
                            <div className="text-sm font-semibold">$1200</div>
                            {/* Date (with icon placeholder) */}
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <div className="w-4 h-4 bg-gray-300 rounded" />
                                <div className='text-[#2C3C4E] mt-1'>Jun 15 / 12 Months</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message Section */}
                <div className="bg-black px-4 py-6 rounded-md">
                    <div className="text-sm font-base  text-white mb-3">
                        Send message to Pratik Parmar
                    </div>
                    <div className="flex space-x-2">
                        <div className="flex-1 flex items-center  bg-white text-gray-900 p-2 rounded-full">
                            Hello, is this available?
                        </div>
                        <div className="bg-blue-600 text-white px-5 py-3 rounded-full">
                            Send
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}
