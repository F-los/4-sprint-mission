'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productAPI, authAPI } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  price: number;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 토큰이 있으면 사용자 정보 로드
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userResponse = await authAPI.getProfile();
          setUser(userResponse.data);
        } catch (error) {
          console.log('사용자 정보 로드 실패:', error);
        }
      }

      // 상품 목록 로드
      const productsResponse = await productAPI.getAll({ limit: 10 });
      setProducts(productsResponse.data);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (productId: number) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      await productAPI.toggleLike(productId);
      // 상품 목록 새로고침
      const response = await productAPI.getAll({ limit: 10 });
      setProducts(response.data);
    } catch (error) {
      console.error('좋아요 실패:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Sprint Mission 4 테스트</h1>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">안녕하세요, {user.nickname}님!</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="space-x-2">
                  <Link
                    href="/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🛍️ 상품 목록</h2>
            <p className="text-gray-600 mb-6">
              백엔드 API와 연결된 상품 목록입니다. 좋아요 기능을 테스트해보세요!
            </p>

            {/* API 연결 상태 */}
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <p className="font-bold">✅ 백엔드 연결 성공!</p>
              <p>총 {products.length}개 상품이 로드되었습니다.</p>
            </div>
          </div>

          {/* 상품 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    {product.price.toLocaleString()}원
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>💬 {product.commentCount}</span>
                      <span>❤️ {product.likeCount}</span>
                    </div>
                    
                    <button
                      onClick={() => handleLike(product.id)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        product.isLiked
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      disabled={!user}
                    >
                      {product.isLiked ? '❤️ 좋아요 취소' : '🤍 좋아요'}
                    </button>
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-400">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 빈 상태 */}
          {products.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">상품이 없습니다.</div>
              <p className="text-gray-400">
                백엔드에서 테스트 상품을 추가해보세요!
              </p>
            </div>
          )}

          {/* 기능 테스트 안내 */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">🧪 테스트 가능한 기능</h3>
            <ul className="space-y-2 text-blue-800">
              <li>✅ 회원가입 / 로그인</li>
              <li>✅ JWT 토큰 인증</li>
              <li>✅ 상품 목록 조회</li>
              <li>✅ 상품 좋아요 / 취소</li>
              <li>✅ 자동 토큰 갱신 (Refresh Token)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}