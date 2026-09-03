import { Router } from "express";
import {
  createRestaurant,
  getRestaurantById,
  updateRestaurant,
  getRestaurants
} from "../controllers/restaurant.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import { updateRestaurantCategories } from "../controllers/restaurant-category.controller.js";
import {
  createMenuCategory,
  getMenuCategoriesByRestaurant,
} from "../controllers/menu-category.controller.js";
import {
  createMenuItem,
  getMenuItemsByRestaurant,
} from "../controllers/menu-item.controller.js";
import {
  createRestaurantImage,
  deleteRestaurantImage,
} from "../controllers/restaurant-image.controller.js";
import { getRestaurantReviews } from "../controllers/review.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  createRestaurant,
);
router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);
router.put(
  "/:id",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  updateRestaurant,
);
router.put(
  "/:restaurantId/categories",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  updateRestaurantCategories,
);
router.post(
  "/:restaurantId/menu-categories",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  createMenuCategory,
);
router.get("/:restaurantId/menu-categories", getMenuCategoriesByRestaurant);
router.post(
  "/:restaurantId/menu-items",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  createMenuItem,
);
router.get("/:restaurantId/menu-items", getMenuItemsByRestaurant);
router.post(
  "/:restaurantId/images",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  createRestaurantImage,
);
router.delete(
  "/:restaurantId/images/:imageId",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  deleteRestaurantImage
);
router.get(
  "/:restaurantId/reviews",
  getRestaurantReviews
);

export default router;
