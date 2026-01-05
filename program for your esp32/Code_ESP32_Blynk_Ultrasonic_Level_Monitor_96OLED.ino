#define BLYNK_TEMPLATE_ID "TMPL3goz3gyPX"
#define BLYNK_TEMPLATE_NAME "Waste level"
#define BLYNK_AUTH_TOKEN "HL5sXNg--dpSovmN-5m6OGeVtL2KU8py"

// WiFi credentials
char ssid[] = "Shrawan";
char pass[] = "12345678";

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Wire.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <BlynkSimpleEsp32.h>

// Pins
#define TRIGPIN 4
#define ECHOPIN 2  // safe GPIO for ESP32

// Bin settings
const int emptyBinDistance = 24; // distance when bin is empty
const int fullBinDistance = 0;   // distance when bin is full

// OLED settings
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

long duration;
float distance;
int percentFull;

void setup() {
  Serial.begin(115200);

  pinMode(TRIGPIN, OUTPUT);
  pinMode(ECHOPIN, INPUT);

  Wire.begin(21, 22); // SDA = 21, SCL = 22

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
    for (;;);
  }
  display.clearDisplay();
  display.display();

  // Connect to Blynk
  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, pass);
}

void loop() {
  measureDistance();
  calculatePercentage();
  updateOLED();

  // Send % full to Blynk virtual pin V1
  Blynk.virtualWrite(V1, percentFull);

  Blynk.run();
  delay(1000); // update every 1 second
}

void measureDistance() {
  // Trigger HC-SR04
  digitalWrite(TRIGPIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIGPIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIGPIN, LOW);

  // Read echo with timeout
  duration = pulseIn(ECHOPIN, HIGH, 30000); // 30ms timeout
  distance = (duration * 0.0343) / 2; // cm

  // Safety: if no echo or sensor blocked, treat as empty
  if (distance <= 0 || distance > emptyBinDistance) distance = emptyBinDistance;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");
}

void calculatePercentage() {
  float filledDistance = emptyBinDistance - distance;

  // Clamp values
  if (filledDistance < 0) filledDistance = 0;
  if (filledDistance > (emptyBinDistance - fullBinDistance)) 
      filledDistance = emptyBinDistance - fullBinDistance;

  percentFull = map((int)filledDistance, 0, emptyBinDistance - fullBinDistance, 0, 100);

  Serial.print("Percent Full: ");
  Serial.println(percentFull);
}

void updateOLED() {
  display.clearDisplay();
  display.setTextSize(3);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 20);
  display.print(percentFull);
  display.print("%");
  display.display();
}
