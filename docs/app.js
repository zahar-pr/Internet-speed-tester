const form = document.getElementById("form");
const startBtn = document.getElementById("start");
const preset = document.getElementById("preset");
const urlInput = document.getElementById("url");
const log = document.getElementById("log");
const popup = document.getElementById("popup");

// url -> размер в байтах для готовых файлов (нужен, если сервер не отдает CORS)
const knownSizes = { "test-5mb.bin": 5242880 };

fetch("links.json")
  .then((r) => r.json())
  .then((links) => {
    for (const link of links) {
      knownSizes[link.url] = link.size;
      preset.add(new Option(link.name, link.url));
    }
  })
  .catch(() => {});

preset.addEventListener("change", () => (urlInput.value = preset.value));

function withNoCache(url) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}nocache=${Date.now()}${Math.random().toString(36).slice(2)}`;
}

// Обычный режим: сервер разрешает CORS, читаем тело и считаем байты сами.
async function downloadCors(url) {
  const start = performance.now();
  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const size = (await resp.arrayBuffer()).byteLength;
  return { size, seconds: (performance.now() - start) / 1000 };
}

// Обход CORS: no-cors запрос скачивает файл, но тело недоступно.
// Время конца загрузки берем из Resource Timing API, размер - из списка готовых файлов.
async function downloadNoCors(url, size) {
  const fullUrl = new URL(url, location.href).href;
  await fetch(fullUrl, { mode: "no-cors", cache: "no-store" });
  const entry = await waitForTiming(fullUrl);
  return { size, seconds: entry.duration / 1000 };
}

function waitForTiming(fullUrl, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    (function check() {
      const entry = performance.getEntriesByName(fullUrl).pop();
      if (entry && entry.responseEnd > 0) return resolve(entry);
      if (performance.now() - started > timeoutMs) return reject(new Error("таймаут"));
      setTimeout(check, 50);
    })();
  });
}

async function download(url) {
  const reqUrl = withNoCache(url);
  try {
    return { ...(await downloadCors(reqUrl)), cors: true };
  } catch (err) {
    if (!(err instanceof TypeError)) throw err; // HTTP-ошибка, а не CORS
    performance.clearResourceTimings();
    return { ...(await downloadNoCors(withNoCache(url), knownSizes[url] ?? null)), cors: false };
  }
}

function addLog(text, isError = false) {
  const li = document.createElement("li");
  li.textContent = text;
  if (isError) li.className = "err";
  log.appendChild(li);
}

const mb = (bytes) => (bytes / 1e6).toFixed(2);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();
  const count = Number(document.getElementById("count").value) || 10;

  startBtn.disabled = true;
  log.innerHTML = "";

  let totalBytes = 0;
  let totalSeconds = 0;
  let ok = 0;
  let sizeUnknown = false;

  for (let i = 1; i <= count; i++) {
    try {
      const { size, seconds, cors } = await download(url);
      totalSeconds += seconds;
      ok++;
      const mode = cors ? "" : " [без CORS]";
      if (size == null) {
        sizeUnknown = true;
        addLog(`за ${seconds.toFixed(3)} с, размер неизвестен${mode}`);
      } else {
        totalBytes += size;
        addLog(`${mb(size)} МБ за ${seconds.toFixed(3)} с -> ${mb(size / seconds)} МБ/с${mode}`);
      }
    } catch (err) {
      addLog(`ошибка: ${err.message}`, true);
    }
  }

  const speed = ok && !sizeUnknown ? totalBytes / totalSeconds / 1e6 : null;
  document.getElementById("popup-url").textContent = url;
  document.getElementById("speed").textContent = speed == null ? "?" : speed.toFixed(2);
  document.getElementById("mbit").textContent = speed == null ? "" : `${(speed * 8).toFixed(2)} Мбит/с`;
  document.getElementById("avg").textContent = ok ? `${(totalSeconds / ok).toFixed(3)} с` : "-";
  document.getElementById("total").textContent = ok && !sizeUnknown ? `${mb(totalBytes)} МБ` : "?";
  document.getElementById("ok").textContent = `${ok} из ${count}`;
  popup.showModal();
  startBtn.disabled = false;
});
