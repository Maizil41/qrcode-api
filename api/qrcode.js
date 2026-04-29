import QRCode from "qrcode";
import sharp from "sharp";
import path from "path";
import fs from "fs";

function ConvertCRC16(str) {
  let crc = 0xFFFF;

  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;

    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x8000)
        ? (crc << 1) ^ 0x1021
        : crc << 1;
    }
  }

  return (crc & 0xFFFF)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");
}

function convertQris(qris, nominal) {
  let data = qris.trim();
  data = data.slice(0, -4);
  data = data.replace("010211", "010212");
  data = data.replace(/54\d{2}\d+/g, "");

  const amount =
    "54" +
    nominal.length.toString().padStart(2, "0") +
    nominal;

  if (data.includes("5802ID")) {
    data = data.replace("5802ID", amount + "5802ID");
  } else {
    data += amount;
  }

  data += "6304";

  const crc = ConvertCRC16(data);

  return data + crc;
}

export default async function handler(req, res) {
  try {
    const { id, harga, string } = req.query;

    if (!id || !harga || !string) {
      return res.status(400).json({
        error: "Parameter string, id & harga wajib"
      });
    }

    const QRIS_STATIC = String(string).trim();

    if (!QRIS_STATIC.startsWith("000201")) {
      return res.status(400).json({
        error: "QRIS tidak valid"
      });
    }

    const nominal = String(harga).replace(/\D/g, "");
    if (!nominal) {
      return res.status(400).json({
        error: "Nominal tidak valid"
      });
    }

    const qrisDinamis = convertQris(QRIS_STATIC, nominal);

    const qrBuffer = await QRCode.toBuffer(qrisDinamis, {
      width: 512,
      margin: 4,
      errorCorrectionLevel: "H"
    });

    const logoPath = path.join(process.cwd(), "public/logo.png");

    let finalBuffer = qrBuffer;

    if (fs.existsSync(logoPath)) {
      const logoBuffer = await sharp(logoPath)
        .resize(110, 110)
        .toBuffer();

      finalBuffer = await sharp(qrBuffer)
        .composite([
          {
            input: logoBuffer,
            gravity: "center"
          }
        ])
        .png()
        .toBuffer();
    }

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="qris-${id}.png"`
    );

    res.send(finalBuffer);

  } catch (err) {
    res.status(500).json({
      error: "Gagal generate QR",
      detail: err.message
    });
  }
}
