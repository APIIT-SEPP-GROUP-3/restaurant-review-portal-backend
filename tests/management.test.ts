import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { actor, password, prisma, reviewFixture, restaurant } from "./support/fixtures.js";
import { ROLES } from "../src/constants/roles.js";

describe("separated role responsibilities", () => {
  test("admin cannot moderate, comment, or manage menus and images", async () => {
    const f = await reviewFixture("APPROVED");
    const admin = await actor(ROLES.ADMIN);
    const auth = { type: "bearer" as const };
    await request(app).get("/api/moderation/reviews").auth(admin.token, auth).expect(403);
    await request(app).patch(`/api/moderation/reviews/${f.review.id}/approve`).auth(admin.token, auth).expect(403);
    await request(app).post(`/api/reviews/${f.review.id}/comments`).auth(admin.token, auth).send({ commentText: "Admin comment" }).expect(403);
    await request(app).put(`/api/menu-items/${f.item.id}`).auth(admin.token, auth).send({ price: 1 }).expect(403);
    await request(app).post(`/api/restaurants/${f.place.id}/menu-categories`).auth(admin.token, auth).send({ name: "Category" }).expect(403);
    await request(app).post(`/api/restaurants/${f.place.id}/images/presign`).auth(admin.token, auth).send({}).expect(403);
  });
  test("admin can create/edit users, change roles, and deactivate existing tokens", async () => {
    const admin = await actor(ROLES.ADMIN);
    const moderator = await actor(ROLES.MODERATOR);
    const customer = await actor(ROLES.CUSTOMER);
    const created = await request(app).post("/api/admin/users").auth(admin.token, { type: "bearer" }).send({ firstName: "New", lastName: "User", email: "new@example.test", password, role: ROLES.MODERATOR }).expect(201);
    expect(created.body.data).not.toHaveProperty("passwordHash");
    await request(app).patch(`/api/admin/users/${customer.id}`).auth(admin.token, { type: "bearer" }).send({ role: ROLES.MODERATOR, firstName: "Changed" }).expect(200);
    // Original CUSTOMER token now has current MODERATOR permissions.
    await request(app).get("/api/moderation/reviews").auth(customer.token, { type: "bearer" }).expect(200);
    await request(app).post("/api/reviews").auth(customer.token, { type: "bearer" }).send({}).expect(403);
    await request(app).patch(`/api/admin/users/${moderator.id}`).auth(admin.token, { type: "bearer" }).send({ isActive: false }).expect(200);
    await request(app).get("/api/moderation/reviews").auth(moderator.token, { type: "bearer" }).expect(401);
    await request(app).get("/api/admin/users").auth(customer.token, { type: "bearer" }).expect(403);
  });
  test("only admin assigns owners and changes restaurant status", async () => {
    const admin = await actor(ROLES.ADMIN);
    const owner = await actor(ROLES.RESTAURANT_OWNER);
    const other = await actor(ROLES.RESTAURANT_OWNER, "other");
    const customer = await actor(ROLES.CUSTOMER);
    const place = await restaurant(owner.id);
    const path = `/api/admin/restaurants/${place.id}`;
    await request(app).patch(`${path}/owner`).auth(admin.token, { type: "bearer" }).send({ ownerId: customer.id }).expect(400);
    await request(app).patch(`${path}/owner`).auth(admin.token, { type: "bearer" }).send({ ownerId: other.id }).expect(200);
    await request(app).put(`/api/restaurants/${place.id}`).auth(owner.token, { type: "bearer" }).send({ name: "Old owner edit" }).expect(403);
    await request(app).put(`/api/restaurants/${place.id}`).auth(other.token, { type: "bearer" }).send({ status: "INACTIVE" }).expect(400);
    await request(app).patch(`${path}/status`).auth(other.token, { type: "bearer" }).send({ status: "INACTIVE" }).expect(403);
    await request(app).patch(`${path}/status`).auth(admin.token, { type: "bearer" }).send({ status: "INACTIVE" }).expect(200);
    await request(app).get(`/api/restaurants/${place.id}`).expect(404);
    const mine = await request(app).get("/api/me/restaurants").auth(other.token, { type: "bearer" }).expect(200);
    expect(mine.body.data[0]).toMatchObject({ id: place.id, status: "INACTIVE" });
  });
  test("customers see only their own reviews including pending/rejected status", async () => {
    const f = await reviewFixture("REJECTED");
    const other = await actor(ROLES.CUSTOMER, "other");
    const mine = await request(app).get("/api/me/reviews").auth(f.customer.token, { type: "bearer" }).expect(200);
    expect(mine.body.data[0]).toMatchObject({ id: f.review.id, moderationStatus: "REJECTED" });
    const theirs = await request(app).get("/api/me/reviews").auth(other.token, { type: "bearer" }).expect(200);
    expect(theirs.body.data).toEqual([]);
    await request(app).get(`/api/reviews/${f.review.id}`).expect(404);
  });
  test("owners delete only their own empty categories/items; preserve review history", async () => {
    const f = await reviewFixture();
    const other = await actor(ROLES.RESTAURANT_OWNER, "other");
    await request(app).delete(`/api/menu-items/${f.item.id}`).auth(other.token, { type: "bearer" }).expect(403);
    await request(app).delete(`/api/menu-items/${f.item.id}`).auth(f.owner.token, { type: "bearer" }).expect(409);
    const category = await prisma.menuCategory.create({ data: { restaurantId: f.place.id, name: "Empty" } });
    const item = await prisma.menuItem.create({ data: { restaurantId: f.place.id, menuCategoryId: category.id, name: "New meal", price: 100 } });
    await request(app).delete(`/api/menu-categories/${category.id}`).auth(f.owner.token, { type: "bearer" }).expect(409);
    await request(app).delete(`/api/menu-items/${item.id}`).auth(f.owner.token, { type: "bearer" }).expect(200);
    await request(app).delete(`/api/menu-categories/${category.id}`).auth(f.owner.token, { type: "bearer" }).expect(200);
  });
});
