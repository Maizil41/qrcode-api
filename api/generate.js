import QRCode from 'qrcode';

const QRIS_STATIC = "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214207143969394550303UMI51440014ID.CO.QRIS.WWW0215ID20253829587880303UMI5204481253033605802ID5922MUTIARA CELL OK23137256012ACEH SELATAN61052371162070703A0163044BAF";

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
    const uang = "54" + nominal.length.toString().padStart(2, '0') + nominal + "5802ID";
    let hasil = step2[0] + uang + step2[1];
    hasil += ConvertCRC16(hasil);

    return hasil;
}

export default async function handler(req, res) {
    try {
        const { jumlah } = req.query;
        if (!jumlah) {
            return res.status(400).send('Parameter "jumlah" harus diisi');
        }
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
