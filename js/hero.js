/* ===================================================================
   hero.js : KARTU SAPAAN & NOTIFIKASI
   Isi: sapaan sesuai jam, kalimat status, notifikasi otomatis,
   tautan cepat (Check Calendar, See Overdue, Manage Tasks).
   Tombol Add task ada di kartu sapaan (id addBtn), diatur di form.js.
   =================================================================== */
(function (T) {
"use strict";
var $ = T.$;

// Sapaan sesuai jam, kalimat status, dan notifikasi (overdue, jatuh tempo hari ini, jumlah selesai)
T.renderNotifs = function () {
  var h = new Date().getHours();
  $("greet").textContent = h < 11 ? "Good morning!" : h < 15 ? "Good afternoon!" : h < 19 ? "Good evening!" : "Hi there!";
  var open = T.tasks.filter(function (t) { return t.status !== "Done"; }), late = open.filter(T.isOverdue), today = T.todayStr();
  var dueToday = open.filter(function (t) { return t.dd === today && !T.isOverdue(t); }), done = T.tasks.length - open.length, n = [];
  $("heroSub").textContent = !T.tasks.length ? "Add your first task to get started." :
    late.length ? "You have " + late.length + " overdue task" + (late.length > 1 ? "s" : "") + ". Let's catch up!" :
    open.length ? "You have " + open.length + " task" + (open.length > 1 ? "s" : "") + " to finish. What are we doing today?" : "You're all caught up!";
  if (late.length) n.push(["late", "!", "overdue", late.length + " task" + (late.length > 1 ? "s are" : " is") + " overdue", T.esc(late[0].title) + (late.length > 1 ? " and " + (late.length - 1) + " more" : "")]);
  if (dueToday.length) n.push(["warn", "!", "today", "Due today: " + T.esc(dueToday[0].title), "At " + T.esc(dueToday[0].dt) + (dueToday.length > 1 ? " (+" + (dueToday.length - 1) + " more)" : "")]);
  n.push(T.tasks.length ?
    ["info", "&#10003;", "tasks", done + " of " + T.tasks.length + " tasks completed", done === T.tasks.length ? "Everything is done. Great job!" : "Keep going, you're doing great"] :
    ["info", "+", "tasks", "No tasks yet", "Use Add task above to begin"]);
  $("notes").innerHTML = n.map(function (x) {
    return '<button type="button" class="note" data-go="' + x[2] + '"><i class="ni ' + x[0] + '">' + x[1] + "</i><span>" + x[3] + "<small>" + x[4] + "</small></span>&#8250;</button>";
  }).join("");
};

// Tautan cepat & notifikasi (atribut data-go): lompat ke kalender / tampilkan tugas
document.addEventListener("click", function (ev) {
  var b = ev.target.closest("[data-go]"); if (!b) return;
  var g = b.dataset.go;
  // Pastikan bagian My Tasks terbuka dulu sebelum menggulir ke sana
  function go(id) { T.setTasksOpen(true); $(id).scrollIntoView({ behavior: "smooth", block: "start" }); }
  if (g === "overdue") { $("fStatus").value = ""; $("fLate").checked = true; T.render(); go("listTop"); }
  else if (g === "tasks") { $("fStatus").value = ""; $("fLate").checked = false; T.render(); go("listTop"); }
  else if (g === "cal") { go("viewCal"); }
  else if (g === "today") { T.calGoToday(); go("viewCal"); }
});

})(window.Taskly);