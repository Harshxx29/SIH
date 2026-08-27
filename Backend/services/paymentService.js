class PaymentService {
    static async createPaymentGatewayOrder(amount, currency = 'INR') {
        // Logic to integrate with Razorpay/Stripe
        return { orderId: 'dummy_order_id', amount };
    }

    static async verifyPaymentSignature(orderId, paymentId, signature) {
        // Logic to verify gateway signature
        return true;
    }
}

module.exports = PaymentService;
