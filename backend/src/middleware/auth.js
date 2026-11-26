import jwt from "jsonwebtoken";
import { pool } from "../db.js";
export function requireAuth(req,res,next){
 const token=req.headers.authorization?.replace(/^Bearer\s+/i,"");
 if(!token)return res.status(401).json({error:"Authentication required"});
 try{req.user=jwt.verify(token,process.env.JWT_SECRET,{issuer:"erpbusiness-api",audience:"erpbusiness-web"});next();}
 catch{return res.status(401).json({error:"Invalid or expired token"});}
}
export async function requireBusiness(req,res,next){
 const businessId=req.headers["x-business-id"]||req.user?.businessId;
 if(!businessId)return res.status(400).json({error:"Select an active business"});
 try{
  const r=await pool.query("SELECT role FROM business_members WHERE business_id=$1 AND user_id=$2",[businessId,req.user.sub]);
  if(!r.rowCount)return res.status(403).json({error:"You do not have access to this business"});
  req.businessId=businessId;req.businessRole=r.rows[0].role;next();
 }catch(e){next(e);}
}
