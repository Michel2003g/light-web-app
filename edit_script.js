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

  console.log(response)
  console.log(data)

  return data;
}

function getThemeButton (themeName) {

    const container = document.getElementById("theme-container");

    // new element
    const element = document.createElement('div');

    element.innerHTML = `<div class="object-button-container">
                <button class="object-button" onClick="setTheme(${themeName})">
                    🔥
                </button>
                <p class="button-title">${themeName}</p>
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

themeData.forEach(data => {
  getThemeButton(data.theme);
});

const parameters = GetParameters();

const lampTitle = document.getElementById("page-title");
const lampTheme = document.getElementById("current-theme");

const lamp = Number(parameters["lamp"]);

function setTheme (theme) {
  fetch(`/set?type=theme&value=${theme}&lamp=${lamp}`)
  .then(response => response.text()) // of .json() als je JSON terugstuurt
    .then(data => {
      console.log(data);
    });
}

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
  });

} else {
  lampTitle.textContent = "Editing Lamp : " + parameters["lamp"];
  
  apiCall().then(apiData => {
    lampTheme.textContent = apiData.lamps[lamp].theme.toUpperCase();
  });
}
