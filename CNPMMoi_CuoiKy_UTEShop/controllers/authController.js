const User = require('../models/User');
const OTP = require('../models/OTP');
const otpService = require('../services/otpService');
const emailService = require('../services/emailService');
const { generateToken } = require('../middleware/auth');
const {
    successResponse,
    errorResponse,
    createdResponse,
    conflictResponse,
    notFoundResponse,
    unauthorizedResponse
} = require('../utils/responseHelper');
const {
    HTTP_STATUS,
    OTP_TYPES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
} = require('../utils/constants');

class AuthController {
    // Register new user
    async register(req, res) {
        try {
            const { email, password, full_name, phone } = req.body;

            // Check if email already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return conflictResponse(res, ERROR_MESSAGES.EMAIL_EXISTS);
            }

            // Create new user
            const newUser = await User.create({
                email,
                password,
                full_name,
                phone
            });

            // Generate and send OTP for email verification
            await otpService.createRegistrationOTP(newUser.id, email, full_name);

            console.log(`✅ User registered successfully: ${email}`);
            return createdResponse(res, {
                user: newUser.toJSON(),
                message: 'Vui lòng kiểm tra email để xác thực tài khoản'
            }, SUCCESS_MESSAGES.REGISTER_SUCCESS);

        } catch (error) {
            console.error('❌ Registration error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Verify OTP for registration
    async verifyRegistrationOTP(req, res) {
        try {
            const { email, otp_code } = req.body;

            // Find user by email
            const user = await User.findByEmail(email);
            if (!user) {
                return notFoundResponse(res, ERROR_MESSAGES.USER_NOT_FOUND);
            }

            // Check if user is already verified
            if (user.is_verified) {
                return conflictResponse(res, 'Tài khoản đã được xác thực');
            }

            // Verify OTP
            const verificationResult = await otpService.verifyOTP(
                user.id, 
                otp_code, 
                OTP_TYPES.REGISTER
            );

            if (!verificationResult.success) {
                return unauthorizedResponse(res, verificationResult.error);
            }

            // Update user verification status
            await User.updateVerificationStatus(user.id, true);

            // Send welcome email
            await emailService.sendWelcomeEmail(email, user.full_name);

            // Generate JWT token
            const token = generateToken(user.id);

            console.log(`✅ User verified successfully: ${email}`);
            return successResponse(res, {
                user: { ...user.toJSON(), is_verified: true },
                token,
                token_type: 'Bearer'
            }, SUCCESS_MESSAGES.OTP_VERIFIED);

        } catch (error) {
            console.error('❌ OTP verification error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // User login
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Find user by email with password
            const user = await User.findByEmailWithPassword(email);
            if (!user) {
                return unauthorizedResponse(res, ERROR_MESSAGES.INVALID_CREDENTIALS);
            }

            // Verify password
            const isPasswordValid = await user.verifyPassword(password);
            if (!isPasswordValid) {
                return unauthorizedResponse(res, ERROR_MESSAGES.INVALID_CREDENTIALS);
            }

            // Check if user is verified
            if (!user.is_verified) {
                // Resend verification OTP
                await otpService.createRegistrationOTP(user.id, email, user.full_name);
                return unauthorizedResponse(res, 'Tài khoản chưa được xác thực. Mã OTP mới đã được gửi đến email của bạn.');
            }

            // Generate JWT token
            const token = generateToken(user.id);

            console.log(`✅ User logged in successfully: ${email}`);
            return successResponse(res, {
                user: user.toJSON(),
                token,
                token_type: 'Bearer'
            }, SUCCESS_MESSAGES.LOGIN_SUCCESS);

        } catch (error) {
            console.error('❌ Login error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Forgot password - send OTP
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            // Find user by email
            const user = await User.findByEmail(email);
            if (!user) {
                // For security, don't reveal if email exists
                return successResponse(res, null, 'Nếu email tồn tại, mã OTP đã được gửi');
            }

            // Check rate limiting
            const canRequest = await otpService.canRequestNewOTP(user.id, OTP_TYPES.RESET_PASSWORD);
            if (!canRequest) {
                return errorResponse(res, 'Vui lòng chờ ít nhất 1 phút trước khi yêu cầu OTP mới', HTTP_STATUS.TOO_MANY_REQUESTS);
            }

            // Generate and send password reset OTP
            await otpService.createPasswordResetOTP(user.id, email, user.full_name);

            console.log(`✅ Password reset OTP sent: ${email}`);
            return successResponse(res, null, SUCCESS_MESSAGES.OTP_SENT);

        } catch (error) {
            console.error('❌ Forgot password error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Reset password with OTP
    async resetPassword(req, res) {
        try {
            const { email, otp_code, new_password } = req.body;

            // Find user by email
            const user = await User.findByEmail(email);
            if (!user) {
                return notFoundResponse(res, ERROR_MESSAGES.USER_NOT_FOUND);
            }

            // Verify OTP
            const verificationResult = await otpService.verifyOTP(
                user.id, 
                otp_code, 
                OTP_TYPES.RESET_PASSWORD
            );

            if (!verificationResult.success) {
                return unauthorizedResponse(res, verificationResult.error);
            }

            // Update user password
            await User.updatePassword(user.id, new_password);

            console.log(`✅ Password reset successfully: ${email}`);
            return successResponse(res, null, SUCCESS_MESSAGES.PASSWORD_RESET);

        } catch (error) {
            console.error('❌ Reset password error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Resend OTP
    async resendOTP(req, res) {
        try {
            const { email, otp_type } = req.body;

            // Validate OTP type
            if (!Object.values(OTP_TYPES).includes(otp_type)) {
                return errorResponse(res, 'Loại OTP không hợp lệ', HTTP_STATUS.BAD_REQUEST);
            }

            // Find user by email
            const user = await User.findByEmail(email);
            if (!user) {
                return notFoundResponse(res, ERROR_MESSAGES.USER_NOT_FOUND);
            }

            // Check rate limiting
            const canRequest = await otpService.canRequestNewOTP(user.id, otp_type);
            if (!canRequest) {
                return errorResponse(res, 'Vui lòng chờ ít nhất 1 phút trước khi yêu cầu OTP mới', HTTP_STATUS.TOO_MANY_REQUESTS);
            }

            // Generate and send appropriate OTP
            if (otp_type === OTP_TYPES.REGISTER) {
                if (user.is_verified) {
                    return conflictResponse(res, 'Tài khoản đã được xác thực');
                }
                await otpService.createRegistrationOTP(user.id, email, user.full_name);
            } else if (otp_type === OTP_TYPES.RESET_PASSWORD) {
                await otpService.createPasswordResetOTP(user.id, email, user.full_name);
            }

            console.log(`✅ OTP resent: ${email} (${otp_type})`);
            return successResponse(res, null, SUCCESS_MESSAGES.OTP_SENT);

        } catch (error) {
            console.error('❌ Resend OTP error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Refresh JWT token
    async refreshToken(req, res) {
        try {
            const { newToken, user } = req;

            return successResponse(res, {
                user: user.toJSON(),
                token: newToken,
                token_type: 'Bearer'
            }, 'Token refreshed successfully');

        } catch (error) {
            console.error('❌ Refresh token error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Check authentication status
    async checkAuth(req, res) {
        try {
            const user = req.user;
            
            return successResponse(res, {
                user: user.toJSON(),
                is_authenticated: true
            }, 'User is authenticated');

        } catch (error) {
            console.error('❌ Check auth error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Logout (client-side token removal, could add token blacklist in future)
    async logout(req, res) {
        try {
            // In a more advanced implementation, you might want to blacklist the token
            // For now, logout is handled client-side by removing the token
            
            console.log(`✅ User logged out: ${req.user.email}`);
            return successResponse(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);

        } catch (error) {
            console.error('❌ Logout error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get OTP statistics (for debugging/admin)
    async getOTPStats(req, res) {
        try {
            const stats = await OTP.getOTPStats();
            return successResponse(res, stats, 'OTP statistics retrieved');

        } catch (error) {
            console.error('❌ Get OTP stats error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }
}

module.exports = new AuthController();
