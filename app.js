const fs = require("fs");
const express = require("express");
const utf8 = require("utf8");
const app = express();
const formatVietnameseAddress = require("./util.js").formatVietnameseAddress;

const rawdata = fs.readFileSync("data.json");
const datas = JSON.parse(rawdata);

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.send("<h1>Hello World!</h1>");
});

app.get("/api/address", async function (req, res) {
  const inputText = utf8.decode(req.query.input);
  console.log(utf8.decode(req.query.input));
  const addressFormatted = await formatVietnameseAddress(inputText, datas);

  res.send(addressFormatted);
});

app.listen(process.env.PORT || 3000, () => console.log("Server is running..."));
