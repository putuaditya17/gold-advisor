# Gold Advisor v11

Gold Advisor adalah dashboard pribadi untuk membaca timing akumulasi Galeri24 1 gram. V11 memisahkan data, collector, dan engine keputusan agar lebih mudah diaudit dan dikembangkan.

## Arsitektur
- **Frontend:** HTML + CSS + vanilla JS; cocok untuk GitHub Pages.
- **Dataset:** `data/prices.json` dengan schema v2.
- **Collector:** `scripts/update_prices.py` mengambil satu snapshot per hari dari halaman publik Galeri24 1 gram.
- **Scheduler:** `.github/workflows/update.yml` berjalan harian dan dapat dijalankan manual.
- **Fallback:** `js/app.js` membawa salinan dataset internal terakhir agar UI tetap tampil jika fetch JSON gagal.

## Etika collector
Collector menggunakan satu request terjadwal per hari, tidak login, tidak mengakses data pribadi, tidak mencoba melewati proteksi, dan berhenti jika struktur data tidak terbaca dengan yakin. Sumber yang dirujuk: https://galeri24.co.id/harga-emas/

## Interpretasi
BUY SCORE adalah decision aid berbasis rule + histori, bukan prediksi harga. Confidence mengukur kualitas/kepadatan data, bukan peluang profit. Replay hanya eksploratif.

## GitHub Pages
Publikasikan branch `main`, folder `/ (root)`.

## GitHub Actions
Setelah upload, buka **Actions → Daily Galeri24 price refresh → Run workflow** untuk uji pertama.


V12 UI update: desktop layout now uses a wider 1760px canvas with responsive gutters and wider chart/content columns, reducing unused side space on large browsers.

## V14 UI
- Wide desktop layout without artificial max-width.
- Consumer-finance style navigation and decision hierarchy.
- Interactive price points with date, sell price, buyback and point-to-point change.
- Chart uses actual calendar spacing between observations.
- Dashboard emphasizes a plain-language action and a concrete starting allocation.
- Sparse history is disclosed instead of being filled with invented points.


## V15: regime/rebound reading
Menambahkan klasifikasi regime sederhana untuk membedakan rebound harian dari pembalikan tren 30/90 hari. Ini indikator interpretasi, bukan prediksi.
