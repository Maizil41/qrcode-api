const QRCode = require('qrcode');

export default async function handler(req, res) {
  const { text } = req.query;

  if (!text) {
    return res.status(400).json({ error: 'Parameter "text" dibutuhkan' });
  }

  try {
    const qrDataURL = await QRCode.toDataURL(text);
    res.status(200).json({ text, qrcode: qrDataURL });
  } catch (err) {
    res.status(500).json({ error: 'Gagal generate QR Code' });
  }
}

