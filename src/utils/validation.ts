import { z } from 'zod';

/** Match backend UnifiedAuthController::normalizePhone (10-digit Indian). */
export function normalizeIndianMobile(raw: string): string {
  let normalized = raw.replace(/\D/g, '');
  if (normalized.length > 10) {
    if (normalized.startsWith('91') && normalized.length >= 12) {
      normalized = normalized.slice(-10);
    } else if (normalized.startsWith('0') && normalized.length >= 11) {
      normalized = normalized.slice(-10);
    } else {
      normalized = normalized.slice(-10);
    }
  }
  return normalized;
}

/** 10-digit Indian mobile starting with 6–9 (digits only, after normalization). */
export const phoneSchema = z.object({
  mobile: z
    .string()
    .min(1, 'Mobile required')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
});

/** 6-digit SMS OTP. */
export const otpCodeSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export const newUserProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name required')
    .max(255)
    .regex(/^[a-zA-Z\s]+$/, 'Name should only contain letters and spaces'),
  email: z.union([z.string().email('Valid email required'), z.literal('')]).optional(),
  referral_code: z.string().max(64).optional(),
});

export const checkoutSchema = z
  .object({
    gift_send_option: z.enum(['send_as_gift', 'buy_for_self']),
    receiver_name: z.string().optional(),
    receiver_email: z.string().email().optional().or(z.literal('')),
    receiver_mobile: z.string().optional(),
    receiver_msg: z.string().max(500).optional(),
    payment_method: z.enum(['wallet', 'ccavenue', 'unlimit', 'razorpay']),
  })
  .superRefine((data, ctx) => {
    if (data.gift_send_option === 'send_as_gift') {
      if (!data.receiver_name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Recipient name required',
          path: ['receiver_name'],
        });
      }
      if (!data.receiver_email?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Recipient email required',
          path: ['receiver_email'],
        });
      }
      const m = data.receiver_mobile?.replace(/\D/g, '') ?? '';
      if (m.length !== 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '10-digit mobile required',
          path: ['receiver_mobile'],
        });
      }
    }
  });

export const profileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  mobile: z.string().optional(),
});

export const loadWalletSchema = z.object({
  amount: z.number().min(100).max(500000),
  payment_method: z.enum(['bank_transfer', 'upi', 'neft', 'rtgs']),
  utr_number: z.string().min(1, 'UTR required'),
  bank_reference: z.string().optional(),
});
