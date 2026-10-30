const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (_req, res) => {
  res.json({
    ok: true,
    service: "AM Generator Dashboard",
    status: "ready",
    mode: process.env.SERVICE_MODE || "demo",
    timestamp: new Date().toISOString()
  });
});

// Safe demo endpoint. Connect your own authorized service here after adding
// authentication, rate limiting, and service-specific validation.
app.post("/api/process", async (req, res) => {
  const count = Number(req.body?.count);
  if (!Number.isInteger(count) || count < 1 || count > 10) {
    return res.status(400).json({
      ok: false,
      error: "Jumlah proses harus berupa bilangan bulat 1–10."
    });
  }

  // Deliberately does not create accounts, access third-party inboxes,
  // or perform third-party magic-link verification. Replace this block
  // only with an operation for a service you own or are authorized to manage.
  const results = Array.from({ length: count }, (_, i) => ({
    id: `DEMO-${Date.now()}-${i + 1}`,
    status: "demo",
    message: "Contoh hasil saja — belum menjalankan layanan eksternal.",
    createdAt: new Date().toISOString()
  }));

  res.json({
    ok: true,
    mode: "demo",
    total_requested: count,
    total_success: 0,
    total_failed: 0,
    results,
    message: "Endpoint demo aktif. Hubungkan layanan resmi milikmu di server."
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: "Terjadi kesalahan pada server." });
});

app.listen(PORT, () => {
  console.log(`AM Generator Dashboard berjalan di http://localhost:${PORT}`);
});