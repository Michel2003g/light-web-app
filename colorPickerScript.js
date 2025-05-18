/// create the color picker;

    const element = document.createElement("div");
    element.innerHTML = `
    <div id="color-picker-container">
        <div id="color-picker-body" class="show">
            <div id="colorPreview"></div>
            <div class="slider-container">
                <input type="range" id="hueSlider" min="0" max="360" value="0">
                <input type="range" id="saturationSlider" min="0" max="100" value="100">
                <input type="range" id="brightnessSlider" min="0" max="100" value="50">
            </div>
            <button id="close-color-picker">Close</button>
        </div>
    </div>
    `
    /// add color picker to the body;
    document.body.appendChild(element);

    const colorPickerBody = document.getElementById('color-picker-body');
    const colorPickerCloseButton = document.getElementById('close-color-picker');

    const hueSlider = document.getElementById('hueSlider');
    const saturationSlider = document.getElementById('saturationSlider');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const preview = document.getElementById('colorPreview');

    function throttle(func, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = (new Date).getTime();
            if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
            }
        };
    }

    function hslToRgb(h, s = 100, l = 50) {
        s /= 100;
        l /= 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;

        if (0 <= h && h < 60)      [r, g, b] = [c, x, 0];
        else if (60 <= h && h < 120)  [r, g, b] = [x, c, 0];
        else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
        else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
        else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
        else if (300 <= h && h < 360) [r, g, b] = [c, 0, x];

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return { r, g, b };
    }

    function sendColor() {
      const hue = hueSlider.value;
      const brightness = brightnessSlider.value;
      const saturation = saturationSlider.value;

      const rgb = hslToRgb(hue, saturation, brightness);
      fetch(`/setColor?lamp=6&r=${rgb.r}&g=${rgb.g}&b=${rgb.b}`)
    }

    const throttleSend = throttle(sendColor, 250);

    function updateColor() {
      const hue = hueSlider.value;
      const brightness = brightnessSlider.value;
      const saturation = saturationSlider.value;
      const hue_color = `hsl(${hue}, 100%, 50%)`;
      const brightness_color = `hsl(0, 0%, ${brightness}%)`;
      const saturation_color = `hsl(0, ${saturation}%, 0%)`;
      const combined_color = `hsl(${hue}, ${saturation}%, ${brightness}%)`;
      preview.style.backgroundColor = combined_color;
      document.documentElement.style.setProperty('--hue', hue);
      document.documentElement.style.setProperty('--brightness', `${brightness}%`);
      document.documentElement.style.setProperty('--saturation', `${saturation}%`);
      document.documentElement.style.setProperty('--thumb-color-hue', hue_color);
      document.documentElement.style.setProperty('--thumb-color-brightness', brightness_color);
      throttleSend();
    }

    hueSlider.addEventListener('input', updateColor);
    brightnessSlider.addEventListener('input', updateColor);
    saturationSlider.addEventListener('input', updateColor);

    hueSlider.addEventListener('change', sendColor);
    brightnessSlider.addEventListener('change', sendColor);
    saturationSlider.addEventListener('change', sendColor);

    updateColor();

    colorPickerCloseButton.addEventListener("click", event => {
        colorPickerBody.classList.remove("show");
    });
