# Gold Advisor v4

Dashboard web untuk membantu membaca kondisi harga emas dan menentukan pembelian bertahap.

## Struktur
- `index.html` UI utama
- `css/styles.css` styling
- `js/app.js` decision engine + interactive chart + simulator
- `data/prices.json` histori
- `scripts/update_prices.py` updater fail-closed
- `.github/workflows/update.yml` update harian

## GitHub Pages
Upload seluruh isi folder ini ke root branch `main`, lalu aktifkan Pages dari `main` + `/(root)`.

## Catatan data
Dataset awal merupakan snapshot historis, bukan satu tahun penuh harian. Karena itu skor adalah decision aid, bukan prediksi dan belum merupakan backtest statistik final. Selalu cek harga final di Tring/Pegadaian sebelum transaksi.
