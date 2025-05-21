import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  size?: number;
  className?: string;
  showText?: boolean;
  reviewCount?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalStars = 5,
  size = 16,
  className,
  showText = false,
  reviewCount,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} fill="currentColor" strokeWidth={0} className="text-yellow-400" style={{ width: size, height: size }} />
      ))}
      {hasHalfStar && (
        <StarHalf key="half" fill="currentColor" strokeWidth={0} className="text-yellow-400" style={{ width: size, height: size }} />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} fill="currentColor" strokeWidth={0} className="text-gray-300" style={{ width: size, height: size }} />
      ))}
      {showText && <span className="ml-2 text-sm text-muted-foreground">{rating.toFixed(1)} {reviewCount ? `(${reviewCount} reviews)` : ''}</span>}
    </div>
  );
};

export default StarRating;
