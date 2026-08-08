export class AuthModal {
  private static instance: AuthModal | null = null;
  private step: 'phone' | 'otp' = 'phone';
  private phoneNumber: string = '';
  private countdownTimer: any = null;
  private countdownValue: number = 0;

  private constructor() {
    this.createWrapper();
  }

  public static getInstance(): AuthModal {
    if (!AuthModal.instance) {
      AuthModal.instance = new AuthModal();
    }
    return AuthModal.instance;
  }

  private createWrapper() {
    if (!document.getElementById('auth-modal-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.id = 'auth-modal-wrapper';
      wrapper.className = 'fixed inset-0 z-[9999] hidden flex items-center justify-center p-4 sm:p-6';
      
      const backdrop = document.createElement('div');
      backdrop.className = 'absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity opacity-0';
      backdrop.id = 'auth-modal-backdrop';
      backdrop.onclick = () => this.hide();
      
      const container = document.createElement('div');
      container.id = 'auth-modal-container';
      container.className = 'relative bg-white w-full max-w-[340px] rounded-3xl shadow-2xl overflow-hidden transform scale-95 opacity-0 transition-all duration-300';
      
      wrapper.appendChild(backdrop);
      wrapper.appendChild(container);
      document.body.appendChild(wrapper);
    }
  }

  public show() {
    this.step = 'phone';
    this.phoneNumber = '';
    this.stopCountdown();
    this.render();
    
    const wrapper = document.getElementById('auth-modal-wrapper');
    const backdrop = document.getElementById('auth-modal-backdrop');
    const container = document.getElementById('auth-modal-container');
    
    if (wrapper && backdrop && container) {
      wrapper.classList.remove('hidden');
      setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        backdrop.classList.add('opacity-100');
        container.classList.remove('scale-95', 'opacity-0');
        container.classList.add('scale-100', 'opacity-100');
      }, 10);
    }
  }

  public hide() {
    this.stopCountdown();
    const wrapper = document.getElementById('auth-modal-wrapper');
    const backdrop = document.getElementById('auth-modal-backdrop');
    const container = document.getElementById('auth-modal-container');
    
    if (wrapper && backdrop && container) {
      backdrop.classList.remove('opacity-100');
      backdrop.classList.add('opacity-0');
      container.classList.remove('scale-100', 'opacity-100');
      container.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        wrapper.classList.add('hidden');
      }, 300);
    }
  }

  private render() {
    const container = document.getElementById('auth-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="relative pt-8 px-6 pb-5 border-b border-slate-100 bg-white text-center">
        ${this.step === 'otp' ? `
          <button id="btn-back-step" class="absolute top-4 left-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
        ` : ''}
        <button id="btn-close-modal" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
          <i class="fa-solid fa-xmark"></i>
        </button>
        
        <h2 class="text-xl font-black text-slate-900 font-serif tracking-tight">Đăng nhập</h2>
        <p class="text-xs text-slate-500 mt-1">
          ${this.step === 'phone' ? 'Nhập số điện thoại để tiếp tục' : `Mã OTP đã được gửi đến <span class="font-bold text-slate-900">${this.phoneNumber}</span>`}
        </p>
      </div>

      <div class="px-6 py-8 bg-slate-50">
        ${this.step === 'phone' ? this.phoneTemplate() : this.otpTemplate()}
      </div>
    `;

    this.bindEvents();
    if (this.step === 'phone') {
      this.loadGoogleSDK();
    }
  }

  private phoneTemplate(): string {
    return `
      <form id="auth-form-phone" class="space-y-3 mb-4">
        <div>
          <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Số điện thoại</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <i class="fa-solid fa-phone text-slate-400 text-xs"></i>
            </div>
            <input type="tel" id="auth_phone" value="${this.phoneNumber}" required placeholder="Nhập số điện thoại..." class="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2a83e9] focus:ring-1 focus:ring-[#2a83e9] transition-all">
          </div>
        </div>

        <button type="submit" id="btn-submit-phone" class="w-full bg-[#2a83e9] text-white py-3 rounded-xl font-black uppercase tracking-wider text-[13px] hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 mt-1">
          Tiếp tục
        </button>
        <p id="auth-msg-phone" class="text-[11px] font-bold text-red-500 text-center hidden mt-1.5"></p>
      </form>

      <div class="relative flex items-center justify-center mb-4">
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
        <span class="relative bg-slate-50 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hoặc</span>
      </div>

      <div id="google-btn-container" class="flex justify-center min-h-[40px]">
        <!-- Google Sign-In Button will be rendered here -->
      </div>
    `;
  }

  private otpTemplate(): string {
    return `
      <form id="auth-form-otp" class="space-y-3 mb-4">
        <div>
          <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mã OTP (6 số)</label>
          <div class="flex gap-2">
            <input type="text" id="auth_otp" required placeholder="000000" maxlength="6" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xl tracking-[0.5em] text-center font-bold focus:outline-none focus:border-[#2a83e9] focus:ring-1 focus:ring-[#2a83e9] transition-all">
          </div>
          <div class="flex justify-end mt-1.5">
            <a href="javascript:void(0)" id="btn-resend-otp" class="text-[11px] font-bold text-[#2a83e9] hover:text-blue-700 pointer-events-none opacity-50">Gửi lại mã (30s)</a>
          </div>
        </div>

        <button type="submit" id="btn-submit-otp" class="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase tracking-wider text-[13px] hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 mt-1">
          Xác nhận OTP
        </button>
        <p id="auth-msg-otp" class="text-[11px] font-bold text-red-500 text-center hidden mt-1.5"></p>
      </form>
    `;
  }

  private loadGoogleSDK() {
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-gsi-script';
      script.async = true;
      script.defer = true;
      script.onload = () => this.initGoogleBtn();
      document.head.appendChild(script);
    } else if ((window as any).google) {
      this.initGoogleBtn();
    }
  }

  private initGoogleBtn() {
    const googleBtnContainer = document.getElementById('google-btn-container');
    if (!googleBtnContainer || !(window as any).google) return;
    
    googleBtnContainer.innerHTML = '';
    
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1043320299624-mock-client-id.apps.googleusercontent.com';
    (window as any).google.accounts.id.initialize({
      client_id: clientId,
      callback: this.handleGoogleCallback.bind(this)
    });
    
    (window as any).google.accounts.id.renderButton(
      googleBtnContainer,
      { theme: 'outline', size: 'large', width: 292 }
    );
  }

  private async handleGoogleCallback(response: any) {
    try {
      const res = await fetch("http://localhost:3000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Đăng nhập Google thất bại");
      
      localStorage.setItem("token", data.token);
      this.hide();
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  }

  private startCountdown() {
    this.stopCountdown();
    this.countdownValue = 30;
    this.updateResendBtn();
    
    this.countdownTimer = setInterval(() => {
      this.countdownValue--;
      this.updateResendBtn();
      if (this.countdownValue <= 0) {
        this.stopCountdown();
      }
    }, 1000);
  }

  private stopCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.countdownValue = 0;
    this.updateResendBtn();
  }

  private updateResendBtn() {
    const btn = document.getElementById('btn-resend-otp') as HTMLAnchorElement;
    if (!btn) return;

    if (this.countdownValue > 0) {
      btn.textContent = `Gửi lại mã (${this.countdownValue}s)`;
      btn.classList.add('pointer-events-none', 'opacity-50');
    } else {
      btn.textContent = 'Gửi lại mã';
      btn.classList.remove('pointer-events-none', 'opacity-50');
    }
  }

  private async handleSendOtp(phone: string, msgEl: HTMLElement, btnEl: HTMLButtonElement | HTMLAnchorElement) {
    const isResend = btnEl.tagName === 'A';
    const oldText = isResend ? btnEl.textContent : btnEl.innerHTML;
    
    if (!isResend) {
      (btnEl as HTMLButtonElement).disabled = true;
      btnEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
    }
    msgEl.classList.add('hidden');

    try {
      const res = await fetch("http://localhost:3000/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Gửi OTP thất bại");
      
      alert(`Mã OTP của bạn là: ${data.otp}`);
      
      this.phoneNumber = phone;
      this.step = 'otp';
      if (!isResend) {
        this.render();
      }
      this.startCountdown();
    } catch (err: any) {
      msgEl.textContent = err.message;
      msgEl.classList.remove('hidden');
      if (isResend) {
        alert(err.message);
      }
    } finally {
      if (!isResend) {
        (btnEl as HTMLButtonElement).disabled = false;
        btnEl.innerHTML = oldText as string;
      }
    }
  }

  private bindEvents() {
    document.getElementById('btn-close-modal')?.addEventListener('click', () => this.hide());
    document.getElementById('btn-back-step')?.addEventListener('click', () => {
      this.step = 'phone';
      this.stopCountdown();
      this.render();
    });

    const formPhone = document.getElementById('auth-form-phone') as HTMLFormElement;
    if (formPhone) {
      formPhone.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = document.getElementById('auth-msg-phone') as HTMLParagraphElement;
        const phoneInput = document.getElementById('auth_phone') as HTMLInputElement;
        const btn = document.getElementById('btn-submit-phone') as HTMLButtonElement;
        const phone = phoneInput.value.trim();
        
        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
        if (!phoneRegex.test(phone)) {
          msg.textContent = "Số điện thoại không hợp lệ (VD: 0912345678)";
          msg.classList.remove('hidden');
          phoneInput.classList.add('border-red-500');
          return;
        }
        
        phoneInput.classList.remove('border-red-500');
        this.handleSendOtp(phone, msg, btn);
      });
    }

    const resendBtn = document.getElementById('btn-resend-otp');
    if (resendBtn) {
      resendBtn.addEventListener('click', () => {
        if (this.countdownValue <= 0) {
          const msg = document.getElementById('auth-msg-otp') as HTMLParagraphElement;
          this.handleSendOtp(this.phoneNumber, msg, resendBtn as HTMLAnchorElement);
        }
      });
    }

    const formOtp = document.getElementById('auth-form-otp') as HTMLFormElement;
    if (formOtp) {
      formOtp.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-submit-otp') as HTMLButtonElement;
        const msg = document.getElementById('auth-msg-otp') as HTMLParagraphElement;
        const otpInput = document.getElementById('auth_otp') as HTMLInputElement;
        const otp = otpInput.value.trim();

        if (otp.length !== 6 || !/^\d+$/.test(otp)) {
          msg.textContent = "Vui lòng nhập đủ 6 số OTP";
          msg.classList.remove('hidden');
          otpInput.classList.add('border-red-500');
          return;
        }

        btn.disabled = true;
        const oldText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
        msg.classList.add('hidden');
        otpInput.classList.remove('border-red-500');

        try {
          const phone = this.phoneNumber;
          const res = await fetch("http://localhost:3000/api/auth/otp/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, otp })
          });
          const data = await res.json();
          
          if (!res.ok) throw new Error(data.message || "Xác nhận OTP thất bại");

          localStorage.setItem("token", data.token);
          this.hide();
          window.location.reload();
        } catch (err: any) {
          msg.textContent = err.message;
          msg.classList.remove('hidden', 'text-emerald-500');
          msg.classList.add('text-red-500');
        } finally {
          btn.disabled = false;
          btn.innerHTML = oldText;
        }
      });
    }
  }
}
