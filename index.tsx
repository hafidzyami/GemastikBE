import express from "express";
import BodyParser from "body-parser";
import * as FirebaseService from "./FirebaseService";
import Expo from "expo-server-sdk";
import fs from "fs";
import path from "path";

const app = express();
const port = 8000;
const expo = new Expo();

const jsonParser = BodyParser.json();

// Path to the data.json file
const dataFilePath = path.join(__dirname, "data.json");

app.post("/registerPushToken", jsonParser, async (req, res) => {
  const userId = String(req.body.userId);
  const token = String(req.body.token);
  await FirebaseService.saveToken(userId, token);
  res.status(200).send("success");
});

app.post(`/sample`, jsonParser, async (_, res) => {
  expo.sendPushNotificationsAsync([
    {
      to: [
        "ExponentPushToken[tNKtAtJ1TG8P1KX0AIPc8z]",
        "ExponentPushToken[sq1UZBB8C5JYubZFRPRBFx]",
        "ExponentPushToken[7g-DWtOVu-QUq-exg_o3Ys]",
        "ExponentPushToken[KnuXdVG0kATOzhTnMJXK5-]",
        "ExponentPushToken[znMzwIO0_7DPmUW2rWGqs4]",
        "ExponentPushToken[RKyFLoOAyT5lKRO4buEXON]",
        "ExponentPushToken[iuY42iGeiZ8Qj_fUF1iWgW]",
        "ExponentPushToken[0-8vd4KBLOrzOE7ZJK5J7z]"
      ],
      title: "Urgent Call from Paramedis",
      body: "Terdapat pasien darurat pada ambulans!",
    },
  ]);
  res.status(200).send("success");
});

const saveDataToFile = (newData : any) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
};

const readDataFromFile = () => {
  const fileData = fs.readFileSync(dataFilePath);
  return JSON.parse(fileData.toString()); // C
}

// New POST method to store IP address in data.json
app.post("/IpAddress", jsonParser, (req, res) => {
  const { ipaddress } = req.body;

  if (!ipaddress) {
    return res.status(400).send("IP address is required");
  }

  // Save the IP address to the data.json file
  const newData = { ipaddress };
  saveDataToFile(newData);

  res.status(200).send("IP address saved successfully");
});

app.get("/IpAddress", (req, res) => {
  const data = readDataFromFile();

  if (data) {
    res.status(200).json(data);
  } else {
    res.status(404).send("No data found");
  }
});

app.listen(port, () => console.log(`running on port ${port}`));
