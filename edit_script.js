function GetParameters() {

  const search = location.search.split("?")[1]; /// get all text after ?
  let result = {};

  const items = search.split("&");

  items.forEach(item => {
    const data = item.split("=");
    result[data[0]] = data[1];
  });

  return result;
}

async function apiCall() {
  const response = await fetch("/api"); // of een volledige URL
  const data = await response.json(); // als het JSON is

  return data;
}

function getThemeButton (themeName) {

    const container = document.getElementById("theme-container");

    // new element
    const element = document.createElement('div');

    element.innerHTML = `<div class="object-button-container">
                <button class="object-button" onClick="setTheme('${themeName}')">
                    🔥
                </button>
                <p class="button-title">${themeName}</p>
            </div>`;

    const button = element.querySelector('.object-button-container');

    container.appendChild(button);

    return button;

}

function getSettingButton (settingName) {

    const container = document.getElementById("settings-container");

    // new element
    const element = document.createElement('div');

    element.innerHTML = `<div class="object-button-container">
                <button class="object-button" onClick="OpenSetting('${settingName}')">
                    🔥
                </button>
                <p class="button-title">${settingName}</p>
            </div>`;

    const button = element.querySelector('.object-button-container');

    container.appendChild(button);

    return button;

}

const themeData = [
  {
    theme : "Static",
    settings : [
      "Color1"
    ],
  },
  {
    theme : "Fire",
    settings : [
      "Color2"
    ],
  },
  {
    theme : "Breathe",
    settings : [
      "Color1",
      "Speed"
    ],
  },
  {
    theme : "Sparkle",
    settings : [
      "Color1",
      "Amount"
    ],
  },
];

getSettingButton("Color1");
getSettingButton("Color2");
getSettingButton("Speed");

themeData.forEach(data => {
  getThemeButton(data.theme);
});

const parameters = GetParameters();

const lampTitle = document.getElementById("page-title");
const lampTheme = document.getElementById("current-theme");
const enabledCheckbox = document.getElementById("enabled-checkbox");

const lamp = Number(parameters["lamp"]);

function setTheme (theme) {
  fetch(`/set?type=theme&value=${theme}&lamp=${lamp}`)
  .then(response => response.text()) // of .json() als je JSON terugstuurt
    .then(data => {
      if (lamp != -1) {
        lampTheme.textContent = `${theme.toUpperCase()}`
      }
    });
}

let currentColorSlot = 0;

function OpenSetting (settingName) {
  console.log(settingName);

  if (settingName == "Color1") {
    currentColorSlot = 0;
    colorPickerContainer.classList.add("show");
  } else if (settingName == "Color2") {
    currentColorSlot = 1;
    colorPickerContainer.classList.add("show")
  } else if (settingName == "Speed") {
    currentColorSlot = 0;
    colorPickerContainer.classList.add("show");
  }

}

function setEnabled (checkbox) {
  fetch(`/set?type=enabled&value=${checkbox.checked}&lamp=${lamp}`)
  .then(response => response.text()) // of .json() als je JSON terugstuurt
    // .then(data => {
    // });
}

enabledCheckbox.addEventListener("change", (event) => {
  setEnabled(event.target);
});

if (lamp === -1) {
  lampTitle.textContent = "Editing All Lamps";

  apiCall().then(apiData => {
    let allThemes = "";

    apiData.lamps.forEach(lamp => {
      if (allThemes.includes(lamp.theme) == false) {
        allThemes = allThemes + lamp.theme + " "
      };
    });

    if (allThemes === "") {
      allThemes = "NONE";
    }

    lampTheme.textContent = allThemes
    enabledCheckbox.checked = false
  });

} else {
  lampTitle.textContent = "Editing Lamp : " + `${(lamp + 1)}`;
  
  apiCall().then(apiData => {
    const thisLamp = apiData.lamps[lamp];
    lampTheme.textContent = thisLamp.theme.toUpperCase();
    enabledCheckbox.checked = (thisLamp.enabled == "1");
  });

}

//// loaded in from color picker script.

colorPickerBody.addEventListener("colorChange", (e) => {
    const rgb = e.detail.rgb;
    fetch(`http://192.168.178.33/setColor?slot=${currentColorSlot}&lamp=${lamp}&r=${rgb.r}&g=${rgb.g}&b=${rgb.b}`)
})
