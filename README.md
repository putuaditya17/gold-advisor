# Gold Advisor v10

Dashboard static untuk membaca harga Galeri24 1 gram, koreksi, spread, BUY SCORE, rencana pembelian bertahap, simulator, dan replay sederhana terhadap histori.

## Prinsip
- Tidak mengarang titik harga yang tidak tersedia.
- Jika `data/prices.json` gagal dimuat di browser, `js/app.js` memakai embedded fallback agar UI tetap berfungsi.
- Perubahan 7/30/90/365 hari dihitung berdasarkan tanggal aktual dan hanya jika ada titik pada/ sebelum target.
- Replay 30/90 hari adalah eksploratif dan bukan bukti prediktif.

## GitHub Pages
Upload isi folder ini ke root repository, lalu Pages = `main` + `/ (root)`.

## GitHub Actions
Workflow hanya memvalidasi dataset. Ia sengaja tidak mengambil data dari sumber eksternal secara otomatis sampai parser sumber live disepakati dan tervalidasi.
