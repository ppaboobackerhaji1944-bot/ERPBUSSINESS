# ERPBUSSINESS — Multi-business ERP

A multi-company ERP starter built with React, Node.js, Express and PostgreSQL.

## Modules in this starter
- Multi-business creation, membership listing and business-aware dashboard
- Email/password registration and login with bcrypt password hashing and JWT authentication
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
See `.env.example`. Set `JWT_SECRET` to a random value of at least 32 characters. Never commit real credentials. The API now provides registration/login, business membership checks, and starter customer/product endpoints. The frontend dashboard still uses sample display data; a connected sign-in and management UI is the next milestone. Production password reset, email verification, token revocation, database row-level security, backups, tax rules and security review remain necessary.

## Project structure
- `frontend/` React + Vite application
- `backend/` Express REST API
- `database/schema.sql` PostgreSQL schema
- `docs/ROADMAP.md` implementation plan
- `docs/API.md` API endpoint reference

## Tenant isolation
Business-owned tables include `business_id`. Every API query must be scoped to the authenticated user's active business. Before production, enforce this at the database layer with PostgreSQL row-level security and test cross-tenant access thoroughly.

## License
Private project. Add a license before redistributing.
