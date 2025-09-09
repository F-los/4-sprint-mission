# Sprint Mission 4 - 중고거래 플랫폼

완전한 풀스택 중고거래 플랫폼으로, JWT 토큰 기반 인증, Refresh Token, Prisma ORM을 활용한 관계형 데이터베이스 설계가 특징입니다.

## 🚀 배포된 서비스

- **프론트엔드**: [https://4-sprint-mission.vercel.app](https://4-sprint-mission.vercel.app)
- **백엔드 API**: [https://sprint-mission-4-backend.onrender.com](https://sprint-mission-4-backend.onrender.com)

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** - React 프레임워크 (App Router)
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **Axios** - HTTP 클라이언트
- **Vercel** - 배포 플랫폼

### Backend
- **Node.js** - 런타임 환경
- **Express.js** - 웹 프레임워크
- **TypeScript** - 타입 안전성
- **Prisma ORM** - 데이터베이스 ORM
- **PostgreSQL** - 관계형 데이터베이스
- **JWT** - 인증 토큰 (Access + Refresh Token)
- **bcryptjs** - 비밀번호 암호화
- **Render.com** - 배포 플랫폼

### DevOps & Tools
- **ESLint** - 코드 린팅
- **Prettier** - 코드 포매팅
- **Git** - 버전 관리

## ✅ 구현된 기능

### 🔐 기본 요구사항

#### 인증 시스템
- [x] User 스키마 작성 (id, email, nickname, image, password, createdAt, updatedAt)
- [x] 회원가입 API (email, nickname, password)
- [x] 비밀번호 해싱 저장 (bcryptjs)
- [x] JWT Access Token 기반 로그인
- [x] 토큰 기반 인증 시스템

#### 상품 기능 인가
- [x] 로그인한 유저만 상품 등록 가능
- [x] 상품 등록자만 수정/삭제 가능
- [x] 권한 검증 미들웨어

#### 게시글 기능 인가
- [x] 로그인한 유저만 게시글 등록 가능
- [x] 게시글 등록자만 수정/삭제 가능
- [x] 권한 검증 시스템

#### 댓글 기능 인가
- [x] 로그인한 유저만 상품/게시글 댓글 등록 가능
- [x] 댓글 작성자만 수정/삭제 가능

#### 유저 정보 관리
- [x] 유저 정보 조회 기능
- [x] 유저 정보 수정 기능
- [x] 비밀번호 변경 기능
- [x] 등록한 상품 목록 조회
- [x] 비밀번호 응답 데이터 제외

### 🚀 심화 요구사항

#### 고급 인증
- [x] **Refresh Token 구현** - 자동 토큰 갱신
- [x] 토큰 만료 시 자동 재발급
- [x] 안전한 토큰 저장소 관리

#### 좋아요 시스템
- [x] 상품 좋아요/취소 기능
- [x] 게시글 좋아요/취소 기능  
- [x] **isLiked 상태 표시** - 사용자별 좋아요 상태 확인
- [x] 좋아요한 상품 목록 조회

### 💎 추가 구현 기능

#### 고급 UI/UX
- [x] **반응형 디자인** - 모바일/태블릿/데스크톱 지원
- [x] **로딩 상태 관리** - 사용자 경험 향상
- [x] **실시간 상태 업데이트** - 좋아요, 댓글 수 실시간 반영
- [x] **에러 핸들링** - 사용자 친화적 오류 메시지
- [x] **폼 유효성 검증** - 클라이언트/서버 양측 검증

#### 보안 강화
- [x] **CORS 설정** - 도메인별 접근 제어
- [x] **입력 검증** - SQL Injection 등 보안 취약점 방지
- [x] **에러 미들웨어** - 안전한 에러 응답
- [x] **환경변수 관리** - 민감 정보 보호

#### 개발자 경험
- [x] **TypeScript 완전 지원** - 타입 안전성
- [x] **ESLint 설정** - 코드 품질 관리
- [x] **Prisma ORM** - 타입 안전한 데이터베이스 쿼리
- [x] **자동 배포** - CI/CD 파이프라인

#### 데이터 관리
- [x] **관계형 데이터 모델링** - 사용자, 상품, 게시글, 댓글, 좋아요 관계
- [x] **데이터베이스 마이그레이션** - 스키마 버전 관리
- [x] **시드 데이터** - 초기 테스트 데이터 제공
- [x] **페이지네이션** - 대용량 데이터 처리

## 📁 프로젝트 구조

```
sprint_mission_4/
├── frontend/                 # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/             # App Router 페이지
│   │   │   ├── articles/    # 게시글 관련 페이지
│   │   │   ├── products/    # 상품 관련 페이지
│   │   │   ├── user/        # 사용자 정보 페이지
│   │   │   ├── profile/     # 마이페이지
│   │   │   ├── login/       # 로그인 페이지
│   │   │   └── register/    # 회원가입 페이지
│   │   ├── lib/
│   │   │   └── api.ts       # API 클라이언트 및 인터셉터
│   │   └── types/
│   │       └── index.ts     # TypeScript 타입 정의
│   ├── eslint.config.mjs    # ESLint 설정
│   ├── tailwind.config.ts   # Tailwind CSS 설정
│   └── package.json
├── backend/                  # Node.js + Express 백엔드
│   ├── src/
│   │   ├── controllers/     # API 컨트롤러
│   │   │   ├── user.controller.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── article.controller.ts
│   │   │   └── comment.controller.ts
│   │   ├── routes/          # API 라우터
│   │   ├── middlewares/     # 미들웨어 (인증, 에러처리)
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   ├── prisma/
│   │   │   └── client.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── app.ts           # Express 앱 설정
│   ├── prisma/
│   │   ├── schema.prisma    # 데이터베이스 스키마
│   │   ├── seed.js          # 시드 데이터
│   │   └── migrations/      # 데이터베이스 마이그레이션
│   ├── render.yaml          # Render 배포 설정
│   └── package.json
└── README.md
```

## 🗄️ 데이터베이스 ERD

```mermaid
erDiagram
    User {
        int id PK
        string email UK
        string nickname
        string image
        string password
        datetime createdAt
        datetime updatedAt
        string refreshToken
    }
    
    Product {
        int id PK
        string name
        string description
        int price
        string[] tags
        string imageUrl
        datetime createdAt
        datetime updatedAt
        int userId FK
    }
    
    Article {
        int id PK
        string title
        string content
        datetime createdAt
        datetime updatedAt
        int userId FK
    }
    
    Comment {
        int id PK
        string content
        datetime createdAt
        datetime updatedAt
        int userId FK
        int productId FK
        int articleId FK
    }
    
    Like {
        int id PK
        datetime createdAt
        int userId FK
        int productId FK
        int articleId FK
    }
    
    User ||--o{ Product : "등록"
    User ||--o{ Article : "작성"
    User ||--o{ Comment : "작성"
    User ||--o{ Like : "좋아요"
    Product ||--o{ Comment : "댓글"
    Article ||--o{ Comment : "댓글"
    Product ||--o{ Like : "좋아요"
    Article ||--o{ Like : "좋아요"
```

### 📊 관계 설명
- **User** : 모든 엔티티의 작성자
- **Product** : 사용자가 등록한 중고 상품
- **Article** : 사용자가 작성한 게시글
- **Comment** : 상품 또는 게시글에 달린 댓글
- **Like** : 상품 또는 게시글에 대한 좋아요
- **Unique Constraints** : 한 사용자는 같은 상품/게시글에 하나의 좋아요만 가능

## 🚀 로컬 개발 환경 설정

### 1️⃣ 저장소 클론

```bash
git clone <your-repository-url>
cd sprint_mission_4
```

### 2️⃣ 백엔드 설정

```bash
cd backend

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일을 열어 다음 값들을 설정하세요:
```

#### 환경변수 설정 (.env)
```env
# 서버 포트
PORT=3000

# PostgreSQL 데이터베이스 연결
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT 시크릿 키 (강력한 랜덤 문자열 생성 권장)
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key"
```

#### 데이터베이스 설정
```bash
# PostgreSQL이 실행 중인지 확인 후

# Prisma 마이그레이션 실행
npx prisma migrate dev --name init

# 데이터베이스에 시드 데이터 추가
npx prisma db seed

# 개발 서버 실행
npm run dev
```

### 3️⃣ 프론트엔드 설정

```bash
cd ../frontend

# 의존성 설치
npm install

# 개발 서버 실행 (다른 터미널에서)
npm run dev
```

### 4️⃣ 접속 및 테스트

- **프론트엔드**: http://localhost:3001
- **백엔드 API**: http://localhost:3000

#### 🧪 테스트 계정
시드 데이터로 생성된 테스트 계정들:

| 이메일 | 비밀번호 | 닉네임 |
|--------|----------|--------|
| alice@example.com | password123 | Alice |
| bob@example.com | password456 | Bob |
| charlie@example.com | password789 | Charlie |

### 5️⃣ 주요 기능 테스트 순서

1. **회원가입/로그인** 
   - 새 계정 생성 또는 테스트 계정으로 로그인

2. **상품 관리**
   - 상품 등록 → 내 상품 수정/삭제 → 타인 상품 권한 테스트

3. **게시글 시스템**
   - 게시글 작성 → 댓글 추가 → 좋아요 기능 테스트

4. **사용자 프로필**
   - 내 정보 수정 → 비밀번호 변경 → 내 활동 내역 조회

5. **고급 기능**
   - 토큰 만료 후 자동 갱신 → 좋아요한 상품 목록 → 권한 테스트

## 🔧 개발 명령어

### 백엔드
```bash
npm run dev          # 개발 서버 실행
npm run build        # TypeScript 빌드
npm start            # 프로덕션 서버 실행
npm run lint         # ESLint 실행
npm run generate     # Prisma 클라이언트 생성
npm run deploy       # 마이그레이션 실행
npm run seed         # 시드 데이터 추가
```

### 프론트엔드
```bash
npm run dev          # 개발 서버 실행
npm run build        # Next.js 빌드
npm start            # 프로덕션 서버 실행
npm run lint         # ESLint 실행
```

## 📈 성능 및 최적화

- **Turbopack** 사용으로 빠른 개발 빌드
- **TypeScript** 완전 지원으로 런타임 에러 최소화
- **Prisma ORM** 으로 타입 안전한 데이터베이스 쿼리
- **JWT + Refresh Token** 으로 보안성과 UX 균형
- **반응형 디자인** 으로 모든 기기 지원

## 🐛 문제 해결

### 자주 발생하는 문제들

1. **데이터베이스 연결 실패**
   - PostgreSQL 서버가 실행 중인지 확인
   - DATABASE_URL 환경변수 확인

2. **JWT 토큰 오류**
   - JWT_SECRET 환경변수 설정 확인
   - 토큰 만료 시간 확인

3. **CORS 오류**
   - 백엔드 CORS 설정에 프론트엔드 URL 추가
   - 개발환경에서는 localhost:3001 허용됨

4. **빌드 오류**
   - TypeScript 타입 오류 확인
   - ESLint 경고 확인

## 👥 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 개인 학습 목적으로 제작되었습니다.

---

**개발자**: [Your Name]  
**완성일**: 2025년 1월  
**기술 스택**: Next.js 15, Node.js, TypeScript, PostgreSQL, Prisma ORM, JWT