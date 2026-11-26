# ERPBUSSINESS roadmap

## Phase 1 — Foundation (current starter)
- React dashboard shell and navigation
- Express API, PostgreSQL connection and health endpoint
- Multi-business data model, members/roles, customers, suppliers, products, invoices and audit logs
- Docker Compose database

## Phase 2 — Core operations
- Business onboarding and business switcher backed by the API
- Secure sign-in, invitations, password hashing and session refresh
- Customer/supplier CRUD screens
- Product catalogue, warehouses, stock movements and reorder alerts
- Sales quotations, invoices, receipts and credit notes
- Purchase orders, goods received notes and supplier bills

## Phase 3 — Finance and compliance
- Double-entry chart of accounts and journal entries
- Payment allocations, bank reconciliation and cashbook
- Configurable GST tax codes, HSN/SAC, CGST/SGST/IGST and credit notes
- Financial statements and exportable reports

## Phase 4 — People and scale
- HR, attendance and payroll
- Fine-grained permissions and approval workflows
- PostgreSQL row-level security and tenant-isolation tests
- Automated backups, monitoring, CI, integration tests and deployment

## Important
The dashboard currently uses sample display data. The API exposes a small starter set of endpoints. This repository is a foundation, not a production-ready accounting or payroll system. Validate Indian tax, payroll, privacy and statutory requirements with qualified professionals before using it for official records.
