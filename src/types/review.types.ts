export interface RatingInput {
  ratingTypeId: number;
  ratingValue: number;
}

export interface CreateReviewInput {
  restaurantId: number;
  menuItemId?: number;
  title?: string;
  reviewText: string;
  ratings: RatingInput[];
}
