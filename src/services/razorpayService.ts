import RazorpayCheckout from 'react-native-razorpay';
import { COLORS } from '../constants/colors';
import { APP_CONFIG } from '../constants/config';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

class RazorpayService {
  private readonly RAZORPAY_KEY = APP_CONFIG.RAZORPAY_KEY_ID;

  async initiatePayment(
    amount: number,
    orderId: string,
    userName?: string,
    userEmail?: string,
    userPhone?: string
  ): Promise<RazorpayResponse> {
    const options = {
      key: this.RAZORPAY_KEY,
      amount: (amount * 100).toString(),
      currency: 'INR',
      name: 'AspirantX',
      description: 'Wallet Recharge',
      order_id: orderId,
      prefill: {
        name: userName || '',
        email: userEmail || '',
        contact: userPhone || '',
      },
      theme: {
        color: COLORS.primary,
      },
    };

    try {
      const data = await RazorpayCheckout.open(options);
      console.log('Payment successful:', data);
      return data as RazorpayResponse;
    } catch (error: any) {
      console.error('Payment failed:', error);
      throw new Error(error?.description || error?.message || 'Payment was cancelled');
    }
  }

  async initiatePurchase(
    amount: number,
    orderId: string,
    description: string,
    userName?: string,
    userEmail?: string
  ): Promise<RazorpayResponse> {
    const options = {
      key: this.RAZORPAY_KEY,
      amount: (amount * 100).toString(),
      currency: 'INR',
      name: 'AspirantX',
      description: description,
      order_id: orderId,
      prefill: {
        name: userName || '',
        email: userEmail || '',
      },
      theme: {
        color: COLORS.primary,
      },
    };

    try {
      const data = await RazorpayCheckout.open(options);
      return data as RazorpayResponse;
    } catch (error: any) {
      throw new Error(error?.description || error?.message || 'Payment was cancelled');
    }
  }
}

export default new RazorpayService();
