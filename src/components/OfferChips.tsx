import React, { useState } from "react";

interface OfferChipsProps {
    features: string[];
}

const OfferChips: React.FC<OfferChipsProps> = ({ features }) => {
    const [expanded, setExpanded] = useState(false);

    // Show either all features or the first 6
    const visibleFeatures = expanded ? features : features.slice(0, 6);

    return (
        <div>
            <div className="flex flex-wrap gap-2">
                {visibleFeatures.map((feature, idx) => (
                    <div
                        key={idx}
                        className="inline-flex items-center px-3 py-1.5 bg-[#F4F4F4] text-[#374957] rounded-full text-sm"
                    >
                        {feature}
                    </div>
                ))}
            </div>

            {/* Show the link only if there are more than 6 features and not expanded yet */}
            {features.length > 6 && !expanded && (
                <a
                    href="#"
                    className="text-blue-600 text-sm mt-3 inline-block"
                    onClick={(e) => {
                        e.preventDefault();
                        setExpanded(true);
                    }}
                >
                    Show more
                </a>
            )}
        </div>
    );
};

export default OfferChips;