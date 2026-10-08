import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { prisma, reviewFixture } from "./support/fixtures.js";

describe("reviews", () => {
  test("customer submits a valid review which starts PENDING", async () => {
    const f = await reviewFixture();
    const response = await request(app).post("/api/reviews").auth(f.customer.token, { type: "bearer" }).send({
      restaurantId: f.place.id, reviewText: "Excellent food", ratings: [{ ratingTypeId: f.rating.id, ratingValue: 5 }],
    }).expect(201);
    expect(response.body.data).toMatchObject({ userId: f.customer.id, moderationStatus: "PENDING", ratings: [expect.objectContaining({ ratingValue: 5 })] });
    const stored = await prisma.review.findUniqueOrThrow({ where: { id: response.body.data.id } });
    expect(stored.moderationStatus).toBe("PENDING");
    expect(Number(stored.overallRating)).toBe(5);
  });
  test.each([0, 6])("rejects rating %i without inserting a review", async (ratingValue) => {
    const f = await reviewFixture();
    await request(app).post("/api/reviews").auth(f.customer.token, { type: "bearer" }).send({
      restaurantId: f.place.id, reviewText: "Excellent food", ratings: [{ ratingTypeId: f.rating.id, ratingValue }],
    }).expect(400);
    expect(await prisma.review.count()).toBe(1);
    expect(await prisma.reviewRating.count()).toBe(1);
  });
  test("public restaurant/menu lists and review detail expose only approved reviews", async () => {
    const f = await reviewFixture("APPROVED");
    for (const status of ["PENDING", "REJECTED"] as const) {
      const hidden = await prisma.review.create({ data: { userId: f.customer.id, restaurantId: f.place.id, menuItemId: f.item.id, reviewText: "Hidden review", moderationStatus: status } });
      await request(app).get(`/api/reviews/${hidden.id}`).expect(404);
    }
    for (const path of [`/api/restaurants/${f.place.id}/reviews`, `/api/menu-items/${f.item.id}/reviews`]) {
      const response = await request(app).get(path).expect(200);
      expect(response.body.data.map((review: { id: number }) => review.id)).toEqual([f.review.id]);
    }
    const detail = await request(app).get(`/api/reviews/${f.review.id}`).expect(200);
    expect(detail.body.data.moderationStatus).toBe("APPROVED");
  });
});
