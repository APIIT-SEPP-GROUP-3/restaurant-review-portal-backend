import { Router } from "express";
import { getRatingTypes } from "../controllers/rating-type.controller.js";

const router = Router();

router.get("/", getRatingTypes);

export default router;