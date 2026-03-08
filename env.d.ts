declare module '@env' {
  export const RAZORPAY_KEY_ID: string;
}

declare module 'react-native-razorpay' {
  interface RazorpayOptions {
    key: string;
    amount: string;
    currency: string;
    name: string;
    description?: string;
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

  const RazorpayCheckout: {
    open(options: RazorpayOptions): Promise<{
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }>;
  };

  export default RazorpayCheckout;
}
