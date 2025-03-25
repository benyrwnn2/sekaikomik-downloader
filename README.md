# Sekaikomik Downloader

Sekaikomik Downloader adalah aplikasi web sederhana untuk mengunduh komik dari website sekaikomik.lat dalam format PDF, mencari komik berdasarkan judul, dan menampilkan daftar komik terbaru. Proyek ini dibangun menggunakan Node.js, Express, dan beberapa library seperti Axios, Cheerio, dan PDFKit.

## Fitur
- **Download Komik**: Masukkan URL komik untuk mengunduhnya dalam format PDF, lengkap dengan thumbnail.
- **Cari Komik**: Cari komik berdasarkan judul dan lihat hasilnya dalam bentuk kartu.
- **Komik Terbaru**: Lihat 5 komik terbaru yang diambil secara dinamis dari situs sumber.
- **Desain Modern**: Antarmuka pengguna dengan desain responsif, efek hover, dan animasi sederhana.

## Prasyarat
Sebelum memulai, pastikan kamu memiliki:
- [Node.js](https://nodejs.org/) (versi LTS disarankan, misalnya v18.x atau lebih baru).
- [npm](https://www.npmjs.com/) (biasanya sudah terinstal bersama Node.js).
- Koneksi internet untuk mengunduh dependensi dan mengakses situs sumber komik.

## Instalasi
Ikuti langkah-langkah berikut untuk menginstal dan menjalankan proyek di komputer lokalmu:

### 1. Clone Repository
Clone repository ini ke komputer lokalmu menggunakan Git:
```bash
git clone https://github.com/<username>/komik-downloader.git
cd komik-downloader
