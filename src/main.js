<<<<<<< HEAD
import "./js/projects.js";
import { on } from "./js/spa.js"; "./js/spa.js";

function initListeners() {
  const scrollShow = Array.from(document.querySelectorAll("[data-scroll-class]"));
  scrollShow?.forEach((e, i) => {
    const attr = e.getAttribute("data-scroll-threshold");
    const threshold = parseCssVal(attr);
    if (typeof threshold != "number" || !attr) return;
    const fn = () => {
      const className = e.getAttribute("data-scroll-class");
      if (window.scrollY < threshold) return e.classList.remove(className);
      e.classList.add(className);
    }
    addEventListener("scroll", fn);
    fn();
  });

  document.querySelector(".background-darken").addEventListener("click", () => {
    document.querySelector("#nav-toggle").checked = false;
  });
}

function parseCssVal(inp, toPX) {
  const ex = /([0-9\.]*)([a-z]*)/gi.exec(inp);
  const val = parseFloat(ex[1]);
  const unit = ex[2];
  if (!unit || toPX == true) return [ex[1], ex[2]];
  if (unit == "vh") {
    return (val / 100) * window.innerHeight;
  } else if (unit == "vw") {
    return (val / 100) * window.innerWidth;
  } else if (unit == "rem") {
    return val * 16;
  }
  return val;
}

initListeners();
on("load", e => initListeners());
=======
import config from "/src/site.config.js";

const nav = document.querySelector(".nav-progress");
const navTop = document.querySelector(".nav-top");
const projects = document.querySelector("div.projects");

document.addEventListener("scroll", updateProgress);

function updateProgress() {
  const full = document.body.getBoundingClientRect();
  const progress = (document.documentElement.scrollTop || document.body.scrollTop) / (full.height - window.innerHeight) * 100;
  nav.style.setProperty("--width", `${progress}vw`);

  if ((document.documentElement.scrollTop || document.body.scrollTop) < 600) navTop.classList.add("hidden");
  else navTop.classList.remove("hidden");
}

(function() {
  config.projects.forEach(project => {
    const ele = document.createElement("div");
    const src = project.src ?? `/src/projects/shot-${project.name}.png`;

    ele.className = "project";
    ele.id = `project-${project.name}`;

    ele.innerHTML = /*html*/`
      <img src="${src}" draggable="false">
      <div class="info">
        <h1>${project.name}</h1>
        <div class="made-with">
          <p>Made with:</p>
          ${getDevIcons(project)}
        </div>
        <p>${project.description}</p>
        <div class="buttons">
          ${getButtons(project)}
        </div>
      </div>
    `;

    projects.appendChild(ele);
  });

  updateProgress();
})();

function getDevIcons(project) {
  let res = "";

  project.madeWith.forEach(item => {
    res += /*html*/`
      <img src="/src/icons/${item}.svg" draggable="false">
    `;
  });

  return res;
}

function getButtons(project) {
  let res = "";

  if(project.live) res += /*html*/`<a class="button fill" href=${project.live} target="_blank">View live</a>`;
  if(project.github) res += /*html*/`<a class="button" href=${project.github} target="_blank">View code</a>`;

  return res;
}
>>>>>>> 002b13a3d43ce511e4703387f93a7713bc3a1689
