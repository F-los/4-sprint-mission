# Sprint Mission 9 - 판다마켓

sprint_mission_5의 모든 기능을 Featured Architecture + Prisma로 재구성한 풀스택 프로젝트입니다.

## 📁 프로젝트 구조

```
sprint_mission_9/
├── backend/          # Express + Prisma + TypeScript API 서버
├── frontend/         # Next.js + TypeScript 프론트엔드
└── README.md         # 이 파일
```

## 🚀 빠른 시작

### Backend (포트 9999)

```bash
cd backend

# 1. 의존성 설치
npm install

# 2. 환경변수 설정 (.env 파일 생성)
cp .env.example .env

# 3. 데이터베이스 설정
npm run generate      # Prisma Client 생성
npx prisma db push    # 스키마 적용
npm run seed          # 초기 데이터

# 4. 서버 실행
npm run dev           # 개발 모드
```

서버: http://localhost:9999
API: http://localhost:9999/api

### Frontend (포트 3000)

```bash
cd frontend

# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev
```

프론트엔드: http://localhost:3000

## ✨ 주요 기능

### Backend
- ✅ Featured Architecture (도메인 기반)
- ✅ Prisma ORM (PostgreSQL)
- ✅ JWT 인증
- ✅ DTO + Service + Repository 패턴
- ✅ TypeScript (No any type)
- ✅ Zod 스키마 검증
- ✅ 파일 업로드 (Multer)

### Frontend
- ✅ Next.js 14 (App Router)
- ✅ TypeScript
- ✅ Axios API 통신
- ✅ 반응형 디자인

## 📡 API 기능

### 인증
- 회원가입/로그인
- JWT 토큰 인증
- 토큰 자동 갱신

### 상품
- CRUD (생성/조회/수정/삭제)
- 페이지네이션 & 필터링
- 좋아요 기능
- 이미지 업로드

### 게시글
- CRUD
- 페이지네이션 & 검색
- 좋아요 기능

### 댓글
- 상품/게시글 댓글
- CRUD

## 🛠️ 기술 스택

### Backend
- Node.js + Express
- TypeScript
- Prisma (PostgreSQL)
- JWT (jsonwebtoken)
- Bcrypt
- Multer
- Zod

### Frontend
- Next.js 14
- TypeScript
- Axios
- React

## 📝 환경변수

### Backend (.env)
```env
PORT=9999
DATABASE_URL=postgresql://user:password@localhost:5432/panda_market
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
CORS_ORIGIN=*
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:9999/api
```

## 🎯 코딩 규칙

1. **No any type** - 모든 타입 명시적 선언
2. **Type Redefinition 제거** - Prisma 타입 재사용
3. **Single Source of Truth** - 타입 중복 정의 금지
4. **Single Responsibility** - 각 파일/함수는 단일 책임

## 📚 상세 문서

- [Backend 문서](./backend/README.md)
- [Frontend 문서](./frontend/README.md)

## 🔄 Migration from sprint_mission_5

- ✅ Layered → Featured Architecture
- ✅ Raw SQL → Prisma ORM
- ✅ DTO + Service + Repository 패턴 적용
- ✅ TypeScript 타입 안정성 강화
- ✅ JWT 인증 통합

## 📞 포트 정보

- **Backend API**: 9999
- **Frontend**: 3000
- **PostgreSQL**: 5432
