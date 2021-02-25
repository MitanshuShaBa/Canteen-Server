const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const hmac_sha256 = require("crypto-js/hmac-sha256");
const admin = require("firebase-admin");
require("dotenv").config();
const { DateTime, Interval } = require("luxon");

const serviceAccount = {
  type: "service_account",
  project_id: "kjsieit-canteen",
  private_key_id: process.env.private_key_id,
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCyvQW6wYIAzTSX\nsEsX2ZuOIowl6ZpXw+QLa8jebh9jwS4TZAF8U5ClstnMz8gjJBPlN0rxgsKR7wso\nKayPyAAHkD6OEDVP+gdOkU6i+nmG7WDzr94cReLo6cDrqZscKgVFlEEkcjXIpqEG\nk3r4bDUgaMkcBsm3xiHnzwjSwLhWG0dGASXUJOTobgV7jJKDGGGi8bFWPf4kYkMJ\nWyIi4E3W6sxFcIejBUTj+hvG0k1GPMM6UJ9FCrMBkMDZYclaIanlbswbAfrJgND4\nGCS8w516hMCuT+zKyuXaMWjXuzzRK8YBexUqj4QY+FH9YtngeX4JHZ0bKEJj2TCy\n5CxsXf+RAgMBAAECggEAASDf3yK3HSWughGnG7awPHi73UZpBspSD39l9H+J+7F9\nxroQJ1aIuH8VUG10ZEJnTMBpXPZ4H388mQuQTxUSaPnQZ0mzaHaZ4rVYo39E0qT/\ngnJXCuMnEFTfdq1qsQYT4/FQavg8njBtHlNCiLx4JmT69g4V6m7aCnJcaiY007hU\nJhgPiH+vpvFAyWAp/53sv5bM9ty654CbW3VJ2cuNrpudds74/hMGJyVZmZp5dQmw\n00/ME8RJtzd9JStiwJF9yCAp25NHCp1DQqF1xLSAZTbNIJg62qS/87CGxAHSEbpO\n4C0JcRAbvcWHaS/ngA09RoGl+XOE8j5suOjjOwyP8QKBgQDv+e0pN0klXQ377fI4\nSBKVWPXIJUNfy7Ft6IaQLC2VFnXKltYR/5HyvqJhXaxXid65uIcnoKoUhzbucLy1\n6DBCHmOTqO1amNUYcoVjxVuuI4ElJwEjwcESSxCwog4ahg31XvuST5UnKTvFvi1R\nZy4fMfKoPq4XHxVxLOeqAx/qqQKBgQC+rFDaZBvZJGpCZZIT1KuL7rDbUuOPgfvw\nxrb9QwQZVCZiGMFA3NPbZicpCam2TupDqowghCHUJmLhAXPH1Why/zpBHWKrFbjy\nSM0hshiFP7CkGbnbhVbMoskyY2i3iErDfyE8kVFqd9hHH+xAktLTKh/8YQtTKyrJ\nriLIrR8mqQKBgHjbmBN/4njMyrQsfCbYNXO939qy2aGvRmaiCtMlTLefHievm5Ro\n8Coe1EzRDnDv4JoMUxUkF0RLbODdKk066MMD5waAtzk/a2Lqmj9LMAcdnncFk89c\nT05VO8yZcRzukq0W7wAa0HVukMngI5axrkrLrvgIyUifwP7ErM+0zygxAoGAIRyh\nidt6rpHRVih3XrQ++jUAR4Y0eHZ1PxHzMzYRHyjq5XwxC0eODvrFcC36Z+t6aTfT\nz83CZiooX7S1240m71l9T1OAD//ct06HOQPJmFJAJa9GBGY6dZ0LXZG/3KdxfFO2\nfOMrhVa8m1Vi3K/ipsMY/OYJZm8HpjB0X+8YiskCgYAKtU4qOGPAZ/CxE4ejBE3r\n/CqHJkWyMGdCJIBnQNl6AqQliMiK+lui97uiXxnMRwVDeEbcKUa1wf8DDKxdBpf2\n5ufRIRsrV080Fq48Yd4bxk5XKkXRn2+NgUGBPd4hJqaOo7dxyl58EH7aL/xRVCZp\ndoNIAVXpb0pHOGiN142dJA==\n-----END PRIVATE KEY-----\n",
  client_email: "kjsieit-canteen@appspot.gserviceaccount.com",
  client_id: "117629358682196742432",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/kjsieit-canteen%40appspot.gserviceaccount.com",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

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

const report = (orders) => {
  let total_revenue = 0;
  let total_sales = 0;
  let total_orders = 0;
  let total_orders_cancelled = 0;
  let sale_per_item = {};

  orders.forEach((data) => {
    if (data.status == "cancelled") {
      total_orders_cancelled += 1;
    } else {
      total_orders += 1;
      total_revenue += data.total_amount;

      data.items.map((item) => {
        let itemDetail = data.bill[item];

        total_sales += itemDetail.quantity;
        if (sale_per_item[item] !== undefined) {
          // item is in sales_per_item
          sale_per_item[item].quantity =
            sale_per_item[item].quantity + itemDetail.quantity;

          sale_per_item[item].total =
            sale_per_item[item].total + itemDetail.quantity * itemDetail.price;
        } else {
          // item is not in sales_per_item so add it
          sale_per_item[item] = {
            quantity: itemDetail.quantity,
            total: itemDetail.quantity * itemDetail.price,
          };
        }
      });
    }
  });

  let most_sold_item = Object.keys(sale_per_item);
  most_sold_item.sort(
    (a, b) => sale_per_item[b].quantity - sale_per_item[a].quantity
  );
  most_sold_item = most_sold_item; // apply logic to select top

  let most_revenue_item = Object.keys(sale_per_item);
  most_revenue_item.sort(
    (a, b) => sale_per_item[b].total - sale_per_item[a].total
  );
  most_revenue_item = most_revenue_item; // apply logic to select top

  return {
    total_revenue,
    total_sales,
    total_orders,
    total_orders_cancelled,
    sale_per_item,
    most_sold_item,
    most_revenue_item,
  };
};

const isToday = (someDate, today) => {
  return (
    someDate.getDate() == today.getDate() &&
    someDate.getMonth() == today.getMonth() &&
    someDate.getFullYear() == today.getFullYear()
  );
};

app.get("/reports", (req, res) => {
  db.collection("orders")
    .orderBy("placed_at", "desc")
    .get()
    .then((snapshot) => {
      let orders = [];
      let weekOrders = [];
      let monthOrders = [];
      let dayOrders = [];

      let dateNow = DateTime.local();
      let datePrevWeek = dateNow.minus({ days: 7 });
      let datePrevMonth = dateNow.minus({ days: 30 });
      let weekInterval = Interval.fromDateTimes(datePrevWeek, dateNow);
      let monthInterval = Interval.fromDateTimes(datePrevMonth, dateNow);

      // console.log(dateNow.toUTC().toJSDate().toString());
      // console.log(datePrevWeek.toUTC().toJSDate().toString());
      // console.log();

      snapshot.forEach((doc) => {
        let data = doc.data();
        let orderDate = DateTime.fromJSDate(data.placed_at.toDate());
        orders.push(data);

        if (weekInterval.contains(orderDate)) {
          weekOrders.push(data);
        }

        if (monthInterval.contains(orderDate)) {
          monthOrders.push(data);
        }
        if (isToday(orderDate.toJSDate(), dateNow.toJSDate())) {
          dayOrders.push(data);
        }
      });

      res.send({
        total: report(orders),
        week: report(weekOrders),
        month: report(monthOrders),
        day: report(dayOrders),
      });
    })
    .catch((err) => console.log(err));
});

app.get("/processTimestamp/:docId", (req, res) => {
  docId = req.params.docId;
  db.collection("orders")
    .doc(docId)
    .get()
    .then((doc) => {
      doc_data = doc.data();
      seconds = doc_data.placed_at._seconds;
      // console.log(seconds);
      db.collection("orders")
        .doc(doc.id)
        .update({ placed_at_seconds: seconds });
      res.send("Done");
    })
    .catch((err) => console.log(err));
});

// app.get("/processTimestamps", (req, res) => {
//   db.collection("orders")
//     .get()
//     .then((querySnapshot) => {
//       querySnapshot.forEach((doc) => {
//         doc_data = doc.data();
//         seconds = doc_data.placed_at._seconds;
//         console.log(seconds);
//         db.collection("orders")
//           .doc(doc.id)
//           .update({ placed_at_seconds: seconds });
//       });
//     })
//     .catch((err) => console.log(err));
// });

//listen
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
