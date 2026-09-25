# Mak Ros

Toko online untuk usaha rumahan: frozen food, camilan, kue kering, sambal, dan
busana. Pembeli memilih barang, lalu pesanannya tersusun rapi di WhatsApp toko.

- **Toko:** https://socialiam.github.io/mak-ros/
- **Dasbor:** https://socialiam.github.io/mak-ros/admin.html

Tanpa server dan tanpa biaya. Seluruh isi toko ada di satu berkas, `produk.js`,
dan berkas itu diubah lewat dasbor.

## Mengubah isi toko

Buka dasbor, ubah apa saja, lalu tekan **Terbitkan**. Ada dua cara terbit:

1. **Dari HP (disarankan).** Sambungkan sekali di *Info toko → Terbitkan dari HP*.
   Setelah itu setiap perubahan terbit dengan satu ketukan, foto ikut terunggah.
2. **Lewat laptop.** Tekan *Unduh produk.js*, lalu klik dua kali
   `kirim-ke-github.cmd`.

Perubahan yang belum terbit tersimpan di perangkat itu dan bisa dilihat dulu
dengan tombol **Pratinjau**.

Pasang dasbor di layar utama HP: buka dasbor di Chrome, menu ⋮, lalu
*Tambahkan ke layar utama*. Dasbor terbuka seperti aplikasi.

## Isi folder

| Berkas | Gunanya |
| --- | --- |
| `produk.js` | Isi toko: identitas, kategori, barang. Ditulis oleh dasbor. |
| `index.html`, `app.js`, `style.css` | Halaman toko untuk pembeli |
| `admin.html`, `admin.js`, `admin.css` | Dasbor pemilik toko |
| `foto/` | Foto barang yang diunggah dari dasbor |
| `gambar/` | Ikon toko dan gambar sampul untuk pratinjau link |
| `kirim-ke-github.cmd` | Terbit lewat laptop |

## Keamanan

Dasbor boleh dibuka siapa saja: tanpa kunci GitHub, ia hanya bisa mengunduh
berkas ke perangkatnya sendiri. Kunci GitHub disimpan di perangkat pemilik saja
dan hanya berhak mengubah repo `mak-ros`. Bila HP hilang, hapus kuncinya di
github.com/settings/personal-access-tokens.
