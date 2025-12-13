# Telegram Clone

Real vaqtda xabar almashish ilovasi - Node.js, React, TypeScript, Socket.io

## Texnologiyalar

**Backend:** Node.js, Express, Prisma, PostgreSQL, Socket.io, JWT, bcrypt

**Frontend:** React 18, TypeScript, TailwindCSS, Zustand, Axios, Socket.io-client

## Loyiha Strukturasi

```
├── src/                    # Backend
│   ├── config/            # Konfiguratsiya
│   ├── database/          # Prisma connection
│   ├── middleware/        # Auth, error handling
│   ├── models/            # TypeScript types
│   ├── routes/            # API endpointlari
│   ├── services/          # Business logic
│   └── utils/             # Yordamchi funksiyalar
├── frontend/              # Frontend
│   └── src/
│       ├── components/    # UI komponentlar
│       ├── pages/         # Sahifalar
│       ├── services/      # API client
│       ├── store/         # Zustand store
│       └── types/         # TypeScript types
└── prisma/                # Database schema
```

## Ishga Tushirish

### 1. Backend

```bash
# Paketlarni o'rnatish
npm install

# .env faylini sozlash
# DATABASE_URL ni o'zgartiring

# Prisma client yaratish
npx prisma generate

# Database migration
npx prisma migrate dev --name init

# Serverni ishga tushirish
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Brauzerda ochish

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Endpointlari

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | /api/auth/register | Ro'yxatdan o'tish |
| POST | /api/auth/login | Kirish |
| POST | /api/auth/logout | Chiqish |
| GET | /api/auth/me | Joriy foydalanuvchi |

## Xususiyatlar

- ✅ Foydalanuvchi ro'yxatdan o'tishi va login
- ✅ JWT autentifikatsiya
- ✅ Parol bcrypt bilan hash qilinadi
- ✅ Professional Telegram-style UI
- ✅ Responsive dizayn
- ✅ Protected routes
- ⏳ Real-time xabar yuborish (Socket.io)
- ⏳ Guruh chatlari
- ⏳ Media fayl yuklash

## Environment Variables

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/telegram_clone"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

## Deploy qilish (Render.com)

### 1. GitHub repository yaratish

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/telegram-clone.git
git push -u origin main
```

### 2. Render.com da deploy

1. [Render.com](https://render.com) ga kiring
2. "New +" > "Blueprint" ni tanlang
3. GitHub repository ni ulang
4. `render.yaml` fayli avtomatik aniqlandi
5. Environment variables ni sozlang:
   - `JWT_SECRET`: Random string
   - `NODE_ENV`: production
6. Deploy tugmasini bosing

### 3. Manual deploy (Docker)

```bash
# Backend build
docker build -t telegram-clone-api .

# Frontend build  
cd frontend
docker build -t telegram-clone-frontend .

# Run containers
docker run -p 3001:3001 telegram-clone-api
docker run -p 80:80 telegram-clone-frontend
```

### 4. Local production build

```bash
# Windows
./build.ps1

# Linux/Mac
./build.sh

# Start production server
npm start
```

## Production URLs

- **Frontend**: https://telegram-clone-frontend.onrender.com
- **Backend API**: https://telegram-clone-api.onrender.com
- **Database**: PostgreSQL (Render managed)

## Troubleshooting

### CORS xatolari
Frontend va backend bir xil domenda bo'lishi kerak yoki CORS to'g'ri sozlangan bo'lishi kerak.

### Database connection
Production da `DATABASE_URL` environment variable to'g'ri sozlangan bo'lishi kerak.

### File uploads
Production da static file serving yoqilgan bo'lishi kerak.
