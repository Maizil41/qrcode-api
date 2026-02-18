import QRCode from "qrcode";

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
  qris = qris.slice(0, -4);

  const step1 = qris.replace("010211", "010212");
  const step2 = step1.split("5802ID");

  const uang =
    "54" +
    nominal.length.toString().padStart(2, "0") +
    nominal +
    "5802ID";

  const hasil = step2[0] + uang + step2[1];

  return hasil + ConvertCRC16(hasil);
}

export default async function handler(req, res) {
  try {
    const { id, harga } = req.query;

    if (!id || !harga) {
      return res.status(400).json({
        error: "Parameter id & harga wajib"
      });
    }

    const QRIS_STATIC =
"00020101021126670016COM.NOBUBANK.WWW01189360050300000907180214032208368264740303UMI51440014ID.CO.QRIS.WWW0215ID20254190269630303UMI5204481253033605802ID5919TOKO MUTIARA PONSEL6012ACEH SELATAN61052371162070703A0163045139";

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
      errorCorrectionLevel: "M"
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="qris-${id}.png"`
    );

    res.send(qrBuffer);

  } catch (err) {
    res.status(500).json({
      error: "Gagal generate QR",
      detail: err.message
    });
  }
}
