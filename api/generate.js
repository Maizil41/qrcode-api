const QRCode = require('qrcode');

module.exports = async (req, res) => {
  const { text } = req.query;

  if (!text) {
    return res.status(400).send('Parameter "text" dibutuhkan');
  }

  try {
    const buffer = await QRCode.toBuffer(text);
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    res.status(500).send('Gagal generate QR Code');
  }
};
