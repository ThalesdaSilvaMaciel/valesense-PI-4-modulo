import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import type { User, UserRole, UserStatus } from "./auth.types.js";

export type CreateUserInput = {
  name: string;
  email: string;
  document?: string;
  password: string;
  role: UserRole;
};

export interface UserRepository {
  list(): Promise<User[]>;
  findByEmail(email: string): Promise<User | null>;
  findByDocument(document: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  updatePassword(id: string, password: string): Promise<User | null>;
  updateProfile(id: string, input: Pick<CreateUserInput, "name" | "document">): Promise<User | null>;
  updateRole(id: string, role: UserRole): Promise<User | null>;
  updateStatus(id: string, status: UserStatus): Promise<User | null>;
}

class InMemoryUserRepository implements UserRepository {
  private readonly users: User[] = [];

  async list() {
    return [...this.users];
  }

  async findByEmail(email: string) {
    return this.users.find((user) => user.email === email.toLowerCase()) ?? null;
  }

  async findByDocument(document: string) {
    return this.users.find((user) => user.document === document) ?? null;
  }

  async findById(id: string) {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async create(input: CreateUserInput) {
    const now = new Date();
    const user: User = {
      id: randomUUID(),
      name: input.name,
      email: input.email.toLowerCase(),
      document: input.document,
      passwordHash: await bcrypt.hash(input.password, 12),
      role: input.role,
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(user);
    return user;
  }

  async updatePassword(id: string, password: string) {
    const user = await this.findById(id);
    if (!user) return null;

    user.passwordHash = await bcrypt.hash(password, 12);
    user.updatedAt = new Date();
    return user;
  }

  async updateProfile(id: string, input: Pick<CreateUserInput, "name" | "document">) {
    const user = await this.findById(id);
    if (!user) return null;

    user.name = input.name;
    if (input.document !== undefined) user.document = input.document;
    user.updatedAt = new Date();
    return user;
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.findById(id);
    if (!user) return null;

    user.role = role;
    user.updatedAt = new Date();
    return user;
  }

  async updateStatus(id: string, status: UserStatus) {
    const user = await this.findById(id);
    if (!user) return null;

    user.status = status;
    user.updatedAt = new Date();
    return user;
  }
}

export const userRepository: UserRepository = new InMemoryUserRepository();

export async function seedInitialAdmin() {
  if (!env.ADMIN_NAME || !env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return;
  if (await userRepository.findByEmail(env.ADMIN_EMAIL)) return;

  await userRepository.create({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
    role: "ADMIN",
  });
}
