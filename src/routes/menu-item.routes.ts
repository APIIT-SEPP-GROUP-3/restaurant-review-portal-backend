import { Router } from "express";
import { getMenuItemById } from "../controllers/menu-item.controller.js";

const router = Router();

router.get("/:id", getMenuItemById);

export default router;