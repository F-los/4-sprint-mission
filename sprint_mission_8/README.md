# Sprint Mission 8 - 실시간 알림 기능 구현

판다마켓 프로젝트에 WebSocket(Socket.IO)을 활용한 실시간 알림 기능을 추가한 미션입니다.

## 주요 기능

### 1. 실시간 알림 시스템
- Socket.IO를 사용한 양방향 실시간 통신
- JWT 토큰 기반 소켓 인증
- 사용자별 개인 알림 룸 관리

### 2. 알림 유형
- **가격 변동 알림**: 좋아요한 상품의 가격이 변경되면 알림
- **댓글 알림**: 자신이 작성한 게시글에 새 댓글이 달리면 알림

### 3. 알림 관리 기능
- 알림 목록 조회 (최신순)
- 안 읽은 알림 개수 표시
- 개별 알림 읽음 처리
- 전체 알림 읽음 처리

## 기술 스택

### Backend
- **Framework**: Express.js (TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Real-time**: Socket.IO 4.8.1
- **Authentication**: JWT

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS
- **Real-time**: Socket.IO Client 4.8.1
- **HTTP Client**: Axios

## 데이터베이스 스키마

### Notification 모델
```prisma
model Notification {
  id        Int      @id @default(autoincrement())
  type      String   // 'PRICE_CHANGE' or 'COMMENT'
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  userId    Int
  productId Int?
  articleId Int?
  commentId Int?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
}
```

## API 엔드포인트

### 알림 관련 API
- `GET /notifications` - 알림 목록 조회
- `GET /notifications/unread-count` - 안 읽은 알림 개수 조회
- `PATCH /notifications/:id/read` - 특정 알림 읽음 처리
- `PATCH /notifications/read-all` - 모든 알림 읽음 처리

### Socket.IO 이벤트
- **Client → Server**
  - `connect` - 소켓 연결 (JWT 토큰 인증)
  - `disconnect` - 소켓 연결 해제

- **Server → Client**
  - `notification` - 새 알림 전송

## 프로젝트 구조

```
sprint_mission_8/
├── backend/
│   ├── src/
│   │   ├── socket.ts                    # Socket.IO 초기화 및 설정
│   │   ├── main.ts                      # HTTP 서버 + Socket.IO 서버
│   │   ├── controllers/
│   │   │   └── notification.controller.ts
│   │   ├── services/
│   │   │   ├── notification.service.ts
│   │   │   ├── product.service.ts       # 가격 변동 알림 로직
│   │   │   └── comment.service.ts       # 댓글 알림 로직
│   │   ├── repositories/
│   │   │   ├── notification.repository.ts
│   │   │   └── like.repository.ts
│   │   └── routes/
│   │       └── notification.routes.ts
│   └── prisma/
│       └── schema.prisma                # 알림 모델 포함
│
└── frontend/
    └── src/
        ├── lib/
        │   ├── socket.ts                # Socket.IO 클라이언트 설정
        │   └── api.ts                   # 알림 API 함수
        ├── types/
        │   └── notification.ts          # 알림 타입 정의
        └── app/
            └── components/
                └── NotificationBell.tsx # 알림 벨 컴포넌트
```

## 설치 및 실행

### 1. 백엔드 설정

```bash
cd backend

# 의존성 설치
npm install

# Prisma 마이그레이션
npx prisma migrate dev

# Prisma Client 생성
npx prisma generate

# 개발 서버 실행
npm run dev
```

### 2. 프론트엔드 설정

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 3. 환경 변수 설정

**backend/.env**
```
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secret-key"
PORT=3000
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## 주요 구현 내용

### 1. Socket.IO 서버 설정
- HTTP 서버와 Socket.IO 서버 통합
- JWT 기반 소켓 인증 미들웨어
- 사용자별 개인 룸 자동 가입

### 2. 가격 변동 알림
상품 가격이 변경되면:
1. 해당 상품을 좋아요한 모든 사용자 조회
2. 각 사용자에게 알림 생성 및 저장
3. Socket.IO를 통해 실시간 알림 전송

### 3. 댓글 알림
게시글에 댓글이 작성되면:
1. 게시글 작성자 확인
2. 작성자에게 알림 생성 및 저장 (본인 댓글 제외)
3. Socket.IO를 통해 실시간 알림 전송

### 4. 프론트엔드 알림 시스템
- 로그인 시 자동으로 Socket.IO 연결
- 실시간 알림 수신 및 UI 업데이트
- 브라우저 알림 (Notification API) 지원
- 알림 드롭다운 UI 제공

## 테스트 방법

### 가격 변동 알림 테스트
1. 사용자 A로 로그인
2. 특정 상품에 좋아요 클릭
3. 사용자 B (상품 소유자)로 로그인
4. 해당 상품의 가격 수정
5. 사용자 A에게 실시간 알림 표시 확인

### 댓글 알림 테스트
1. 사용자 A로 로그인
2. 게시글 작성
3. 사용자 B로 로그인
4. 사용자 A의 게시글에 댓글 작성
5. 사용자 A에게 실시간 알림 표시 확인

## 추가 기능 제안

- 알림 클릭 시 해당 상품/게시글로 이동
- 알림 삭제 기능
- 알림 설정 (알림 유형별 on/off)
- 알림 페이지네이션
- 푸시 알림 지원

## 참고 사항

- Socket.IO는 WebSocket을 기본으로 하되, 폴백으로 HTTP long-polling 지원
- 알림은 데이터베이스에 영구 저장되어 로그아웃 후에도 유지
- 읽지 않은 알림은 파란색 배경으로 강조 표시
- 브라우저 알림은 사용자 권한 허용 필요

## 테스트용 서버

`sprint_mission_8_test` 폴더에는 Socket.IO의 기본 동작을 테스트하기 위한 간단한 서버가 포함되어 있습니다.

```bash
cd sprint_mission_8_test
npm install
node server.js
```

브라우저에서 `http://localhost:3000`에 접속하여 Socket.IO가 정상적으로 작동하는지 확인할 수 있습니다.

## 라이센스

MIT
