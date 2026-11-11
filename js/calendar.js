/* ===================================================================
   calendar.js : KALENDER
   Isi: menggambar kalender sebulan, pilih tanggal, bulan sebelum/sesudah,
   panel "Tasks due" untuk tanggal terpilih.
   =================================================================== */
(function (T) {
"use strict";
var $ = T.$;

// calY/calM = tahun & bulan yang ditampilkan, selDay = tanggal terpilih
var calY, calM, selDay;
function goToday() {
  var n = new Date();
  calY = n.getFullYear(); calM = n.getMonth(); selDay = T.todayStr();
}
goToday();

// Dipakai file lain (notifikasi "Due today") untuk melompat ke hari ini
T.calGoToday = function () { goToday(); T.renderCal(); };

// Teks tanggal YYYY-MM-DD dari tahun, bulan, dan hari
function ds(y, m, d) { return y + "-" + T.pad(m + 1) + "-" + T.pad(d); }

// Gambar kalender: tanggal lewat = "past" (abu-abu), hari ini = lingkaran,
// tanggal yang punya deadline = titik (merah jika ada Overdue).
T.renderCal = function () {
  var first = new Date(calY, calM, 1), dim = new Date(calY, calM + 1, 0).getDate(), today = T.todayStr(), h = "", i, d;
  $("calTitle").textContent = first.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  for (i = 0; i < first.getDay(); i++) h += "<span></span>";
  for (d = 1; d <= dim; d++) {
    var s = ds(calY, calM, d), ts = T.tasks.filter(function (t) { return t.dd === s; }), late = ts.some(T.isOverdue);
    h += '<button type="button" class="cd' + (s < today ? " past" : "") + (s === today ? " today" : "") + (s === selDay ? " sel" : "") +
      '" data-day="' + s + '" aria-label="' + s + (s < today ? ", past date" : "") + (ts.length ? ", " + ts.length + " task(s) due" : "") + '">' +
      d + (ts.length ? '<i class="dot' + (late ? " late" : "") + '"></i>' : "") + "</button>";
  }
  $("calGrid").innerHTML = h;
  // Panel kanan: tugas yang deadline-nya di tanggal terpilih
  $("dayTitle").textContent = new Date(selDay + "T00:00").toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  var list = T.tasks.filter(function (t) { return t.dd === selDay; }).sort(function (a, b) { return a.dt < b.dt ? -1 : 1; });
  $("dayList").innerHTML = list.length ? list.map(function (t) {
    var late = T.isOverdue(t);
    return '<div class="ev' + (late ? " late" : "") + (t.status === "Done" ? " done" : "") + '"><b>' + T.esc(t.title) + "</b><span>Due " + T.esc(t.dt) + ", " + t.status + (late ? ", Overdue" : "") + "</span></div>";
  }).join("") : '<div class="ev none">No tasks due this day</div>';
};

// Klik sebuah tanggal untuk melihat tugas yang deadline-nya hari itu
$("calGrid").addEventListener("click", function (ev) {
  var b = ev.target.closest("[data-day]");
  if (b) { selDay = b.dataset.day; T.renderCal(); }
});
// Tombol bulan sebelumnya / berikutnya / kembali ke hari ini
$("calPrev").addEventListener("click", function () { calM--; if (calM < 0) { calM = 11; calY--; } T.renderCal(); });
$("calNext").addEventListener("click", function () { calM++; if (calM > 11) { calM = 0; calY++; } T.renderCal(); });
$("calToday").addEventListener("click", T.calGoToday);

})(window.Taskly);