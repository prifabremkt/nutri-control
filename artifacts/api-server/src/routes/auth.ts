import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signToken, requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: "E-mail e senha são obrigatórios" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim())).limit(1);
  if (!user) {
    res.status(401).json({ error: "E-mail ou senha incorretos" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "E-mail ou senha incorretos" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.json({ token, name: user.name, email: user.email });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select({ id: usersTable.id, email: usersTable.email, name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.userId))
    .limit(1);
  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }
  res.json(user);
});

export default router;
