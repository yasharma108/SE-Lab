#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

#define DHTPIN 4
#define DHTTYPE DHT11

// ── WiFi credentials ──
const char* ssid     = "GALAXY M34 5G 37FF";
const char* password = "yash1204";

// ── Backend server URL (your PC's local IP) ──
const char* serverUrl = "http://10.6.34.241:5000/api/sensor-data";

DHT dht(DHTPIN, DHTTYPE);

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);

    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
    }
    Serial.println("\nConnected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());

    dht.begin();
}

void loop() {
    if (WiFi.status() == WL_CONNECTED) {
        float temperature = dht.readTemperature();

        if (isnan(temperature)) {
            Serial.println("Failed to read from DHT sensor!");
            delay(2000);
            return;
        }

        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");

        // JSON fields match backend controller: assetId, temperature, powerStatus
        String jsonData = "{";
        jsonData += "\"assetId\":\"AMUL-REF-1002\",";
        jsonData += "\"temperature\":" + String(temperature) + ",";
        jsonData += "\"powerStatus\":\"ON\"";
        jsonData += "}";

        int httpResponseCode = http.POST(jsonData);

        Serial.print("Temp: ");
        Serial.print(temperature);
        Serial.print("°C | Response: ");
        Serial.println(httpResponseCode);

        if (httpResponseCode < 0) {
            Serial.print("HTTP Error: ");
            Serial.println(http.errorToString(httpResponseCode));
        }

        http.end();
    } else {
        Serial.println("WiFi disconnected! Reconnecting...");
        WiFi.reconnect();
    }

    delay(5000);   // Send reading every 5 seconds
}