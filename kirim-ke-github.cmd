@echo off
title Kirim Toko Ma Ros ke GitHub
cd /d "%~dp0"

echo.
echo   Mengirim perubahan toko Ma Ros ke GitHub...
echo.

git add -A
git diff --cached --quiet
if %errorlevel%==0 (
  echo   Tidak ada yang berubah. Semua sudah sama dengan di GitHub.
  goto selesai
)

git commit -m "perbarui toko" >nul
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
