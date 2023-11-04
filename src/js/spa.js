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
  if (window.location.pathname == url || window.location.pathname.slice(0, -1) == url) return;
  register(url, async (body) => {
    await transition(body, url);
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
function transition(body, url) {
  const duration = 1000;
  const delay = 1000;
  const opts = { duration: duration, easing: "ease-in-out", fill: "forwards" };
  const [top, left, right, base] = getTranstionElements();

  return new Promise((resolve) => {
    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "hidden";

    base.animate([{ opacity: "0" }, { opacity: "1" }], opts);
    top.animate([{ transform: "translate(0, -30vh)" }, { transform: "translate(0,0)" }], opts);
    left.animate([{ transform: "translate(-30vh, 30vh)" }, { transform: "translate(0,0)" }], opts);
    right.animate([{ transform: "translate(30vh, 30vh)" }, { transform: "translate(0,0)" }], opts);
    base.style.pointerEvents = "all";

    setTimeout(() => {
      replaceBody(body);
      history.pushState({}, "", url);
      document.title = formatTitle(url);
      emit("load", { url });

      document.body.style.overflowX = "hidden";
      document.body.style.overflowY = "overlay";
      window.scrollTo({ top: 0, behavior: "instant" });

      base.animate([{ opacity: "1" }, { opacity: "0" }], opts);
      top.animate([{ transform: "translate(0,0)" }, { transform: "translate(0, -30vh)" }], opts);
      left.animate([{ transform: "translate(0,0)" }, { transform: "translate(-30vh, 30vh)" }], opts);
      right.animate([{ transform: "translate(0,0)" }, { transform: "translate(30vh, 30vh)" }], opts);

      setTimeout(() => {
        base.style.pointerEvents = "none";
        resolve();
      }, duration);
    }, duration + delay);
  });
}

function formatTitle(url) {
  let replaced = url.replace("/", "");
  let name = replaced.charAt(0).toUpperCase() + replaced.slice(1);
  if (url != "/") name += " - ";
  return `${name}Codefoxdev`;
}

function replaceBody(body) {
  const children = Array.from(document.body.childNodes);
  const newChildren = Array.from(body.childNodes);

  for (const e of children) {
    if (e.nodeType != 1) {
      document.body.removeChild(e);
      continue;
    }
    if (e.getAttribute("data-preserve") != null) continue;
    if (e.tagName?.toLowerCase() == "script") continue;
    document.body.removeChild(e);
  }

  for (const e of newChildren) {
    if (e.nodeType != 1) continue;
    if (e.tagName?.toLowerCase() == "script") continue;
    document.body.appendChild(e.cloneNode(true));
  }
}

function getTranstionElements() {
  let ele = document.querySelector("#transition");
  if (!ele) {
    ele = document.createElement("div");
    ele.className = "transition";
    ele.id = "transition";
    ele.setAttribute("data-preserve", "");

    ele.innerHTML = /*html*/`
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path
          d="M8.54397 47.6165C7.61353 47.0812 7.04001 46.0896 7.04001 45.0162V20.3806C7.04001 19.6119 7.87113 19.1307 8.53779 19.5133L29.9524 31.804C30.8843 32.3389 31.459 33.3314 31.459 34.4059V59.071C31.459 59.8401 30.627 60.3213 29.9603 59.9378L8.54397 47.6165Z"
          fill="#754BBB"
          id="left" />
        <path
          d="M34.8434 59.9166C34.1767 60.3077 33.3374 59.8269 33.3374 59.0541V34.4207C33.3374 33.3563 33.9014 32.3716 34.8195 31.8331L55.7808 19.5371C56.4475 19.146 57.2868 19.6267 57.2868 20.3996V45.033C57.2868 46.0974 56.7228 47.0821 55.8047 47.6206L34.8434 59.9166Z"
          fill="#6637B3"
          id="right" />
        <path
          d="M33.8716 4.03073C32.957 3.51508 31.8394 3.51508 30.9248 4.03073L9.50353 16.1084C8.82954 16.4884 8.82393 17.457 9.49349 17.8448L30.8947 30.2395C31.8247 30.7781 32.9718 30.7781 33.9017 30.2395L55.303 17.8448C55.9725 17.457 55.9669 16.4884 55.2929 16.1084L33.8716 4.03073Z"
          fill="#8C69C6"
          id="top" />
      </g>
    </svg>`;
    document.body.appendChild(ele);
  }

  return [
    ele.querySelector("#top"),
    ele.querySelector("#left"),
    ele.querySelector("#right"),
    ele
  ];
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