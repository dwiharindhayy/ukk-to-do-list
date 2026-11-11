/* ===================================================================
   validation.js : SEMUA VALIDASI FORM
   Isi: aturan validasi tanggal/waktu, kotak pesan error, batas min date picker.
   =================================================================== */
(function (T) {
"use strict";
var $ = T.$;

// Menerima isi form (v), mengembalikan daftar pesan error. Kosong = lolos.
// Saat Edit, kolom yang tidak diubah tidak ditolak, supaya tugas Overdue masih bisa diedit.
T.validate = function (v) {
  var e = [], today = T.todayStr(), isEdit = T.editId !== null;
  var sdChanged = !isEdit || v.sd !== T.orig.sd;
  var ddChanged = !isEdit || v.dd !== T.orig.dd || v.dt !== T.orig.dt;
  // Aturan 1: nama tugas wajib diisi
  if (!v.title.trim()) e.push("Task name is required.");
  // Aturan 2: start date, deadline date, deadline time wajib dipilih
  if (!v.sd) e.push("Please select a start date.");
  if (!v.dd) e.push("Please select a deadline date.");
  if (!v.dt) e.push("Please select a deadline time.");
  // Aturan 3: start date tidak boleh sebelum hari ini
  if (v.sd && sdChanged && v.sd < today) e.push("Start date cannot be in the past.");
  // Aturan 4: deadline tidak boleh sebelum hari ini
  if (v.dd && ddChanged && v.dd < today) e.push("Deadline cannot be in the past.");
  // Aturan 5: deadline tidak boleh lebih awal dari start date
  if (v.sd && v.dd && v.dd < v.sd) e.push("Deadline cannot be earlier than start date.");
  // Aturan 6: deadline hari ini harus jam yang belum lewat
  if (v.dd === today && v.dt && ddChanged && v.status !== "Done") {
    if (new Date(v.dd + "T" + v.dt).getTime() <= Date.now()) e.push("Please select a future time for today's deadline.");
  }
  return e;
};

// Tampilkan daftar pesan error di kotak merah dalam form (atau sembunyikan jika kosong)
T.showErrors = function (list) {
  var box = $("errs");
  box.innerHTML = list.map(function (m) { return "<div>" + T.esc(m) + "</div>"; }).join("");
  box.classList.toggle("on", list.length > 0);
};

// Isi atribut min pada date picker agar tanggal lewat abu-abu dan tidak bisa dipilih
T.applyMin = function () {
  var today = T.todayStr();
  var sMin = T.editId !== null && T.orig.sd < today ? T.orig.sd : today;
  var dMin = T.editId !== null && T.orig.dd < today ? T.orig.dd : today;
  $("sd").min = sMin;
  $("dd").min = $("sd").value && $("sd").value > dMin ? $("sd").value : dMin;
};

})(window.Taskly);