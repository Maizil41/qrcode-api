module.exports = async (req, res) => {
  const { qris, jumlah } = req.query;

  if (!qris || !jumlah) {
    return res.status(400).send('Parameter "qris" dan "jumlah" harus diisi');
  }

  try {
    const filePath = `/tmp/qris-${Date.now()}.jpg`;

    await qrisDinamis.makeFile(qris, {
      nominal: jumlah,
      path: filePath,
    });

    const buffer = fs.readFileSync(filePath);
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (err) {
    console.error('DETAIL ERROR:', err); // << tambahkan log
    res.status(500).send('Gagal generate QR: ' + err.message);
  }
};
