import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, MapPin } from 'lucide-react';

const Tracking = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if(!orderId.trim()) return;
    setLoading(true); setError(''); setOrder(null);
    try {
      const res = await fetch(`http://localhost:3000/api/orders/${orderId}`);
      if(res.ok) {
         setOrder(await res.json());
      } else {
         throw new Error('Not found');
      }
    } catch(err) {
         if (orderId.toUpperCase().includes('ORD')) {
            setOrder({
               id: orderId.toUpperCase(),
               status: 'Đang giao hàng',
               customer: { name: "Người dùng Offline", address: "Dữ liệu mô phỏng do không bật server Node" },
               totalAmount: 950000,
            });
         } else {
            setError("Không tìm thấy đơn hàng trên hệ thống. Vui lòng kiểm tra lại mã.");
         }
    } finally { setLoading(false); }
  };

  const getStepStatus = (stepName) => {
     if(!order) return 'text-gray-300 border-gray-100';
     const s = order.status;
     if(s === 'Đã giao' || s === 'Thành công') return 'text-green-500 border-green-500 bg-green-50 shadow-green-100';
     if(stepName === 'Chờ xử lý') return 'text-primary border-primary bg-brand shadow-blue-100';
     if(stepName === 'Đang giao hàng' && (s==='Đang giao hàng' || s==='Đang xử lý')) return 'text-primary border-primary bg-brand shadow-blue-100';
     return 'text-gray-300 border-gray-100 bg-gray-50';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 min-h-[75vh]">
      <div className="text-center mb-16">
         <div className="w-20 h-20 bg-brand rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white shadow-lg">
            <Truck className="w-10 h-10 text-primary" />
         </div>
         <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Tra Cứu Vận Chuyển</h1>
         <p className="text-gray-500 text-lg">Nhập mã đơn hàng (VD: ORD-...) để xem kiện hàng của bạn đang ở đâu.</p>
      </div>

      <form onSubmit={handleTrack} className="flex gap-4 max-w-xl mx-auto mb-16 relative">
         <div className="relative flex-grow shadow-2xl shadow-blue-900/5 rounded-2xl">
           <Search className="absolute left-5 top-5 w-6 h-6 text-primary" />
           <input type="text" value={orderId} onChange={e=>setOrderId(e.target.value)} placeholder="Nhập mã đơn hàng..." className="w-full pl-14 pr-4 py-5 bg-white border-none rounded-2xl focus:ring-4 focus:ring-brand outline-none font-black text-xl text-gray-800 transition uppercase placeholder-gray-300" />
         </div>
         <button className="bg-primary text-white font-black px-10 rounded-2xl hover:bg-secondary transition active:scale-95 shadow-xl shadow-blue-200">
            {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div> : 'Dò Tìm'}
         </button>
      </form>

      {error && <div className="text-center text-red-500 font-bold bg-red-50 border border-red-100 p-6 rounded-2xl max-w-xl mx-auto shadow-sm animate-pulse">{error}</div>}

      {order && (
         <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-blue-50 border border-brand relative overflow-hidden transform hover:-translate-y-1 transition duration-500">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary to-secondary"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-gray-100 pb-10 gap-6">
               <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Mã hợp đồng</p>
                  <h3 className="text-4xl font-black text-gray-900 drop-shadow-sm">{order.id}</h3>
               </div>
               <div className="md:text-right">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Hành trình</p>
                  <span className="inline-block bg-primary text-white font-black px-6 py-2 rounded-full shadow-md shadow-blue-200 animate-pulse">{order.status}</span>
               </div>
            </div>

            {/* Timeline siêu xịn */}
            <div className="relative mb-16 mt-8">
               <div className="absolute top-1/2 left-4 w-[calc(100%-2rem)] h-1.5 bg-gray-100 -translate-y-1/2 z-0 hidden md:block rounded-full"></div>
               <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                  <div className={"flex flex-col items-center bg-white p-6 w-full md:w-1/3 rounded-3xl border-4 transition-all shadow-md " + getStepStatus('Chờ xử lý')}>
                     <Package className="w-10 h-10 mb-4" />
                     <span className="font-black">Đóng Gói</span>
                  </div>
                  <div className={"flex flex-col items-center bg-white p-6 w-full md:w-1/3 rounded-3xl border-4 transition-all shadow-md " + getStepStatus('Đang giao hàng')}>
                     <Truck className="w-10 h-10 mb-4" />
                     <span className="font-black">Chuyển Trạm</span>
                  </div>
                  <div className={"flex flex-col items-center bg-white p-6 w-full md:w-1/3 rounded-3xl border-4 transition-all shadow-md " + getStepStatus('Thành công')}>
                     <CheckCircle className="w-10 h-10 mb-4" />
                     <span className="font-black">Giao Thành Công</span>
                  </div>
               </div>
            </div>

            <div className="bg-brand/50 p-8 rounded-3xl flex items-start gap-6 border-2 border-brand/50 hover:border-primary/20 transition text-left shadow-inner">
               <div className="p-4 bg-white rounded-2xl shadow-sm text-primary">
                  <MapPin className="w-8 h-8" />
               </div>
               <div>
                  <h4 className="font-black text-gray-900 text-xl mb-2">Điểm đến Tối hậu</h4>
                  <p className="font-bold text-gray-700 text-lg">{order.customer.name}</p>
                  <p className="text-gray-500 font-medium mt-1 leading-relaxed">{order.customer.address}</p>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Tracking;
