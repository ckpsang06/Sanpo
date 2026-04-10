import React, { useState } from 'react';
import { ShoppingCart, Search, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { totalItems } = useCart(); // Lấy số lượng từ Context

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if(searchTerm.trim()) {
      navigate(`/?q=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate(`/`);
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black text-primary flex items-center gap-3 transform hover:scale-105 transition-transform">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">S</div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Sanpo</span>
        </Link>
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg mx-12 relative group">
          <input
            type="text"
            placeholder="Tìm kiếm thời trang xanh mát..."
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all group-hover:bg-white group-hover:shadow-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5 group-hover:text-primary transition-colors" />
          <button type="submit" className="hidden">Tím kiếm</button>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center cursor-pointer text-gray-500 hover:text-primary transition transform hover:-translate-y-1">
            <User className="w-6 h-6" />
            <span className="text-xs mt-1 font-bold hidden sm:block">Tài khoản</span>
          </div>
          <Link to="/cart" className="flex flex-col items-center cursor-pointer text-gray-500 hover:text-primary transition transform hover:-translate-y-1 group">
            <div className="relative">
              <ShoppingCart className="w-6 h-6 group-hover:animate-bounce text-gray-700 group-hover:text-primary transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-pulse">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-bold hidden sm:block text-gray-700 group-hover:text-primary">Giỏ hàng</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
