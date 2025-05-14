function newLampButton (index) {

    const container = document.getElementById("lamp-container")

    // new element
    const element = document.createElement('div');

    element.innerHTML = `<div class="object-button-container">
                <button class="object-button">
                    🔥
                </button>
                <p class="button-title">Lamp ${index+1}</p>
            </div>`;

    container.appendChild(element);
}

for (let i = 0; i < 10; i++) {
    console.log(i);
    newLampButton(i);
}
