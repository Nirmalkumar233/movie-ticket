const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { google } = require('googleapis');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // For frontend files

// 1. Initialize Razorpay
const razorpay = new Razorpay({
    key_id: 'rzp_live_ThV1DZFZJlCYuF',
    key_secret: 'oGk7T0yoJwG7PT8JS3GamfsB'
});

// 2. Initialize Google Sheets Auth
const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const SPREADSHEET_ID = '1jbLLUct1Zi2u10iReltIzaAForbXeopkGrynztN-Ep8';

// API: Create Razorpay Order & Verify Seat Limit (Max 10)
app.post('/api/create-order', async (req, res) => {
    try {
        const { customerName, email, selectedSeats } = req.body;

        if (!selectedSeats || selectedSeats.length === 0 || selectedSeats.length > 10) {
            return res.status(400).json({ error: 'You can book between 1 and 10 tickets only.' });
        }

        const amount = selectedSeats.length * 200 * 100; // ₹200 per seat in paisa

        const options = {
            amount: amount,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json({ order, selectedSeats, customerName, email });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Verify Payment, Update Google Sheet, and Generate QR
app.post('/api/verify-payment', async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            customerName, 
            email, 
            selectedSeats 
        } = req.body;

        // Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', 'YOUR_RAZORPAY_SECRET')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed!' });
        }

        const bookingID = `BKS_${Date.now()}`;
        const timestamp = new Date().toISOString();

        // Append to Google Sheets 'Bookings' tab
        const sheets = google.sheets({ version: 'v4', auth });
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Bookings!A:G',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[bookingID, customerName, email, selectedSeats.join(', '), selectedSeats.length * 200, razorpay_payment_id, timestamp]]
            }
        });

        // Generate QR Code containing booking verification string
        const qrData = `BookingID: ${bookingID} | Name: ${customerName} | Seats: ${selectedSeats.join(', ')}`;
        const qrCodeImage = await QRCode.toDataURL(qrData);

        res.json({ 
            success: true, 
            bookingID, 
            qrCode: qrCodeImage,
            message: 'Booking confirmed and logged to Google Sheets.' 
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000')); 