'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Script from 'next/script';

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin, register, isAuthenticated, isLoading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/profile');
    }
  }, [isAuthenticated, authLoading, router]);

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleCallback = async (response: any) => {
    try {
      const res = await googleLogin(response.credential);
      if (res.success) {
        router.push('/profile');
      } else {
        setErrorMessage(res.message || 'Đăng nhập Google thất bại');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Đăng nhập Google thất bại');
    }
  };

  const initGoogleBtn = () => {
    const googleBtnContainer = document.getElementById('google-btn-container');
    if (!googleBtnContainer || !(window as any).google) return;
    
    googleBtnContainer.innerHTML = '';
    
    const clientId = '353464933030-gs4nius9ik1kikb6meq9acigl5kju766.apps.googleusercontent.com';
    (window as any).google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCallback
    });
    
    (window as any).google.accounts.id.renderButton(
      googleBtnContainer,
      { theme: 'outline', size: 'large', type: 'standard' }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const res = await login({ phoneOrEmail: phone, password });
        if (res.success) {
          if (phone.includes('admin') || phone === '0909000999' || phone.includes('closet.vn')) {
            router.push('/admin');
          } else {
            router.push('/profile');
          }
        } else {
          setErrorMessage(res.message || 'Đăng nhập không thành công');
        }
      } else {
        if (password !== confirmPassword) {
          setErrorMessage('Mật khẩu xác nhận không khớp');
          setIsLoading(false);
          return;
        }

        const res = await register({ full_name: fullName, phone, password });
        if (res.success) {
          router.push('/profile');
        } else {
          setErrorMessage(res.message || 'Đăng ký không thành công');
        }
      }
    } catch (err: any) {
      setErrorMessage('Đã xảy ra lỗi khi xử lý. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex bg-white overflow-hidden font-sans">
      {/* Left side */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-700 to-indigo-600 relative items-center justify-center overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 text-center px-12">
          <Link href="/" className="inline-block mb-8">
            <h1 className="text-5xl font-black text-white tracking-tight">CLOSET.</h1>
          </Link>
          <div className="space-y-6 text-indigo-100">
            <p className="text-2xl font-light italic leading-relaxed">
              "Thời trang không chỉ là quần áo. Nó là cách bạn thể hiện bản thân với thế giới."
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="w-12 h-px bg-indigo-300"></span>
              <span className="text-sm font-semibold tracking-widest uppercase">Premium Collection</span>
              <span className="w-12 h-px bg-indigo-300"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 overflow-y-auto bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative">
          
          <Link href="/" className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </Link>

          {/* Tabs */}
          <div className="flex mb-8 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Đăng ký
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {activeTab === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <i className="fa-regular fa-user"></i>
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-slate-800"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại / Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="fa-solid fa-phone"></i>
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-slate-800"
                  placeholder="0987654321 hoặc admin@closet.vn"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
                {activeTab === 'login' && (
                  <Link href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                    Quên mật khẩu?
                  </Link>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="fa-solid fa-lock"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-slate-800"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600">
                  <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {activeTab === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Xác nhận mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <i className="fa-solid fa-lock"></i>
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-slate-800"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600">
                    <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-600/20 cursor-pointer">
              {isLoading ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : (
                <span>{activeTab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</span>
              )}
            </button>


          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">Hoặc tiếp tục với</span>
            </div>
          </div>

          <div className="mt-6 w-full flex items-center justify-center min-h-[44px]">
            <div id="google-btn-container"></div>
          </div>
        </div>
      </div>
      <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" onLoad={initGoogleBtn} />
    </div>
  );
}
