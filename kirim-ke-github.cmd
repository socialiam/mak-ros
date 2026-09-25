@echo off
setlocal enabledelayedexpansion
title Kirim Toko Mak Ros ke GitHub
cd /d "%~dp0"
set "UNDUHAN=%USERPROFILE%\Downloads"

echo.
echo   ==================================================
echo    KIRIM TOKO MAK ROS KE INTERNET
echo    socialiam.github.io/mak-ros
echo   ==================================================
echo.

rem ---- ambil dulu perubahan yang diterbitkan dari HP ----
git pull --rebase --autostash -q

rem ---- ambil produk.js terbaru dari folder Unduhan ----
set "BARU="
for /f "delims=" %%f in ('dir /b /o-d "%UNDUHAN%\produk*.js" 2^>nul') do (
  if not defined BARU set "BARU=%%f"
)

if defined BARU (
  echo   Ditemukan data toko di folder Unduhan:
  echo     !BARU!
  copy /y "%UNDUHAN%\!BARU!" "%~dp0produk.js" >nul
  move /y "%UNDUHAN%\!BARU!" "%UNDUHAN%\terkirim-!BARU!.txt" >nul
  echo   Data toko disalin ke folder mak-ros.
) else (
  echo   Tidak ada produk.js baru di folder Unduhan.
  echo   Yang dikirim hanya perubahan lain, bila ada.
)
echo.

git add -A
git diff --cached --quiet
if %errorlevel%==0 (
  echo   Tidak ada yang berubah. Semua sudah sama dengan di GitHub.
  goto selesai
)

echo   Perubahan yang akan dikirim:
git diff --cached --name-only
echo.

git commit -m "perbarui toko" >nul
echo   Mengirim ke GitHub...
git push
if errorlevel 1 (
  echo.
  echo   GAGAL mengirim. Periksa sambungan internet lalu coba lagi.
  goto selesai
)

echo.
echo   BERHASIL. Tunggu sekitar satu menit, lalu muat ulang halaman
echo   toko dengan Ctrl+Shift+R.

:selesai
echo.
pause
