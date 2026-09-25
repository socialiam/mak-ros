// Mesin toko. Tidak perlu diubah; isi toko ada di produk.js.
(function () {
  const toko = window.TOKO;
  const rupiah = (n) => "Rp" + n.toLocaleString("id-ID");
  const $ = (id) => document.getElementById(id);

  const SEMUA = "semua";
  let kategoriAktif = SEMUA;
  let keranjang = [];
  try { keranjang = JSON.parse(localStorage.getItem("makros-keranjang")) || []; } catch (e) {}

  function simpan() {
    try { localStorage.setItem("makros-keranjang", JSON.stringify(keranjang)); } catch (e) {}
  }

  function isiIdentitas() {
    document.title = toko.nama;
    $("namaToko").textContent = toko.nama;
    $("namaKaki").textContent = toko.nama;
    $("slogan").textContent = toko.slogan;
    $("kota").textContent = toko.kota;
    $("tahun").textContent = new Date().getFullYear();
  }

  function gambarTab() {
    $("tab").innerHTML = "";
    [{ id: SEMUA, nama: "Semua", ikon: "🏠" }].concat(toko.kategori).forEach((k) => {
      const b = document.createElement("button");
      b.textContent = k.ikon + " " + k.nama;
      b.setAttribute("aria-pressed", k.id === kategoriAktif);
      b.onclick = () => { kategoriAktif = k.id; gambarTab(); gambarDaftar(); };
      $("tab").appendChild(b);
    });
  }

  function gambarDaftar() {
    const daftar = $("daftar");
    daftar.innerHTML = "";
    const tampil = kategoriAktif === SEMUA
      ? toko.kategori
      : toko.kategori.filter((k) => k.id === kategoriAktif);

    tampil.forEach((k) => {
      const isi = toko.produk.filter((p) => p.kategori === k.id);
      if (kategoriAktif === SEMUA) {
        const judul = document.createElement("h2");
        judul.className = "judul-kategori";
        judul.textContent = k.ikon + " " + k.nama;
        daftar.appendChild(judul);
      }
      if (!isi.length) {
        const kosong = document.createElement("p");
        kosong.className = "kosong-kategori";
        kosong.textContent = "Barang di kategori ini segera hadir.";
        daftar.appendChild(kosong);
      }
      isi.forEach((p) => daftar.appendChild(buatKartu(p)));
    });
  }

  function buatKartu(p) {
    const kartu = document.createElement("article");
    kartu.className = "kartu";

    const gambar = document.createElement("div");
    gambar.className = "gambar";
    if (p.foto) {
      const img = document.createElement("img");
      img.src = p.foto; img.alt = p.nama; img.loading = "lazy";
      gambar.appendChild(img);
    } else {
      gambar.textContent = p.ikon || "🛍️";
    }

    const judul = document.createElement("h3");
    judul.textContent = p.nama;
    const ket = document.createElement("p");
    ket.textContent = p.keterangan || "";
    const harga = document.createElement("div");
    harga.className = "harga";
    harga.textContent = rupiah(p.harga);

    kartu.append(gambar, judul, ket, harga);

    let pilih = null;
    if (p.pilihan && p.pilihan.length) {
      pilih = document.createElement("select");
      pilih.setAttribute("aria-label", "Pilihan " + p.nama);
      p.pilihan.forEach((v) => pilih.add(new Option(v, v)));
      kartu.appendChild(pilih);
    }

    const tombol = document.createElement("button");
    tombol.textContent = "+ Keranjang";
    if (p.habis) {
      tombol.textContent = "Stok habis";
      tombol.disabled = true;
      kartu.classList.add("kosong");
    }
    tombol.onclick = () => {
      tambah(p, pilih ? pilih.value : "");
      tombol.textContent = "✓ Ditambahkan";
      setTimeout(() => (tombol.textContent = "+ Keranjang"), 900);
    };
    kartu.appendChild(tombol);
    return kartu;
  }

  function tambah(p, pilihan) {
    const ada = keranjang.find((x) => x.id === p.id && x.pilihan === pilihan);
    if (ada) ada.jumlah += 1;
    else keranjang.push({ id: p.id, pilihan, jumlah: 1 });
    simpan(); gambarKeranjang();
  }

  function produkDari(item) {
    return toko.produk.find((p) => p.id === item.id);
  }

  function hitungTotal() {
    return keranjang.reduce((s, x) => {
      const p = produkDari(x);
      return p ? s + p.harga * x.jumlah : s;
    }, 0);
  }

  function gambarKeranjang() {
    keranjang = keranjang.filter((x) => produkDari(x) && !produkDari(x).habis && x.jumlah > 0);
    const jumlah = keranjang.reduce((s, x) => s + x.jumlah, 0);
    $("bukaKeranjang").hidden = jumlah === 0;
    $("jumlahKeranjang").textContent = jumlah;
    $("totalMini").textContent = rupiah(hitungTotal());
    $("total").textContent = rupiah(hitungTotal());

    const ul = $("isiKeranjang");
    ul.innerHTML = "";
    keranjang.forEach((x) => {
      const p = produkDari(x);
      const li = document.createElement("li");
      const nama = document.createElement("span");
      nama.textContent = p.nama + (x.pilihan ? " (" + x.pilihan + ")" : "") + " × " + x.jumlah;
      const kurang = document.createElement("button");
      kurang.textContent = "−"; kurang.setAttribute("aria-label", "Kurangi");
      kurang.onclick = () => { x.jumlah -= 1; simpan(); gambarKeranjang(); if (!keranjang.length) $("keranjang").close(); };
      const lebih = document.createElement("button");
      lebih.textContent = "+"; lebih.setAttribute("aria-label", "Tambah");
      lebih.onclick = () => { x.jumlah += 1; simpan(); gambarKeranjang(); };
      li.append(nama, kurang, lebih);
      ul.appendChild(li);
    });
  }

  function kirimWhatsApp() {
    if (/x/i.test(toko.nomorWhatsApp)) {
      alert("Nomor WhatsApp toko belum diisi. Ubah nomorWhatsApp di berkas produk.js.");
      return;
    }
    const baris = keranjang.map((x) => {
      const p = produkDari(x);
      return "• " + p.nama + (x.pilihan ? " (" + x.pilihan + ")" : "") +
        " × " + x.jumlah + " = " + rupiah(p.harga * x.jumlah);
    });
    const pesan = [
      "Assalamualaikum " + toko.nama + ", saya mau pesan:",
      "",
      ...baris,
      "",
      "Total: " + rupiah(hitungTotal()),
      "Nama: " + ($("namaPemesan").value.trim() || "-"),
      "Alamat: " + ($("alamat").value.trim() || "-")
    ].join("\n");
    window.open("https://wa.me/" + toko.nomorWhatsApp + "?text=" + encodeURIComponent(pesan), "_blank");
  }

  $("bukaKeranjang").onclick = () => $("keranjang").showModal();
  $("tutup").onclick = () => $("keranjang").close();
  $("kirimWa").onclick = kirimWhatsApp;

  isiIdentitas();
  gambarTab();
  gambarDaftar();
  gambarKeranjang();
})();
