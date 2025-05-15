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
                <button class="object-button">
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
const apiData = await apiCall();

const lampTitle = document.getElementById("page-title");
const lampTheme = document.getElementById("current-theme");

const lamp = Number(parameters["lamp"]);

if (lamp === -1) {
  lampTitle.textContent = "Editing All Lamps";

  let allThemes = "";

  apiData.lamps.forEach(lamp => {
    allThemes = allThemes + lamp.theme.toUpperCase() + " "
  });

  lampTheme.textContent = allThemes

} else {
  console.log(apiData.lamps)
  lampTitle.textContent = "Editing Lamp : " + parameters["lamp"];
  lampTheme.textContent = apiData.lamps[lamp].theme.toUpperCase()
}
