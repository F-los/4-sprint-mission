# 판다마켓 실시간 알림 시스템

Express + Socket.IO를 사용한 실시간 알림 시스템 구현

## 실행 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일 내용:
```env
# Server Configuration
PORT=3000

# CORS Configuration
CORS_ORIGIN=*

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=panda_market
DB_USER=panda_user
DB_PASSWORD=panda1234

# Node Environment
NODE_ENV=development
```

### 3. PostgreSQL 데이터베이스 설정

PostgreSQL에 접속:
```bash
sudo -u postgres psql
```

데이터베이스와 유저 생성:
```sql
CREATE DATABASE panda_market;
CREATE USER panda_user WITH PASSWORD 'panda1234';
GRANT ALL PRIVILEGES ON DATABASE panda_market TO panda_user;
\c panda_market
GRANT ALL ON SCHEMA public TO panda_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO panda_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO panda_user;
\q
```

### 4. 스키마 생성
```bash
sudo -u postgres psql -d panda_market
```
```sql
\i /home/flos/codeit/sprint_mission/sprint_mission_8/schema.sql
```

테이블 소유자를 panda_user로 변경:
```sql
ALTER TABLE notifications OWNER TO panda_user;
ALTER TABLE users OWNER TO panda_user;
ALTER TABLE products OWNER TO panda_user;
ALTER TABLE posts OWNER TO panda_user;
ALTER TABLE post_comments OWNER TO panda_user;
ALTER TABLE product_comments OWNER TO panda_user;
ALTER TABLE product_likes OWNER TO panda_user;
ALTER TABLE categories OWNER TO panda_user;
ALTER TABLE boards OWNER TO panda_user;
ALTER FUNCTION notify_new_notification() OWNER TO panda_user;
ALTER FUNCTION notify_price_change() OWNER TO panda_user;
ALTER FUNCTION notify_post_comment() OWNER TO panda_user;
ALTER FUNCTION notify_product_comment() OWNER TO panda_user;
ALTER FUNCTION update_timestamp() OWNER TO panda_user;
\q
```

### 5. 테스트 데이터 생성
```bash
npm run seed
```

### 6. 서버 실행
```bash
npm start
```

### 7. 브라우저 접속
http://localhost:3000 (또는 `.env`에서 설정한 포트)

## 기능

### 실시간 알림

- 좋아요한 상품 가격 변경 시 자동 알림
- 게시글에 댓글 작성 시 작성자에게 자동 알림
- 상품에 댓글 작성 시 판매자에게 자동 알림

### UI 기능

- 사용자 선택
- 실시간 알림 수신
- 안 읽은 알림 개수 표시
- 알림 읽음 처리
- 모든 알림 읽음 처리
- 테스트 알림 생성

### Socket.IO 장점

- **자동 재연결**: 연결이 끊기면 자동으로 재연결 시도
- **Room 기능**: 사용자별 Room으로 효율적인 알림 전송
- **이벤트 기반**: 타입별 이벤트로 깔끔한 코드 구조
- **자동 JSON 변환**: 수동 파싱 불필요
- **폴백 지원**: WebSocket이 안되면 Long Polling으로 자동 전환

## 테스트 방법

### 1. 브라우저를 2개 열기

- 첫 번째 브라우저: 사용자 1 선택
- 두 번째 브라우저: 사용자 2 선택

### 2. 테스트 알림 생성

첫 번째 브라우저에서 "테스트 알림 생성" 버튼 클릭

### 3. 실제 데이터로 테스트

PostgreSQL에서 직접 댓글 작성 또는 가격 변경:

```sql
-- 상품 가격 변경 (좋아요한 사용자들에게 알림)
UPDATE products SET price = 900000 WHERE id = 1;

-- 게시글에 댓글 작성 (작성자에게 알림)
INSERT INTO post_comments (post_id, user_id, content)
VALUES (1, 2, '좋은 글이네요!');

-- 상품에 댓글 작성 (판매자에게 알림)
INSERT INTO product_comments (product_id, user_id, content)
VALUES (1, 2, '구매하고 싶습니다!');
```

## 파일 구조

```
sprint_mission_8/
├── server.js              # Express + Socket.IO 서버
├── seed.js                # 테스트 데이터 생성 스크립트
├── package.json           # 의존성 설정 (socket.io, dotenv)
├── schema.sql             # 데이터베이스 스키마
├── queries.sql            # SQL 쿼리 모음
├── .env.example           # 환경변수 예시 파일
├── .env                   # 환경변수 설정 파일 (git에서 제외)
├── public/
│   └── index.html        # 클라이언트 UI (Socket.IO 클라이언트)
└── README.md             # 이 파일
```

## 기술 스택

- **Backend**: Node.js, Express
- **WebSocket**: Socket.IO v4.7
- **Database**: PostgreSQL
- **Environment**: dotenv
- **Features**: PostgreSQL LISTEN/NOTIFY, Room 기반 알림 전송

## 환경변수 설명

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `PORT` | 서버 포트 | `3000` |
| `CORS_ORIGIN` | CORS 허용 origin | `*` |
| `DB_HOST` | PostgreSQL 호스트 | `localhost` |
| `DB_PORT` | PostgreSQL 포트 | `5432` |
| `DB_NAME` | 데이터베이스 이름 | `panda_market` |
| `DB_USER` | 데이터베이스 사용자 | `panda_user` |
| `DB_PASSWORD` | 데이터베이스 비밀번호 | `panda1234` |
| `NODE_ENV` | 실행 환경 | `development` |
