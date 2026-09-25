// Dasbor Mak Ros.
// Perubahan disimpan dulu di perangkat ini (draf), lalu diterbitkan ke GitHub:
// langsung dari dasbor bila sudah tersambung, atau lewat laptop dengan produk.js.
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const rupiah = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");
  const salin = (x) => JSON.parse(JSON.stringify(x));
  const sama = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const baca = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const tulis = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

  const KUNCI_KERJA = "makros-admin-kerja";
  const KUNCI_TOKEN = "makros-admin-token";
  const CABANG = "main";
  const REPO = (() => {
    const h = location.hostname;
    if (h.endsWith(".github.io")) {
      const pemilik = h.split(".")[0];
      const nama = location.pathname.split("/").filter(Boolean)[0];
      return pemilik + "/" + (nama && !nama.includes(".") ? nama : h);
    }
    return "socialiam/mak-ros";
  })();

  const EMOJI = ["🥟", "🍗", "🥐", "🍛", "🍜", "🍲", "🥘", "🍤", "🐟", "🦑", "🥩", "🍖", "🌭", "🍢", "🍡",
    "🥨", "🥔", "🥜", "🍘", "🌀", "🍪", "🍰", "🧁", "🍩", "🎂", "🍞", "🧀", "❄️", "🎁", "🌶️", "🥫", "🥥", "🍯",
    "🧃", "☕", "🍵", "👗", "👔", "👕", "👖", "🧕", "👚", "👘", "👜", "👟", "👠", "🧦", "🧣", "🧢", "👶", "🛍️", "🌸"];
  const SARAN_VARIAN = [["S", "M", "L", "XL"], ["Original", "Pedas"], ["Kecil", "Sedang", "Besar"], ["250 g", "500 g", "1 kg"]];
  const PALET = ["#f6e3d6", "#f3ead0", "#e3eedf", "#f5dde0", "#e0e8f3", "#ece2f3", "#f1e6da"];
  const PALET_GELAP = ["#3a2419", "#3a321c", "#1f3124", "#3a2226", "#1f2a38", "#2d2238", "#33271d"];
  const gelap = matchMedia("(prefers-color-scheme: dark)").matches;

  // ---------- Keadaan ----------
  let terbit = salin(window.TOKO);            // yang sedang tampil di toko
  let kerja = baca(KUNCI_KERJA) || salin(terbit); // yang sedang Anda susun
  let token = baca(KUNCI_TOKEN);

  function simpanKerja() {
    if (sama(kerja, terbit)) tulis(KUNCI_KERJA, null);
    else if (!tulis(KUNCI_KERJA, kerja)) roti("Penyimpanan HP penuh. Terbitkan sekarang agar tidak hilang.");
    gambarStatus();
  }

  const warnaKategori = (id) => {
    const i = Math.max(0, kerja.kategori.findIndex((k) => k.id === id));
    return (gelap ? PALET_GELAP : PALET)[i % PALET.length];
  };
  const kategoriDari = (id) => kerja.kategori.find((k) => k.id === id) || { nama: "Tanpa kategori", ikon: "🛍️" };

  function isiMini(wadah, p) {
    wadah.style.setProperty("--latar-ikon", warnaKategori(p.kategori));
    wadah.textContent = "";
    if (p.foto) { const img = document.createElement("img"); img.src = p.foto; img.alt = ""; wadah.appendChild(img); }
    else wadah.textContent = p.ikon || kategoriDari(p.kategori).ikon;
  }

  // ---------- Sapaan & status ----------
  function gambarSapaan() {
    const j = new Date().getHours();
    const waktu = j < 11 ? "pagi" : j < 15 ? "siang" : j < 18 ? "sore" : "malam";
    $("sapaan").textContent = "Selamat " + waktu + ",";
    $("namaToko").textContent = kerja.nama || "Toko";
  }

  function daftarPerubahan() {
    const out = [];
    const label = { nama: "Nama toko", nomorWhatsApp: "Nomor WhatsApp", kota: "Kota", slogan: "Slogan",
      cerita: "Cerita toko", jamBuka: "Jam buka", areaKirim: "Pengiriman", pembayaran: "Cara bayar" };
    Object.keys(label).forEach((k) => { if (!sama(kerja[k], terbit[k])) out.push(["ubah", label[k]]); });
    if (!sama(kerja.kategori, terbit.kategori)) out.push(["ubah", "Kategori"]);
    const lama = new Map(terbit.produk.map((p) => [p.id, p]));
    const baru = new Set(kerja.produk.map((p) => p.id));
    kerja.produk.forEach((p) => {
      const l = lama.get(p.id);
      if (!l) out.push(["baru", p.nama]);
      else if (!sama(l, p)) out.push(["ubah", p.nama]);
    });
    terbit.produk.forEach((p) => { if (!baru.has(p.id)) out.push(["hapus", p.nama]); });
    if (!out.length && !sama(kerja, terbit)) out.push(["ubah", "Susunan toko"]);
    return out;
  }

  function gambarStatus() {
    const n = daftarPerubahan().length;
    $("kartuStatus").classList.toggle("berubah", n > 0);
    $("statusAksi").hidden = n === 0;
    $("statusIkon").textContent = n ? n : "✓";
    $("statusJudul").textContent = n ? n + " perubahan belum tampil di toko" : "Toko sudah terbaru";
    $("statusKet").textContent = n
      ? "Ketuk Terbitkan agar pembeli bisa melihatnya."
      : "Semua yang Anda lihat di sini sudah tampil di toko.";
    gambarSapaan();
  }

  // ---------- Navigasi ----------
  let halAktif = "halBarang";
  document.querySelectorAll(".nav-bawah button").forEach((b) => {
    b.onclick = () => {
      halAktif = b.dataset.hal;
      document.querySelectorAll(".nav-bawah button").forEach((x) => x.toggleAttribute("aria-current", x === b));
      document.querySelectorAll(".nav-bawah button[aria-current]").forEach((x) => x.setAttribute("aria-current", "page"));
      document.querySelectorAll(".hal").forEach((h) => (h.hidden = h.id !== halAktif));
      $("barangBaru").hidden = halAktif !== "halBarang";
      if (halAktif === "halKategori") gambarKategori();
      if (halAktif === "halToko") gambarToko();
      scrollTo({ top: 0, behavior: "smooth" });
    };
  });

  // ---------- Halaman barang ----------
  let saring = "semua";
  let cari = "";

  function gambarSaring() {
    const w = $("saringKategori");
    w.innerHTML = "";
    [{ id: "semua", nama: "Semua", ikon: "✨" }].concat(kerja.kategori).forEach((k) => {
      const b = document.createElement("button");
      const n = k.id === "semua" ? kerja.produk.length : kerja.produk.filter((p) => p.kategori === k.id).length;
      b.textContent = k.ikon + " " + k.nama + " · " + n;
      b.setAttribute("aria-pressed", k.id === saring);
      b.onclick = () => { saring = k.id; gambarSaring(); gambarBarang(); };
      w.appendChild(b);
    });
  }

  function gambarBarang() {
    const ul = $("daftarBarang");
    ul.innerHTML = "";
    const kata = cari.trim().toLowerCase();
    const urutKat = (p) => { const i = kerja.kategori.findIndex((k) => k.id === p.kategori); return i < 0 ? 999 : i; };
    const isi = kerja.produk
      .filter((p) => (saring === "semua" || p.kategori === saring) && (!kata || p.nama.toLowerCase().includes(kata)))
      .map((p, i) => [p, i]).sort((a, b) => urutKat(a[0]) - urutKat(b[0]) || a[1] - b[1]).map((x) => x[0]);

    isi.forEach((p, i) => {
      const li = document.createElement("li");
      li.className = "baris-barang" + (p.habis ? " habis" : "");
      li.style.animationDelay = Math.min(i, 10) * 25 + "ms";
      li.dataset.id = p.id;

      const buka = document.createElement("button");
      buka.className = "buka";
      buka.setAttribute("aria-label", "Ubah " + p.nama);
      buka.onclick = () => bukaSunting(p.id);
      const mini = document.createElement("div"); mini.className = "mini"; isiMini(mini, p);
      const teks = document.createElement("div"); teks.className = "teks";
      const b = document.createElement("b"); b.textContent = p.nama;
      const hg = document.createElement("span"); hg.textContent = rupiah(p.harga);
      const kecil = document.createElement("small");
      const bagian = [kategoriDari(p.kategori).nama];
      if (p.pilihan && p.pilihan.length) bagian.push(p.pilihan.length + " varian");
      kecil.textContent = bagian.join(" · ");
      if (p.unggulan) { const f = document.createElement("span"); f.className = "tanda-favorit"; f.textContent = " · ⭐"; kecil.appendChild(f); }
      teks.append(b, hg, kecil);
      buka.append(mini, teks);

      const sak = document.createElement("div"); sak.className = "saklar-mini";
      const lab = document.createElement("label"); lab.className = "saklar";
      const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = !p.habis;
      cb.setAttribute("aria-label", "Stok " + p.nama + " tersedia");
      const tulisan = document.createElement("span");
      lab.append(cb, tulisan);
      const ket = document.createElement("div"); ket.textContent = p.habis ? "Habis" : "Ada";
      if (p.habis) ket.className = "tanda-habis";
      cb.onchange = () => {
        if (cb.checked) delete p.habis; else p.habis = true;
        simpanKerja();
        li.classList.toggle("habis", !!p.habis);
        ket.textContent = p.habis ? "Habis" : "Ada";
        ket.className = p.habis ? "tanda-habis" : "";
        roti(p.habis ? "“" + p.nama + "” ditandai habis" : "“" + p.nama + "” tersedia lagi");
      };
      sak.append(lab, ket);

      li.append(buka, sak);
      ul.appendChild(li);
    });

    if (!isi.length) {
      const li = document.createElement("li");
      li.className = "kosong-admin";
      li.innerHTML = "<b>🧺</b>";
      li.append(kata ? "Tidak ada barang bernama “" + cari.trim() + "”." : "Belum ada barang di sini. Ketuk “Barang baru” untuk menambah.");
      ul.appendChild(li);
    }
  }
  $("cariBarang").addEventListener("input", (e) => { cari = e.target.value; gambarBarang(); });

  // ---------- Lembar sunting barang ----------
  let draf = null;
  let potretAwal = "";

  function bukaSunting(id) {
    const ada = id && kerja.produk.find((p) => p.id === id);
    draf = ada ? salin(ada) : {
      id: "P" + Date.now().toString(36).toUpperCase(),
      kategori: saring !== "semua" ? saring : (kerja.kategori[0] || {}).id,
      nama: "", harga: 0, ikon: "", keterangan: ""
    };
    draf.pilihan = draf.pilihan || [];
    $("judulSunting").textContent = ada ? "Ubah barang" : "Barang baru";
    $("hapusBarang").hidden = !ada;
    $("sNama").value = draf.nama;
    $("sHarga").value = draf.harga ? Number(draf.harga).toLocaleString("id-ID") : "";
    $("sKet").value = draf.keterangan || "";
    $("sTersedia").checked = !draf.habis;
    $("sUnggulan").checked = !!draf.unggulan;
    $("varianBaru").value = "";
    gambarPilihKategori(); gambarVarian(); gambarFoto(); gambarKisiIkon();
    potretAwal = JSON.stringify(ambilDariFormulir());
    $("lembarSunting").showModal();
    $("lembarSunting").querySelector(".lembar-isi").scrollTop = 0;
    if (!ada) setTimeout(() => $("sNama").focus(), 300);
  }

  function ambilDariFormulir() {
    const p = salin(draf);
    p.nama = $("sNama").value.trim();
    p.harga = Number($("sHarga").value.replace(/\D/g, "")) || 0;
    p.keterangan = $("sKet").value.trim();
    if (!p.ikon) p.ikon = kategoriDari(p.kategori).ikon;
    if (!p.pilihan.length) delete p.pilihan;
    if ($("sTersedia").checked) delete p.habis; else p.habis = true;
    if ($("sUnggulan").checked) p.unggulan = true; else delete p.unggulan;
    if (!p.foto) delete p.foto;
    return p;
  }

  $("sHarga").addEventListener("input", (e) => {
    const angka = e.target.value.replace(/\D/g, "").slice(0, 10);
    e.target.value = angka ? Number(angka).toLocaleString("id-ID") : "";
  });

  function gambarPilihKategori() {
    const w = $("sKategori");
    w.innerHTML = "";
    kerja.kategori.forEach((k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", k.id === draf.kategori);
      b.textContent = k.ikon + " " + k.nama;
      b.onclick = () => { draf.kategori = k.id; gambarPilihKategori(); gambarFoto(); };
      w.appendChild(b);
    });
  }

  function gambarVarian() {
    const w = $("sVarian");
    w.innerHTML = "";
    draf.pilihan.forEach((v, i) => {
      const s = document.createElement("span");
      s.append(v);
      const x = document.createElement("button");
      x.type = "button"; x.textContent = "✕"; x.setAttribute("aria-label", "Hapus varian " + v);
      x.onclick = () => { draf.pilihan.splice(i, 1); gambarVarian(); };
      s.appendChild(x);
      w.appendChild(s);
    });
    const saran = $("saranVarian");
    saran.innerHTML = "";
    SARAN_VARIAN.forEach((set) => {
      if (set.every((v) => draf.pilihan.includes(v))) return;
      const b = document.createElement("button");
      b.type = "button"; b.textContent = "+ " + set.join(", ");
      b.onclick = () => { set.forEach((v) => { if (!draf.pilihan.includes(v)) draf.pilihan.push(v); }); gambarVarian(); };
      saran.appendChild(b);
    });
  }

  function tambahVarian() {
    const isi = $("varianBaru").value.split(",").map((s) => s.trim()).filter(Boolean);
    isi.forEach((v) => { if (!draf.pilihan.includes(v)) draf.pilihan.push(v); });
    $("varianBaru").value = "";
    gambarVarian();
    $("varianBaru").focus();
  }
  $("tambahVarian").onclick = tambahVarian;
  $("varianBaru").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); tambahVarian(); } });

  function gambarKisiIkon() {
    const w = $("sIkon");
    w.innerHTML = "";
    EMOJI.forEach((em) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = em;
      b.setAttribute("aria-pressed", em === draf.ikon);
      b.setAttribute("aria-label", "Ikon " + em);
      b.onclick = () => { draf.ikon = em; gambarKisiIkon(); gambarFoto(); };
      w.appendChild(b);
    });
  }

  function gambarFoto() {
    const ada = !!draf.foto;
    $("fotoPilih").hidden = ada;
    $("fotoGambar").hidden = !ada;
    $("fotoAksi").hidden = !ada;
    $("wadahIkon").hidden = ada;
    if (ada) $("fotoGambar").src = draf.foto;
    $("fotoPilih").style.setProperty("--latar-ikon", warnaKategori(draf.kategori));
    $("fotoIkon").textContent = draf.ikon || kategoriDari(draf.kategori).ikon || "📷";
  }

  $("fotoPilih").onclick = () => $("fotoBerkas").click();
  $("fotoGanti").onclick = () => $("fotoBerkas").click();
  $("fotoHapus").onclick = () => { delete draf.foto; gambarFoto(); };
  $("fotoBerkas").onchange = () => {
    const berkas = $("fotoBerkas").files[0];
    $("fotoBerkas").value = "";
    if (!berkas) return;
    kecilkanFoto(berkas).then((url) => { draf.foto = url; gambarFoto(); })
      .catch(() => roti("Foto ini tidak bisa dibaca. Coba foto lain ya."));
  };

  // Foto dikecilkan ke sisi terpanjang 1000 px supaya toko tetap ringan.
  function kecilkanFoto(berkas) {
    return new Promise((jadi, gagal) => {
      const img = new Image();
      img.onload = () => {
        const skala = Math.min(1, 1000 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * skala); c.height = Math.round(img.height * skala);
        const g = c.getContext("2d");
        g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
        g.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(img.src);
        jadi(c.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = gagal;
      img.src = URL.createObjectURL(berkas);
    });
  }

  $("simpanBarang").onclick = () => {
    const p = ambilDariFormulir();
    if (!p.nama) { roti("Nama barangnya diisi dulu ya"); return goyang($("sNama")); }
    if (!p.harga) { roti("Harganya diisi dulu ya"); return goyang($("sHarga")); }
    if (!p.kategori) { roti("Buat kategori dulu di menu Kategori"); return; }
    const i = kerja.produk.findIndex((x) => x.id === p.id);
    if (i >= 0) kerja.produk[i] = p; else kerja.produk.push(p);
    simpanKerja();
    potretAwal = JSON.stringify(p);
    $("lembarSunting").close();
    gambarSaring(); gambarBarang();
    roti(i >= 0 ? "✓ Perubahan disimpan" : "✓ “" + p.nama + "” ditambahkan");
    const baris = document.querySelector('.baris-barang[data-id="' + p.id + '"]');
    if (baris) baris.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  $("hapusBarang").onclick = () => {
    const i = kerja.produk.findIndex((x) => x.id === draf.id);
    if (i < 0) return;
    const [dibuang] = kerja.produk.splice(i, 1);
    simpanKerja();
    potretAwal = JSON.stringify(ambilDariFormulir());
    $("lembarSunting").close();
    gambarSaring(); gambarBarang();
    roti("“" + dibuang.nama + "” dihapus", "Batalkan", () => {
      kerja.produk.splice(i, 0, dibuang);
      simpanKerja(); gambarSaring(); gambarBarang();
      roti("✓ Dikembalikan");
    });
  };

  // Menutup lembar sunting tanpa menyimpan: tanya dulu bila ada yang berubah.
  function bolehTutupSunting() {
    if (JSON.stringify(ambilDariFormulir()) === potretAwal) return true;
    return confirm("Perubahan pada barang ini belum disimpan. Tutup saja?");
  }
  $("lembarSunting").addEventListener("cancel", (e) => { if (!bolehTutupSunting()) e.preventDefault(); });

  $("barangBaru").onclick = () => {
    if (!kerja.kategori.length) { roti("Buat kategori dulu di menu Kategori"); return; }
    bukaSunting(null);
  };

  // ---------- Halaman kategori ----------
  let kategoriPilihIkon = null;

  function gambarKategori() {
    const ul = $("daftarKategori");
    ul.innerHTML = "";
    kerja.kategori.forEach((k, i) => {
      const n = kerja.produk.filter((p) => p.kategori === k.id).length;
      const li = document.createElement("li");
      li.className = "baris-kategori";

      const ikon = document.createElement("button");
      ikon.className = "ikon-besar"; ikon.textContent = k.ikon;
      ikon.style.setProperty("--latar-ikon", warnaKategori(k.id));
      ikon.setAttribute("aria-label", "Ganti ikon " + k.nama);
      ikon.onclick = () => { kategoriPilihIkon = k; gambarKisiKategori(); $("lembarIkon").showModal(); };

      const isi = document.createElement("div"); isi.className = "isi";
      const nama = document.createElement("input");
      nama.value = k.nama; nama.setAttribute("aria-label", "Nama kategori"); nama.maxLength = 24;
      nama.oninput = () => { k.nama = nama.value.trim() || k.nama; simpanKerja(); };
      nama.onblur = () => { nama.value = k.nama; gambarSaring(); };
      const kecil = document.createElement("small"); kecil.textContent = n + " barang";
      isi.append(nama, kecil);

      const naik = tombolKecil("i-atas", "Naikkan " + k.nama, i === 0, () => pindahKategori(i, -1));
      const turun = tombolKecil("i-bawah", "Turunkan " + k.nama, i === kerja.kategori.length - 1, () => pindahKategori(i, 1));
      const hapus = document.createElement("button");
      hapus.className = "tombol-kecil-bulat"; hapus.textContent = "🗑";
      hapus.setAttribute("aria-label", "Hapus kategori " + k.nama);
      hapus.onclick = () => {
        if (n) return roti("Masih ada " + n + " barang di sini. Pindahkan dulu ya.");
        const [dibuang] = kerja.kategori.splice(i, 1);
        simpanKerja(); gambarKategori(); gambarSaring();
        roti("Kategori “" + dibuang.nama + "” dihapus", "Batalkan", () => {
          kerja.kategori.splice(i, 0, dibuang); simpanKerja(); gambarKategori(); gambarSaring();
        });
      };
      li.append(ikon, isi, naik, turun, hapus);
      ul.appendChild(li);
    });
  }

  function tombolKecil(ikon, label, mati, aksi) {
    const b = document.createElement("button");
    b.className = "tombol-kecil-bulat";
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#' + ikon + '"/></svg>';
    b.setAttribute("aria-label", label);
    b.disabled = mati;
    b.onclick = aksi;
    return b;
  }

  function pindahKategori(i, arah) {
    const [k] = kerja.kategori.splice(i, 1);
    kerja.kategori.splice(i + arah, 0, k);
    simpanKerja(); gambarKategori(); gambarSaring(); gambarBarang();
  }

  function gambarKisiKategori() {
    const w = $("kisiIkonKategori");
    w.innerHTML = "";
    EMOJI.forEach((em) => {
      const b = document.createElement("button");
      b.textContent = em;
      b.setAttribute("aria-pressed", em === kategoriPilihIkon.ikon);
      b.onclick = () => {
        kategoriPilihIkon.ikon = em;
        simpanKerja(); $("lembarIkon").close(); gambarKategori(); gambarSaring(); gambarBarang();
      };
      w.appendChild(b);
    });
  }

  $("tambahKategori").onclick = () => {
    let id = "kategori-" + Date.now().toString(36);
    kerja.kategori.push({ id, nama: "Kategori baru", ikon: "🛍️" });
    simpanKerja(); gambarKategori(); gambarSaring();
    const inputs = $("daftarKategori").querySelectorAll("input");
    const terakhir = inputs[inputs.length - 1];
    terakhir.focus(); terakhir.select();
  };

  // ---------- Halaman info toko ----------
  function rapikanWa(v) {
    let d = (v || "").replace(/\D/g, "");
    if (d.startsWith("0")) d = "62" + d.slice(1);
    else if (d.startsWith("8")) d = "62" + d;
    return d;
  }
  const waBenar = (v) => /^62\d{8,13}$/.test(v || "");

  function gambarBantuWa() {
    const b = $("bantuWa");
    const v = kerja.nomorWhatsApp;
    if (waBenar(v)) { b.textContent = "✓ Nomor siap dipakai pembeli."; b.className = "bantu benar-teks"; }
    else { b.textContent = "Belum benar. Ketik saja nomor WA biasa, misalnya 0812…, nanti dirapikan otomatis."; b.className = "bantu salah-teks"; }
  }

  function gambarToko() {
    document.querySelectorAll("[data-toko]").forEach((el) => {
      const k = el.dataset.toko;
      el.value = /x/i.test(kerja[k] || "") && k === "nomorWhatsApp" ? "" : kerja[k] || "";
      el.oninput = () => {
        kerja[k] = el.value.trim();
        simpanKerja();
        if (k === "nama") gambarSapaan();
        if (k === "nomorWhatsApp") gambarBantuWa();
      };
      if (k === "nomorWhatsApp") el.onblur = () => {
        kerja[k] = rapikanWa(el.value); el.value = kerja[k]; simpanKerja(); gambarBantuWa();
      };
    });
    gambarBantuWa();
    gambarBayar();
    gambarSambung();
  }

  $("cobaWa").onclick = () => {
    if (!waBenar(kerja.nomorWhatsApp)) return roti("Isi nomor WhatsApp dulu ya");
    window.open("https://wa.me/" + kerja.nomorWhatsApp + "?text=" + encodeURIComponent("Tes dari dasbor " + kerja.nama + " ✓"), "_blank");
  };

  function gambarBayar() {
    const w = $("daftarBayar");
    w.innerHTML = "";
    kerja.pembayaran = kerja.pembayaran || [];
    kerja.pembayaran.forEach((v, i) => {
      const s = document.createElement("span");
      s.append(v);
      const x = document.createElement("button");
      x.textContent = "✕"; x.setAttribute("aria-label", "Hapus " + v);
      x.onclick = () => { kerja.pembayaran.splice(i, 1); simpanKerja(); gambarBayar(); };
      s.appendChild(x);
      w.appendChild(s);
    });
  }
  function tambahBayar() {
    $("bayarBaru").value.split(",").map((s) => s.trim()).filter(Boolean)
      .forEach((v) => { if (!kerja.pembayaran.includes(v)) kerja.pembayaran.push(v); });
    $("bayarBaru").value = "";
    simpanKerja(); gambarBayar();
  }
  $("tambahBayar").onclick = tambahBayar;
  $("bayarBaru").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); tambahBayar(); } });

  // ---------- Sambungan GitHub ----------
  function gambarSambung() {
    const w = $("kotakSambung");
    w.innerHTML = "";
    if (token) {
      w.innerHTML = '<div class="tersambung"><b>✅</b><div><strong>Tersambung</strong>' +
        '<small>Tombol Terbitkan langsung jalan dari perangkat ini.</small></div>' +
        '<button class="tombol-teks" id="putuskan">Putuskan</button></div>';
      $("putuskan").onclick = () => {
        if (!confirm("Putuskan sambungan di perangkat ini?")) return;
        token = null; tulis(KUNCI_TOKEN, null); gambarSambung(); roti("Sambungan diputus");
      };
      return;
    }
    w.innerHTML =
      '<p class="ket-hal" style="margin-top:14px">Sambungkan sekali saja, lalu Anda bisa menerbitkan perubahan langsung dari HP, tanpa laptop.</p>' +
      '<ol class="langkah-sambung">' +
      '<li>Buka <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">halaman kunci GitHub</a> dan masuk dengan akun <b>' + REPO.split("/")[0] + '</b>.</li>' +
      '<li><b>Token name</b>: tulis <span class="kode">Dasbor Mak Ros</span>. <b>Expiration</b>: pilih yang paling lama.</li>' +
      '<li><b>Repository access</b>: pilih <i>Only select repositories</i>, lalu pilih <span class="kode">' + REPO.split("/")[1] + '</span>.</li>' +
      '<li><b>Permissions</b> → <b>Contents</b>: pilih <i>Read and write</i>.</li>' +
      '<li>Tekan <b>Generate token</b>, salin kodenya, lalu tempel di bawah ini.</li></ol>' +
      '<div class="tambah-sebaris"><input id="isianToken" placeholder="github_pat_…" autocomplete="off" spellcheck="false">' +
      '<button class="tombol tombol-utama" id="sambungkan">Sambungkan</button></div>' +
      '<small class="bantu">Kunci ini hanya tersimpan di perangkat ini dan hanya bisa mengubah toko ' + REPO.split("/")[1] + '.</small>';
    $("sambungkan").onclick = async () => {
      const t = $("isianToken").value.trim();
      if (!t) return goyang($("isianToken"));
      $("sambungkan").disabled = true; $("sambungkan").textContent = "Memeriksa…";
      try {
        const r = await gh("GET", "/repos/" + REPO, null, t);
        if (!r.ok) throw new Error(r.status);
        token = t; tulis(KUNCI_TOKEN, t);
        gambarSambung();
        roti("✅ Tersambung! Sekarang bisa terbit dari sini.");
        muatDariGitHub();
      } catch (e) {
        $("sambungkan").disabled = false; $("sambungkan").textContent = "Sambungkan";
        roti("Kunci belum cocok. Periksa lagi langkah 3 dan 4 ya.");
      }
    };
  }

  function gh(metode, jalur, isi, kunci, terima) {
    return fetch("https://api.github.com" + jalur, {
      method: metode,
      cache: "no-store",
      headers: Object.assign({
        Authorization: "Bearer " + (kunci || token),
        Accept: terima || "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }, isi ? { "Content-Type": "application/json" } : {}),
      body: isi ? JSON.stringify(isi) : undefined
    });
  }

  function isiBerkas(data) {
    return "// DATA TOKO MAK ROS\n// Dibuat oleh dasbor (admin.html). Paling mudah diubah lewat dasbor.\n\n" +
      "window.TOKO = " + JSON.stringify(data, null, 2) + ";\n";
  }

  function base64Teks(s) {
    const bytes = new TextEncoder().encode(s);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }

  // Bila tersambung, ambil isi toko langsung dari GitHub: selalu yang terbaru, tanpa tertahan cache.
  async function muatDariGitHub() {
    if (!token) return;
    try {
      const r = await gh("GET", "/repos/" + REPO + "/contents/produk.js?ref=" + CABANG, null, null, "application/vnd.github.raw");
      if (!r.ok) return;
      const teks = await r.text();
      const data = JSON.parse(teks.slice(teks.indexOf("{"), teks.lastIndexOf("}") + 1));
      const adaDraf = !!baca(KUNCI_KERJA);
      terbit = data;
      if (!adaDraf) kerja = salin(terbit);
      simpanKerja(); gambarSemua();
    } catch (e) { /* tetap memakai produk.js yang dimuat halaman */ }
  }

  // ---------- Terbitkan ----------
  function bukaTerbit() {
    const ubah = daftarPerubahan();
    const isi = $("isiTerbit"), kaki = $("kakiTerbit");
    const nama = { baru: "Baru", ubah: "Diubah", hapus: "Dihapus" };
    isi.innerHTML = '<p class="ket-hal" style="margin:0">Yang akan tampil di toko:</p>';
    const ul = document.createElement("ul"); ul.className = "daftar-ubah";
    ubah.forEach(([jenis, teks]) => {
      const li = document.createElement("li");
      const s = document.createElement("span"); s.className = "jenis-" + jenis; s.textContent = nama[jenis];
      li.append(s, teks);
      ul.appendChild(li);
    });
    isi.appendChild(ul);
    if (!waBenar(kerja.nomorWhatsApp)) {
      const p = document.createElement("p"); p.className = "bantu salah-teks";
      p.textContent = "⚠️ Nomor WhatsApp toko belum diisi, jadi pembeli belum bisa memesan. Isi di menu Info toko.";
      isi.appendChild(p);
    }

    kaki.innerHTML = "";
    if (token) {
      const t = document.createElement("button");
      t.className = "tombol tombol-utama tombol-lebar"; t.textContent = "🚀 Terbitkan sekarang";
      t.onclick = jalankanTerbit;
      kaki.appendChild(t);
    } else {
      const cara = document.createElement("div"); cara.className = "pilihan-cara";
      cara.innerHTML =
        "<div><strong>📱 Dari HP (disarankan)</strong><p>Sambungkan sekali di menu Info toko → Terbitkan dari HP. Setelah itu cukup satu ketukan.</p></div>" +
        "<div><strong>💻 Lewat laptop</strong><p>Unduh produk.js di bawah, lalu klik dua kali <b>kirim-ke-github.cmd</b> di folder mak-ros.</p></div>";
      isi.appendChild(cara);
      const s = document.createElement("button");
      s.className = "tombol tombol-utama tombol-lebar"; s.textContent = "Sambungkan dari HP";
      s.onclick = () => { $("lembarTerbit").close(); document.querySelector('[data-hal="halToko"]').click(); setTimeout(() => $("kotakSambung").scrollIntoView({ behavior: "smooth" }), 300); };
      const u = document.createElement("button");
      u.className = "tombol tombol-garis tombol-lebar"; u.textContent = "⬇️ Unduh produk.js";
      u.onclick = unduh;
      kaki.append(s, u);
    }
    const buang = document.createElement("button");
    buang.className = "tombol-teks"; buang.textContent = "Batalkan semua perubahan";
    buang.onclick = () => {
      if (!confirm("Kembalikan dasbor seperti yang tampil di toko sekarang? Semua perubahan yang belum terbit akan hilang.")) return;
      kerja = salin(terbit); simpanKerja(); gambarSemua(); $("lembarTerbit").close(); roti("Perubahan dibatalkan");
    };
    kaki.appendChild(buang);
    $("lembarTerbit").showModal();
  }
  $("tombolTerbit").onclick = bukaTerbit;

  let sedangTerbit = false;
  async function jalankanTerbit() {
    sedangTerbit = true;
    const isi = $("isiTerbit"), kaki = $("kakiTerbit");
    const foto = kerja.produk.filter((p) => p.foto && p.foto.startsWith("data:"));
    const total = foto.length + 1;
    let selesai = 0;
    isi.innerHTML = '<div class="hasil-besar"><b>🚀</b><strong>Sedang menerbitkan…</strong><p id="teksKemajuan">Mohon jangan tutup halaman ini.</p></div>' +
      '<div class="kemajuan"><i id="batangKemajuan"></i></div>';
    kaki.innerHTML = "";
    const maju = (teks) => { $("batangKemajuan").style.width = Math.round((selesai / total) * 100) + "%"; $("teksKemajuan").textContent = teks; };

    try {
      for (const p of foto) {
        maju("Mengunggah foto " + (selesai + 1) + " dari " + foto.length + "…");
        const jalur = "foto/" + p.id.toLowerCase() + "-" + Date.now().toString(36) + ".jpg";
        const r = await gh("PUT", "/repos/" + REPO + "/contents/" + jalur,
          { message: "foto " + p.nama, content: p.foto.split(",")[1], branch: CABANG });
        if (!r.ok) throw r;
        p.foto = jalur;
        tulis(KUNCI_KERJA, kerja);
        selesai++;
      }
      maju("Menyimpan isi toko…");
      const lama = await gh("GET", "/repos/" + REPO + "/contents/produk.js?ref=" + CABANG);
      const sha = lama.ok ? (await lama.json()).sha : undefined;
      const r = await gh("PUT", "/repos/" + REPO + "/contents/produk.js",
        { message: "perbarui toko dari dasbor", content: base64Teks(isiBerkas(kerja)), branch: CABANG, sha });
      if (!r.ok) throw r;
      selesai++; maju("");

      terbit = salin(kerja);
      simpanKerja(); gambarSemua();
      isi.innerHTML = '<div class="hasil-besar"><b>🎉</b><strong>Sudah terbit!</strong>' +
        "<p>Toko diperbarui dalam 1–2 menit. Bila belum berubah, muat ulang halaman toko.</p></div>";
      const lihat = document.createElement("a");
      lihat.className = "tombol tombol-utama tombol-lebar"; lihat.textContent = "Lihat toko";
      lihat.href = "index.html"; lihat.target = "_blank"; lihat.rel = "noopener";
      const oke = document.createElement("button");
      oke.className = "tombol tombol-garis tombol-lebar"; oke.textContent = "Selesai";
      oke.onclick = () => $("lembarTerbit").close();
      kaki.append(lihat, oke);
      if (navigator.vibrate) navigator.vibrate([20, 60, 20]);
    } catch (e) {
      const status = e && e.status;
      const pesan = status === 401 || status === 403 || status === 404
        ? "GitHub menolak kunci ini. Buka Info toko, putuskan, lalu sambungkan lagi."
        : "Sambungan internet terputus. Perubahan Anda aman, coba terbitkan lagi.";
      isi.innerHTML = '<div class="hasil-besar"><b>😟</b><strong>Belum berhasil</strong><p></p></div>';
      isi.querySelector("p").textContent = pesan;
      const ulang = document.createElement("button");
      ulang.className = "tombol tombol-utama tombol-lebar"; ulang.textContent = "Coba lagi";
      ulang.onclick = jalankanTerbit;
      kaki.appendChild(ulang);
      gambarStatus();
    } finally {
      sedangTerbit = false;
    }
  }
  $("lembarTerbit").addEventListener("cancel", (e) => { if (sedangTerbit) e.preventDefault(); });

  function unduh() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([isiBerkas(kerja)], { type: "text/javascript" }));
    a.download = "produk.js";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    roti("⬇️ produk.js diunduh. Lanjutkan dengan kirim-ke-github.cmd di laptop.");
  }
  $("unduh").onclick = unduh;

  // ---------- Umum ----------
  document.querySelectorAll(".lembar").forEach((d) => {
    d.addEventListener("click", (e) => {
      if (!(e.target === d || e.target.closest("[data-tutup]"))) return;
      if (d.id === "lembarSunting" && !bolehTutupSunting()) return;
      if (d.id === "lembarTerbit" && sedangTerbit) return;
      d.close();
    });
  });

  function goyang(el) {
    el.classList.remove("salah"); void el.offsetWidth; el.classList.add("salah");
    el.focus();
    setTimeout(() => el.classList.remove("salah"), 1200);
  }

  let waktuRoti;
  function roti(teks, tombol, aksi) {
    const r = $("roti");
    r.textContent = teks;
    if (tombol) {
      const b = document.createElement("button");
      b.textContent = tombol;
      b.onclick = () => { r.classList.remove("tampil"); aksi(); };
      r.appendChild(b);
    }
    r.classList.add("tampil");
    clearTimeout(waktuRoti);
    waktuRoti = setTimeout(() => r.classList.remove("tampil"), tombol ? 5000 : 2400);
  }

  // Jangan biarkan halaman tertutup saat sedang menerbitkan.
  addEventListener("beforeunload", (e) => { if (sedangTerbit) { e.preventDefault(); e.returnValue = ""; } });

  function gambarSemua() {
    gambarStatus(); gambarSaring(); gambarBarang();
    if (halAktif === "halKategori") gambarKategori();
    if (halAktif === "halToko") gambarToko();
  }

  gambarSemua();
  muatDariGitHub();
})();
