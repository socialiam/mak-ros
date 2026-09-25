// DATA TOKO MA ROS
// Hanya berkas ini yang perlu diubah untuk mengganti isi toko.
// Harga ditulis angka biasa tanpa titik: 35000 berarti Rp35.000.
// "pilihan" boleh dihapus bila barang tidak punya ukuran/varian.

window.TOKO = {
  nama: "Mak Ros",
  slogan: "Masakan rumahan beku & busana pilihan, dari dapur dan lemari keluarga.",
  // Nomor WhatsApp: awali 62, tanpa 0 di depan, tanpa spasi. Contoh 6281234567890
  nomorWhatsApp: "62XXXXXXXXXXX",
  kota: "Kota Anda",

  kategori: [
    { id: "frozen", nama: "Frozen Food", ikon: "🥟" },
    { id: "camilan", nama: "Camilan", ikon: "🥨" },
    { id: "kue", nama: "Kue Kering", ikon: "🍪" },
    { id: "sambal", nama: "Sambal & Bumbu", ikon: "🌶️" },
    { id: "fashion", nama: "Fashion", ikon: "👗" }
  ],

  produk: [
    { id: "F01", kategori: "frozen", nama: "Dimsum Ayam isi 20", harga: 35000, ikon: "🥟",
      keterangan: "Tanpa pengawet. Kukus 15 menit langsung dari freezer.",
      pilihan: ["Original", "Pedas"] },
    { id: "F02", kategori: "frozen", nama: "Nugget Ayam Sayur 500 g", harga: 42000, ikon: "🍗",
      keterangan: "Ayam asli dicampur wortel dan buncis. Anak-anak suka." },
    { id: "F03", kategori: "frozen", nama: "Risol Mayo isi 10", harga: 30000, ikon: "🥐",
      keterangan: "Isi smoked beef, telur dan mayones. Tinggal goreng." },
    { id: "F04", kategori: "frozen", nama: "Rendang Sapi 250 g", harga: 65000, ikon: "🍛",
      keterangan: "Resep keluarga, dimasak 6 jam. Hangatkan saja." },

    { id: "C01", kategori: "camilan", nama: "Keripik Singkong Balado 250 g", harga: 20000, ikon: "🥔",
      keterangan: "Renyah, bumbu balado meresap.",
      pilihan: ["Original", "Balado", "Pedas Level 3"] },
    { id: "C02", kategori: "camilan", nama: "Rempeyek Kacang isi 10", harga: 18000, ikon: "🥜",
      keterangan: "Tipis, gurih, kacang tanah pilihan." },
    { id: "C03", kategori: "camilan", nama: "Makaroni Pedas Daun Jeruk 200 g", harga: 15000, ikon: "🌀",
      keterangan: "Pedas nagih, wangi daun jeruk." },

    { id: "K01", kategori: "kue", nama: "Nastar Premium 500 g", harga: 85000, ikon: "🍪",
      keterangan: "Selai nanas buatan sendiri, mentega wisman." },
    { id: "K02", kategori: "kue", nama: "Kastengel Keju 500 g", harga: 90000, ikon: "🧀",
      keterangan: "Keju edam asli, gurih dan lumer." },

    { id: "S01", kategori: "sambal", nama: "Sambal Bawang 150 ml", harga: 25000, ikon: "🌶️",
      keterangan: "Tahan 2 minggu di suhu ruang.",
      pilihan: ["Sedang", "Pedas", "Extra Pedas"] },
    { id: "S02", kategori: "sambal", nama: "Bumbu Rendang Siap Masak", harga: 30000, ikon: "🫙",
      keterangan: "Untuk 1 kg daging. Tinggal tambah santan." },

    { id: "B01", kategori: "fashion", nama: "Gamis Katun Polos", harga: 145000, ikon: "👗",
      keterangan: "Katun adem, jahitan rapi, ada saku.",
      pilihan: ["M", "L", "XL"] },
    { id: "B02", kategori: "fashion", nama: "Kemeja Pria Lengan Panjang", harga: 120000, ikon: "👔",
      keterangan: "Bahan oxford, tidak mudah kusut.",
      pilihan: ["M", "L", "XL"] },
    { id: "B03", kategori: "fashion", nama: "Kaos Anak Karakter", harga: 55000, ikon: "👕",
      keterangan: "Cotton combed 30s, sablon awet.",
      pilihan: ["2-4 th", "5-7 th", "8-10 th"] },
    { id: "B04", kategori: "fashion", nama: "Kerudung Segi Empat", harga: 45000, ikon: "🧕",
      keterangan: "Voal premium, mudah dibentuk.",
      pilihan: ["Hitam", "Krem", "Dusty Pink"] }
  ]
};
