/* ===================================================================
   tasks.js : DAFTAR TUGAS
   Isi: kartu statistik, progress bar, filter + search, menggambar daftar
   tugas, tombol Edit/Delete/centang di kartu.
   Aturan revisi: tugas Done TERKUNCI (tidak bisa diedit / di-uncheck).
   =================================================================== */
(function (T) {
"use strict";
var $ = T.$;

// Isi dropdown filter kategori dan saran kategori di form
T.renderFilters = function () {
  var cur = $("fCat").value, cs = T.categories();
  $("fCat").innerHTML = '<option value="">All categories</option>' + cs.map(function (c) { return "<option>" + T.esc(c) + "</option>"; }).join("");
  $("fCat").value = cs.indexOf(cur) > -1 ? cur : "";
  $("cats").innerHTML = cs.map(function (c) { return '<option value="' + T.esc(c) + '">'; }).join("");
};

// Hitung dan gambar 4 kartu statistik: To Do, In Progress, Done, Overdue
T.renderStats = function () {
  var c = { todo: 0, prog: 0, done: 0, late: 0 }, n = T.tasks.length;
  T.tasks.forEach(function (t) {
    if (t.status === "To Do") c.todo++; else if (t.status === "In Progress") c.prog++; else c.done++;
    if (T.isOverdue(t)) c.late++;
  });
  var I = {
    a: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 10h8M8 14h5"/>',
    b: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    c: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 12l3 3 5-6"/>',
    d: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>'
  };
  var cards = [["s1", "a", "Tasks to do", c.todo, ""], ["s2", "b", "Tasks in progress", c.prog, ""], ["s3", "c", "Tasks done", c.done, ""], ["s4", "d", "Overdue tasks", c.late, "late"]];
  $("stats").innerHTML = cards.map(function (s) {
    return '<div class="stat ' + s[0] + ' ' + s[4] + '"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[s[1]] + '</svg><span>' + s[2] + '<br>out of ' + n + ' total</span><b>' + s[3] + '</b></div>';
  }).join("");
};

// Progress bar: persentase tugas yang sudah Done dari seluruh tugas
T.renderProgress = function () {
  var n = T.tasks.length, d = T.tasks.filter(function (t) { return t.status === "Done"; }).length, p = n ? Math.round(d / n * 100) : 0;
  $("progBar").style.width = p + "%";
  $("progPct").textContent = p + "%";
  $("progTxt").textContent = !n ? "No tasks yet" : p === 100 ? "All done, amazing! 🎉" : d + " of " + n + " tasks completed";
};

// FILTER + SEARCH: true jika tugas cocok dengan SEMUA kondisi (hanya menyaring tampilan)
function matches(t) {
  var q = $("q").value.trim().toLowerCase(), st = $("fStatus").value, ct = $("fCat").value, pr = $("fPri").value;
  if (q) { var hay = (t.title + " " + t.desc + " " + t.cat).toLowerCase(); if (hay.indexOf(q) < 0) return false; }
  if (st && t.status !== st) return false;
  if ($("fLate").checked && !T.isOverdue(t)) return false;
  if (ct && t.cat !== ct) return false;
  if (pr && t.pri !== pr) return false;
  return true;
}

// Fungsi PENGGAMBAR utama: dipanggil setiap data atau filter berubah.
T.render = function () {
  $("today").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  $("clearQ").hidden = !$("q").value;
  T.renderProgress(); T.renderCal(); T.renderNotifs(); T.renderStats();
  var rows = T.tasks.filter(matches).sort(function (a, b) {
    var da = T.deadlineDate(a), db = T.deadlineDate(b);
    return (da ? da.getTime() : 1e15) - (db ? db.getTime() : 1e15);
  });
  if (!rows.length) {
    $("list").innerHTML = '<div class="empty"><strong>No tasks found</strong>' + (T.tasks.length ? "Try a different search or reset the filters." : "Add your first task to get started.") + "</div>";
    return;
  }
  $("list").innerHTML = rows.map(function (t) {
    var late = T.isOverdue(t), locked = T.isLocked(t);
    var sc = t.status === "Done" ? "s-done" : t.status === "In Progress" ? "s-prog" : "";
    return '<article class="task' + (late ? " overdue" : "") + (locked ? " done" : "") + '">' +
      // Tugas Done: centang dan tombol Edit dinonaktifkan (terkunci)
      '<input class="chk" type="checkbox" data-done="' + t.id + '" ' + (locked ? "checked disabled" : "") + ' aria-label="' + (locked ? "Task completed (locked)" : "Mark as done") + '">' +
      '<div><h3>' + T.esc(t.title) + '</h3>' + (t.desc ? '<p>' + T.esc(t.desc) + '</p>' : '') +
      '<div class="meta"><span class="tag ' + sc + '">' + t.status + '</span>' + (late ? '<span class="tag late">Overdue</span>' : '') +
      '<span class="tag">' + t.pri + ' priority</span>' + (t.cat ? '<span class="tag">' + T.esc(t.cat) + '</span>' : '') +
      '<span class="tag">Starts ' + T.esc(t.sd || "–") + '</span><span class="tag">Due ' + T.esc(T.fmt(t)) + '</span></div></div>' +
      '<div class="acts"><button class="btn" data-edit="' + t.id + '"' + (locked ? ' disabled title="Completed tasks cannot be edited"' : '') + '>Edit</button>' +
      '<button class="btn danger" data-del="' + t.id + '">Delete</button></div></article>';
  }).join("");
};

/* ---------- aksi di kartu tugas ---------- */
function findTask(id) { return T.tasks.filter(function (t) { return t.id == id; })[0]; }

// Tombol Edit dan Delete (satu pendengar untuk semua kartu)
$("list").addEventListener("click", function (ev) {
  var b = ev.target.closest("button"); if (!b || b.disabled) return;
  if (b.dataset.edit) {
    var t = findTask(b.dataset.edit);
    if (T.isLocked(t)) { T.toast("Completed tasks can't be edited 🔒"); return; }
    T.openForm(t);
  }
  if (b.dataset.del && confirm("Delete this task?")) {
    T.tasks = T.tasks.filter(function (t) { return t.id != b.dataset.del; });
    T.persist(); T.renderFilters(); T.render(); T.toast("Task deleted 🗑️");
  }
});

// Kotak centang: dicentang = Done. Setelah Done, centang terkunci (tidak bisa dibatalkan).
$("list").addEventListener("change", function (ev) {
  var id = ev.target.dataset && ev.target.dataset.done; if (!id) return;
  if (T.isLocked(findTask(id))) { T.render(); return; }
  T.tasks = T.tasks.map(function (t) { return t.id == id ? Object.assign({}, t, { status: ev.target.checked ? "Done" : "To Do" }) : t; });
  T.persist(); T.render();
  if (ev.target.checked) T.toast("Great job! Task done 🎊");
});

/* ---------- search + filter (real-time) ---------- */
$("q").addEventListener("input", T.render);
["fStatus", "fCat", "fPri", "fLate"].forEach(function (id) { $(id).addEventListener("change", T.render); });
// Tombol x: kosongkan kotak search
$("clearQ").addEventListener("click", function () { $("q").value = ""; T.render(); $("q").focus(); });
// Tombol Reset filters: kosongkan search dan semua filter
$("reset").addEventListener("click", function () {
  $("q").value = ""; $("fStatus").value = ""; $("fCat").value = ""; $("fPri").value = ""; $("fLate").checked = false; T.render();
});

})(window.Taskly);