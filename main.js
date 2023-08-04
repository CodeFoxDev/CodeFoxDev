import config from "./public/site.config.js";

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
    const src = project.src ?? `/public/projects/shot-${project.name}.png`;

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
      <img src="/public/icons/${item}.svg" draggable="false">
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