import React from 'react';
import { Star } from 'lucide-react';

export const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      size={16}
      className={index < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
    />
  ));
};