"use client";

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    interactive?: boolean;
    onChange?: (rating: number) => void;
}

const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
};

const touchTargetClasses = {
    sm: 'p-0.5',
    md: 'p-1',
    lg: 'p-2',
};

export default function StarRating({
    rating,
    maxRating = 5,
    size = 'md',
    showValue = false,
    interactive = false,
    onChange,
}: StarRatingProps) {
    const handleClick = (index: number) => {
        if (interactive && onChange) {
            onChange(index + 1);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (interactive && onChange && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onChange(index + 1);
        }
    };

    return (
        <div className="flex items-center gap-0.5" dir="ltr">
            {Array.from({ length: maxRating }).map((_, index) => {
                const isFilled = index < Math.round(rating);
                const isHalfFilled = !isFilled && index < rating && index + 1 > rating;

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleClick(index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        disabled={!interactive}
                        className={`
                            ${sizeClasses[size]}
                            ${touchTargetClasses[size]}
                            ${interactive ? 'cursor-pointer active:scale-110 transition-transform' : 'cursor-default'}
                            ${interactive ? 'min-w-[44px] min-h-[44px] flex items-center justify-center' : ''}
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded
                            disabled:opacity-100
                        `}
                        aria-label={interactive ? `דירוג ${index + 1} מתוך ${maxRating}` : undefined}
                        tabIndex={interactive ? 0 : -1}
                    >
                        <span
                            className={`
                                ${isFilled ? 'text-yellow-400' : 'text-gray-300'}
                                ${isHalfFilled ? 'text-yellow-400/50' : ''}
                            `}
                        >
                            ★
                        </span>
                    </button>
                );
            })}
            {showValue && (
                <span className="mr-2 text-gray-600 font-medium">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
