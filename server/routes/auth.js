import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { dbGet, dbRun } from "../lib/db.js";
import { signToken, setAuthCookie, clearAuthCookie } from "../lib/auth.js";

const router = express.Router();
const nowIso = () => new Date().toISOString();

router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, address, postal, phone, email, password } = req.body || {};
    if (!first_name || !last_name || !address || !postal || !phone || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const mail = String(email).trim().toLowerCase();
    const existing = await dbGet("SELECT id FROM users WHERE email = ?", [mail]);
    if (existing) return res.status(409).json({ error: "Email already used" });

    const password_hash = await bcrypt.hash(String(password), 12);
    const r = await dbRun(
      `INSERT INTO users (first_name,last_name,address,postal,phone,email,password_hash,created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
      [first_name, last_name, address, postal, phone, mail, password_hash, nowIso()]
    );

    const token = signToken({ uid: r.lastID, email: mail });
    setAuthCookie(res, token);
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    const mail = String(email).trim().toLowerCase();
    const user = await dbGet("SELECT id, email, password_hash FROM users WHERE email = ?", [mail]);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({ uid: user.id, email: user.email });
    setAuthCookie(res, token);
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", async (req, res) => {
  clearAuthCookie(res);
  return res.json({ ok: true });
});

router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Missing email" });

    const mail = String(email).trim().toLowerCase();
    const user = await dbGet("SELECT id FROM users WHERE email = ?", [mail]);
    if (!user) return res.json({ ok: true });

    const token = crypto.randomBytes(24).toString("hex");
    const token_hash = crypto.createHash("sha256").update(token).digest("hex");
    const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await dbRun(
      `INSERT INTO password_resets (user_id, token_hash, expires_at, created_at)
       VALUES (?,?,?,?)`,
      [user.id, token_hash, expires_at, nowIso()]
    );

    return res.json({ ok: true, reset_link: `/reset-password.html?token=${token}&email=${encodeURIComponent(mail)}` });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/reset", async (req, res) => {
  try {
    const { email, token, password } = req.body || {};
    if (!email || !token || !password) return res.status(400).json({ error: "Missing fields" });

    const mail = String(email).trim().toLowerCase();
    const token_hash = crypto.createHash("sha256").update(String(token)).digest("hex");

    const row = await dbGet(
      `SELECT id, user_id, expires_at, used_at
       FROM password_resets
       WHERE token_hash = ?
       ORDER BY id DESC LIMIT 1`,
      [token_hash]
    );

    if (!row) return res.status(400).json({ error: "Invalid token" });
    if (row.used_at) return res.status(400).json({ error: "Token already used" });
    if (new Date(row.expires_at).getTime() < Date.now()) return res.status(400).json({ error: "Token expired" });

    const password_hash = await bcrypt.hash(String(password), 12);
    await dbRun("UPDATE users SET password_hash = ? WHERE id = ?", [password_hash, row.user_id]);
    await dbRun("UPDATE password_resets SET used_at = ? WHERE id = ?", [nowIso(), row.id]);

    const jwtTok = signToken({ uid: row.user_id, email: mail });
    setAuthCookie(res, jwtTok);

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
