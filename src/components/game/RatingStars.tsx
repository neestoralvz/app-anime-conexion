import { useState } from 'react';
import { GAME_CONFIG } from '@/constants';

interface RatingStarsProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingStars({ value, onChange, disabled = false, size = 'md' }: RatingStarsProps) {
  const [hoverValue, setHoverValue] = useState(0);
  
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverValue(0);
    }
  };

  return (
    <div className="flex space-x-1">
      {Array.from({ length: GAME_CONFIG.RATING_SCALE.MAX }, (_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= (hoverValue || value);
        
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            className={`${sizes[size]} transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded ${
              disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
            }`}
          >
            <svg
              fill={isActive ? '#f59e0b' : '#d1d5db'}
              viewBox="0 0 24 24"
              className="w-full h-full transition-colors"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}