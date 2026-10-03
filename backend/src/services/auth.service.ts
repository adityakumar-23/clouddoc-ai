import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';
import { Role, SubscriptionPlan } from '@prisma/client';

export class AuthService {
  async register(data: { email: string; password: string; fullName: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new AppError('An account with this email address already exists', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        fullName: data.fullName.trim(),
        role: Role.USER,
        isVerified: true, // Set to true by default for seamless demo onboarding
        verificationToken,
        subscription: {
          create: {
            plan: SubscriptionPlan.FREE,
            status: 'ACTIVE',
          },
        },
        usage: {
          create: {
            storageUsedBytes: BigInt(0),
            storageLimitBytes: BigInt(524288000), // 500 MB Free
            monthlyConversions: 0,
            monthlyAiRequests: 0,
          },
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      tokens,
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
      include: {
        subscription: true,
        usage: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
        plan: user.subscription?.plan || SubscriptionPlan.FREE,
        storageUsedBytes: user.usage?.storageUsedBytes ? Number(user.usage.storageUsedBytes) : 0,
        storageLimitBytes: user.usage?.storageLimitBytes ? Number(user.usage.storageLimitBytes) : 524288000,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Return success anyway to avoid user enumeration vulnerability
      return { message: 'If an account exists, a password reset email has been dispatched.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    return {
      message: 'If an account exists, a password reset email has been dispatched.',
      resetToken: env.NODE_ENV !== 'production' ? resetToken : undefined,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new AppError('Password reset link is invalid or has expired', 400, 'INVALID_RESET_TOKEN');
    }

    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Password has been reset successfully. You may now log in.' };
  }

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new AppError('Invalid verification token', 400, 'INVALID_TOKEN');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    return { message: 'Email verified successfully.' };
  }

  refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as {
        sub: string;
        email: string;
        role: Role;
      };

      const tokens = this.generateTokens(decoded.sub, decoded.email, decoded.role);
      return tokens;
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  private generateTokens(userId: string, email: string, role: Role) {
    const accessToken = jwt.sign(
      { sub: userId, email, role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    const refreshToken = jwt.sign(
      { sub: userId, email, role },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}

export const authService = new AuthService();
