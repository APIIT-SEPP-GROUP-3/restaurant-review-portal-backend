import { Router } from "express";
import { createRestaurant } from "../controllers/restaurant.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("RESTAURANT_OWNER", "ADMIN"),
  createRestaurant
);

export default router;