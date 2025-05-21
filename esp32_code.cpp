#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <Adafruit_NeoPixel.h>
#include <map>

#define DATA_PIN    5
#define NUM_LAMPS   7
#define PIXELS_PER_LAMP 30
#define NUM_LEDS    (NUM_LAMPS * PIXELS_PER_LAMP)

Adafruit_NeoPixel strip(NUM_LEDS, DATA_PIN, NEO_GRB + NEO_KHZ800);

struct Pixel {
  uint32_t color;     // RGB kleur, bv. 0xFF0000
  uint8_t brightness; // 0-255
};

struct RGB {
  int r;
  int g;
  int b;
};

struct Lamp {
  bool enabled; // is the lamp enabled.
  String theme; // theme of the lamp.
  RGB colors[2];  
};

Lamp lamps[NUM_LAMPS];
Pixel leds[NUM_LAMPS][PIXELS_PER_LAMP];        // kleur + brightness per pixel
bool activeLeds[NUM_LAMPS][PIXELS_PER_LAMP];   // true als pixel actief is

// Wifi gegevens
const char* ssid = "-obviously not giving that up";
const char* password = "-not sharing duhh";

WebServer server(80);

HTTPClient http;

String homePageURL = "https://michel2003g.github.io/light-web-app/index.html";
String lightPageURL = "https://michel2003g.github.io/light-web-app/edit.html";

void setPixel (int lampIndex, int pixelIndex, uint32_t color, uint8_t brightness) {
  int absoluteIndex = (lampIndex * PIXELS_PER_LAMP) + pixelIndex;

  // Dim de kleur handmatig op basis van brightness
  float factor = brightness / 255.0;

  uint8_t r = (color >> 16) & 0xFF;
  uint8_t g = (color >> 8)  & 0xFF;
  uint8_t b =  color        & 0xFF;

  r = r * factor;
  g = g * factor;
  b = b * factor;

  Pixel newData = {
    color = color,
    brightness = brightness
  };

  bool ledActive = brightness > 0;
  if (activeLeds[lampIndex][pixelIndex] != ledActive) {
    activeLeds[lampIndex][pixelIndex] = ledActive;
  }

  strip.setPixelColor(absoluteIndex, strip.Color(r, g, b));

  leds[lampIndex][pixelIndex] = newData;
}

/// same as set pixel but will use previous pixel color.
void setPixel (int lampIndex, int pixelIndex, uint8_t brightness) {
  Pixel thisPixel = leds[lampIndex][pixelIndex];
  setPixel(lampIndex, pixelIndex, thisPixel.color, brightness);
}

void staticUpdate (int lampIndex) {
  for (int l = 0; l < PIXELS_PER_LAMP; l++) {
    RGB color = lamps[lampIndex].colors[0];
    setPixel (lampIndex, l, strip.Color(color.r, color.g, color.b), 255); /// 0xFF9329
  }
}

void sparkleUpdate (int lampIndex) {
  for (int l = 0; l < PIXELS_PER_LAMP; l++) {
    Pixel thisPixel = leds[lampIndex][l]; /// to retrieve previous pixel data.
    int blink = random(0,100);
    
    if (blink > 95) {
      RGB color = lamps[lampIndex].colors[0];
      setPixel (lampIndex, l, strip.Color(color.r, color.g, color.b), 255);
    } else if (thisPixel.brightness > 0) {
      RGB color = lamps[lampIndex].colors[0];
      setPixel (lampIndex, l, strip.Color(color.r, color.g, color.b), thisPixel.brightness - 6);
    }
  }
}

void fireUpdate (int lampIndex) {
  for (int l = 0; l < PIXELS_PER_LAMP; l++) {
    Pixel thisPixel = leds[lampIndex][l]; /// to retrieve previous pixel data.
    int blink = random(0,101);
    
    if (blink > 97) {
      RGB color = lamps[lampIndex].colors[random(0,2)];
      setPixel (lampIndex, l, strip.Color(color.r, color.g, color.b), 255);
    } else if (thisPixel.brightness > 0) {
      RGB color = lamps[lampIndex].colors[0];
      setPixel (lampIndex, l, thisPixel.brightness - 6);
    }
  }
}

