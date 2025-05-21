const lamps = [];

function getLampButton (index) {

    const container = document.getElementById("lamp-container");

    if (lamps[i]) {
        return lamps[i];
    }

    // new element
    const element = document.createElement('div');

    element.innerHTML = `<div class="object-button-container">
                <a href="./edit?lamp=${index}" class="object-button">
                    🔥
                </a>
                <p class="button-title">Lamp ${index+1}</p>
            </div>`;

    const button = element.querySelector('.object-button-container');

    container.appendChild(button);

    lamps[i] = button;
    return button;

}

fetch('./api')  // vervang door het echte IP en endpoint van je ESP32
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();  // JSON data parsen
  })
  .then(data => {
    const lamps = data["lamps"]

    for (i = 0; i < lamps.length; i++) {
        const lampButtonContainer = getLampButton(i);
        const lampData = lamps[i];

        const lampButton = lampButtonContainer.querySelector('.object-button');

        if (lampData.enabled == "1") {
            lampButton.classList.add("active");
        } else {
            lampButton.classList.remove("active");
        };
    };

  });

/// keeps the page up to date every 5 sec on data found on the esp.
setInterval( () => {
  fetch('./api')  // get api data;
  .then(response => {
    return response.json();  // parse JSON;
  })
  .then(data => {
    const lamps = data["lamps"];

    for (i = 0; i < lamps.length; i++) {
        const lampButtonContainer = getLampButton(i);
        const lampData = lamps[i];

        const lampButton = lampButtonContainer.querySelector('.object-button');

        if (lampData.enabled == true) {
            lampButton.classList.add("active");
        } else {
            lampButton.classList.remove("active");
        };
    };

  });
}, 5000);
