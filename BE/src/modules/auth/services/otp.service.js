class OtpService {
    constructor() {
        // Map to store OTP data: { phone: { otp: string, expiresAt: number, attempts: number, blockUntil: number } }
        this.store = new Map();
    }

    sendOtp(phone) {
        const now = Date.now();
        let record = this.store.get(phone);

        if (record) {
            // Check if blocked
            if (record.blockUntil && now < record.blockUntil) {
                const waitMinutes = Math.ceil((record.blockUntil - now) / 60000);
                throw new Error(`Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau ${waitMinutes} phút.`);
            }

            if (record.attempts >= 3) {
                // Block for 5 minutes
                record.blockUntil = now + 5 * 60 * 1000;
                record.attempts = 0; // reset attempts for after block
                this.store.set(phone, record);
                throw new Error(`Bạn đã yêu cầu quá 3 lần. Vui lòng chờ 5 phút.`);
            }
        } else {
            record = { attempts: 0 };
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        record.otp = otp;
        record.expiresAt = now + 30 * 1000; // 30 seconds
        record.attempts += 1;
        record.blockUntil = 0; // clear any old block

        this.store.set(phone, record);
        
        return otp;
    }

    verifyOtp(phone, otp) {
        const now = Date.now();
        const record = this.store.get(phone);

        if (!record) {
            throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn.');
        }

        if (now > record.expiresAt) {
            throw new Error('Mã OTP đã hết hạn (chỉ có hiệu lực trong 30s).');
        }

        if (record.otp !== otp) {
            throw new Error('Mã OTP không chính xác.');
        }

        // Success -> clear the record
        this.store.delete(phone);
        return true;
    }
}

module.exports = new OtpService();
