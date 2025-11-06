'use client';

import { useAuth } from '@/hooks/useAuth';
import FormInput from '@/components/ui/FormInput';

export default function Login() {
  const { 
    loginForm, 
    loginLoading, 
    loginError, 
    updateLoginForm, 
    handleLoginSubmit 
  } = useAuth();

  return (
    <div className="relative h-screen overflow-hidden flex items-center justify-center">
      {/* Background xoay và phóng to */}
      <div className="absolute inset-0 bg-[url('/loginBackground.png')] bg-cover bg-center transform -rotate-12 scale-135"></div>

      {/* Overlay gradient radial */}
      <div className="absolute inset-0 bg-blue-500 opacity-100 mix-blend-overlay"></div>

      {/* Overlay gradient radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_center,transparent_0%,transparent_40%,#333333_85%,#333333_100%)]"></div>

      {/* Overlay gradient radial */}
      <div className="absolute inset-0 bg-white opacity-80 mix-blend-hard-light"></div>

      {/* Nội dung đăng nhập */}
      <div className="relative max-w-106 w-full space-y-6 p-8 bg-white border border-gray-200 rounded-xl shadow-lg">
        {/* Logo */}
        <div className="text-center">
          <div className="bg-sky-50 border border-blue-100 shadow-md w-fit mx-auto rounded-xl px-3.5 py-2.5 mb-3">
            <img
              className="mx-auto h-10 w-auto mb-0.5"
              src="/LogoNoBrand.png"
              alt="POPRCM Admin"
            />
            <div className="text-center text-[12px] font-extrabold tracking-wider text-indigo-950">POPRCM</div>
            <div className="text-center text-[8px] font-bold saturate-70 tracking-wide text-blue-600 mt-[-4]">Movies for you</div>
          </div>
          <h2 className="mt-1 text-center text-xl font-bold text-blue-800">
            Đăng nhập hệ thống
          </h2>
          <p className="mt-1 text-center text-[12px] text-gray-600">
            Chỉ dành cho quản trị viên
          </p>
        </div>

        {/* Form đăng nhập */}
        <form className="mt-5 space-y-5" onSubmit={handleLoginSubmit}>
          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {loginError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <FormInput
                id="email"
                name="email"
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => updateLoginForm('email', e.target.value)}
                placeholder="admin@poprcm.com"
                className='py-2 text-md'
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <FormInput
                id="password"
                name="password"
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => updateLoginForm('password', e.target.value)}
                placeholder="••••••••"
                className='py-2 text-md'
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loginLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white ${
                loginLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              } transition-colors`}
            >
              {loginLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Demo: admin@poprcm.com / admin123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}