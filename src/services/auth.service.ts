import prisma from "../config/prisma.js";
import { generateToken } from "../utils/jwt.js";
import { comparePassword, hashPassword } from "../utils/password.js";


interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const customerRole = await prisma.role.findUnique({
    where: {
      roleName: "CUSTOMER",
    },
  });

  if (!customerRole) {
    throw new Error("CUSTOMER_ROLE_NOT_FOUND");
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      passwordHash,
      roleId: customerRole.id,
    },
    include: {
      role: true,
    },
  });

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role.roleName,
  };
};

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email.toLowerCase(),
    },
    include: {
      role: true,
    },
  });

  if (!user || !user.isActive) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordMatches = await comparePassword(
    data.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = generateToken({
    userId: user.id,
    role: user.role.roleName,
  });

  return {
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role.roleName,
    },
  };
};