uint32_t hsv(int h, int s, int v) {
  h = h % 360;
  if (h < 0) h += 360;

  float hf = h / 60.0f;
  float sf = constrain(s, 0, 100) / 100.0f;
  float vf = constrain(v, 0, 100) / 100.0f;

  float c = vf * sf;
  float x = c * (1 - fabs(fmod(hf, 2) - 1));
  float m = vf - c;

  float r1, g1, b1;

  if (hf < 1) {
    r1 = c; g1 = x; b1 = 0;
  } else if (hf < 2) {
    r1 = x; g1 = c; b1 = 0;
  } else if (hf < 3) {
    r1 = 0; g1 = c; b1 = x;
  } else if (hf < 4) {
    r1 = 0; g1 = x; b1 = c;
  } else if (hf < 5) {
    r1 = x; g1 = 0; b1 = c;
  } else {
    r1 = c; g1 = 0; b1 = x;
  }

  uint8_t r = (r1 + m) * 255;
  uint8_t g = (g1 + m) * 255;
  uint8_t b = (b1 + m) * 255;

  return ((uint32_t)r << 16) | ((uint32_t)g << 8) | b; // 0xRRGGBB
}

std::map<String, unsigned long> timers;

void setLastTime(String key) {
    timers[key] = millis();
}

float timeSince(String key) {
    if (timers.find(key) != timers.end()) {
        unsigned long diff = millis() - timers[key];
        if (diff > 30000) {
            // als ouder dan 30 sec geef 30 seconden op en reset de timer.
            timers[key] = millis();
            return 30;
        }
        return (float)diff;
    } else {
        // key bestaat niet, return 0 of een groot getal
        timers[key] = millis(); /// make sure the key exists now.
        return 0;
    }
}


/// collect floats to make the time range more wide.
std::map<int, int> rainbowoffsets;

void rainbowUpdate(int lampIndex) {
  /// if the last update is more then 10 seconds ago add offset.
  if (timeSince("rnb" + String(lampIndex)) > .5f) {
    rainbowoffsets[lampIndex] += 1; /// add to offset based on last update time.
    setLastTime("rnb" + String(lampIndex)); /// set the last update time.

    int offset = rainbowoffsets[lampIndex];

    for (int i = 0; i < PIXELS_PER_LAMP; i++) {
      int hue = (i * 5 + offset) % 360; 
      setPixel(lampIndex, i, hsv(hue, 100, 50), 255);
    }
  }

}

void breatheUpdate(int lampIndex) {
  float t = timeSince("brt" + String(lampIndex)) / 1000.0f; // tijd sinds start in seconden
  float brightness = (sin(t * 2 * PI / 4.0) + 1.0) / 2.0;   // waarde tussen 0 en 1 (4 seconden cyclus)
  uint8_t mapped = (uint8_t)(brightness * 255);             // schaal naar 0-255

  RGB color = lamps[lampIndex].colors[0];

  for (int i = 0; i < PIXELS_PER_LAMP; i++) {
    setPixel(lampIndex, i, strip.Color(color.r, color.g, color.b), mapped);
  }
}

void setLampColor (int index, int slot, int r, int g, int b) {
  lamps[index].colors[slot] = { r, g, b };
}

void handleClient (void * parameter) {
  while (true) {
    server.handleClient();
    delay(50);
  }
}

