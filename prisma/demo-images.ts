// Pexels photo IDs refer to the matching named photos at https://www.pexels.com/photo/<id>/.
// Original source links and Wikimedia credits are recorded in demo-image-credits.md.
const pexels = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=960`;

export const dishImages: Record<string, string> = {
  "Chicken Kottu": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Chicken_Kottu.jpg",
  "Rice and Curry": "https://upload.wikimedia.org/wikipedia/commons/8/86/SL-rice_and_curry.jpg",
  "Coconut Roti": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Coconut_Roti.jpg",
  "Margherita Pizza": pexels(14590497),
  "Creamy Mushroom Pasta": pexels(36863869),
  "Bruschetta": pexels(36370196),
  "Grilled Fish": pexels(17010948),
  "Garlic Prawns": pexels(699544),
  "Seafood Fried Rice": pexels(36998847),
  "Vegetable Buddha Bowl": pexels(3297367),
  "Chickpea Curry": pexels(7364662),
  "Avocado Toast": pexels(1656685),
  "Breakfast Sandwich": pexels(39949753),
  "Chocolate Cake": pexels(1028711),
  "Strawberry Waffles": pexels(5711392),
  "Grilled Chicken": pexels(5695611),
  "Garden Salad": pexels(3298060),
  "Club Sandwich": pexels(19202829),
  "Fresh Lime Juice": pexels(36860546),
  "Ceylon Tea": pexels(31959376),
};

export const diningImages = [
  pexels(28299287), pexels(12519440), pexels(28299287),
  pexels(34141722), pexels(5461641), pexels(5373256),
];

export function dishImage(name: string): string {
  const url = dishImages[name];
  if (!url) throw new Error(`No demo photo configured for ${name}`);
  return url;
}
