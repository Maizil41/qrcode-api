const qrisDinamis = require('qris-dinamis');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  const { qris, jumlah } = req.query;

  if (!qris || !jumlah) {
    return res.status(400).send('Parameter "qris" dan "jumlah" harus diisi');
  }

  try {
    // Gunakan folder /tmp di Vercel
    const filePath = path.join('/tmp', `qris-${Date.now()}.jpg`);

    await qrisDinamis.makeFile(qris, {
      nominal: jumlah,
      path: filePath,
    });

    // Baca hasil file JPG dari /tmp dan kirimkan ke user
    const buffer = fs.readFileSync(filePath);
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (err) {
    console.error('Error generate QR:', err);
    res.status(500).send('Gagal generate QR');
  }
};
