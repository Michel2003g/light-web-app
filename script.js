const lamps = [];

function getLampButton (index) {

    const container = document.getElementById("lamp-container");

    if (lamps[i]) {
        return lamps[i];
    }

    // new element
    const element = document.createElement('div');

    element.innerHTML = `<div class="object-button-container">
                <button class="object-button">
                    🔥
                </button>
                <p class="button-title">Lamp ${index+1}</p>
            </div>`;

    container.appendChild(element);

    lamps[i] = element;

}

// for (let i = 0; i < 10; i++) {
//     console.log(i);
//     getLampButton(i);
// }

fetch('./api')  // vervang door het echte IP en endpoint van je ESP32
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();  // JSON data parsen
  })
  .then(data => {
    console.log('Gekregen data:', data);
    // hier kun je iets doen met je data, bijvoorbeeld:
    // update je UI of verwerk de LED-waarden

    const lamps = data["lamps"]
    console.log(lamps)
    console.log(lamps.lenght)

    for (i = 0; i < lamps.lenght; i++) {
        const lampButton = getLampButton(i);
        const lampData = lamps[i];

        console.log(lampData);

        if (lampData.enabled) {
            lampButton.classList.add("active");
        } else {
            lampButton.classList.remove("active");
        };
    };

  });
