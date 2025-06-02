import QRCode from 'qrcode';
import { readFile } from 'fs/promises';

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
  let uang = "54" + nominal.length.toString().padStart(2, '0') + nominal + "5802ID";
  let hasil = step2[0] + uang + step2[1];
  hasil += ConvertCRC16(hasil);
  return hasil;
}

export default async function handler(req, res) {
  const { username, jumlah } = req.query;
  if (!username || !jumlah) return res.status(400).send('Parameter username dan jumlah wajib');

  try {
    const db = JSON.parse(await readFile('qris-db.json', 'utf-8'));
    const qris = db[username];
    if (!qris) return res.status(404).send('QRIS tidak ditemukan untuk username tersebut');

    const qrisDinamis = convertQris(qris, jumlah);
    const buffer = await QRCode.toBuffer(qrisDinamis, { width: 512 });
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (e) {
    console.error(e);
    res.status(500).send('Terjadi kesalahan saat generate');
  }
}
