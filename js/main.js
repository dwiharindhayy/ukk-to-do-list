/* ===================================================================
   main.js : PROGRAM DIMULAI DI SINI (harus dimuat paling akhir)
   Baca data, siapkan filter, gambar halaman pertama kali,
   lalu hitung ulang tiap 30 detik agar status Overdue muncul sendiri.
   =================================================================== */
(function (T) {
"use strict";
T.load();
T.renderFilters();
T.render();
setInterval(T.render, 30000);
})(window.Taskly);