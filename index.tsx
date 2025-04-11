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
const tokenFilePath = path.join(__dirname, "dataToken.json");

app.post("/registerPushToken", jsonParser, async (req, res) => {
  const userId = String(req.body.userId);
  const token = String(req.body.token);
  await FirebaseService.saveToken(userId, token);
  res.status(200).send("success");
});

// Function to read tokens from dataToken.json
const readTokensFromFile = () => {
  try {
    if (fs.existsSync(tokenFilePath)) {
      const fileData = fs.readFileSync(tokenFilePath);
      return JSON.parse(fileData.toString());
    }
    return { tokens: [] }; // Default structure if file doesn't exist
  } catch (error) {
    console.error("Error reading token file:", error);
    return { tokens: [] }; // Default structure on error
  }
};

const saveTokensToFile = (data : any) => {
  try {
    fs.writeFileSync(tokenFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing token file:", error);
  }
};

// Endpoint to add a new token
app.post("/addToken", jsonParser, (req, res) => {
  const { token } = req.body;
  
  // Validate request body
  if (!token) {
    return res.status(400).send("Token is required");
  }
  
  try {
    // Read existing tokens
    const data = readTokensFromFile();
    
    // Check if token already exists to avoid duplicates
    if (!data.tokens.includes(token)) {
      // Add new token to the array
      data.tokens.push(token);
      
      // Save updated data
      saveTokensToFile(data);
      
      return res.status(200).json({
        success: true,
        message: "Token added successfully",
        tokens: data.tokens
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Token already exists",
        tokens: data.tokens
      });
    }
  } catch (error) {
    console.error("Error in /addToken endpoint:", error);
    return res.status(500).send("Internal server error");
  }
});

// Endpoint to get all tokens
app.get("/tokens", (req, res) => {
  try {
    const data = readTokensFromFile();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in /tokens endpoint:", error);
    res.status(500).send("Internal server error");
  }
});

// Update the /sample endpoint to use tokens from dataToken.json
app.post(`/sample`, jsonParser, async (_, res) => {
  try {
    const tokenData = readTokensFromFile();
    
    if (!tokenData.tokens || tokenData.tokens.length === 0) {
      return res.status(404).send("No tokens found");
    }
    
    const notifications = await expo.sendPushNotificationsAsync([
      {
        to: tokenData.tokens,
        title: "Urgent Call from Paramedis",
        body: "Terdapat pasien darurat pada ambulans!",
      },
    ]);
    
    res.status(200).json({
      success: true,
      message: "Notifications sent",
      results: notifications
    });
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).send("Error sending notifications");
  }
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
