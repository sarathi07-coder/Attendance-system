const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let client = null;
let qrCodeData = null;
let isReady = false;
let isConnecting = false;

function initClient() {
    if (client && isReady) {
        console.log('Client already ready');
        return;
    }

    console.log('🔄 Initializing WhatsApp client...');
    isConnecting = true;
    isReady = false;

    client = new Client({
        authStrategy: new LocalAuth({ dataPath: './session' }),
        puppeteer: {
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('qr', async (qr) => {
        console.log('📱 QR Code received!');
        qrCodeData = await qrcode.toDataURL(qr);
        isConnecting = false;
    });

    client.on('ready', () => {
        console.log('✅ WhatsApp client is ready!');
        isReady = true;
        isConnecting = false;
        qrCodeData = null;
    });

    client.on('authenticated', () => {
        console.log('🔐 Authenticated successfully!');
    });

    client.on('auth_failure', (msg) => {
        console.error('❌ Authentication failed:', msg);
        isReady = false;
        isConnecting = false;
        client = null;
    });

    client.on('disconnected', (reason) => {
        console.log('📴 Disconnected:', reason);
        isReady = false;
        isConnecting = false;
        client = null;
    });

    client.initialize();
}

app.post('/connect', async (req, res) => {
    if (isReady && client) {
        return res.json({ success: true, message: 'Already connected!', connected: true });
    }
    initClient();
    res.json({ success: true, message: 'Connecting... Please wait for QR code.' });
});

app.get('/get-qr', (req, res) => {
    if (isReady) {
        return res.json({ success: false, error: 'Already connected', connected: true });
    }
    if (qrCodeData) {
        const base64 = qrCodeData.split(',')[1];
        return res.json({ success: true, qr_image: base64 });
    }
    if (isConnecting) {
        return res.json({ success: false, error: 'Loading QR code...', connecting: true });
    }
    return res.json({ success: false, error: 'Not initialized. Call /connect first.' });
});

app.get('/status', (req, res) => {
    res.json({
        connected: isReady && client !== null,
        browser_active: client !== null,
        connecting: isConnecting
    });
});

app.post('/send-message', async (req, res) => {
    const { phone, message } = req.body;

    if (!client || !isReady) {
        return res.json({ success: false, error: 'WhatsApp not connected. Please scan QR first.' });
    }

    if (!phone || !message) {
        return res.json({ success: false, error: 'Phone and message required' });
    }

    try {
        const formattedPhone = phone.replace(/[^0-9]/g, '') + '@c.us';
        await client.sendMessage(formattedPhone, message);
        console.log(`✉️ Message sent to ${phone}`);
        res.json({ success: true, message: 'Message sent!' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.json({ success: false, error: error.message });
    }
});

app.post('/send-bulk', async (req, res) => {
    const { recipients } = req.body;

    if (!client || !isReady) {
        return res.json({ success: false, error: 'WhatsApp not connected' });
    }

    const results = [];
    for (const recipient of recipients) {
        try {
            const formattedPhone = recipient.phone.replace(/[^0-9]/g, '') + '@c.us';
            await client.sendMessage(formattedPhone, recipient.message);
            results.push({ phone: recipient.phone, success: true });
            await new Promise(r => setTimeout(r, 1000));
        } catch (error) {
            results.push({ phone: recipient.phone, success: false, error: error.message });
        }
    }

    res.json({
        success: true,
        results,
        total: recipients.length,
        sent: results.filter(r => r.success).length
    });
});

app.post('/disconnect', async (req, res) => {
    if (client) {
        await client.destroy();
        client = null;
        isReady = false;
        qrCodeData = null;
    }
    res.json({ success: true, message: 'Disconnected' });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║         WhatsApp Message Service for Attendance           ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}                  ║
║  Auto-initializing WhatsApp client...                     ║
╚═══════════════════════════════════════════════════════════╝
    `);
    initClient();
});
