class NotificationService {
    static async sendPushNotification(userId, title, body) {
        // Logic to integrate with Firebase Cloud Messaging
        console.log(`Push Notification sent to ${userId}: ${title}`);
    }

    static async sendSMS(phoneNumber, message) {
        // Logic to integrate with Twilio or local SMS gateway
        console.log(`SMS sent to ${phoneNumber}`);
    }
}

module.exports = NotificationService;
