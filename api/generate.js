const qrisDinamis = require('qris-dinamis');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  const { qris, jumlah } = req.query;

  if (!qris || !jumlah) {
    return res.status(400).send('Parameter "qris" dan "jumlah" harus diisi');
  }

  try {
    const filePath = path.join('/tmp', `qris-${Date.now()}.jpg`);

    await qrisDinamis.makeFile(qris, {
      nominal: jumlah,
      path: filePath
    });

    const imgBuffer = fs.readFileSync(filePath);
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imgBuffer);
  } catch (err) {
    console.error('Gagal membuat file QR:', err);
    res.status(500).send('Gagal membuat QR');
  }
};
