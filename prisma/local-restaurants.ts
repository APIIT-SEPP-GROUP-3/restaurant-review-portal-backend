type Dish = { name: string; description: string; price: number; image: string; category: string; previousName?: string; isAvailable?: boolean };
const dish = (name: string, description: string, price: number, image: string, category = "Main Dishes", previousName?: string): Dish => ({ name, description, price, image, category, previousName });
const breakfast = [
  dish("Kiribath with Lunu Miris", "Coconut milk rice with a spicy onion and chilli sambol.", 450, "Kiribath", "Breakfast"),
  dish("String Hoppers with Kiri Hodi", "Ten steamed string hoppers with coconut milk gravy and pol sambol.", 650, "String Hoppers", "Breakfast"),
  dish("Pol Roti with Sambol", "Two coconut rotis served with freshly ground pol sambol.", 400, "Coconut Roti", "Breakfast"),
];
const desserts = [dish("Watalappan", "Steamed kithul jaggery and coconut custard with cardamom and cashews.", 450, "Watalappan", "Desserts")];
const drinks = [
  dish("Fresh Lime Juice", "Fresh lime squeezed to order; ask for less sugar or no sugar.", 300, "Fresh Lime Juice", "Drinks"),
  dish("Ceylon Tea", "A freshly brewed pot of black tea, with milk served separately on request.", 200, "Ceylon Tea", "Drinks"),
];

// Fictional local venues and illustrative menus; prices are sample LKR amounts.
export const localRestaurants = [
  { name: "Cinnamon Gedara", previousName: "Demo Cinnamon Kitchen", city: "Colombo", address: "42 Galle Road, Bambalapitiya", cuisine: "Sri Lankan", categories: ["Sri Lankan", "Rice & Curry", "Street Food"], description: "A neighbourhood kitchen serving home-style rice and curry, evening kottu and traditional breakfast favourites.", dishes: [
    dish("Chicken Kottu", "Chopped godamba roti tossed with chicken curry, egg, leeks and vegetables.", 1100, "Chicken Kottu", "Main Dishes", "Chicken Kottu"),
    dish("Chicken Rice and Curry", "Red rice, chicken curry, parippu, seasonal vegetables, mallung and papadam.", 850, "Rice and Curry", "Main Dishes", "Rice and Curry"),
    dish("Pol Roti with Chicken Curry", "Coconut roti with a side of chicken curry and spicy sambol.", 700, "Coconut Roti", "Main Dishes", "Coconut Roti"),
    ...breakfast, ...desserts, ...drinks,
  ] },
  { name: "Kandyan Bath Kade", previousName: "Demo Bella Napoli", city: "Kandy", address: "18 Peradeniya Road", cuisine: "Sri Lankan", categories: ["Sri Lankan", "Rice & Curry", "Traditional Breakfast"], description: "A welcoming bath kade with generous lunch plates, coconut-rich curries and freshly prepared morning meals.", dishes: [
    dish("Red Rice and Chicken Curry", "Red rice with chicken curry, beans, parippu, greens and papadam.", 800, "Rice and Curry", "Main Dishes", "Margherita Pizza"),
    dish("Village Rice and Curry", "A home-style rice plate with chicken, seasonal curries and fresh sambol.", 750, "Rice and Curry", "Main Dishes", "Creamy Mushroom Pasta"),
    dish("Kadala Curry with Pol Roti", "Slow-cooked chickpeas with coconut roti and onion sambol.", 650, "Chickpea Curry", "Main Dishes", "Bruschetta"),
    ...breakfast, ...desserts, ...drinks,
  ] },
  { name: "Galle Muhudu Rasa", previousName: "Demo Ocean Table", city: "Galle", address: "27 Matara Road, Magalle", cuisine: "Seafood", categories: ["Sri Lankan", "Seafood"], description: "A coastal dining spot specialising in grilled fish, prawns and seafood rice with bright lime and chilli flavours.", dishes: [
    dish("Grilled Fish with Lime", "Grilled fish with lime, fresh herbs and a side salad.", 2200, "Grilled Fish", "Main Dishes", "Grilled Fish"),
    dish("Garlic Butter Prawns", "Prawns cooked with garlic butter and a gentle chilli kick.", 2400, "Garlic Prawns", "Main Dishes", "Garlic Prawns"),
    dish("Seafood Fried Rice", "Wok-fried rice with prawns, seafood, egg and vegetables.", 1600, "Seafood Fried Rice", "Main Dishes", "Seafood Fried Rice"),
    ...breakfast, ...desserts, ...drinks,
  ] },
  { name: "Yaal Pachchai Kitchen", previousName: "Demo Green Garden", city: "Jaffna", address: "36 Kankesanthurai Road", cuisine: "Vegetarian", categories: ["Sri Lankan", "Vegetarian", "Traditional Breakfast"], description: "A vegetarian kitchen offering chickpea curry, coconut-based breakfasts and colourful bowls of seasonal produce.", dishes: [
    dish("Seasonal Vegetable Bowl", "A colourful bowl of fresh vegetables, tofu and a light dressing.", 950, "Vegetable Buddha Bowl", "Main Dishes", "Vegetable Buddha Bowl"),
    dish("Kadala Curry with Roti", "Tender chickpeas simmered in a spiced gravy, served with roti.", 650, "Chickpea Curry", "Main Dishes", "Chickpea Curry"),
    dish("Avocado Toast", "Toasted bread topped with mashed avocado, lime and herbs.", 750, "Avocado Toast", "Main Dishes", "Avocado Toast"),
    ...breakfast, ...drinks,
  ] },
  { name: "Udarata Tea Room", previousName: "Demo Hill Country Cafe", city: "Nuwara Eliya", address: "12 Haddon Hill Road", cuisine: "Cafe", categories: ["Cafe", "Traditional Breakfast"], description: "A cosy hill-country tea room serving hot Ceylon tea, local breakfast sets, sandwiches and sweet treats.", dishes: [
    dish("Egg Breakfast Sandwich", "A warm sandwich filled with eggs and a light seasoning.", 650, "Breakfast Sandwich", "Main Dishes", "Breakfast Sandwich"),
    dish("Chocolate Cake", "A slice of rich chocolate layer cake to enjoy with afternoon tea.", 550, "Chocolate Cake", "Desserts", "Chocolate Cake"),
    dish("Strawberry Waffles", "Fresh waffles topped with strawberries and a drizzle of syrup.", 950, "Strawberry Waffles", "Desserts", "Strawberry Waffles"),
    ...breakfast, ...desserts, ...drinks,
  ] },
  { name: "Negombo Wel Thera", previousName: "Demo Sunset Bistro", city: "Negombo", address: "58 Lewis Place, Kudapaduwa", cuisine: "Cafe", categories: ["Sri Lankan", "Cafe", "Seafood"], description: "A relaxed seaside bistro with grilled chicken, light meals and traditional Sri Lankan breakfast plates.", dishes: [
    dish("Grilled Chicken with Herbs", "Grilled chicken served with herbs, vegetables and a wedge of lime.", 1450, "Grilled Chicken", "Main Dishes", "Grilled Chicken"),
    dish("Garden Salad", "Fresh leafy greens and crunchy seasonal vegetables with a light dressing.", 600, "Garden Salad", "Main Dishes", "Garden Salad"),
    { ...dish("Club Sandwich", "A toasted layered sandwich with chicken, salad and a creamy dressing.", 950, "Club Sandwich", "Main Dishes", "Club Sandwich"), isAvailable: false },
    ...breakfast, ...desserts, ...drinks,
  ] },
];
