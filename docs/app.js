const form = document.getElementById("form");
const startBtn = document.getElementById("start");
const log = document.getElementById("log");
const result = document.getElementById("result");

async function download(url) {
  const sep = url.includes("?") ? "&" : "?";
  const start = performance.now();
  const resp = await fetch(`${url}${sep}nocache=${Date.now()}`, { cache: "no-store" });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const size = (await resp.arrayBuffer()).byteLength;
  return { size, seconds: (performance.now() - start) / 1000 };
}

function addLog(text, isError = false) {
  const li = document.createElement("li");
  li.textContent = text;
  if (isError) li.className = "err";
  log.appendChild(li);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = document.getElementById("url").value.trim();
  const count = Number(document.getElementById("count").value) || 10;

  startBtn.disabled = true;
  log.innerHTML = "";
  result.hidden = true;

  let totalBytes = 0;
  let totalSeconds = 0;
  let ok = 0;

  for (let i = 1; i <= count; i++) {
    try {
      const { size, seconds } = await download(url);
      totalBytes += size;
      totalSeconds += seconds;
      ok++;
      addLog(`${(size / 1e6).toFixed(2)} МБ за ${seconds.toFixed(3)} с -> ${(size / seconds / 1e6).toFixed(2)} МБ/с`);
    } catch (err) {
      addLog(`ошибка: ${err.message}`, true);
    }
  }

  if (ok) {
    document.getElementById("speed").textContent = (totalBytes / totalSeconds / 1e6).toFixed(2);
    document.getElementById("avg").textContent = (totalSeconds / ok).toFixed(3);
    document.getElementById("total").textContent = (totalBytes / 1e6).toFixed(2);
    result.hidden = false;
  }
  startBtn.disabled = false;
});
