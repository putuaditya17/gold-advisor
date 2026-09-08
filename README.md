# Gold Advisor — Pegadaian / Tring

Dashboard web statis untuk membantu menentukan timing akumulasi emas. Fitur:
- harga terakhir Galeri24 1 gram
- spread beli vs buyback
- perubahan 7/30/90/365 hari
- drawdown dari peak
- BUY SCORE 0–100
- zona cicil / agresif / ekstrem
- simulasi alokasi modal

## Menjalankan di komputer
Gunakan web server sederhana, karena browser biasanya memblokir fetch JSON dari `file://`.

```bash
python -m http.server 8080
```
Lalu buka `http://localhost:8080`.

## Update otomatis harian
Untuk benar-benar otomatis, deploy folder ini ke GitHub Pages dan aktifkan workflow `.github/workflows/update.yml`. Workflow dipasang sebagai kerangka: sumber data harus disesuaikan dengan endpoint/feed Pegadaian yang dapat diakses tanpa login. Dashboard sengaja memisahkan `data/prices.json` dari UI agar sumber data dapat diganti tanpa mengubah mesin analisis.

## Catatan
Dataset awal berisi snapshot historis yang dapat diverifikasi. Ini bukan feed harian penuh 365 hari. Engine tidak menjanjikan prediksi; ia memberi rule-based timing signal berdasarkan data yang tersedia.
