const qrisDinamis = require('qris-dinamis');

module.exports = async (req, res) => {
  const { qris, jumlah } = req.query;

  if (!qris || !jumlah) {
    return res.status(400).send('Parameter "qris" dan "jumlah" harus diisi');
  }

  try {
    // Misal qris-dinamis ada method makeBuffer() mirip makeFile()
    const buffer = await qrisDinamis.makeBuffer(qris, { nominal: jumlah });

    res.setHeader('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal generate QR: ' + error.message);
  }
};
