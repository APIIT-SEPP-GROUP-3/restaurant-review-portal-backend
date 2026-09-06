import { Router } from "express";
import { updateMenuCategory } from "../controllers/menu-category.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.put(
  "/:id",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  updateMenuCategory
);

export default router;
