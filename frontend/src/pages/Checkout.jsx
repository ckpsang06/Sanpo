import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  if (cart.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = { customer: formData, items: cart, totalAmount: totalPrice };
      
      let response;
      try {
         response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
         });
      } catch (err) {
         console.warn("Backend local server is offline. Simulating checkout success...");
      }

      const generatedId = (response && response.ok) ? (await response.json()).orderId : `ORD-${Date.now().toString().slice(-6)}`;
      
      setOrderId(generatedId);
      setSuccess(true);
      clearCart();
    } catch (err) {
      alert("Đã có lỗi xảy ra khi xử lý đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-8 animate-bounce" />
        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Đặt hàng thành công!</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">Chúng tôi đã tiếp nhận đơn hàng của bạn. Sanpo sẽ liên hệ để giao hàng sớm nhất.</p>
        <div className="bg-brand border-2 border-primary/20 py-4 px-8 rounded-3xl inline-block mb-10 shadow-sm">
          <p className="text-gray-600 mb-1 font-medium">Mã theo dõi đơn hàng:</p>
          <p className="text-2xl font-black text-primary tracking-widest">{orderId}</p>
        </div>
        <div>
          <Link to="/" className="bg-gray-900 text-white font-bold py-4 px-10 rounded-full hover:bg-gray-800 transition-all shadow-xl hover:-translate-y-1 inline-block">
            Quay về Trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/cart" className="flex items-center gap-2 text-gray-500 hover:text-primary transition font-semibold mb-8 inline-flex">
         <ArrowLeft className="w-4 h-4" /> Quay lại Giỏ hàng
      </Link>
      <h1 className="text-3xl font-black text-gray-900 mb-10">Tiến hành Thanh Toán</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-grow">
          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
               <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">1</span> 
               Thông tin giao hàng
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Họ và Tên</label>
                <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full px-5 py-4 bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand focus:border-primary transition-all outline-none" placeholder="Nhập tên người nhận..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Điện thoại</label>
                   <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full px-5 py-4 bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand focus:border-primary transition-all outline-none" placeholder="Ví dụ: 0912..." />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email (Không bắt buộc)</label>
                   <input type="email" className="w-full px-5 py-4 bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand focus:border-primary transition-all outline-none" placeholder="Email nhận hóa đơn" />
                 </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Khu vực Giao hàng</label>
                <textarea required name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full px-5 py-4 bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand focus:border-primary transition-all outline-none placeholder-gray-400" placeholder="Số nhà, đường, Phường/Xã, Quận/Huyện..."></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl hover:bg-primary transition-all shadow-xl hover:shadow-blue-300/50 mt-8 flex justify-center items-center group active:scale-95"
              >
                {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent border-solid rounded-full animate-spin"></div> : "XÁC NHẬN MUA HÀNG"}
              </button>
            </form>
          </div>
        </div>

        <div className="w-full lg:w-[420px]">
          <div className="bg-brand/50 p-8 rounded-3xl border border-blue-100 sticky top-28 backdrop-blur-sm">
             <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center justify-between">
                Tóm tắt đơn hàng 
                <span className="bg-primary text-white text-xs py-1 px-3 rounded-full">{cart.reduce((sum, item) => sum + item.quantity, 0)} món</span>
             </h3>
             <div className="space-y-4 mb-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-50">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                    <div className="flex-1">
                       <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                       <p className="text-xs font-semibold text-gray-400 mt-1">SL: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-black text-primary">
                       {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="pt-6 border-t border-blue-200">
               <div className="flex justify-between text-gray-600 mb-3 font-medium">
                 <span>Tiền hàng</span>
                 <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</span>
               </div>
               <div className="flex justify-between text-gray-600 mb-6 font-medium">
                 <span>Phí giao hàng</span>
                 <span>0 ₫</span>
               </div>
               <div className="flex justify-between text-2xl font-black text-gray-900 bg-white p-5 rounded-2xl shadow-inner border border-gray-100">
                 <span>Tổng tiền</span>
                 <span className="text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
