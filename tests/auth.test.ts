import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { actor, password, prisma } from "./support/fixtures.js";
import { ROLES } from "../src/constants/roles.js";
import { comparePassword } from "../src/utils/password.js";

const registration = { firstName: "Test", lastName: "Customer", email: "new@example.test", password };

describe("health and authentication", () => {
  test("health endpoint", async () => {
    const response = await request(app).get("/api/health").expect(200);
    expect(response.body).toEqual({ success: true, message: "Restaurant Review Portal API is running" });
  });
  test("registers a customer with a hashed password and rejects duplicate email", async () => {
    await prisma.role.create({ data: { roleName: ROLES.CUSTOMER } });
    const response = await request(app).post("/api/auth/register").send(registration).expect(201);
    expect(response.body.data).toMatchObject({ email: registration.email, role: ROLES.CUSTOMER });
    expect(response.body.data).not.toHaveProperty("passwordHash");
    const stored = await prisma.user.findUniqueOrThrow({ where: { email: registration.email } });
    expect(stored.passwordHash).not.toBe(password);
    expect(await comparePassword(password, stored.passwordHash)).toBe(true);
    await request(app).post("/api/auth/register").send({ ...registration, email: registration.email.toUpperCase() }).expect(409);
    expect(await prisma.user.count()).toBe(1);
  });
  test("logs in and uses the returned token for /me", async () => {
    const customer = await actor(ROLES.CUSTOMER);
    const login = await request(app).post("/api/auth/login").send({ email: customer.email, password }).expect(200);
    expect(login.body.data.token).toEqual(expect.any(String));
    expect(login.body.data.user).not.toHaveProperty("passwordHash");
    const me = await request(app).get("/api/auth/me").auth(login.body.data.token, { type: "bearer" }).expect(200);
    expect(me.body.data).toMatchObject({ id: customer.id, email: customer.email, role: ROLES.CUSTOMER });
  });
  test.each(["wrong password", "unknown email"])("rejects invalid login: %s", async (scenario) => {
    const customer = await actor(ROLES.CUSTOMER);
    const response = await request(app).post("/api/auth/login").send({
      email: scenario === "unknown email" ? "missing@example.test" : customer.email,
      password: scenario === "wrong password" ? "incorrect" : password,
    }).expect(401);
    expect(response.body).toMatchObject({ success: false, message: "Invalid email or password" });
  });
  test.each([undefined, "invalid-token"])("rejects missing or invalid token (%s)", async (token) => {
    const call = request(app).get("/api/auth/me");
    if (token) call.auth(token, { type: "bearer" });
    await call.expect(401);
  });
});
