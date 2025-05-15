function GetParameters() {

  const search = location.search.split("?")[1]; /// get all text after ?
  let result = {};

  const items = search.split("&");

  items.forEach(item => {
    const data = item.split("=");
    result[data[1]] = data[1];
  });

  console.log(result);

  return result;
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

GetParameters();
