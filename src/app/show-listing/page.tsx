'use client'
import PropertyCardCarousel from '@/components/PropertyCard';
import ShowListingCardCarousel from '@/components/ShowListingCarousel';
import React from 'react'

const ShowListing = () => {

    const dummyProperties = [
        {
            images: [
                "https://i.pinimg.com/736x/c8/42/c8/c842c87b22e9b538c8b6fe5024029f46.jpg",
                "https://i.pinimg.com/736x/c8/42/c8/c842c87b22e9b538c8b6fe5024029f46.jpg",
                "https://i.pinimg.com/736x/c8/42/c8/c842c87b22e9b538c8b6fe5024029f46.jpg",
                "https://i.pinimg.com/736x/c8/42/c8/c842c87b22e9b538c8b6fe5024029f46.jpg",
            ],
            address: "265 Mainstreet, Toronto",
            price: 1200,
            date: new Date(),
        },
    ];

    return (
        <div>
            {dummyProperties.map((property, index) => (
                <ShowListingCardCarousel
                    key={index}
                    images={property.images}
                    address={property.address}
                    price={property.price}
                    date={property.date}
                />
            ))}
        </div>
    )
}

export default ShowListing