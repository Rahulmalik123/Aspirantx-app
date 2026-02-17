import { NativeModules } from 'react-native';
import { COLORS } from '../constants/colors';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

class RazorpayService {
  private readonly RAZORPAY_KEY = 'rzp_test_your_key_here'; // Replace with actual key from env

  async initiatePayment(
    amount: number,
    orderId: string,
    userName?: string,
    userEmail?: string,
    userPhone?: string
  ): Promise<RazorpayResponse> {
    return new Promise((resolve, reject) => {
      const options: RazorpayOptions = {
        key: this.RAZORPAY_KEY,
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        name: 'AspirantHub',
        description: 'Wallet Recharge',
        order_id: orderId,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        theme: {
          color: 'COLORS.primary',
        },
      };

      try {
        // Check if Razorpay module is available
        if (!NativeModules.RazorpayCheckout) {
          console.warn('⚠️ Razorpay SDK not installed. Using mock payment.');
          // Mock successful payment for development
          setTimeout(() => {
            resolve({
              razorpay_payment_id: `pay_mock_${Date.now()}`,
              razorpay_order_id: orderId,
              razorpay_signature: `sig_mock_${Date.now()}`,
            });
          }, 2000);
          return;
        }

        NativeModules.RazorpayCheckout.open(
          options,
          (data: RazorpayResponse) => {
            console.log('✅ Payment successful:', data);
            resolve(data);
          },
          (error: any) => {
            console.error('❌ Payment failed:', error);
            reject(new Error(error.description || 'Payment failed'));
          }
        );
      } catch (error) {
        console.error('❌ Razorpay error:', error);
        reject(error);
      }
    });
  }

  async initiatePurchase(
    amount: number,
    orderId: string,
    description: string,
    userName?: string,
    userEmail?: string
  ): Promise<RazorpayResponse> {
    return new Promise((resolve, reject) => {
      const options: RazorpayOptions = {
        key: this.RAZORPAY_KEY,
        amount: amount * 100,
        currency: 'INR',
        name: 'AspirantHub',
        description: description,
        order_id: orderId,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: 'COLORS.primary',
        },
      };

      try {
        if (!NativeModules.RazorpayCheckout) {
          console.warn('⚠️ Razorpay SDK not installed. Using mock payment.');
          setTimeout(() => {
            resolve({
              razorpay_payment_id: `pay_mock_${Date.now()}`,
              razorpay_order_id: orderId,
              razorpay_signature: `sig_mock_${Date.now()}`,
            });
          }, 2000);
          return;
        }

        NativeModules.RazorpayCheckout.open(
          options,
          (data: RazorpayResponse) => {
            resolve(data);
          },
          (error: any) => {
            reject(new Error(error.description || 'Payment failed'));
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default new RazorpayService();
