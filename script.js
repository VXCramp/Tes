const STORAGE_KEY = "produk-tugas-3";
const defaultProducts = [
  { id: 1, nama: "Pulpen", harga: 5000 },
  { id: 2, nama: "Buku Tulis", harga: 12000 },
  { id: 3, nama: "Spidol", harga: 8000 },
];

let products = load();
let nextId = products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
let editingId = null;
let deletingId = null;

const $ = (id) => document.getElementById(id);
const rupiah = (n) => "Rp" + Number(n).toLocaleString("id-ID");

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (e) { /* abaikan, pakai data awal */ }
  return defaultProducts.slice();
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); } catch (e) { /* abaikan */ }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function render() {
  const body = $("product-body");
  body.innerHTML = products.map((p) => `
    <tr>
      <td>${p.id}</td>
      <td>${escapeHtml(p.nama)}</td>
      <td>${rupiah(p.harga)}</td>
      <td>
        <div class="row-actions">
          <button class="btn btn-outline btn-sm" data-edit="${p.id}">Edit</button>
          <button class="btn btn-outline-danger btn-sm" data-delete="${p.id}">Hapus</button>
        </div>
      </td>
    </tr>`).join("");
  $("empty-state").hidden = products.length > 0;
}

/* ---------- Modal helpers ---------- */
function openModal(id) { $(id).hidden = false; }
function closeModals() {
  document.querySelectorAll(".overlay").forEach((m) => (m.hidden = true));
  editingId = null;
  deletingId = null;
}

function validate(nama, harga, errorEl, hargaInput) {
  const value = Number(harga);
  const valid = nama.trim() !== "" && Number.isFinite(value) && value > 0;
  errorEl.classList.toggle("error", !valid);
  hargaInput.classList.toggle("invalid", !valid);
  if (!valid) {
    errorEl.textContent = nama.trim() === ""
      ? "Nama produk wajib diisi."
      : "Harga harus lebih dari 0.";
  }
  return valid;
}

/* ---------- Tambah ---------- */
$("btn-tambah").addEventListener("click", () => {
  $("form-tambah").reset();
  $("tambah-error").textContent = "Harga harus lebih dari 0.";
  $("tambah-error").classList.remove("error");
  $("tambah-harga").classList.remove("invalid");
  openModal("modal-tambah");
  $("tambah-nama").focus();
});

$("form-tambah").addEventListener("submit", (e) => {
  e.preventDefault();
  const nama = $("tambah-nama").value;
  const harga = $("tambah-harga").value;
  if (!validate(nama, harga, $("tambah-error"), $("tambah-harga"))) return;
  products.push({ id: nextId++, nama: nama.trim(), harga: Number(harga) });
  save();
  render();
  closeModals();
});

/* ---------- Edit ---------- */
function openEdit(id) {
  const p = products.find((item) => item.id === id);
  if (!p) return;
  editingId = id;
  $("edit-id").textContent = "ID: " + p.id;
  $("edit-nama").value = p.nama;
  $("edit-harga").value = p.harga;
  $("edit-error").textContent = "Harga harus lebih dari 0.";
  $("edit-error").classList.remove("error");
  $("edit-harga").classList.remove("invalid");
  openModal("modal-edit");
  $("edit-nama").focus();
}

$("form-edit").addEventListener("submit", (e) => {
  e.preventDefault();
  const nama = $("edit-nama").value;
  const harga = $("edit-harga").value;
  if (!validate(nama, harga, $("edit-error"), $("edit-harga"))) return;
  const p = products.find((item) => item.id === editingId);
  if (p) {
    p.nama = nama.trim();
    p.harga = Number(harga);
  }
  save();
  render();
  closeModals();
});

/* ---------- Hapus ---------- */
function openDelete(id) {
  const p = products.find((item) => item.id === id);
  if (!p) return;
  deletingId = id;
  $("hapus-id").textContent = "ID: " + p.id;
  $("hapus-nama").textContent = p.nama;
  $("hapus-harga").textContent = rupiah(p.harga);
  openModal("modal-hapus");
}

$("btn-konfirmasi-hapus").addEventListener("click", () => {
  products = products.filter((item) => item.id !== deletingId);
  save();
  render();
  closeModals();
});

/* ---------- Event umum ---------- */
$("product-body").addEventListener("click", (e) => {
  const edit = e.target.closest("[data-edit]");
  const del = e.target.closest("[data-delete]");
  if (edit) openEdit(Number(edit.dataset.edit));
  if (del) openDelete(Number(del.dataset.delete));
});

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-close]") || e.target.classList.contains("overlay")) closeModals();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModals();
});

render();
