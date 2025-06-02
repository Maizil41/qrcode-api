import QRCode from 'qrcode';

export default async function handler(req, res) {
  const { text, format } = req.query;

  if (!text) {
    return res.status(400).json({ error: 'Parameter "text" dibutuhkan' });
  }

  try {
    if (format === 'png') {
      const buffer = await QRCode.toBuffer(text);
      res.setHeader('Content-Type', 'image/png');
      res.send(buffer);
    } else {
      const dataUrl = await QRCode.toDataURL(text);
      res.status(200).json({ text, qrcode: dataUrl });
    }
  } catch (err) {
    res.status(500).json({ error: 'Gagal generate QR Code' });
  }
}
