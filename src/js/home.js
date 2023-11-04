import config from "../site.config.js";
import { on } from "./spa.js";

function initListeners() {
  const title = document.querySelector("#title-type");

  let index = 0;
  let animationInProgress = false;

  setInterval(async () => {
    if (animationInProgress) return;
    if (index < config.home.titles.length - 1) index++;
    else index = 0;
    const content = config.home.titles[index];

    animationInProgress = true;
    await typeContent(title, content, 20);
    animationInProgress = false;
  }, 6000);
}

function typeContent(element, content, speed) {
  return new Promise(resolve => {
    let innerHTMLLength = element.innerHTML.length;
    let totalLength = innerHTMLLength + content.length;
    let i = 0;
    let iv = setInterval(() => {
      if (i < innerHTMLLength) {
        // Remove char
        element.innerHTML = element.innerHTML.slice(0, -1);
      } else if (i < totalLength) {
        // Add char
        let contentIndex = i - innerHTMLLength;
        element.innerHTML += content.charAt(contentIndex);
      } else {
        clearInterval(iv);
        resolve();
      }
      i++;
    }, speed);
  });
}

initListeners();
on("load", e => initListeners());