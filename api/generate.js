import QRCode from 'qrcode';

// ====== QRIS statis kamu taruh di sini ======
const QRIS_STATIC = "00020101021126690014ID.LINKAJA.WWW011893600902146083094502020304000005802ID5906TOKO A6015KOTA JAKARTA BARAT61051234562270115ID10200300000503ID0012345678905802ID6304XXXX";
// Ganti nilai di atas dengan string QRIS statismu (pastikan benar & lengkap)

function ConvertCRC16(str) {
    let crc = 0xFFFF;
    for (let c = 0; c < str.length; c++) {
        crc ^= str.charCodeAt(c) << 8;
        for (let i = 0; i < 8; i++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
        }
    }
    let hex = (crc & 0xFFFF).toString(16).toUpperCase();
    return hex.padStart(4, '0');
}

function convertQris(qris, nominal) {
    // hapus CRC lama (4 char terakhir)
    qris = qris.slice(0, -4);

    // ubah tag 01 dari 011 -> 012 (statis -> dinamis) jika ada
    let step1 = qris.replace("010211", "010212");

    // pecah pada country code "5802ID"
    let step2 = step1.split("5802ID");

    // bangun field amount (ID 54)
    const uang = "54" + nominal.length.toString().padStart(2, '0') + nominal + "5802ID";

    // gabung kembali dan hitung CRC baru
    let hasil = step2[0] + uang + step2[1];
    hasil += ConvertCRC16(hasil);

    return hasil;
}

export default async function handler(req, res) {
    try {
        // hanya butuh jumlah; qris sudah didefinisikan statis
        const { jumlah } = req.query;
        if (!jumlah) {
            return res.status(400).send('Parameter "jumlah" harus diisi');
        }

        // pastikan nominal hanya angka
        const nominal = String(jumlah).trim().replace(/\D/g, '');
        if (!nominal) {
            return res.status(400).send('Parameter "jumlah" harus berupa angka (tanpa pemisah/koma)');
        }

        const qrisDinamis = convertQris(QRIS_STATIC, nominal);

        const qrBuffer = await QRCode.toBuffer(qrisDinamis, {
            width: 512,
            margin: 4,
            errorCorrectionLevel: 'M'
        });

        res.setHeader('Content-Type', 'image/png');
        res.send(qrBuffer);
    } catch (err) {
        console.error("QRIS Error:", err);
        res.status(500).send('Terjadi kesalahan saat generate QR Code');
    }
}
