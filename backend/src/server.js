import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";
import { requireAuth, requireBusiness } from "./middleware/auth.js";
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("Set JWT_SECRET to a random string of at least 32 characters");
const app=express();
app.use(helmet());
app.use(cors({origin:process.env.CLIENT_ORIGIN||"http://localhost:5173"}));
app.use(express.json({limit:"1mb"}));
const authLimiter=rateLimit({windowMs:15*60*1000,limit:20,standardHeaders:true,legacyHeaders:false});
const tokenFor=(user,businessId,role)=>jwt.sign({sub:user.id,businessId,role},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||"8h",issuer:"erpbusiness-api",audience:"erpbusiness-web"});
app.get("/api/health",async(_req,res)=>{try{await pool.query("SELECT 1");res.json({status:"ok",database:"connected"});}catch{res.status(503).json({status:"error",database:"unavailable"});}});
app.post("/api/auth/register",authLimiter,async(req,res)=>{
 const {name,email,password,businessName}=req.body||{};
 if(!name?.trim()||!email?.trim()||!businessName?.trim()||typeof password!=="string")return res.status(400).json({error:"Name, email, password and business name are required"});
 if(password.length<12||password.length>200)return res.status(400).json({error:"Password must be between 12 and 200 characters"});
 const c=await pool.connect();
 try{
  await c.query("BEGIN");
  const hash=await bcrypt.hash(password,12);
  const u=(await c.query("INSERT INTO app_users(name,email,password_hash) VALUES($1,lower($2),$3) RETURNING id,name,email",[name.trim(),email.trim(),hash])).rows[0];
  const b=(await c.query("INSERT INTO businesses(name) VALUES($1) RETURNING id,name,currency",[businessName.trim()])).rows[0];
  await c.query("INSERT INTO business_members(business_id,user_id,role) VALUES($1,$2,'owner')",[b.id,u.id]);
  await c.query("COMMIT");
  res.status(201).json({token:tokenFor(u,b.id,"owner"),user:u,businesses:[{...b,role:"owner"}],activeBusinessId:b.id});
 }catch(e){await c.query("ROLLBACK");if(e.code==="23505")return res.status(409).json({error:"An account with this email already exists"});console.error(e);res.status(500).json({error:"Unable to create account"});}finally{c.release();}
});
app.post("/api/auth/login",authLimiter,async(req,res)=>{
 const {email,password}=req.body||{};if(!email?.trim()||typeof password!=="string")return res.status(400).json({error:"Email and password are required"});
 try{
  const found=await pool.query("SELECT id,name,email,password_hash FROM app_users WHERE email=lower($1) AND is_active=true",[email.trim()]);
  const u=found.rows[0];if(!u||!(await bcrypt.compare(password,u.password_hash)))return res.status(401).json({error:"Invalid email or password"});
  const businesses=await pool.query("SELECT b.id,b.name,b.currency,bm.role FROM business_members bm JOIN businesses b ON b.id=bm.business_id WHERE bm.user_id=$1 AND b.is_active=true ORDER BY b.name",[u.id]);
  if(!businesses.rowCount)return res.status(403).json({error:"No active business is assigned to this account"});
  const b=businesses.rows[0];res.json({token:tokenFor(u,b.id,b.role),user:{id:u.id,name:u.name,email:u.email},businesses:businesses.rows,activeBusinessId:b.id});
 }catch(e){console.error(e);res.status(500).json({error:"Unable to sign in"});}
});
app.get("/api/auth/me",requireAuth,async(req,res)=>{try{const r=await pool.query("SELECT id,name,email FROM app_users WHERE id=$1 AND is_active=true",[req.user.sub]);if(!r.rowCount)return res.status(401).json({error:"Account is inactive"});res.json({user:r.rows[0]});}catch(e){console.error(e);res.status(500).json({error:"Unable to load account"});}});
app.get("/api/businesses",requireAuth,async(req,res)=>{try{const r=await pool.query("SELECT b.id,b.name,b.legal_name,b.gstin,b.currency,bm.role FROM business_members bm JOIN businesses b ON b.id=bm.business_id WHERE bm.user_id=$1 AND b.is_active=true ORDER BY b.name",[req.user.sub]);res.json(r.rows);}catch(e){console.error(e);res.status(500).json({error:"Unable to load businesses"});}});
app.post("/api/businesses",requireAuth,async(req,res)=>{
 const {name,legalName=null,gstin=null,currency="INR"}=req.body||{};
 if(!name?.trim())return res.status(400).json({error:"Business name is required"});
 if(!/^[A-Z]{3}$/.test(currency))return res.status(400).json({error:"Currency must be a three-letter uppercase code"});
 if(gstin&&!/^[0-9A-Z]{15}$/.test(gstin))return res.status(400).json({error:"GSTIN must contain 15 uppercase letters or digits"});
 const c=await pool.connect();try{await c.query("BEGIN");const n=await c.query("SELECT COUNT(*)::int AS count FROM business_members WHERE user_id=$1 AND role='owner'",[req.user.sub]);if(n.rows[0].count>=20){await c.query("ROLLBACK");return res.status(400).json({error:"Business limit reached"});}
 const b=(await c.query("INSERT INTO businesses(name,legal_name,gstin,currency) VALUES($1,$2,$3,$4) RETURNING id,name,legal_name,gstin,currency",[name.trim(),legalName,gstin,currency])).rows[0];
 await c.query("INSERT INTO business_members(business_id,user_id,role) VALUES($1,$2,'owner')",[b.id,req.user.sub]);await c.query("COMMIT");res.status(201).json({...b,role:"owner"});
 }catch(e){await c.query("ROLLBACK");console.error(e);res.status(500).json({error:"Unable to create business"});}finally{c.release();}
});
app.get("/api/dashboard",requireAuth,requireBusiness,async(req,res)=>{try{const [a,b,c,d]=await Promise.all([pool.query("SELECT COUNT(*)::int AS count FROM customers WHERE business_id=$1",[req.businessId]),pool.query("SELECT COUNT(*)::int AS count FROM products WHERE business_id=$1 AND is_active=true",[req.businessId]),pool.query("SELECT COUNT(*)::int AS count FROM sales_invoices WHERE business_id=$1",[req.businessId]),pool.query("SELECT COALESCE(SUM(total_amount),0)::numeric AS total FROM sales_invoices WHERE business_id=$1 AND status<>'cancelled'",[req.businessId])]);res.json({customers:a.rows[0].count,products:b.rows[0].count,invoices:c.rows[0].count,sales:d.rows[0].total});}catch(e){console.error(e);res.status(500).json({error:"Unable to load dashboard"});}});
app.get("/api/customers",requireAuth,requireBusiness,async(req,res)=>{try{const r=await pool.query("SELECT id,name,email,phone,gstin,created_at FROM customers WHERE business_id=$1 ORDER BY created_at DESC LIMIT 100",[req.businessId]);res.json(r.rows);}catch(e){console.error(e);res.status(500).json({error:"Unable to load customers"});}});
app.post("/api/customers",requireAuth,requireBusiness,async(req,res)=>{const {name,email=null,phone=null,gstin=null}=req.body||{};if(!name?.trim())return res.status(400).json({error:"Customer name is required"});if(gstin&&!/^[0-9A-Z]{15}$/.test(gstin))return res.status(400).json({error:"Invalid GSTIN format"});try{const r=await pool.query("INSERT INTO customers(business_id,name,email,phone,gstin) VALUES($1,$2,$3,$4,$5) RETURNING id,name,email,phone,gstin,created_at",[req.businessId,name.trim(),email?.trim()||null,phone?.trim()||null,gstin]);res.status(201).json(r.rows[0]);}catch(e){if(e.code==="23505")return res.status(409).json({error:"Customer email already exists in this business"});console.error(e);res.status(500).json({error:"Unable to create customer"});}});
app.get("/api/products",requireAuth,requireBusiness,async(req,res)=>{try{const r=await pool.query("SELECT id,sku,name,description,unit,purchase_price,selling_price,tax_rate,stock_quantity,reorder_level,is_active,created_at FROM products WHERE business_id=$1 ORDER BY name LIMIT 250",[req.businessId]);res.json(r.rows);}catch(e){console.error(e);res.status(500).json({error:"Unable to load products"});}});
app.post("/api/products",requireAuth,requireBusiness,async(req,res)=>{const {sku=null,name,description=null,unit="pcs",purchasePrice=0,sellingPrice=0,taxRate=0,openingStock=0,reorderLevel=0}=req.body||{};if(!name?.trim())return res.status(400).json({error:"Product name is required"});const vals=[purchasePrice,sellingPrice,taxRate,openingStock,reorderLevel].map(Number);if(vals.some(v=>!Number.isFinite(v)||v<0)||vals[2]>100)return res.status(400).json({error:"Enter valid non-negative prices, stock and tax rate (maximum 100%)"});try{const r=await pool.query("INSERT INTO products(business_id,sku,name,description,unit,purchase_price,selling_price,tax_rate,stock_quantity,reorder_level) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id,sku,name,description,unit,purchase_price,selling_price,tax_rate,stock_quantity,reorder_level,is_active,created_at",[req.businessId,sku?.trim()||null,name.trim(),description,unit,...vals]);res.status(201).json(r.rows[0]);}catch(e){if(e.code==="23505")return res.status(409).json({error:"SKU already exists in this business"});console.error(e);res.status(500).json({error:"Unable to create product"});}});
app.use((err,_req,res,_next)=>{console.error(err);res.status(500).json({error:"Internal server error"});});
const port=Number(process.env.PORT||4000);app.listen(port,()=>console.log(`ERPBUSSINESS API listening on ${port}`));
