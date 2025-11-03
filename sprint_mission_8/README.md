# 판다마켓 실시간 알림 시스템

Express + WebSocket(ws)을 사용한 실시간 알림 시스템 구현

## 실행 방법

### 1. 의존성 설치

```bash
npm i
```

### 2. 데이터베이스 설정

schema.sql을 실행하여 notifications 테이블과 트리거를 생성합니다.

```bash
psql -U postgres -d panda_market -f schema.sql
```

### 3. 서버 설정 수정

server.js 파일에서 PostgreSQL 연결 정보를 수정하세요:

```javascript
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'panda_market',
  user: 'postgres',
  password: 'postgres', // 실제 비밀번호로 변경
});
```

### 4. 서버 실행

```bash
npm start
```

### 5. 브라우저 접속

http://localhost:3000

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
├── server.js              # Express + WebSocket 서버
├── package.json           # 의존성 설정
├── schema.sql             # 데이터베이스 스키마
├── queries.sql            # SQL 쿼리 모음
├── public/
│   └── index.html        # 클라이언트 UI
└── README.md             # 이 파일
```
