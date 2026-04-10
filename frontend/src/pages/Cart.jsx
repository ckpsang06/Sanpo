import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center">
        <div className="w-32 h-32 bg-blue-50/50 rounded-full flex items-center justify-center mb-8 shadow-inner border border-blue-100">
           <ShoppingBag className="w-16 h-16 text-primary/50" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Giỏ hàng rỗng</h2>
        <p className="text-gray-500 mb-10 max-w-sm mx-auto">Chưa có sản phẩm nào trong giỏ. Hãy dạo quanh cửa hàng để tìm cho mình món đồ ưng ý nhất nhé!</p>
        <Link to="/" className="bg-primary text-white font-bold py-4 px-10 rounded-full hover:bg-secondary hover:-translate-y-1 transition-all shadow-xl hover:shadow-blue-300">
          Khám Phá Ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-10">Giỏ Hàng Của Bạn</h1>
      
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-grow space-y-6">
          {cart.map(item => (
            <div key={item.id} className="group flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-blue-50 items-center">
              <img src={item.image} alt={item.name} className="w-full sm:w-28 h-28 object-cover rounded-2xl border border-gray-100 group-hover:scale-105 transition-transform" />
              <div className="flex-grow text-center sm:text-left">
                <Link to={`/product/${item.id}`} className="text-lg font-bold text-gray-900 hover:text-primary transition-colors">{item.name}</Link>
                <div className="text-primary font-black mt-1 text-xl">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-200 shadow-sm">
                <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-white hover:text-primary rounded-xl transition-all shadow-sm active:scale-95"><Minus className="w-4 h-4" /></button>
                <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-white hover:text-primary rounded-xl transition-all shadow-sm active:scale-95"><Plus className="w-4 h-4" /></button>
              </div>

              <div className="w-full sm:w-32 text-center sm:text-right font-black text-gray-900 text-lg">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
              </div>

               <button onClick={() => removeFromCart(item.id)} className="p-3 text-red-400 hover:text-red-600 transition-all bg-red-50 hover:bg-red-100 rounded-2xl sm:ml-4 group-hover:rotate-12">
                  <Trash2 className="w-5 h-5" />
               </button>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-96">
          <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-brand sticky top-28 bg-gradient-to-b from-white to-blue-50/20">
            <h3 className="text-xl font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">Tổng Đơn Hàng</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Tạm tính ({cart.reduce((sum, item) => sum + item.quantity, 0)} món)</span>
                <span className="font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Phí vận chuyển</span>
                <span className="text-secondary font-bold">Miễn phí</span>
              </div>
            </div>
            
            <div className="flex justify-between text-2xl font-black text-gray-900 border-t border-gray-200 pt-6 mb-8">
              <span>Tổng cộng</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</span>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-black py-4 rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-blue-300/50 flex items-center justify-center gap-2 group"
            >
              Tiến hành Thanh toán
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
