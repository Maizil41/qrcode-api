import { makeFile } from 'qris-dinamis';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { qris, jumlah } = req.query;

  if (!qris || !jumlah) {
    return res.status(400).send('Parameter "qris" dan "jumlah" harus diisi');
  }

  try {
    const outputPath = path.join('/tmp', `qris-${Date.now()}.jpg`);

    await makeFile(qris, {
      nominal: jumlah,
      path: outputPath,
    });

    const imageBuffer = fs.readFileSync(outputPath);
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (err) {
    console.error('Gagal generate QR:', err);
    res.status(500).send('Gagal generate QR');
  }
}
