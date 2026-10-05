import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { actor, prisma, reviewFixture } from "./support/fixtures.js";
import { ROLES } from "../src/constants/roles.js";

describe("review moderation", () => {
  test.each([ROLES.MODERATOR, ROLES.ADMIN])("%s approves and cannot moderate again", async (role) => {
    const f = await reviewFixture();
    const moderator = await actor(role);
    const path = `/api/moderation/reviews/${f.review.id}`;
    await request(app).patch(`${path}/approve`).auth(moderator.token, { type: "bearer" }).expect(200);
    const stored = await prisma.review.findUniqueOrThrow({ where: { id: f.review.id } });
    expect(stored).toMatchObject({ moderationStatus: "APPROVED", moderatedBy: moderator.id, rejectionReason: null, moderatedAt: expect.any(Date) });
    await request(app).patch(`${path}/approve`).auth(moderator.token, { type: "bearer" }).expect(400);
    await request(app).patch(`${path}/reject`).auth(moderator.token, { type: "bearer" }).send({ rejectionReason: "Cannot change decision" }).expect(400);
    expect(await prisma.review.findUniqueOrThrow({ where: { id: f.review.id } })).toEqual(stored);
  });
  test.each([ROLES.MODERATOR, ROLES.ADMIN])("%s rejects with reason and cannot moderate again", async (role) => {
    const f = await reviewFixture();
    const moderator = await actor(role);
    const path = `/api/moderation/reviews/${f.review.id}`;
    await request(app).patch(`${path}/reject`).auth(moderator.token, { type: "bearer" }).send({ rejectionReason: "  Inappropriate content  " }).expect(200);
    const stored = await prisma.review.findUniqueOrThrow({ where: { id: f.review.id } });
    expect(stored).toMatchObject({ moderationStatus: "REJECTED", rejectionReason: "Inappropriate content", moderatedBy: moderator.id, moderatedAt: expect.any(Date) });
    await request(app).patch(`${path}/approve`).auth(moderator.token, { type: "bearer" }).expect(400);
    await request(app).patch(`${path}/reject`).auth(moderator.token, { type: "bearer" }).send({ rejectionReason: "Another reason" }).expect(400);
    expect(await prisma.review.findUniqueOrThrow({ where: { id: f.review.id } })).toEqual(stored);
  });
  test("rejecting without a valid reason leaves the review pending", async () => {
    const f = await reviewFixture();
    const moderator = await actor(ROLES.MODERATOR);
    await request(app).patch(`/api/moderation/reviews/${f.review.id}/reject`).auth(moderator.token, { type: "bearer" }).send({}).expect(400);
    expect((await prisma.review.findUniqueOrThrow({ where: { id: f.review.id } })).moderationStatus).toBe("PENDING");
  });
});
