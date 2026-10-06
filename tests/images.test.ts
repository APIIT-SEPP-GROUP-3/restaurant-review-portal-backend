import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { actor, prisma, reviewFixture } from "./support/fixtures.js";
import { r2 } from "./support/setup.js";
import { ROLES } from "../src/constants/roles.js";

describe.each(["restaurant", "menu item"])("%s image validation and authorization", (resource) => {
  async function fixture() {
    const f = await reviewFixture();
    const isRestaurant = resource === "restaurant";
    const id = isRestaurant ? f.place.id : f.item.id;
    const directory = isRestaurant ? "restaurants" : "menu-items";
    return { ...f, id, directory, path: `/api/${directory}/${id}/images`, key: `${directory}/${id}/photo.webp` };
  }
  test("rejects an object key for another resource before calling R2", async () => {
    const f = await fixture();
    const response = await request(app).post(f.path).auth(f.owner.token, { type: "bearer" }).send({ objectKey: `${f.directory}/${f.id + 1}/photo.webp` }).expect(400);
    expect(response.body.message).toBe("Invalid image object key");
    expect(r2.r2ObjectExists).not.toHaveBeenCalled();
    expect(await prisma.restaurantImage.count()).toBe(0);
    expect(await prisma.menuItemImage.count()).toBe(0);
  });
  test("validates upload content type before signing", async () => {
    const f = await fixture();
    await request(app).post(`${f.path}/presign`).auth(f.owner.token, { type: "bearer" }).send({ fileName: "script.html", contentType: "text/html" }).expect(400);
    expect(r2.generatePresignedUploadUrl).not.toHaveBeenCalled();
  });
  test("owner can presign and save metadata using mocked storage", async () => {
    const f = await fixture();
    await request(app).post(`${f.path}/presign`).auth(f.owner.token, { type: "bearer" }).send({ fileName: "photo.webp", contentType: "image/webp" }).expect(200);
    expect(r2.generatePresignedUploadUrl).toHaveBeenCalledWith({ directory: `${f.directory}/${f.id}`, fileName: "photo.webp", contentType: "image/webp" });
    const saved = await request(app).post(f.path).auth(f.owner.token, { type: "bearer" }).send({ objectKey: f.key, altText: "Test photo", isPrimary: true }).expect(201);
    expect(saved.body.data).toMatchObject({ objectKey: f.key, imageUrl: `https://images.example.test/${f.key}`, isPrimary: true });
    expect(r2.r2ObjectExists).toHaveBeenCalledWith(f.key);
    const stored = resource === "restaurant"
      ? await prisma.restaurantImage.findUniqueOrThrow({ where: { id: saved.body.data.id } })
      : await prisma.menuItemImage.findUniqueOrThrow({ where: { id: saved.body.data.id } });
    expect(stored.objectKey).toBe(f.key);
  });
  test("rejects missing uploaded object without saving metadata", async () => {
    const f = await fixture();
    r2.r2ObjectExists.mockResolvedValue(false);
    await request(app).post(f.path).auth(f.owner.token, { type: "bearer" }).send({ objectKey: f.key }).expect(400);
    expect(await prisma.restaurantImage.count()).toBe(0);
    expect(await prisma.menuItemImage.count()).toBe(0);
  });
  test("another owner cannot presign, save, or delete images", async () => {
    const f = await fixture();
    const other = await actor(ROLES.RESTAURANT_OWNER, "other");
    const image = resource === "restaurant"
      ? await prisma.restaurantImage.create({ data: { restaurantId: f.id, objectKey: f.key, imageUrl: `https://images.example.test/${f.key}` } })
      : await prisma.menuItemImage.create({ data: { menuItemId: f.id, objectKey: f.key, imageUrl: `https://images.example.test/${f.key}` } });
    await request(app).post(`${f.path}/presign`).auth(other.token, { type: "bearer" }).send({ fileName: "photo.webp", contentType: "image/webp" }).expect(403);
    await request(app).post(f.path).auth(other.token, { type: "bearer" }).send({ objectKey: f.key }).expect(403);
    await request(app).delete(`${f.path}/${image.id}`).auth(other.token, { type: "bearer" }).expect(403);
    expect(r2.generatePresignedUploadUrl).not.toHaveBeenCalled();
    expect(r2.r2ObjectExists).not.toHaveBeenCalled();
    expect(r2.deleteR2Object).not.toHaveBeenCalled();
    const stored = resource === "restaurant"
      ? await prisma.restaurantImage.findUniqueOrThrow({ where: { id: image.id } })
      : await prisma.menuItemImage.findUniqueOrThrow({ where: { id: image.id } });
    expect(stored).toEqual(image);
  });
});
