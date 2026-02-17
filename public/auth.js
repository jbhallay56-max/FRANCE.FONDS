async function api(path, body){
  const r = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {})
  });
  const data = await r.json().catch(() => ({}));
  if(!r.ok) throw new Error(data.error || "Erreur");
  return data;
}
function setAlert(el, msg, kind){
  if(!el) return;
  el.textContent = msg || "";
  el.className = "alert " + (kind || "");
  el.style.display = msg ? "block" : "none";
}
window.FRANCE_AUTH = { api, setAlert };