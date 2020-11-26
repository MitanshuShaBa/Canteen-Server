const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const hmac_sha256 = require("crypto-js/hmac-sha256");

const app = express();

//middleware
app.use(express.json());
app.use(cors());

//routes
app.get("/", (req, res) => {
  res.send({ hello: "world" });
});

app.post("/sample", (req, res) => {
  res.send({ notes: req.body.notes });
});

app.post("/order", (req, res) => {
  var instance = new Razorpay({
    key_id: "rzp_test_9vV83s3ftGMywd",
    key_secret: "KWwkTlN54TQxs3KxtGmaWEBk",
  });

  var options = {
    amount: req.body.amount * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: req.body.orderId,
    notes: req.body.notes,
  };

  instance.orders.create(options, function (err, order) {
    // console.log(order);
    res.send(order);
  });
});

app.post("/validate", (req, res) => {
  let generated_signature = hmac_sha256(
    req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id,
    "KWwkTlN54TQxs3KxtGmaWEBk"
  );
  if (generated_signature == req.body.razorpay_signature) {
    res.send(true);
  } else {
    res.send(false);
  }
});

//listen
const PORT = process.env.PORT ? process.env.PORT : 8000;
app.listen(8000, () => console.log(`Listening at http://localhost:${PORT}`));
