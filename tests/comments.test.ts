import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { actor, prisma, reviewFixture } from "./support/fixtures.js";
import { ROLES } from "../src/constants/roles.js";

describe("comments and owner responses", () => {
  test("customer and restaurant owner comments start pending; another owner is forbidden", async () => {
    const f = await reviewFixture("APPROVED");
    const other = await actor(ROLES.RESTAURANT_OWNER, "other");
    for (const user of [f.customer, f.owner]) {
      const response = await request(app).post(`/api/reviews/${f.review.id}/comments`).auth(user.token, { type: "bearer" }).send({ commentText: "Thank you for the review" }).expect(201);
      expect(response.body.data).toMatchObject({ moderationStatus: "PENDING", userId: user.id });
      expect((await prisma.reviewComment.findUniqueOrThrow({ where: { id: response.body.data.id } })).moderationStatus).toBe("PENDING");
    }
    await request(app).post(`/api/reviews/${f.review.id}/comments`).auth(other.token, { type: "bearer" }).send({ commentText: "Unauthorized response" }).expect(403);
    expect(await prisma.reviewComment.count()).toBe(2);
  });
  test("customer cannot comment on a pending review", async () => {
    const f = await reviewFixture();
    await request(app).post(`/api/reviews/${f.review.id}/comments`).auth(f.customer.token, { type: "bearer" }).send({ commentText: "A comment" }).expect(400);
    expect(await prisma.reviewComment.count()).toBe(0);
  });
  test("public comments include only approved roots and approved replies", async () => {
    const f = await reviewFixture("APPROVED");
    const root = await prisma.reviewComment.create({ data: { reviewId: f.review.id, userId: f.customer.id, commentText: "Visible root", moderationStatus: "APPROVED" } });
    let visibleReplyId = 0;
    for (const status of ["PENDING", "REJECTED", "APPROVED"] as const) {
      if (status !== "APPROVED") await prisma.reviewComment.create({ data: { reviewId: f.review.id, userId: f.customer.id, commentText: "Hidden root", moderationStatus: status } });
      const reply = await prisma.reviewComment.create({ data: { reviewId: f.review.id, userId: f.owner.id, parentCommentId: root.id, commentText: "Owner reply", moderationStatus: status } });
      if (status === "APPROVED") visibleReplyId = reply.id;
    }
    const response = await request(app).get(`/api/reviews/${f.review.id}/comments`).expect(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe(root.id);
    expect(response.body.data[0].replies.map((reply: { id: number }) => reply.id)).toEqual([visibleReplyId]);
  });
});
