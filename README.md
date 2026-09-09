# Gold Advisor v5

Dashboard statis untuk membantu menentukan **kapan** dan **berapa banyak** membeli emas Galeri24 1 gram.

## Struktur
- `index.html` — single-page dashboard dengan halaman Ringkasan, Market, Keputusan, Simulator, Cara kerja.
- `css/styles.css` — UI responsive bergaya financial app modern.
- `js/app.js` — analytics engine, grafik, simulator, dan navigasi.
- `data/prices.json` — histori harga.
- `scripts/update_prices.py` — pengambil harga harian dari halaman resmi Galeri24.
- `.github/workflows/update.yml` — update otomatis harian via GitHub Actions.

## GitHub Pages
1. Upload **isi ZIP** ke root branch `main`.
2. Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
3. Buka `https://USERNAME.github.io/gold-advisor/`.
4. Jalankan Actions → **Daily gold price refresh** sekali secara manual untuk tes.

## Catatan data
Dataset awal berisi snapshot historis yang tersedia. Engine v5 menggunakan tanggal kalender untuk menghitung perubahan 7/30/90/365 hari dan tidak menganggap setiap snapshot sebagai satu hari. Histori harian akan bertambah dari update otomatis setelah workflow aktif.

## Catatan metodologi
BUY SCORE adalah rule-based decision aid, bukan prediksi harga dan belum merupakan backtest statistik penuh. Backtest 7/30/90 hari sebaiknya diaktifkan setelah histori harian cukup panjang.
