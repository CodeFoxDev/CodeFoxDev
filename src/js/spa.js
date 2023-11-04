let pages = [];
let host = window.location.origin;
let cbs = [];
const _parser = new DOMParser();

function initListeners() {
  host = window.location.origin;

  const links = document.querySelectorAll("a");
  links.forEach(a => {
    if (!shouldLoad(a.href)) return;
    if (!pages.find(e => e.url == a.pathname)) preload(a.pathname);

    a.addEventListener("click", (e) => {
      e.preventDefault();
      render(a.pathname);
    });
  });
}

/** @param {string} url */
function shouldLoad(url) {
  if (!url.startsWith("http")) return false;
  if (!url.includes(host)) return false;
  return true;
}

async function preload(url) {
  const existing = pages.find(e => e.url == url);
  if (existing) return existing;
  pages.push({
    url: url,
    body: null
  });
  const i = pages.length - 1;

  const res = await fetch(url);
  if (!res) return;
  const text = (await res).text();
  const document = _parser.parseFromString((await text), "text/html");
  if (!document || !text) return;
  pages[i].body = document.body;

  console.log(`Preloaded: ${url}`);
  exec(url, document);

  return {
    url: url,
    body: document.body
  }
}

function render(url) {
  if (window.location.pathname == url) return;
  const _check = document.querySelector("#nav-toggle");
  if (_check) _check.checked = false;
  register(url, async (body) => {
    await transition(body);
    history.pushState({}, "", url);
    document.title = formatTitle(url);
    emit("load", { url });
    initListeners();
  });
}

function exec(url, document) {
  const items = cbs.filter(e => e.url == url);
  if (!items) return;
  items.forEach(e => e.callback(document.body));
}

function register(url, cb) {
  let page = pages.find(e => e.url == url);
  if (page && page.body) return cb(page.body);
  cbs.push({
    url: url,
    callback: cb
  });
}

/**
 * @param {HTMLBodyElement} body 
 */
function transition(body) {
  const duration = 300;
  return new Promise((resolve) => {
    document.body.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], {
      duration: duration,
      easing: "ease",
      fill: "forwards"
    });
    setTimeout(() => {
      document.body.innerHTML = body.innerHTML;
      document.body.animate([
        { opacity: 0 },
        { opacity: 1 }
      ], {
        duration: duration,
        easing: "ease",
        fill: "forwards"
      });
      setTimeout(() => resolve(), duration);
    }, duration);
  });
}

function formatTitle(url) {
  let replaced = url.replace("/", "");
  let name = replaced.charAt(0).toUpperCase() + replaced.slice(1);
  if (url != "/") name += " - ";
  return `${name}Codefoxdev`;
}

initListeners();

let events = [];

function emit(event, data) {
  let call = events.filter(e => e.event == event);
  call.forEach(e => e.callback(data));
}

export function on(event, cb) {
  events.push({
    event, callback: cb
  });
}