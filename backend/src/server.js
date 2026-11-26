import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";
import { requireAuth, requireBusiness } from "./middleware/auth.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

// Demo bootstrap endpoint: replace with hashed-password verification and invitation flow.
app.post("/api/auth/demo-token", (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "Not found" });
  }
  const { userId = "demo-user", businessId = "demo-business", role = "admin" } = req.body || {};
  const token = jwt.sign({ sub: userId, businessId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h"
  });
  res.json({ token, user: { id: userId, role, businessId } });
});

app.get("/api/dashboard", requireAuth, requireBusiness, async (req, res) => {
  try {
    const [customers, products, invoices, sales] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS count FROM customers WHERE business_id = $1", [req.businessId]),
      pool.query("SELECT COUNT(*)::int AS count FROM products WHERE business_id = $1 AND is_active = true", [req.businessId]),
      pool.query("SELECT COUNT(*)::int AS count FROM sales_invoices WHERE business_id = $1", [req.businessId]),
      pool.query("SELECT COALESCE(SUM(total_amount), 0)::numeric AS total FROM sales_invoices WHERE business_id = $1 AND status <> 'cancelled'", [req.businessId])
    ]);
    res.json({
      customers: customers.rows[0].count,
      products: products.rows[0].count,
      invoices: invoices.rows[0].count,
      sales: sales.rows[0].total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load dashboard" });
  }
});

app.get("/api/customers", requireAuth, requireBusiness, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, gstin, created_at FROM customers WHERE business_id = $1 ORDER BY created_at DESC LIMIT 100",
      [req.businessId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load customers" });
  }
});

app.post("/api/customers", requireAuth, requireBusiness, async (req, res) => {
  const { name, email = null, phone = null, gstin = null } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: "Customer name is required" });
  try {
    const result = await pool.query(
      "INSERT INTO customers (business_id, name, email, phone, gstin) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, phone, gstin, created_at",
      [req.businessId, name.trim(), email, phone, gstin]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to create customer" });
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`ERPBUSSINESS API listening on ${port}`));
