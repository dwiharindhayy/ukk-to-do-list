/* ===================================================================
   form.js : FORM ADD / EDIT TASK
   Isi: membuka form, tombol Add task (satu-satunya, di kartu sapaan),
   menyimpan tugas. Tugas Done tidak bisa dibuka untuk diedit.
   =================================================================== */
(function (T) {
"use strict";
var $ = T.$;

// Buka form. Jika t ada = mode EDIT, jika null = mode TAMBAH
T.openForm = function (t) {
  if (t && T.isLocked(t)) { T.toast("Completed tasks can't be edited 🔒"); return; }
  T.editId = t ? t.id : null;
  T.orig = t ? { sd: t.sd, dd: t.dd, dt: t.dt } : null;
  $("dlgTitle").textContent = t ? "Edit task" : "Add task";
  $("title").value = t ? t.title : ""; $("desc").value = t ? t.desc : ""; $("cat").value = t ? t.cat : "";
  $("status").value = t ? t.status : "To Do"; $("pri").value = t ? t.pri : "Medium";
  $("sd").value = t ? t.sd : T.todayStr(); $("dd").value = t ? t.dd : ""; $("dt").value = t ? t.dt : "";
  T.showErrors([]); T.applyMin();
  $("dlg").showModal(); $("title").focus();
};

// Jika start date diubah, batas minimum deadline ikut diperbarui
$("sd").addEventListener("change", T.applyMin);
// Satu-satunya tombol Add task (di kartu sapaan)
$("addBtn").addEventListener("click", function () { T.openForm(null); });
$("cancel").addEventListener("click", function () { $("dlg").close(); });

// SAAT TOMBOL SAVE DITEKAN: ambil isi form -> validasi -> jika error berhenti -> simpan
$("form").addEventListener("submit", function (ev) {
  ev.preventDefault();
  var v = { title: $("title").value, desc: $("desc").value.trim(), cat: $("cat").value.trim(), status: $("status").value, pri: $("pri").value, sd: $("sd").value, dd: $("dd").value, dt: $("dt").value };
  var errs = T.validate(v);
  if (errs.length) { T.showErrors(errs); return; }
  v.title = v.title.trim();
  var wasEdit = T.editId !== null;
  if (wasEdit) {
    // Pengaman: tugas yang sudah Done tidak boleh diubah walau form sempat terbuka
    var cur = T.tasks.filter(function (t) { return t.id === T.editId; })[0];
    if (T.isLocked(cur)) { $("dlg").close(); return; }
    T.tasks = T.tasks.map(function (t) { return t.id === T.editId ? Object.assign({}, t, v) : t; });
  } else {
    v.id = Date.now(); T.tasks.push(v);
  }
  T.persist(); $("dlg").close(); T.renderFilters(); T.render();
  T.toast(wasEdit ? "Task updated ✨" : "Task added 🎉");
});

})(window.Taskly);