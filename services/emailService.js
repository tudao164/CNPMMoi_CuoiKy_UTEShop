const { createTransporter } = require('../config/email');
const { EMAIL_SUBJECTS } = require('../utils/constants');

class EmailService {
    constructor() {
        this.transporter = createTransporter();
    }

    // Send OTP email for registration
    async sendRegistrationOTP(email, fullName, otpCode) {
        const mailOptions = {
            from: `"UTEShop" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: EMAIL_SUBJECTS.VERIFY_ACCOUNT,
            html: this.getRegistrationOTPTemplate(fullName, otpCode)
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Registration OTP sent to ${email}`);
            return true;
        } catch (error) {
            console.error('❌ Error sending registration OTP:', error);
            throw new Error('Không thể gửi email xác thực');
        }
    }

    // Send OTP email for password reset
    async sendPasswordResetOTP(email, fullName, otpCode) {
        const mailOptions = {
            from: `"UTEShop" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: EMAIL_SUBJECTS.RESET_PASSWORD,
            html: this.getPasswordResetOTPTemplate(fullName, otpCode)
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Password reset OTP sent to ${email}`);
            return true;
        } catch (error) {
            console.error('❌ Error sending password reset OTP:', error);
            throw new Error('Không thể gửi email đặt lại mật khẩu');
        }
    }

    // Send welcome email after successful verification
    async sendWelcomeEmail(email, fullName) {
        const mailOptions = {
            from: `"UTEShop" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: EMAIL_SUBJECTS.WELCOME,
            html: this.getWelcomeTemplate(fullName)
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Welcome email sent to ${email}`);
            return true;
        } catch (error) {
            console.error('❌ Error sending welcome email:', error);
            // Don't throw error for welcome email as it's not critical
            return false;
        }
    }

    // Registration OTP email template
    getRegistrationOTPTemplate(fullName, otpCode) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Xác thực tài khoản UTEShop</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #007bff; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px 20px; background: #f9f9f9; }
                .otp-box { background: #007bff; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; border-radius: 5px; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                .btn { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>UTEShop</h1>
                    <p>Xác thực tài khoản của bạn</p>
                </div>
                <div class="content">
                    <h2>Xin chào ${fullName}!</h2>
                    <p>Cảm ơn bạn đã đăng ký tài khoản tại UTEShop. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã OTP bên dưới:</p>
                    
                    <div class="otp-box">
                        ${otpCode}
                    </div>
                    
                    <p><strong>Lưu ý:</strong></p>
                    <ul>
                        <li>Mã OTP có hiệu lực trong vòng 5 phút</li>
                        <li>Không chia sẻ mã này với bất kỳ ai</li>
                        <li>Nếu bạn không yêu cầu đăng ký tài khoản, vui lòng bỏ qua email này</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>&copy; 2024 UTEShop. Tất cả quyền được bảo lưu.</p>
                    <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Password reset OTP email template
    getPasswordResetOTPTemplate(fullName, otpCode) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Đặt lại mật khẩu UTEShop</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px 20px; background: #f9f9f9; }
                .otp-box { background: #dc3545; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; border-radius: 5px; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>UTEShop</h1>
                    <p>Đặt lại mật khẩu</p>
                </div>
                <div class="content">
                    <h2>Xin chào ${fullName}!</h2>
                    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản UTEShop của bạn. Vui lòng sử dụng mã OTP bên dưới để đặt lại mật khẩu:</p>
                    
                    <div class="otp-box">
                        ${otpCode}
                    </div>
                    
                    <div class="warning">
                        <p><strong>⚠️ Cảnh báo bảo mật:</strong></p>
                        <ul>
                            <li>Mã OTP có hiệu lực trong vòng 5 phút</li>
                            <li>Không chia sẻ mã này với bất kỳ ai</li>
                            <li>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này và kiểm tra bảo mật tài khoản</li>
                        </ul>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; 2024 UTEShop. Tất cả quyền được bảo lưu.</p>
                    <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Welcome email template
    getWelcomeTemplate(fullName) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Chào mừng đến với UTEShop</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #28a745; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px 20px; background: #f9f9f9; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
                .feature-box { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #007bff; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Chào mừng đến với UTEShop!</h1>
                </div>
                <div class="content">
                    <h2>Xin chào ${fullName}!</h2>
                    <p>Tài khoản của bạn đã được xác thực thành công! Chào mừng bạn đến với cộng đồng UTEShop - nơi mua sắm trực tuyến đáng tin cậy.</p>
                    
                    <div class="feature-box">
                        <h3>🛍️ Khám phá ngay:</h3>
                        <ul>
                            <li>Hàng ngàn sản phẩm chất lượng cao</li>
                            <li>Giá cả cạnh tranh, nhiều ưu đãi hấp dẫn</li>
                            <li>Giao hàng nhanh chóng toàn quốc</li>
                            <li>Hỗ trợ khách hàng 24/7</li>
                        </ul>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="#" class="btn">Bắt đầu mua sắm</a>
                        <a href="#" class="btn">Xem ưu đãi</a>
                    </div>

                    <p>Nếu bạn có bất kỳ câu hỏi nào, đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn!</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 UTEShop. Tất cả quyền được bảo lưu.</p>
                    <p>Theo dõi chúng tôi trên mạng xã hội để cập nhật những ưu đãi mới nhất!</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

module.exports = new EmailService();
