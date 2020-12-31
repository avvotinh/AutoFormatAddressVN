const fs = require("fs");
const express = require("express");
const utf8 = require("utf8");
const services = require("./services.js");
const datas = JSON.parse(fs.readFileSync("data.json"));

const app = express();

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.send("Yup! Sếp Hợp gọi em sao...");
});

app.get("/api/address", async function (req, res) {
  const inputText = utf8.decode(req.query.input);
  const addressFormatted = await services.formatVietnameseAddress(
    inputText,
    datas
  );

  res.send(addressFormatted);
});

app.listen(process.env.PORT || 3000, () => console.log("Server is running..."));
