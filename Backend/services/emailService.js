const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email body text
 * @param {string} html - Email body HTML
 */
const sendEmail = async (to, subject, text, html) => {
    try {
        // If SMTP credentials aren't set, just log to console (useful for development)
        if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
            console.log(`\n[MOCK EMAIL] To: ${to}\nSubject: ${subject}\nText: ${text}\n`);
            return { success: true, message: 'Mock email sent (credentials not configured)' };
        }

        const info = await transporter.sendMail({
            from: `"CoopSeva" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html
        });
        
        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};

const sendOTP = async (email, otp) => {
    const subject = "Your CoopSeva Verification OTP";
    const text = `Your OTP for CoopSeva login/registration is ${otp}. It will expire in 10 minutes.`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e3a8a;">CoopSeva Login Verification</h2>
            <p>Your One-Time Password (OTP) is:</p>
            <h1 style="background: #f1f5f9; padding: 15px; text-align: center; letter-spacing: 5px; color: #0f172a;">${otp}</h1>
            <p>This OTP will expire in 10 minutes. Do not share it with anyone.</p>
        </div>
    `;
    return sendEmail(email, subject, text, html);
};

const sendInvoice = async (email, booking) => {
    const subject = `Invoice for Booking #${booking._id.toString().slice(-6).toUpperCase()}`;
    const text = `Your service has been completed. Final price: Rs ${booking.finalPrice}`;
    
    // Detailed financial breakdown
    const workerEarnings = booking.financialBreakdown?.workerEarnings || (booking.finalPrice * 0.85);
    const coopShare = booking.financialBreakdown?.cooperativeShare || (booking.finalPrice * 0.10);
    const welfareShare = booking.financialBreakdown?.welfareShare || (booking.finalPrice * 0.05);

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px;">
                <h1 style="color: #1e3a8a; margin: 0;">COOPSEVA</h1>
                <p style="color: #64748b; margin: 5px 0 0 0;">Cooperative Service Marketplace</p>
            </div>
            
            <div style="padding: 20px 0;">
                <h3 style="margin-top: 0;">Digital Invoice</h3>
                <p><strong>Request ID:</strong> #${booking._id.toString().slice(-6).toUpperCase()}</p>
                <p><strong>Date:</strong> ${new Date(booking.updatedAt).toLocaleString()}</p>
                <p><strong>Service:</strong> ${booking.service?.name || 'General Service'}</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr style="background: #f8fafc;">
                        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #cbd5e1;">Description</th>
                        <th style="padding: 10px; text-align: right; border-bottom: 1px solid #cbd5e1;">Amount</th>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Base Service Fee</td>
                        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">₹${booking.finalPrice}</td>
                    </tr>
                </table>
                
                <div style="margin-top: 20px; text-align: right;">
                    <h2 style="color: #0f172a;">Total Paid: ₹${booking.finalPrice}</h2>
                    <p style="color: #10b981; font-weight: bold;">Payment Method: ${booking.paymentMethod || 'Online'}</p>
                </div>
            </div>

            <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; font-size: 12px; color: #475569;">
                <strong>Fair Wage Breakdown:</strong><br/>
                Worker Earnings (85%): ₹${workerEarnings.toFixed(2)}<br/>
                Cooperative Share (10%): ₹${coopShare.toFixed(2)}<br/>
                Welfare & Insurance Fund (5%): ₹${welfareShare.toFixed(2)}
            </div>
            
            <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 30px;">
                Thank you for supporting cooperative workforce!
            </p>
        </div>
    `;
    return sendEmail(email, subject, text, html);
};

module.exports = { sendEmail, sendOTP, sendInvoice };
