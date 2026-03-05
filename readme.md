# Vefforritun 2 - Hópverkefni 1

REST vefþjónusta fyrir viðburðakerfi með notendaumsjón, myndastuðningi og PostgreSQL gagnagrunni.

---

## 👥 Hópur

- Kristján Jakob – KristjanJakob

---

## Tæk og tól

- Node.js + Express
- TypeScript
- PostgreSQL (Neon)
- Prisma ORM
- JWT authentication
- Cloudinary (myndageymsla)
- Vitest + Supertest (tests)
- ESLint

---

# Uppsetning

## 1. Klóna repo

git clone <repo-url>
cd h1

## 2. Setja upp dependencies

npm install

## 3. .env skrá

PORT=3000
JWT_SECRET=your-secret
DATABASE_URL=postgresql://....

CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

## 4. Keyra migrations og Seed

npx prisma migrate dev
npx prisma db seed

## 5. Admin innskráning

username: admin
password: admin123

## 6. Keyrsla

npm run dev

Serverinn keyrir á:
http://localhost:3000

## 7. Keyra tests

npm test

Testin ná yfir:
- GET /events
- POST /auth/login
- POST /admin/events
- GET /events/:id
