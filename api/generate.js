const qrisDinamis = require('qris-dinamis');
const fs = require('fs');

module.exports = async (req, res) => {
  const { qris, jumlah } = req.query;

  if (!qris || !jumlah) {
    return res.status(400).send('Parameter "qris" dan "jumlah" harus diisi');
  }

  try {
    const filePath = `/tmp/qris-${Date.now()}.jpg`;

    await qrisDinamis.makeFile(qris, {
      nominal: jumlah,
      path: filePath, // WAJIB pakai /tmp di Vercel
    });

    const buffer = fs.readFileSync(filePath);
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (err) {
    console.error('DETAIL ERROR:', err);
    res.status(500).send('Gagal generate QR: ' + err.message);
  }
};