void setup() {
  Serial.begin(115200);

  delay(1000);

  // for indication light.
  pinMode(2, OUTPUT);

  // set lights default theme.
  for (int i = 0; i < NUM_LAMPS; i++) {
      lamps[i].enabled = false;
      lamps[i].theme = "Static";
      lamps[i].colors[0] = { 255, 255, 255 };
      lamps[i].colors[1] = { 255, 255, 255 };
  };

  strip.setBrightness(255);

  digitalWrite(2, HIGH);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    for (int i = 0; i < NUM_LAMPS; i++) {
      for (int l = 0; l < PIXELS_PER_LAMP; l++) {
        setPixel (i, l, strip.Color(0,10,255), 255);
      }
      if (i != 0) {
        for (int l = 0; l < PIXELS_PER_LAMP; l++) {
          setPixel (i-1, l, 0);
        }
      }
      delay(100);
      strip.show();
    }
  }

  digitalWrite(2, LOW);

  Serial.println(WiFi.localIP());

  for (int i = 0; i < NUM_LAMPS; i++) {
      for (int l = 0; l < PIXELS_PER_LAMP; l++) {
        setPixel (i, l, strip.Color(10,200,10), 255);
        strip.show();
      }
    }

  // HTML pagina tonen
  server.on("/", HTTP_GET, []() {

    digitalWrite(2, HIGH);

    http.begin(homePageURL);
    http.GET();

    String page = http.getString();

    Serial.println(page);

    server.send(200, "text/html", page);

    http.end();

    digitalWrite(2, LOW);
  });

  server.on("/api", HTTP_GET, []() {
    
    digitalWrite(2, HIGH);

    // server.send(200, "application/json", "");  // Stuurt alleen headers

    server.sendContent("{\"lamps\": [");
    
    for (int i = 0; i < NUM_LAMPS; i++) {
      if (i > 0) server.sendContent(",");
      String Item = "{";
      Item += "\"theme\":\"";
      Item += lamps[i].theme;
      Item += "\",\"enabled\":";
      Item += (lamps[i].enabled ? "true" : "false");
      Item += "}";

      server.sendContent(Item);
    };

    server.sendContent("]}");

    server.client().stop();

    digitalWrite(2, LOW);

  });

  server.on("/edit", HTTP_GET, []() {

    // String type = server.arg("type"); /// lampIndex or -1 for all

    http.begin(lightPageURL);
    http.GET();

    server.send(200, "text/html", http.getString());

    http.end();

  });

  server.on("/set", HTTP_GET, []() {

    int lamp = server.arg("lamp").toInt();
    String type = server.arg("type");
    String value = server.arg("value");

    if (lamp < -1 || lamp >= NUM_LAMPS) {
      server.send(400, "text/plain", "Lamp Index: " + String(lamp) + " Doesn't exist.");
      return;
    }

    if (lamp == -1) {
      for (int i = 0; i < NUM_LAMPS; i++) {

        if (type == "theme") {
          lamps[i].theme = value;
        } else if (type == "enabled") {
          lamps[i].enabled = (value == "true");
        }
      }
    } else {
      Lamp thisLamp = lamps[lamp];

      if (type == "theme") {
        lamps[lamp].theme = value;
      } else if (type == "enabled") {
        lamps[lamp].enabled = (value == "true");
      }
    }

    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "*");
    server.send(204);

  });

  // Leds aanzetten met kleur
  server.on("/setColor", HTTP_GET, []() {

    int lamp = server.arg("lamp").toInt();
    int slot = server.arg("slot").toInt();

    int r = server.arg("r").toInt();
    int g = server.arg("g").toInt();
    int b = server.arg("b").toInt();

     if (lamp == -1) {
      for (int i = 0; i < NUM_LAMPS; i++) {
        setLampColor(i, slot, r, g, b);
      }
    } else {
      setLampColor(lamp, slot, r, g, b);
    }

    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "*");
    server.send(204);

  });

  server.begin(); 

   xTaskCreatePinnedToCore(
    handleClient,       // Functie
    "UpdateTask",     // Naam
    10000,            // Stack grootte
    NULL,             // Parameter
    1,                // Prioriteit
    NULL,             // Task handle
    0                 // Core (0 of 1)
  );

}

void loop() {
  for (int i = 0; i < NUM_LAMPS; i++) {

    bool lampIsEnabled = lamps[i].enabled;

    if (lampIsEnabled) {
      String thisTheme = lamps[i].theme;

      if (thisTheme == "Static") {
        staticUpdate(i);
      } else if (thisTheme == "Sparkle") {
        sparkleUpdate(i);
      } else if (thisTheme == "Fire") {
        fireUpdate(i);
      } else if (thisTheme == "Rainbow") {
        rainbowUpdate(i);
      } else if (thisTheme == "Breathe") {
        breatheUpdate(i);
      }
    } else {
      for (int l = 0; l < PIXELS_PER_LAMP; l++) {
        setPixel (i, l, 0xFF9329, 0);
      }
    }
    
  }

  strip.show();

}
