// Tiny DOM helpers — no framework, just convenience.

export function $(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

export function $app(): HTMLElement {
  return document.getElementById("app")!;
}

export function h(
  tag: string,
  attrs?: Record<string, string>,
  ...children: (string | HTMLElement | null)[]
): HTMLElement {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "className") el.className = v;
      else if (k.startsWith("on")) {
        // Not used here — event handlers are attached separately.
      } else el.setAttribute(k, v);
    }
  }
  for (const child of children) {
    if (child === null) continue;
    if (typeof child === "string") el.appendChild(document.createTextNode(child));
    else el.appendChild(child);
  }
  return el;
}

export function clear(el: HTMLElement) {
  el.innerHTML = "";
}

export function showToast(msg: string, isError = false) {
  let toast = document.getElementById("ov-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "ov-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `ov-toast show ${isError ? "error" : "ok"}`;
  setTimeout(() => toast!.classList.remove("show"), 3000);
}
