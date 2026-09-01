import { Router } from "express";
import {
  createRestaurant,
  getRestaurantById,
  updateRestaurant,
} from "../controllers/restaurant.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { updateRestaurantCategories } from "../controllers/restaurant-category.controller.js";
import { createMenuCategory,getMenuCategoriesByRestaurant } from "../controllers/menu-category.controller.js";
import { createMenuItem ,getMenuItemsByRestaurant} from "../controllers/menu-item.controller.js";
import { createRestaurantImage } from "../controllers/restaurant-image.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("RESTAURANT_OWNER", "ADMIN"),
  createRestaurant,
);
router.get("/:id", getRestaurantById);
router.put(
  "/:id",
  authenticate,
  authorizeRoles("RESTAURANT_OWNER", "ADMIN"),
  updateRestaurant
);
router.put(
  "/:restaurantId/categories",
  authenticate,
  authorizeRoles("RESTAURANT_OWNER", "ADMIN"),
  updateRestaurantCategories
);
router.post(
  "/:restaurantId/menu-categories",
  authenticate,
  authorizeRoles("RESTAURANT_OWNER", "ADMIN"),
  createMenuCategory
);
router.get(
  "/:restaurantId/menu-categories",
  getMenuCategoriesByRestaurant
);
router.post(
  "/:restaurantId/menu-items",
  authenticate,
  authorizeRoles("RESTAURANT_OWNER", "ADMIN"),
  createMenuItem
);
router.get(
  "/:restaurantId/menu-items",
  getMenuItemsByRestaurant
);
router.post(
  "/:restaurantId/images",
  authenticate,
  authorizeRoles("RESTAURANT_OWNER", "ADMIN"),
  createRestaurantImage
);

export default router;
