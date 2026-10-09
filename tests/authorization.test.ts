import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { actor, prisma, restaurant } from "./support/fixtures.js";
import { ROLES } from "../src/constants/roles.js";

describe("role authorization and ownership", () => {
  test("customer cannot access owner, moderator, or admin endpoints", async () => {
    const customer = await actor(ROLES.CUSTOMER);
    await request(app).post("/api/restaurants").auth(customer.token, { type: "bearer" }).send({ name: "Test", address: "123 Road", city: "Colombo" }).expect(403);
    await request(app).get("/api/moderation/reviews").auth(customer.token, { type: "bearer" }).expect(403);
    await request(app).post("/api/restaurant-categories").auth(customer.token, { type: "bearer" }).send({ name: "Cafe" }).expect(403);
    expect(await prisma.restaurant.count()).toBe(0);
    expect(await prisma.restaurantCategory.count()).toBe(0);
  });
  test("admin creates a restaurant assigned to an owner; owner can edit it", async () => {
    const owner = await actor(ROLES.RESTAURANT_OWNER);
    const admin = await actor(ROLES.ADMIN);
    await request(app).post("/api/restaurants").auth(owner.token, { type: "bearer" }).send({}).expect(403);
    const created = await request(app).post("/api/restaurants").auth(admin.token, { type: "bearer" }).send({ ownerId: owner.id, name: "Test Place", address: "123 Road", city: "Colombo" }).expect(201);
    expect(created.body.data.ownerId).toBe(owner.id);
    await request(app).put(`/api/restaurants/${created.body.data.id}`).auth(owner.token, { type: "bearer" }).send({ name: "Updated Place" }).expect(200);
    expect((await prisma.restaurant.findUniqueOrThrow({ where: { id: created.body.data.id } })).name).toBe("Updated Place");
  });
  test("owner cannot update another owner's restaurant", async () => {
    const owner = await actor(ROLES.RESTAURANT_OWNER);
    const other = await actor(ROLES.RESTAURANT_OWNER, "other");
    const place = await restaurant(other.id);
    await request(app).put(`/api/restaurants/${place.id}`).auth(owner.token, { type: "bearer" }).send({ name: "Unauthorized change" }).expect(403);
    expect(await prisma.restaurant.findUniqueOrThrow({ where: { id: place.id } })).toEqual(place);
  });
  test.each([ROLES.MODERATOR])("%s can access moderation endpoints", async (role) => {
    const moderator = await actor(role);
    for (const resource of ["reviews", "comments"]) {
      const response = await request(app).get(`/api/moderation/${resource}`).auth(moderator.token, { type: "bearer" }).expect(200);
      expect(response.body.data).toEqual([]);
    }
  });
});
