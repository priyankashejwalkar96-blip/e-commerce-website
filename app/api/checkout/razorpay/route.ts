import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { amount, currency = 'USD', orderDetails } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    // Convert amount to smallest currency unit (e.g. cents)
    const options = {
      amount: Math.round(amount * 100),
      currency: currency.toUpperCase(),
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Razorpay order creation failed' }, { status: 500 });
  }
}
