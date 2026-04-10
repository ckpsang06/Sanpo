import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart, ArrowLeft, Send } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const prodRes = await fetch(`http://localhost:3000/api/products/${id}`);
        if(prodRes.ok) setProduct(await prodRes.json());
        
        const revRes = await fetch(`http://localhost:3000/api/reviews/${id}`);
        if(revRes.ok) setReviews(await revRes.json());
      } catch (err) {
         setProduct({ id, name: "Sản phẩm Mẫu Hệ Thống", price: 450000, description: "Chi tiết mô tả sản phẩm mẫu cho hệ thống lúc offline/không bật nodejs.", category: "Mẫu", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800" });
         setReviews([{ id:'1', userName: "Người kiểm thử", rating: 5, comment: "Trang web thiết kế quá xuất sắc!" }]);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleAddCart = () => {
    if(product) addToCart(product);
    setAdding(true);
    setTimeout(() => setAdding(false), 1500);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const payload = { productId: id, userName: reviewName, rating: reviewRating, comment: reviewComment };
    try {
      const res = await fetch(`http://localhost:3000/api/reviews`, {
         method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if(res.ok){
         setReviews([...reviews, await res.json()]);
      }
    } catch(err) {
      setReviews([...reviews, { ...payload, id: Date.now().toString()}]);
    }
    setReviewName(''); setReviewComment(''); setReviewRating(5);
  };

  if (loading) return <div className="py-32 flex justify-center"><div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full shadow-lg"></div></div>;
  if (!product) return <div className="py-32 text-center text-xl font-bold">Không tìm thấy sản phẩm.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 font-bold transition-all hover:-translate-x-2">
        <ArrowLeft className="w-5 h-5"/> Mua sắm tiếp
      </Link>

      <div className="flex flex-col md:flex-row gap-12 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-brand mb-12">
        <div className="md:w-1/2 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 relative group">
          <img src={product.image} alt={product.name} className="w-full h-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
        <div className="md:w-1/2 flex flex-col justify-center">
          <span className="text-secondary font-black uppercase tracking-widest text-sm mb-3 bg-secondary/10 inline-block w-fit px-4 py-1.5 rounded-full">{product.category}</span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-5 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-2 mb-8 text-yellow-400 bg-gray-50 p-3 rounded-2xl w-fit">
            {[...Array(5)].map((_, i) => <Starey key={i} className="w-5 h-5 fill-current"/>)}
            <span className="text-gray-600 text-sm ml-2 font-bold">{reviews.length} Feedbacks</span>
          </div>
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-8">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
          </div>
          <p className="text-gray-600 mb-10 leading-relaxed text-lg font-medium">{product.description}</p>
          <button 
            onClick={handleAddCart}
            className={`w-full md:w-fit px-12 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl text-lg ${adding ? 'bg-green-500 shadow-green-200 text-white' : 'bg-primary text-white hover:bg-secondary hover:-translate-y-1 hover:shadow-blue-300 active:scale-95'}`}
          >
            <ShoppingCart className="w-6 h-6" /> {adding ? 'Đã thêm thành công!' : 'Thêm vào Giỏ Hàng'}
          </button>
        </div>
      </div>

      <div className="bg-brand/40 rounded-3xl p-8 md:p-12 border border-blue-50 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
         <h2 className="text-3xl font-black text-gray-900 mb-10 relative z-10 flex items-center gap-4">Đánh giá Sản phẩm <span className="text-sm font-bold bg-white text-primary px-4 py-1 rounded-full shadow-sm">{reviews.length} đánh giá</span></h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
               {reviews.length === 0 ? <p className="text-gray-500 font-semibold bg-white p-6 rounded-2xl">Chưa có đánh giá nào, hãy là người tiên phong!</p> : 
                  reviews.map(r => (
                     <div key={r.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-3">
                           <span className="font-bold text-gray-900 text-lg flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">{r.userName.charAt(0)}</div> {r.userName}</span>
                           <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => <Starey key={i} className={`w-4 h-4 ${i<r.rating ? 'fill-current':'text-gray-200'}`} />)}
                           </div>
                        </div>
                        <p className="text-gray-600 font-medium pl-10">{r.comment}</p>
                     </div>
                  ))
               }
            </div>
            
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 h-fit">
               <h3 className="font-black text-2xl mb-8 text-gray-900">Gửi Cảm nhận</h3>
               <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <input required type="text" placeholder="Tên của bạn" value={reviewName} onChange={e=>setReviewName(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand outline-none transition font-semibold" />
                  <div className="flex flex-col gap-3">
                     <span className="text-gray-900 font-bold ml-1">Chất lượng Sản phẩm:</span>
                     <select value={reviewRating} onChange={e=>setReviewRating(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-brand font-bold text-primary">
                        <option value="5">⭐⭐⭐⭐⭐ 5 Sao - Đỉnh Khao!</option>
                        <option value="4">⭐⭐⭐⭐ 4 Sao - Khá Tốt</option>
                        <option value="3">⭐⭐⭐ 3 Sao - Tạm Ổn</option>
                     </select>
                  </div>
                  <textarea required placeholder="Sản phẩm mặc mát không? Thiết kế đẹp không..." rows="4" value={reviewComment} onChange={e=>setReviewComment(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand outline-none transition font-medium"></textarea>
                  <button type="submit" className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-primary flex justify-center items-center gap-2 shadow-lg hover:-translate-y-1 transition active:scale-95">
                     <Send className="w-5 h-5"/> Gửi Lên Hệ Thống
                  </button>
               </form>
            </div>
         </div>
      </div>
    </div>
  );
};
const Starey = Star;
export default ProductDetail;
