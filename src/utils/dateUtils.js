// Mengambil tanggal hari ini format YYYY-MM-DD sesuai zona waktu lokal perangkat
export function getLocalTodayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Mengubah string tanggal (YYYY-MM-DD atau MM/DD/YYYY) ke format tampilan detail Indonesia
export function formatQuestDate(dateStr) {
  if (!dateStr) return "Tanpa Tanggal";

  const todayISO = getLocalTodayISO();
  const normalized = normalizeToISO(dateStr);

  const dateObj = new Date(`${normalized}T00:00:00`);
  if (isNaN(dateObj.getTime())) return dateStr;

  const formatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dateObj);

  if (normalized === todayISO) {
    return `Hari Ini • ${formatted}`;
  }
  return formatted;
}

// Normalisasi berbagai format tanggal dari Google Sheet menjadi YYYY-MM-DD
export function normalizeToISO(dateStr) {
  if (!dateStr) return getLocalTodayISO();
  const str = String(dateStr).trim();

  // Jika sudah YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // Jika format MM/DD/YYYY dari Google Sheet
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [m, d, y] = str.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return str;
}
