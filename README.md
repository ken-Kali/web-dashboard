# AM Generator Dashboard

Dashboard responsif Node.js + Express. Endpoint proses sengaja berupa demo aman; belum terhubung ke layanan eksternal.

## Persyaratan
- Node.js 18 atau lebih baru
- npm

## Menjalankan lokal
```bash
npm install
npm start
```
Buka http://localhost:3000

## Endpoint
- `GET /api/status` — status backend.
- `POST /api/process` — menerima `{ "count": 1 }`, batas 1–10, dan mengembalikan data demo.

## Menghubungkan layanan yang kamu berwenang kelola
Ubah blok demo di `server.js` untuk memanggil API resmi yang kamu kelola. Sebelum dipublikasikan:
1. Tambahkan autentikasi dan otorisasi.
2. Simpan rahasia di environment variables server, jangan di `public/app.js`.
3. Terapkan rate limiting, logging tanpa data sensitif, dan validasi input.
4. Atur CORS dan HTTPS bila frontend/backend berada di domain terpisah.
5. Jangan menghubungkan endpoint ke pembuatan akun massal atau verifikasi akun pihak ketiga tanpa izin.

## Deploy
Deploy sebagai Node web service di hosting Node.js (mis. Render atau Railway). Build command biasanya `npm install`, start command `npm start`. Hosting akan menentukan URL publik setelah deploy berhasil.
