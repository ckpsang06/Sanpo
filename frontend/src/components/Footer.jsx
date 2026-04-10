import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 mt-16 border-t-4 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">S</div>
             <h3 className="text-2xl font-black text-white tracking-wide">Sanpo</h3>
          </div>
          <p className="text-sm leading-relaxed text-gray-400">Trải nghiệm mua sắm thời trang tiện lợi, đa dạng và phong cách hiện đại với tông màu xanh dương đặc trưng từ Sanpo.</p>
        </div>
        <div>
          <h4 className="text-white text-lg font-bold mb-6">Hỗ Trợ Khách Hàng</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-primary hover:pl-2 transition-all">Chính sách vận chuyển</a></li>
            <li><a href="#" className="hover:text-primary hover:pl-2 transition-all">Chính sách đổi trả</a></li>
            <li><a href="/tracking" className="hover:text-primary hover:pl-2 transition-all text-secondary font-semibold">Tra cứu đơn hàng</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-lg font-bold mb-6">Kết Nối</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center">E</span> hotro@sanpo.vn</li>
            <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center">H</span> 1900 1234</li>
            <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center">L</span> Khu công nghệ cao, TP.HCM</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-sm font-medium text-gray-500">
        &copy; 2026 Sanpo E-Commerce. Developed by Your Fullstack Architect.
      </div>
    </footer>
  );
};

export default Footer;
