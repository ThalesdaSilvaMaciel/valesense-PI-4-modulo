import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { USER_ROLES, USER_STATUSES, toPublicUser } from "../auth/auth.types.js";
import { userRepository } from "../auth/user.repository.js";

const idSchema = z.string().uuid();
const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  document: z.string().trim().min(11).max(18).optional(),
});
const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});
const statusSchema = z.object({ status: z.enum(USER_STATUSES) });
const roleSchema = z.object({ role: z.enum(USER_ROLES) });

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get("/me", async (request, response, next) => {
  try {
    const user = await userRepository.findById(request.user!.id);
    return response.status(200).json({ user: toPublicUser(user!) });
  } catch (error) {
    next(error);
  }
});

usersRouter.patch("/me", async (request, response, next) => {
  try {
    const input = profileSchema.parse(request.body);
    if (input.document) {
      const existingUser = await userRepository.findByDocument(input.document);
      if (existingUser && existingUser.id !== request.user!.id) {
        return response.status(409).json({ error: "Documento já cadastrado" });
      }
    }
    const user = await userRepository.updateProfile(request.user!.id, input);
    return response.status(200).json({ user: toPublicUser(user!) });
  } catch (error) {
    next(error);
  }
});

usersRouter.patch("/me/password", async (request, response, next) => {
  try {
    const { currentPassword, newPassword } = passwordSchema.parse(request.body);
    const user = await userRepository.findById(request.user!.id);
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return response.status(400).json({ error: "Senha atual inválida" });
    }
    if (await bcrypt.compare(newPassword, user.passwordHash)) {
      return response.status(400).json({ error: "A nova senha deve ser diferente da atual" });
    }
    await userRepository.updatePassword(user.id, newPassword);
    return response.status(200).json({ message: "Senha atualizada com sucesso" });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", authorize("ADMIN"), async (_request, response, next) => {
  try {
    const users = await userRepository.list();
    return response.status(200).json({ data: users.map(toPublicUser) });
  } catch (error) {
    next(error);
  }
});

usersRouter.patch("/:id/status", authorize("ADMIN"), async (request, response, next) => {
  try {
    const id = idSchema.parse(request.params.id);
    const { status } = statusSchema.parse(request.body);
    if (id === request.user!.id) {
      return response.status(400).json({ error: "Você não pode alterar seu próprio status" });
    }
    const target = await userRepository.findById(id);
    if (!target) return response.status(404).json({ error: "Usuário não encontrado" });
    if (target.role === "ADMIN" && status === "INACTIVE") {
      const users = await userRepository.list();
      const otherActiveAdmin = users.some((user) => user.id !== target.id && user.role === "ADMIN" && user.status === "ACTIVE");
      if (!otherActiveAdmin) return response.status(400).json({ error: "O último administrador ativo não pode ser inativado" });
    }
    const user = await userRepository.updateStatus(id, status);
    return response.status(200).json({ user: toPublicUser(user!) });
  } catch (error) {
    next(error);
  }
});

usersRouter.patch("/:id/role", authorize("ADMIN"), async (request, response, next) => {
  try {
    const id = idSchema.parse(request.params.id);
    const { role } = roleSchema.parse(request.body);
    if (id === request.user!.id) {
      return response.status(400).json({ error: "Você não pode alterar sua própria role" });
    }
    const target = await userRepository.findById(id);
    if (!target) return response.status(404).json({ error: "Usuário não encontrado" });
    if (target.role === "ADMIN" && role !== "ADMIN" && target.status === "ACTIVE") {
      const users = await userRepository.list();
      const otherActiveAdmin = users.some((user) => user.id !== target.id && user.role === "ADMIN" && user.status === "ACTIVE");
      if (!otherActiveAdmin) return response.status(400).json({ error: "O último administrador ativo não pode ter a role alterada" });
    }
    const user = await userRepository.updateRole(id, role);
    return response.status(200).json({ user: toPublicUser(user!) });
  } catch (error) {
    next(error);
  }
});
