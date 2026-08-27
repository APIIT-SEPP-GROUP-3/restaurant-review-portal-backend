import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import restaurantRoutes from "./routes/restaurant.routes.js";
import restaurantCategoryRoutes from "./routes/restaurant-category.routes.js";
import menuCategoryRoutes from "./routes/menu-category.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Restaurant Review Portal API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use(
  "/api/restaurant-categories",
  restaurantCategoryRoutes
);
app.use("/api/menu-categories", menuCategoryRoutes);
export default app;