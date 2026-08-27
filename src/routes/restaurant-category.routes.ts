import { Router } from "express";
import {
  addRestaurantCategory,
  getRestaurantCategories,
} from "../controllers/restaurant-category.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

router.get("/", getRestaurantCategories);
router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  addRestaurantCategory
);

export default router;