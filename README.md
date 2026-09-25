# Ma Ros

Toko online sederhana untuk usaha rumahan: **frozen food** dan **fashion**.
Pembeli memilih barang, lalu pesanannya terkirim rapi ke WhatsApp toko.

- Tanpa server, tanpa biaya: tayang gratis lewat GitHub Pages.
- Tanpa database: seluruh isi toko ada di satu berkas, `produk.js`.
- Bisa dibuka di HP maupun laptop, dan mengikuti mode gelap.

## Isi folder

| Berkas | Gunanya | Perlu diubah? |
| --- | --- | --- |
| `produk.js` | Nama toko, nomor WhatsApp, kategori, daftar barang dan harga | **Ya, hanya ini** |
| `index.html` | Kerangka halaman | Tidak |
| `style.css` | Warna dan tata letak | Tidak |
| `app.js` | Mesin keranjang dan pesan WhatsApp | Tidak |
| `foto/` | Tempat foto barang (opsional) | Tambahkan foto di sini |

## Cara mengubah isi toko

1. Buka `produk.js`.
2. Isi `nomorWhatsApp`, diawali `62` tanpa angka 0 di depan.
3. Ubah, tambah, atau hapus barang. Harga ditulis tanpa titik: `35000`.
4. Untuk memakai foto, taruh fotonya di folder `foto/` lalu tambahkan
   `foto: "foto/dimsum.jpg"` pada barang itu. Tanpa foto, ikon yang tampil.
5. Klik dua kali `index.html` untuk melihat hasilnya di laptop.
6. Klik dua kali `kirim-ke-github.cmd` agar perubahan tayang di internet.

## Menambah kategori

Tambahkan satu baris di `kategori`, misalnya
`{ id: "kue", nama: "Kue Kering", ikon: "🍪" }`, lalu beri barang
`kategori: "kue"`. Mesinnya tidak perlu disentuh.
