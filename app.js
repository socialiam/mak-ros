// Mesin toko Mak Ros. Isi toko ada di produk.js dan diubah lewat dasbor (admin.html).
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const rupiah = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");
  const simpanLokal = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const bacaLokal = (k, awal) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? awal : v; } catch (e) { return awal; } };

  // Mode pratinjau: dasbor membuka toko dengan perubahan yang belum diterbitkan.
  let toko = window.TOKO;
  if (/[?&]pratinjau/.test(location.search)) {
    const kerja = bacaLokal("makros-admin-kerja", null);
    if (kerja && kerja.produk) { toko = kerja; $("pitaPratinjau").hidden = false; }
  }
  toko.produk = toko.produk || [];
  toko.kategori = toko.kategori || [];

  // Warna latar lembut untuk barang tanpa foto, satu per kategori.
  const PALET = ["#f6e3d6", "#f3ead0", "#e3eedf", "#f5dde0", "#e0e8f3", "#ece2f3", "#f1e6da"];
  const PALET_GELAP = ["#3a2419", "#3a321c", "#1f3124", "#3a2226", "#1f2a38", "#2d2238", "#33271d"];
  const gelap = matchMedia("(prefers-color-scheme: dark)").matches;
  function warnaKategori(idKategori) {
    const i = Math.max(0, toko.kategori.findIndex((k) => k.id === idKategori));
    return (gelap ? PALET_GELAP : PALET)[i % PALET.length];
  }
  const kategoriDari = (id) => toko.kategori.find((k) => k.id === id) || { nama: "", ikon: "🛍️" };
  const produkDari = (id) => toko.produk.find((p) => p.id === id);

  // ---------- Identitas ----------
  function isiIdentitas() {
    document.querySelectorAll("[data-isi]").forEach((el) => {
      const nilai = toko[el.dataset.isi];
      if (nilai) el.textContent = nilai;
    });
    document.title = toko.nama + " · Dapur & Butik Rumahan";
    $("tahun").textContent = new Date().getFullYear();
    $("infoBayar").textContent = (toko.pembayaran || []).join(" · ") || "Tanyakan lewat WhatsApp";
    const sapa = "https://wa.me/" + toko.nomorWhatsApp + "?text=" +
      encodeURIComponent("Assalamualaikum " + toko.nama + ", saya mau tanya-tanya dulu 😊");
    ["waAtas", "waPahlawan"].forEach((id) => ($(id).href = sapa));
  }

  // Hiasan melayang di bagian pembuka, dari ikon barang yang ada.
  function gambarHias() {
    const ikon = [...new Set(toko.produk.map((p) => p.ikon).filter(Boolean))].slice(0, 6);
    // Di layar HP hiasan diletakkan di tepi supaya tidak menutupi tulisan.
    const posisi = innerWidth < 720
      ? [[-4, 3, 58], [86, 1, 62], [-6, 86, 50], [88, 88, 54]]
      : [[6, 14, 64], [84, 10, 72], [2, 62, 56], [88, 58, 60], [16, 86, 48], [76, 88, 50]];
    $("hias").innerHTML = "";
    posisi.forEach(([x, y, u], i) => {
      if (!ikon[i]) return;
      const s = document.createElement("span");
      s.textContent = ikon[i];
      s.style.cssText = `left:${x}%;top:${y}%;--u:${u}px;--tunda:${i * -1.2}s`;
      $("hias").appendChild(s);
    });
  }

  // ---------- Kartu barang ----------
  function isiGambar(wadah, p) {
    wadah.style.setProperty("--latar-ikon", warnaKategori(p.kategori));
    wadah.textContent = "";
    if (p.foto) {
      const img = document.createElement("img");
      img.src = p.foto; img.alt = p.nama; img.loading = "lazy"; img.decoding = "async";
      wadah.appendChild(img);
    } else {
      wadah.textContent = p.ikon || kategoriDari(p.kategori).ikon || "🛍️";
    }
  }

  function buatKartu(p, urutan) {
    const kartu = document.createElement("article");
    kartu.className = "kartu" + (p.habis ? " habis" : "");
    kartu.style.animationDelay = Math.min(urutan, 12) * 40 + "ms";

    const buka = document.createElement("button");
    buka.className = "kartu-buka";
    buka.setAttribute("aria-label", p.nama + ", " + rupiah(p.harga) + (p.habis ? ", stok habis" : ""));
    buka.onclick = () => bukaBarang(p.id);

    const gambar = document.createElement("div");
    gambar.className = "gambar";
    isiGambar(gambar, p);
    if (p.habis) {
      const st = document.createElement("span"); st.className = "stiker habis"; st.textContent = "Stok habis";
      gambar.appendChild(st);
    } else if (p.unggulan) {
      const st = document.createElement("span"); st.className = "stiker"; st.textContent = "⭐ Favorit";
      gambar.appendChild(st);
    }

    const teks = document.createElement("div");
    teks.className = "kartu-teks";
    const h = document.createElement("h3"); h.textContent = p.nama;
    const k = document.createElement("p"); k.textContent = p.keterangan || "";
    const hr = document.createElement("div"); hr.className = "kartu-harga"; hr.textContent = rupiah(p.harga);
    teks.append(h, k, hr);
    buka.append(gambar, teks);
    kartu.appendChild(buka);

    const tambah = document.createElement("button");
    tambah.className = "kartu-tambah";
    tambah.setAttribute("aria-label", "Tambah " + p.nama + " ke keranjang");
    tambah.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-plus"/></svg>';
    tambah.onclick = () => {
      if (p.pilihan && p.pilihan.length) bukaBarang(p.id);
      else masukKeranjang(p.id, "", 1);
    };
    kartu.appendChild(tambah);
    return kartu;
  }

  // ---------- Unggulan ----------
  function gambarUnggulan() {
    const isi = toko.produk.filter((p) => p.unggulan && !p.habis);
    $("bagianUnggulan").hidden = !isi.length;
    $("unggulan").innerHTML = "";
    isi.forEach((p, i) => $("unggulan").appendChild(buatKartu(p, i)));
  }

  // ---------- Kategori & pencarian ----------
  let kategoriAktif = "semua";
  let kataCari = "";

  function gambarTab() {
    $("tab").innerHTML = "";
    const semua = [{ id: "semua", nama: "Semua", ikon: "✨" }].concat(
      toko.kategori.filter((k) => toko.produk.some((p) => p.kategori === k.id))
    );
    semua.forEach((k) => {
      const b = document.createElement("button");
      b.textContent = k.ikon + " " + k.nama;
      b.setAttribute("aria-pressed", k.id === kategoriAktif);
      b.onclick = () => {
        kategoriAktif = k.id;
        gambarTab(); gambarDaftar();
        b.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
      };
      $("tab").appendChild(b);
    });
  }

  const normal = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  function gambarDaftar() {
    const daftar = $("daftar");
    daftar.innerHTML = "";
    const cari = normal(kataCari.trim());
    const cocok = (p) => !cari || normal(p.nama + " " + p.keterangan + " " + kategoriDari(p.kategori).nama).includes(cari);
    const tampil = kategoriAktif === "semua" ? toko.kategori : toko.kategori.filter((k) => k.id === kategoriAktif);

    let urutan = 0;
    tampil.forEach((k) => {
      // Barang yang tersedia di depan, yang habis di belakang.
      const isi = toko.produk.filter((p) => p.kategori === k.id && cocok(p))
        .sort((a, b) => (a.habis ? 1 : 0) - (b.habis ? 1 : 0));
      if (!isi.length) return;
      if (kategoriAktif === "semua" || cari) {
        const j = document.createElement("h3");
        j.className = "judul-kategori";
        j.innerHTML = "<span></span><small></small>";
        j.firstChild.textContent = k.ikon + " " + k.nama;
        j.lastChild.textContent = isi.length + " pilihan";
        daftar.appendChild(j);
      }
      isi.forEach((p) => daftar.appendChild(buatKartu(p, urutan++)));
    });

    if (!urutan) {
      const kosong = document.createElement("div");
      kosong.className = "kosong-daftar";
      kosong.innerHTML = "<b>🔍</b>";
      kosong.append(cari ? "Belum ada yang cocok dengan “" + kataCari.trim() + "”. Coba kata lain, atau tanyakan lewat WhatsApp." : "Barang segera hadir.");
      daftar.appendChild(kosong);
    }
  }

  $("cari").addEventListener("input", (e) => { kataCari = e.target.value; gambarDaftar(); });

  // ---------- Lembar detail barang ----------
  let detail = { id: null, pilihan: "", jumlah: 1 };

  function bukaBarang(id) {
    const p = produkDari(id);
    if (!p) return;
    detail = { id, pilihan: (p.pilihan && p.pilihan[0]) || "", jumlah: 1 };
    isiGambar($("dGambar"), p);
    const k = kategoriDari(p.kategori);
    $("dKategori").textContent = k.ikon + " " + k.nama;
    $("dNama").textContent = p.nama;
    $("dHarga").textContent = rupiah(p.harga);
    $("dKet").textContent = p.keterangan || "";
    $("dPilihanWadah").hidden = !(p.pilihan && p.pilihan.length);
    buatPilihan($("dPilihan"), p.pilihan || [], detail.pilihan, (v) => (detail.pilihan = v));
    perbaruiDetail();
    $("dMasuk").disabled = !!p.habis;
    $("lembarBarang").showModal();
    $("lembarBarang").querySelector(".lembar-isi").scrollTop = 0;
  }

  function perbaruiDetail() {
    const p = produkDari(detail.id);
    $("dJumlah").textContent = detail.jumlah;
    $("dMasuk").innerHTML = "";
    $("dMasuk").append(p.habis ? "Stok sedang habis" : "Tambah · " + rupiah(p.harga * detail.jumlah));
  }

  $("dKurang").onclick = () => { detail.jumlah = Math.max(1, detail.jumlah - 1); perbaruiDetail(); };
  $("dTambah").onclick = () => { detail.jumlah = Math.min(99, detail.jumlah + 1); perbaruiDetail(); };
  $("dMasuk").onclick = () => {
    masukKeranjang(detail.id, detail.pilihan, detail.jumlah);
    $("lembarBarang").close();
  };

  function buatPilihan(wadah, daftar, terpilih, ketikaPilih) {
    wadah.innerHTML = "";
    daftar.forEach((v) => {
      const b = document.createElement("button");
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", v === terpilih);
      b.textContent = v;
      b.onclick = () => {
        wadah.querySelectorAll("button").forEach((x) => x.setAttribute("aria-checked", x === b));
        ketikaPilih(v);
      };
      wadah.appendChild(b);
    });
  }

  // ---------- Keranjang ----------
  let keranjang = bacaLokal("makros-keranjang", []).filter((x) => produkDari(x.id) && !produkDari(x.id).habis);
  const pemesan = bacaLokal("makros-pemesan", { nama: "", alamat: "", kirim: "Diantar", bayar: "" });

  function masukKeranjang(id, pilihan, jumlah) {
    const ada = keranjang.find((x) => x.id === id && x.pilihan === pilihan);
    if (ada) ada.jumlah = Math.min(99, ada.jumlah + jumlah);
    else keranjang.push({ id, pilihan, jumlah });
    simpanLokal("makros-keranjang", keranjang);
    gambarKeranjang();
    const bilah = $("bukaKeranjang");
    bilah.classList.remove("goyang"); void bilah.offsetWidth; bilah.classList.add("goyang");
    if (navigator.vibrate) navigator.vibrate(12);
    roti("✓ " + produkDari(id).nama + " masuk keranjang");
  }

  const hitungTotal = () => keranjang.reduce((s, x) => s + produkDari(x.id).harga * x.jumlah, 0);

  function gambarKeranjang() {
    keranjang = keranjang.filter((x) => x.jumlah > 0 && produkDari(x.id));
    const jumlah = keranjang.reduce((s, x) => s + x.jumlah, 0);
    $("bukaKeranjang").hidden = jumlah === 0;
    $("jumlahKeranjang").textContent = jumlah;
    $("totalMini").textContent = rupiah(hitungTotal());
    $("total").textContent = rupiah(hitungTotal());

    const ul = $("isiKeranjang");
    ul.innerHTML = "";
    keranjang.forEach((x) => {
      const p = produkDari(x.id);
      const li = document.createElement("li");
      const mini = document.createElement("div"); mini.className = "mini"; isiGambar(mini, p);
      const teks = document.createElement("div"); teks.className = "teks";
      const b = document.createElement("b"); b.textContent = p.nama;
      teks.appendChild(b);
      if (x.pilihan) { const s = document.createElement("small"); s.textContent = x.pilihan; teks.appendChild(s); }
      const hg = document.createElement("span"); hg.textContent = rupiah(p.harga * x.jumlah); teks.appendChild(hg);

      const hitung = document.createElement("div"); hitung.className = "penghitung kecil";
      const kurang = document.createElement("button"); kurang.textContent = x.jumlah === 1 ? "🗑" : "−";
      kurang.setAttribute("aria-label", x.jumlah === 1 ? "Hapus dari keranjang" : "Kurangi");
      const out = document.createElement("output"); out.textContent = x.jumlah;
      const tambah = document.createElement("button"); tambah.textContent = "+"; tambah.setAttribute("aria-label", "Tambah");
      kurang.onclick = () => {
        x.jumlah -= 1; simpanLokal("makros-keranjang", keranjang); gambarKeranjang();
        if (!keranjang.length) $("lembarKeranjang").close();
      };
      tambah.onclick = () => { x.jumlah = Math.min(99, x.jumlah + 1); simpanLokal("makros-keranjang", keranjang); gambarKeranjang(); };
      hitung.append(kurang, out, tambah);
      li.append(mini, teks, hitung);
      ul.appendChild(li);
    });
  }

  function siapkanFormulir() {
    $("namaPemesan").value = pemesan.nama;
    $("alamat").value = pemesan.alamat;
    const bayar = toko.pembayaran || [];
    if (!bayar.includes(pemesan.bayar)) pemesan.bayar = bayar[0] || "";
    buatPilihan($("pilihBayar"), bayar, pemesan.bayar, (v) => { pemesan.bayar = v; simpanLokal("makros-pemesan", pemesan); });
    buatPilihan($("pilihKirim"), ["🛵 Diantar", "🏡 Ambil sendiri"],
      pemesan.kirim === "Ambil sendiri" ? "🏡 Ambil sendiri" : "🛵 Diantar",
      (v) => { pemesan.kirim = v.slice(3); $("labelAlamat").hidden = pemesan.kirim === "Ambil sendiri"; simpanLokal("makros-pemesan", pemesan); });
    $("labelAlamat").hidden = pemesan.kirim === "Ambil sendiri";
  }

  $("bukaKeranjang").onclick = () => { siapkanFormulir(); $("lembarKeranjang").showModal(); };

  function tandaiSalah(el) {
    el.classList.remove("salah"); void el.offsetWidth; el.classList.add("salah");
    el.focus();
    setTimeout(() => el.classList.remove("salah"), 1200);
  }

  $("kirimWa").onclick = () => {
    pemesan.nama = $("namaPemesan").value.trim();
    pemesan.alamat = $("alamat").value.trim();
    simpanLokal("makros-pemesan", pemesan);
    if (!pemesan.nama) { roti("Isi nama Anda dulu ya 🙏"); return tandaiSalah($("namaPemesan")); }
    if (pemesan.kirim !== "Ambil sendiri" && !pemesan.alamat) { roti("Alamat kirimnya diisi dulu ya 🙏"); return tandaiSalah($("alamat")); }
    if (!/^62\d{8,13}$/.test(toko.nomorWhatsApp || "")) { roti("Nomor WhatsApp toko belum diatur pemilik toko."); return; }

    const baris = keranjang.map((x, i) => {
      const p = produkDari(x.id);
      return (i + 1) + ". " + p.nama + (x.pilihan ? " (" + x.pilihan + ")" : "") +
        "\n    " + x.jumlah + " × " + rupiah(p.harga) + " = " + rupiah(p.harga * x.jumlah);
    });
    const catatan = $("catatan").value.trim();
    const pesan = [
      "Assalamualaikum " + toko.nama + " 🙏",
      "Saya mau pesan:",
      "",
      ...baris,
      "",
      "*Total belanja: " + rupiah(hitungTotal()) + "*",
      "",
      "Nama: " + pemesan.nama,
      pemesan.kirim === "Ambil sendiri" ? "Cara terima: Ambil sendiri" : "Diantar ke: " + pemesan.alamat,
      pemesan.bayar ? "Pembayaran: " + pemesan.bayar : "",
      catatan ? "Catatan: " + catatan : "",
      "",
      "Mohon info ongkir dan totalnya ya. Terima kasih 😊"
    ].filter((b, i, a) => b !== "" || a[i - 1] !== "").join("\n");

    window.open("https://wa.me/" + toko.nomorWhatsApp + "?text=" + encodeURIComponent(pesan), "_blank");
    roti("Pesanan disiapkan di WhatsApp. Tinggal tekan kirim 💚");
  };

  // Tutup lembar: tombol ×, ketuk di luar, atau tombol kembali.
  document.querySelectorAll(".lembar").forEach((d) => {
    d.addEventListener("click", (e) => { if (e.target === d || e.target.closest("[data-tutup]")) d.close(); });
  });

  // ---------- Roti ----------
  let waktuRoti;
  function roti(teks) {
    const r = $("roti");
    r.textContent = teks;
    r.classList.add("tampil");
    clearTimeout(waktuRoti);
    waktuRoti = setTimeout(() => r.classList.remove("tampil"), 2200);
  }

  isiIdentitas();
  gambarHias();
  gambarUnggulan();
  gambarTab();
  gambarDaftar();
  gambarKeranjang();
})();
