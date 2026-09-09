# Gold Advisor — Pegadaian / Tring v2

Dashboard statis untuk membantu timing akumulasi emas. Engine menggunakan drawdown dari peak, momentum 7/30/90 hari, slope jangka pendek, dan spread beli-vs-buyback.

## GitHub Pages

Pastikan struktur repository seperti ini, dengan `index.html` di root:

```text
gold-advisor/
├── index.html
├── data/
│   └── prices.json
├── scripts/
│   └── update_prices.py
└── .github/
    └── workflows/
        └── update.yml
```

Pages: **Deploy from a branch → main → / (root)**.

## Update otomatis

Workflow berjalan setiap hari sekitar **08:10 WIB**. Ia mengambil baris Galeri24 1 gram dari halaman Galeri24 resmi, menyimpan harga jual + buyback ke `data/prices.json`, lalu commit perubahan. Jika parser tidak yakin, workflow gagal dan **tidak menulis data tebakan**.

Catatan: halaman harga Pegadaian/Tring dirender dinamis, sehingga updater v2 memakai halaman harga resmi Galeri24 (anak perusahaan Pegadaian) sebagai feed yang lebih mudah dibaca oleh GitHub Actions. Harga final yang berlaku tetap harus dicek di Tring sebelum transaksi.
