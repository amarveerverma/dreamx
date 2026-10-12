import { BookingType, CommissionSplit, MembershipTier } from './types';

export class CommissionCalculatorService {
  private static readonly SERVICE_COMMISSION_RATE = 0.20; // 20% for 1:1 services
  private static readonly PROGRAM_COMMISSION_RATE = 0.15; // 15% for structured programs
  private static readonly GST_RATE = 0.18; // 18% GST on platform fee per Indian Tax Code

  /**
   * Calculates the exact commission split, GST breakdown, and net mentor payout.
   * 
   * Example (India MVP Standard):
   * Gross: ₹1,000.00
   * 20% Platform Fee: ₹200.00
   * 18% GST on Fee: ₹36.00
   * Net Mentor Payout: ₹764.00
   * 
   * Subscription Invariance:
   * If a Pro/Elite member receives a discount (e.g. 10% on ₹1,000 = ₹100 off),
   * the student pays ₹900, but the mentor's base payout calculation remains invariant.
   */
  public static calculatePayoutSplit(
    grossAmount: number,
    bookingType: BookingType = 'service',
    membershipDiscount: number = 0.00
  ): CommissionSplit {
    const gross = Number(grossAmount.toFixed(2));
    const discount = Number(membershipDiscount.toFixed(2));

    const commissionRate = bookingType === 'service'
      ? this.SERVICE_COMMISSION_RATE
      : this.PROGRAM_COMMISSION_RATE;

    const basePlatformCommission = Number((gross * commissionRate).toFixed(2));
    const gstAmount = Number((basePlatformCommission * this.GST_RATE).toFixed(2));
    const netPayoutAmount = Number((gross - basePlatformCommission - gstAmount).toFixed(2));

    return {
      grossAmount: gross,
      platformFeePercentage: commissionRate * 100,
      platformCommission: basePlatformCommission,
      gstRate: this.GST_RATE,
      gstAmount,
      netPayoutAmount,
      membershipDiscount: discount
    };
  }

  /**
   * Returns hold duration in days based on booking type
   * One-time services: 3-day (72h) hold
   * Structured programs: 14-day (336h) hold
   */
  public static getHoldDurationDays(bookingType: BookingType): number {
    return bookingType === 'service' ? 3 : 14;
  }

  /**
   * Computes the ISO timestamp when payout becomes eligible for release
   */
  public static computeHoldUntil(bookingType: BookingType, baseDate: Date = new Date()): string {
    const days = this.getHoldDurationDays(bookingType);
    const holdUntil = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
    return holdUntil.toISOString();
  }
}
