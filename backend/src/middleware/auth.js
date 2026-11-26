import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireBusiness(req, res, next) {
  const businessId = req.headers["x-business-id"] || req.user?.businessId;
  if (!businessId) return res.status(400).json({ error: "Select an active business" });
  req.businessId = businessId;
  next();
}
