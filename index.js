"use strict";

const express = require("express");
const mongo = require("mongodb");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dns = require("dns");
const app = express();

const port = process.env.PORT || 3000;
//const URI = process.env.URI;

const URI = process.env.URI;
mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = new mongoose.Schema({
  id: Number,
  url: String
});

const urlModel = mongoose.model("url", urlSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", function(req, res) {
  let urlRegex = /https:\/\/www.|http:\/\/www./g;
  const url = req.body.url;

  dns.lookup(url.replace(urlRegex, ""), (err, address, family) => {
    if (!url.includes("http://") && !url.includes("https://")) {
      res.json({error : "invalid url"});
    } else {
      urlModel
        .find()
        .exec()
        .then(data => {
          new urlModel({
            id: data.length + 1,
            url: url
          })
            .save()
            .then(() => {
              res.json({
                original_url: url,
                short_url: data.length + 1
              });
            })
            .catch(err => {
              res.json(err);
            });
        });
    }
  }); 
});


app.get("/api/shorturl/:id", function(req, res) {
  urlModel
    .find({ id: req.params.id })
    .exec()
    .then(url => {
      res.redirect(url[0]["url"]);
    });
});

app.listen(port, function() {
  console.log(`Node.js listening on port ${port}`);
});
