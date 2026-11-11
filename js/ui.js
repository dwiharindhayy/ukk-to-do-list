/* ===================================================================
   ui.js : TAMPILAN UMUM
   Isi: notifikasi kecil (toast), mode gelap/terang, tombol buka-tutup My Tasks.
   =================================================================== */
(function (T) {
"use strict";
var $ = T.$;

/* ---------- toast ---------- */
// Notifikasi kecil di bawah layar, hilang sendiri setelah 2,2 detik
var tt;
T.toast = function (m) {
  var e = $("toast");
  e.textContent = m;
  e.classList.add("on");
  clearTimeout(tt);
  tt = setTimeout(function () { e.classList.remove("on"); }, 2200);
};

/* ---------- mode gelap / terang ---------- */
// Pilihan tema disimpan di localStorage. Awalnya selalu terang.
var THEME_KEY = "taskly.theme";
function setTheme(t, save) {
  document.documentElement.setAttribute("data-theme", t);
  $("themeBtn").textContent = t === "dark" ? "☀️" : "🌙";
  if (save) { try { localStorage.setItem(THEME_KEY, t); } catch (e) {} }
}
var savedTheme = null;
try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) {}
setTheme(savedTheme || "light", false);
$("themeBtn").addEventListener("click", function () {
  setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
});

/* ---------- buka / tutup SIDEBAR ---------- */
// Sidebar mengecil jadi strip ikon saat ditutup. Pilihan disimpan di localStorage.
var SIDE_KEY = "taskly.side";
function setSide(closed, save) {
  document.querySelector(".app").classList.toggle("side-closed", closed);
  var b = $("sideToggle");
  b.setAttribute("aria-expanded", closed ? "false" : "true");
  b.setAttribute("aria-label", closed ? "Expand sidebar" : "Collapse sidebar");
  b.title = closed ? "Expand sidebar" : "Collapse sidebar";
  if (save) { try { localStorage.setItem(SIDE_KEY, closed ? "closed" : "open"); } catch (e) {} }
}
var savedSide = null;
try { savedSide = localStorage.getItem(SIDE_KEY); } catch (e) {}
setSide(savedSide === "closed", false);
$("sideToggle").addEventListener("click", function () {
  setSide($("sideToggle").getAttribute("aria-expanded") === "true", true);
});

/* ---------- buka / tutup bagian My Tasks ---------- */
// open = true -> bagian My Tasks (progress, filter, daftar, kalender) tampil; false -> disembunyikan
T.setTasksOpen = function (open) {
  $("tasksBody").classList.toggle("closed", !open);
  $("toggleTasks").setAttribute("aria-expanded", open ? "true" : "false");
  $("toggleTxt").textContent = open ? "Hide" : "Show";
};
$("toggleTasks").addEventListener("click", function () {
  var isOpen = $("toggleTasks").getAttribute("aria-expanded") === "true";
  T.setTasksOpen(!isOpen);
});

})(window.Taskly);