/* ===================================================================
   data.js : DATA & FUNGSI BANTU
   Isi: variabel utama, helper tanggal, simpan/baca localStorage.
   Semua file JS berbagi satu "kotak" bernama Taskly (window.Taskly)
   supaya fungsi di satu file bisa dipakai file lain.
   =================================================================== */
window.Taskly = window.Taskly || {};
(function (T) {
"use strict";

// KEY    : nama "laci" di localStorage tempat semua tugas disimpan
// tasks  : array berisi semua tugas (satu tugas = satu objek)
// editId : id tugas yang sedang diedit (null = sedang MENAMBAH tugas baru)
// orig   : tanggal & jam asli tugas saat diedit (dipakai untuk validasi)
var KEY = "taskly.tasks.v1";
T.tasks = [];
T.editId = null;
T.orig = null;

// Singkatan untuk document.getElementById
T.$ = function (id) { return document.getElementById(id); };

/* ---------- date helpers (jam perangkat pengguna) ---------- */
// Menambah angka 0 di depan agar 5 menjadi "05"
T.pad = function (n) { return n < 10 ? "0" + n : "" + n; };
// TANGGAL HARI INI dari jam perangkat, format YYYY-MM-DD
T.todayStr = function () {
  var d = new Date();
  return d.getFullYear() + "-" + T.pad(d.getMonth() + 1) + "-" + T.pad(d.getDate());
};
// Tanggal hari ini digeser beberapa hari (untuk data contoh: -1 = kemarin, 2 = lusa)
T.offsetStr = function (days) {
  var d = new Date();
  d.setDate(d.getDate() + days);
  return d.getFullYear() + "-" + T.pad(d.getMonth() + 1) + "-" + T.pad(d.getDate());
};
// Menggabungkan tanggal + jam deadline menjadi satu objek Date
T.deadlineDate = function (t) { return t.dd && t.dt ? new Date(t.dd + "T" + t.dt) : null; };
// OVERDUE: belum Done DAN deadline sudah lewat. Dihitung otomatis, tidak disimpan.
T.isOverdue = function (t) {
  var d = T.deadlineDate(t);
  return !!d && t.status !== "Done" && d.getTime() < Date.now();
};
// TERKUNCI: tugas yang sudah Done tidak boleh diedit lagi
T.isLocked = function (t) { return !!t && t.status === "Done"; };
// Mengubah deadline menjadi teks mudah dibaca, misal "9 Nov 2026, 17.00"
T.fmt = function (t) {
  var d = T.deadlineDate(t);
  return d ? d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "No deadline";
};
// Mengamankan teks pengguna agar < > tidak dianggap kode HTML
T.esc = function (s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
};
// Daftar kategori unik dari semua tugas (untuk dropdown filter)
T.categories = function () {
  var s = {};
  T.tasks.forEach(function (t) { if (t.cat) s[t.cat] = 1; });
  return Object.keys(s).sort();
};

/* ---------- storage ---------- */
// Baca tugas dari localStorage saat halaman dibuka. Jika kosong, isi 4 tugas contoh.
T.load = function () {
  try {
    var r = localStorage.getItem(KEY);
    if (r) { T.tasks = JSON.parse(r); return; }
  } catch (e) {}
  T.tasks = [
    { id: 1, title: "Finish project report", desc: "Write the summary and conclusion sections", cat: "Work", pri: "High", status: "In Progress", sd: T.offsetStr(0), dd: T.offsetStr(2), dt: "17:00" },
    { id: 2, title: "Buy groceries", desc: "Vegetables, rice, eggs", cat: "Personal", pri: "Low", status: "To Do", sd: T.offsetStr(0), dd: T.offsetStr(1), dt: "18:30" },
    { id: 3, title: "Submit tax form", desc: "Already past its deadline (demo of Overdue)", cat: "Finance", pri: "High", status: "To Do", sd: T.offsetStr(-5), dd: T.offsetStr(-1), dt: "09:00" },
    { id: 4, title: "Study for exam", desc: "Chapters 4 to 6", cat: "School", pri: "Medium", status: "Done", sd: T.offsetStr(-3), dd: T.offsetStr(-2), dt: "12:00" }
  ];
};
// Simpan array tasks ke localStorage. Dipanggil setiap ada tambah/edit/hapus/selesai.
T.persist = function () {
  try { localStorage.setItem(KEY, JSON.stringify(T.tasks)); } catch (e) {}
};

})(window.Taskly);