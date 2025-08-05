// src/middlewares/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (res.headersSent) {
    return next(err);
  }

  // Multer 파일 필터 오류
  if (err instanceof Error && err.message.includes('Only jpeg/png images')) {
    return res.status(400).json({ error: err.message });
  }

  // Prisma에서 not found 오류
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found' });
  }

  // 기본 서버 오류 처리
  res.status(500).json({ error: 'Internal Server Error' });
};
