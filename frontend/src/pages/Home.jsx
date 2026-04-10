import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const apiUrl = searchQuery 
          ? `http://localhost:3000/api/products?q=${encodeURIComponent(searchQuery)}`
          : 'http://localhost:3000/api/products';
          
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('API down');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        // Fallback UI nếu không chạy Backend Node
        let mockData = [
          { "id": "p1", "name": "Áo Thun Sanpo Cơ Bản", "price": 250000, "category": "Áo", "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600" },
          { "id": "p2", "name": "Quần Jeans Nam Xanh Dương", "price": 450000, "category": "Quần", "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600" },
          { "id": "p3", "name": "Balo Laptop Blue", "price": 600000, "category": "Phụ kiện", "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600" },
          { "id": "p4", "name": "Giày Sneaker Sanpo", "price": 850000, "category": "Giày", "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600" }
        ];
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          mockData = mockData.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
        }
        // Giả lập network delay
        setTimeout(() => setProducts(mockData), 600);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };
    fetchProducts();
  }, [searchQuery]);

  return (
    <div className="bg-brand/30 min-h-screen">
      {/* Hero Banner */}
      {!searchQuery && (
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-24 px-4 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
             {/* Abstract Shapes */}
             <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white blur-3xl"></div>
             <div className="absolute top-40 -left-20 w-64 h-64 rounded-full bg-blue-300 blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-blue-50 font-semibold tracking-wider text-sm border border-white/30 backdrop-blur-md">COLLECTION 2026</span>
              <h1 className="text-4xl md:text-6xl font-black leading-tight drop-shadow-md">
                Phong Cách Mới, <br/> Khí Chất Tiên Phong
              </h1>
              <p className="text-lg text-blue-100 max-w-lg mx-auto md:mx-0">
                Khám phá bộ sưu tập thời trang đặc biệt với nét chấm phá màu xanh dương rực rỡ và kiểu dáng cực kỳ bắt mắt từ Sanpo.
              </p>
              <button className="bg-white text-primary font-black py-4 px-10 rounded-full shadow-xl hover:bg-gray-50 transition transform hover:-translate-y-1 hover:shadow-2xl">
                Mua Sắm Ngay
              </button>
            </div>
            <div className="flex-1">
              <img 
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&auto=format&fit=crop&q=80" 
                alt="Banner Thời trang" 
                className="rounded-3xl shadow-2xl border-4 border-white/20 transform rotate-2 hover:rotate-0 transition duration-500"
              />
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900">
              {searchQuery ? `Từ khóa tìm kiếm: "${searchQuery}"` : 'SẢN PHẨM NỔI BẬT'}
            </h2>
            <div className="h-1 w-20 bg-primary mt-4 rounded-full"></div>
            <p className="text-gray-500 mt-4 font-medium">
              {products.length} sản phẩm được hiển thị
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 mt-10">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary border-t-transparent shadow-xl"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.length > 0 ? (
              products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-blue-200">
                <p className="text-gray-500 text-lg font-medium">Lấy làm tiếc! Không tìm thấy sản phẩm nào phù hợp yêu cầu.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
