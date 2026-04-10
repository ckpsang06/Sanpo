import React, { useState } from 'react';
import { ShoppingCart, Star, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col h-full relative">
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-100 block">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm text-primary uppercase tracking-wider">
          {product.category}
        </div>
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
      </Link>
      
      <div className="p-6 flex flex-col flex-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2 text-lg leading-tight mb-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center text-yellow-400 text-sm mb-4">
          {[1,2,3,4,5].map(i => (
             <Starey key={i} className={`w-4 h-4 ${i===5?"text-gray-300":"fill-current"}`} />
          ))}
          <span className="text-gray-500 ml-2 text-xs font-semibold">(Đánh giá)</span>
        </div>
        
        <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-4">
          <div>
            <span className="text-xs text-secondary font-bold uppercase tracking-wider block mb-1">Giá bán</span>
            <span className="text-xl font-black text-gray-900">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
            </span>
          </div>
          
          {/* Nút bấm mua rực rỡ */}
          <button 
            onClick={handleAddToCart}
            className={`p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center relative active:scale-90 ${added ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-brand text-primary hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-white group-hover:scale-110 hover:shadow-blue-300'}`}
            aria-label="Thêm vào giỏ"
            title="Thêm vào Giỏ hàng"
          >
            {added ? <Check className="w-5 h-5 animate-[ping_0.5s_ease-out]" /> : <ShoppingCart className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

// Hack fix for icon map loop
const Starey = Star;

export default ProductCard;
