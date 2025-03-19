const { default: makeWASocket, useMultiFileAuthState } = require('@adiwajshing/baileys');
const axios = require('axios');
require('dotenv').config();


// Fungsi untuk mengambil daftar nomor dari GitHub
async function fetchUserDatabase() {
    try {
        const url = `https://raw.githubusercontent.com/Athar5443/database/refs/heads/main/users.json`;
        const response = await axios.get(url);
        return response.data.users || [];
    } catch (error) {
        console.error("Gagal mengambil database dari GitHub:", error);
        return [];
    }
}

// Fungsi utama untuk memulai bot
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_multi');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    // Mendengarkan pesan masuk
    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            if (!msg.message) continue;

            const senderJid = msg.key.remoteJid;
            const phoneNumber = senderJid.split('@')[0];

            // Ambil database dari GitHub
            const registeredUsers = await fetchUserDatabase();
            const isRegistered = registeredUsers.some(user => user.phone_number === phoneNumber);

            // Kirim pesan balasan berdasarkan hasil validasi
            const responseText = isRegistered
                ? `✅ Nomor ${phoneNumber} terdaftar. Lanjutkan proses...`
                : `❌ Nomor ${phoneNumber} tidak ditemukan di database. Silakan daftar terlebih dahulu.`;

            sock.sendMessage(senderJid, { text: responseText });
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// Jalankan bot
startBot().catch(err => console.error("Error:", err));
