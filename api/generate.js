import QRCode from 'qrcode';

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
    qris = qris.slice(0, -4);
    let step1 = qris.replace("010211", "010212");
    let step2 = step1.split("5802ID");

    let uang = "54" + nominal.length.toString().padStart(2, '0') + nominal;
    uang += "5802ID";

    let hasil = step2[0] + uang + step2[1];
    hasil += ConvertCRC16(hasil);

    return hasil;
}

export default async function handler(req, res) {
    const { qris, jumlah } = req.query;

    if (!qris || !jumlah) {
        return res.status(400).send('Parameter "qris" dan "jumlah" harus diisi');
    }

    try {
        const qrisDinamis = convertQris(qris, jumlah.trim());

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

