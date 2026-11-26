# ERPBUSSINESS — Multi-business ERP

A multi-company ERP starter built with React, Node.js, Express and PostgreSQL.

## Modules in this starter
- Company-aware dashboard and business switching
- Authentication foundation (JWT) and role-based access control
- Customers, suppliers, products and inventory foundations
- Sales and purchase workflow foundations
- GST-ready invoice data model (India; tax configuration must be reviewed for your business)
- Audit log foundation

## Requirements
- Node.js 20+
- PostgreSQL 16+
- npm

## Quick start
1. Copy `.env.example` to `.env` and set a strong `JWT_SECRET` and database URL.
2. Create a PostgreSQL database named `erp_business`.
3. Run the SQL in `database/schema.sql`.
4. Start the API: `cd backend && npm install && npm run dev`.
5. Start the web app in another terminal: `cd frontend && npm install && npm run dev`.

API defaults to http://localhost:4000 and Vite to http://localhost:5173.

## Environment
See `.env.example`. Never commit real credentials. The sample login UI is a frontend shell; production authentication, password reset, email delivery, backups, tax rules and security review must be completed before live use.

## Project structure
- `frontend/` React + Vite application
- `backend/` Express REST API
- `database/schema.sql` PostgreSQL schema
- `docs/ROADMAP.md` implementation plan

## Tenant isolation
Business-owned tables include `business_id`. Every API query must be scoped to the authenticated user's active business. Before production, enforce this at the database layer with PostgreSQL row-level security and test cross-tenant access thoroughly.

## License
Private project. Add a license before redistributing.
