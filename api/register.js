import { writeFile, readFile } from 'fs/promises';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Hanya POST yang diperbolehkan');

  const body = await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      const parsed = new URLSearchParams(data);
      resolve(Object.fromEntries(parsed));
    });
  });

  const { username, qris } = body;
  if (!username || !qris) return res.status(400).end('Username dan QRIS wajib diisi');

  try {
    let db = {};
    try {
      db = JSON.parse(await readFile('qris-db.json', 'utf-8'));
    } catch (e) {}

    db[username] = qris;
    await writeFile('qris-db.json', JSON.stringify(db, null, 2));
    res.end(`QRIS untuk ${username} berhasil disimpan.`);
  } catch (e) {
    console.error(e);
    res.status(500).end('Gagal simpan data');
  }
}
