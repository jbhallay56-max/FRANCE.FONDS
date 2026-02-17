import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET;

export function signToken(payload) {
  if (!secret) throw new Error("JWT_SECRET missing");
  return jwt.sign(payload, secret, { expiresIn: "14d" });
}
export function verifyToken(token) {
  if (!secret) throw new Error("JWT_SECRET missing");
  return jwt.verify(token, secret);
}
export function setAuthCookie(res, token) {
  res.cookie("auth", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 14 * 24 * 60 * 60 * 1000
  });
}
export function clearAuthCookie(res) {
  res.clearCookie("auth", { path: "/" });
}
export function requireAuth(req, res, next) {
  const token = req.cookies?.auth;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try { req.user = verifyToken(token); return next(); }
  catch { return res.status(401).json({ error: "Not authenticated" }); }
}
