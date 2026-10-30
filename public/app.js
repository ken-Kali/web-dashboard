const $ = (id) => document.getElementById(id);
let results = [];
let totals = { requested: 0, success: 0, failed: 0 };

function setServiceState(online, data = {}) {
  $("statusDot").style.background = online ? "var(--green)" : "var(--red)";
  $("statusText").textContent = online ? "Backend terhubung" : "Backend tidak tersedia";
  $("serviceBadge").className = `badge ${online ? "good" : "bad"}`;
  $("serviceBadge").textContent = online ? "Terhubung" : "Offline";
  $("serviceName").textContent = data.service || "AM Generator API";
  $("serviceDescription").textContent = online ? "Endpoint merespons dengan normal." : "Periksa apakah server sedang berjalan.";
  $("serviceMode").textContent = data.mode || "—";
  $("lastChecked").textContent = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

async function checkStatus() {
  $("refreshStatus").disabled = true;
  try {
    const response = await fetch("/api/status", { headers: { Accept: "application/json" } });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error("Status API tidak valid");
    setServiceState(true, data);
  } catch (error) {
    setServiceState(false);
  } finally {
    $("refreshStatus").disabled = false;
  }
}

function renderResults() {
  const body = $("resultsBody");
  if (!results.length) {
    body.innerHTML = `<tr class="empty-row"><td colspan="4"><span class="empty-icon">≡</span><strong>Belum ada hasil</strong><small>Mulai proses untuk melihat respons di sini.</small></td></tr>`;
  } else {
    body.replaceChildren();
    [...results].reverse().forEach(item => {
      const tr = document.createElement("tr");
      const values = [
        { text: item.id || "—", code: true },
        { text: item.status || "unknown", status: true },
        { text: item.message || item.error || "—" },
        { text: item.createdAt ? new Date(item.createdAt).toLocaleString("id-ID") : "—" }
      ];
      values.forEach((value, index) => {
        const td = document.createElement("td");
        if (value.code) {
          const code = document.createElement("code"); code.textContent = value.text; td.append(code);
        } else if (value.status) {
          const span = document.createElement("span");
          span.className = "row-status" + (value.text === "success" ? " ok" : value.text === "failed" ? " fail" : "");
          span.textContent = value.text; td.append(span);
        } else td.textContent = value.text;
        tr.append(td);
      });
      body.append(tr);
    });
  }
  $("resultCount").textContent = `${results.length} item`;
  $("totalRequested").textContent = totals.requested;
  $("totalSuccess").textContent = totals.success;
  $("totalFailed").textContent = totals.failed;
}

$("processForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const count = Number($("count").value);
  if (!Number.isInteger(count) || count < 1 || count > 10) {
    $("formMessage").textContent = "Masukkan angka bulat antara 1 dan 10.";
    return;
  }
  const button = $("runButton");
  button.disabled = true;
  button.innerHTML = "<span>◌</span> Memproses…";
  $("formMessage").textContent = "Mengirim permintaan ke backend…";
  try {
    const response = await fetch("/api/process", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ count })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Permintaan gagal.");
    const incoming = (data.results || []).map(item => ({
      ...item,
      status: item.status || "demo",
      createdAt: item.createdAt || new Date().toISOString()
    }));
    results = [...results, ...incoming].slice(-100);
    totals.requested += Number(data.total_requested ?? count);
    totals.success += Number(data.total_success || 0);
    totals.failed += Number(data.total_failed || 0);
    renderResults();
    $("formMessage").textContent = data.message || "Permintaan selesai.";
  } catch (error) {
    $("formMessage").textContent = error.message || "Tidak dapat terhubung ke backend.";
    totals.requested += count;
    totals.failed += count;
    results.push({
      id: `ERR-${Date.now()}`,
      status: "failed",
      message: error.message || "Kesalahan jaringan",
      createdAt: new Date().toISOString()
    });
    results = results.slice(-100);
    renderResults();
  } finally {
    button.disabled = false;
    button.innerHTML = "<span>▶</span> Mulai proses";
  }
});

$("refreshStatus").addEventListener("click", checkStatus);
$("clearResults").addEventListener("click", () => {
  results = [];
  renderResults();
  $("formMessage").textContent = "Tampilan hasil dibersihkan.";
});
$("exportResults").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ totals, results }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "am-generator-results.json"; a.click();
  URL.revokeObjectURL(url);
});

checkStatus();
