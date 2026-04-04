# Guidewire Project - How to Run

## Prerequisites
- Node.js (v18+ recommended)
- pnpm (install with `npm install -g pnpm`)
- Python 3.12+
- PostgreSQL database (connection string in `.env`)

## 1. Install Dependencies
From the project root:
```
pnpm install
```

## 2. Set Up Python Virtual Environment (for ML Service)
```
cd apps/ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 3. Set Up Database
- Ensure your PostgreSQL database is running and `.env` is configured in `apps/api-server`.
- Run Prisma migrations and seed:
```
cd apps/api-server
pnpm prisma:generate
pnpm prisma:migrate --name init
pnpm tsx src/prisma/seed.ts
```

## 4. Start the API Server
```
cd apps/api-server
pnpm dev
```

## 5. Start the ML Service
```
cd apps/ml-service
source venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

## 6. Start the Frontend (Admin Dashboard or Worker PWA)
```
cd apps/admin-dashboard
pnpm dev
# or
cd apps/worker-pwa
pnpm dev
```

---

## Useful Commands
- Run tests: (add test instructions here if available)
- Lint/format: (add lint/format instructions here if available)

---

For more details, see the documentation in the `docs/` folder.
