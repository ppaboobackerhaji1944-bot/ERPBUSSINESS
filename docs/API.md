# API reference

Base URL: `http://localhost:4000`. JSON request/response bodies unless noted.

## Authentication
- `POST /api/auth/register` — create a user and first business. Body: `{ "name": "...", "email": "...", "password": "12+ characters", "businessName": "..." }`.
- `POST /api/auth/login` — body: `{ "email": "...", "password": "..." }`. Returns a bearer token, user and business memberships.
- `GET /api/auth/me` — current user; requires `Authorization: Bearer <token>`.

## Businesses
- `GET /api/businesses` — list businesses the signed-in user belongs to.
- `POST /api/businesses` — create another business for the signed-in user. Body: `{ "name": "...", "legalName": "...", "gstin": "...", "currency": "INR" }`.

## Business-scoped operations
Send both `Authorization: Bearer <token>` and `X-Business-Id: <membership business UUID>`.
- `GET /api/dashboard` — counts and invoice totals.
- `GET /api/customers`, `POST /api/customers` — list/create customers. Body: `{ "name": "...", "email": "...", "phone": "...", "gstin": "..." }`.
- `GET /api/products`, `POST /api/products` — list/create products. Body: `{ "sku": "...", "name": "...", "unit": "pcs", "purchasePrice": 0, "sellingPrice": 0, "taxRate": 0, "openingStock": 0, "reorderLevel": 0 }`.

## Notes
- Passwords are hashed using bcryptjs. Authentication endpoints have basic rate limiting.
- The business middleware checks membership before scoped handlers execute.
- This is an early development API, not a complete production security posture. Add CSRF strategy for cookie auth if adopted, refresh/revocation, email verification, password reset, audit coverage, DB row-level security and automated tests before production.
- Do not put secrets in source control. Set a random `JWT_SECRET` of at least 32 characters.
