/*
  다음 경우들에 대해 총 14개의 SQL 쿼리를 작성해 주세요.
  예시로 값이 필요한 경우 적당한 값으로 채워넣어서 작성하면 됩니다. 
*/

/*
  1. 내 정보 업데이트 하기
  - 닉네임을 "test"로 업데이트
  - 현재 로그인한 유저 id가 1이라고 가정
*/
UPDATE users
SET nickname = 'test'
WHERE id = 1;


/*
  2. 내가 생성한 상품 조회
  - 현재 로그인한 유저 id가 1이라고 가정
  - 최신 순으로 정렬
  - 10개씩 페이지네이션, 3번째 페이지
*/
SELECT *
FROM products
WHERE owner_id = 1
ORDER BY created_at DESC
LIMIT 10 OFFSET 20;


/*
  3. 내가 생성한 상품의 총 개수
  - 현재 로그인한 유저 id가 1이라고 가정
*/
SELECT COUNT(*) as total_count
FROM products
WHERE owner_id = 1;


/*
  4. 내가 좋아요 누른 상품 조회
  - 현재 로그인한 유저 id가 1이라고 가정
  - 최신 순으로 정렬
  - 10개씩 페이지네이션, 3번째 페이지
*/
SELECT p.*
FROM products p
INNER JOIN product_likes pl ON p.id = pl.product_id
WHERE pl.user_id = 1
ORDER BY pl.created_at DESC
LIMIT 10 OFFSET 20;


/*
  5. 내가 좋아요 누른 상품의 총 개수
  - 현재 로그인한 유저 id가 1이라고 가정
*/
SELECT COUNT(*) as total_count
FROM product_likes
WHERE user_id = 1;


/*
  6. 상품 생성
  - 현재 로그인한 유저 id가 1이라고 가정
*/
INSERT INTO products (name, description, price, image_url, owner_id)
VALUES ('MacBook Pro', 'M3 Max 칩 탑재 16인치 노트북', 3500000, 'https://example.com/macbook.jpg', 1);


/*
  7. 상품 목록 조회
  - 상품명에 "test"가 포함된 상품 검색
  - 최신 순으로 정렬
  - 10개씩 페이지네이션, 1번째 페이지
  - 각 상품의 좋아요 개수를 포함해서 조회하기
*/
SELECT p.*, COUNT(pl.id) as like_count
FROM products p
LEFT JOIN product_likes pl ON p.id = pl.product_id
WHERE p.name LIKE '%test%'
GROUP BY p.id
ORDER BY p.created_at DESC
LIMIT 10 OFFSET 0;


/*
  8. 상품 상세 조회
  - 1번 상품 조회
*/
SELECT p.*, u.nickname as owner_nickname, COUNT(pl.id) as like_count
FROM products p
INNER JOIN users u ON p.owner_id = u.id
LEFT JOIN product_likes pl ON p.id = pl.product_id
WHERE p.id = 1
GROUP BY p.id;


/*
  9. 상품 정보 수정
  - 1번 상품 수정
*/
UPDATE products
SET name = 'Updated Product Name',
    description = 'Updated product description',
    price = 50000
WHERE id = 1;


/*
  10. 상품 삭제
  - 1번 상품 삭제
*/
DELETE FROM products
WHERE id = 1;


/*
  11. 상품 좋아요
  - 1번 유저가 2번 상품 좋아요
*/
INSERT INTO product_likes (user_id, product_id)
VALUES (1, 2);


/*
  12. 상품 좋아요 취소
  - 1번 유저가 2번 상품 좋아요 취소
*/
DELETE FROM product_likes
WHERE user_id = 1 AND product_id = 2;


/*
  13. 상품 댓글 작성
  - 1번 유저가 2번 상품에 댓글 작성
*/
INSERT INTO product_comments (content, user_id, product_id)
VALUES ('정말 좋은 상품이네요! 구매하고 싶습니다.', 1, 2);


/*
  14. 상품 댓글 조회
  - 1번 상품에 달린 댓글 목록 조회
  - 최신 순으로 정렬
  - 댓글 날짜 2025-03-25 기준일을 제외한 이전 데이터 10개
*/
SELECT pc.*, u.nickname as author_nickname
FROM product_comments pc
INNER JOIN users u ON pc.user_id = u.id
WHERE pc.product_id = 1
  AND pc.created_at < '2025-03-25'
ORDER BY pc.created_at DESC
LIMIT 10;
