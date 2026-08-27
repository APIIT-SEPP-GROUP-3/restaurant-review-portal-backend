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
import { createMenuItem } from "../controllers/menu-item.controller.js";

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

export default router;
