import express from "express";
import { requireAuth } from "../lib/auth.js";
import { dbGet } from "../lib/db.js";

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  const u = await dbGet(
    "SELECT id, first_name, last_name, address, postal, phone, email, created_at FROM users WHERE id = ?",
    [req.user.uid]
  );
  return res.json({ ok: true, user: u });
});

export default router;
