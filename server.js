import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import mongoData from "./mongoData.js";
import Pusher from "pusher";
import allRoutes from "./routes.js";

//app config
const app = express();
const port = process.env.PORT || 8000;

const pusher = new Pusher({
  appId: "1130498",
  key: "2c85310c5ba9cfaac9e1",
  secret: "ef62db04fe4399937772",
  cluster: "ap2",
  useTLS: true,
});

//middlewares
app.use(express.json());
app.use(cors());

//db config
const mongoURI =
  "mongodb+srv://admin:HVKRGjoOa3DwFsaz@cluster0.mdubn.mongodb.net/discordDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("DB Connected");
  const changeStream = mongoose.connection.collection("conversations").watch();

  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      pusher.trigger("channels", "newChannel", {
        change: change,
      });
    } else if (change.operationType === "update") {
      pusher.trigger("conversation", "newMessage", {
        change: change,
      });
    } else if (change.operationType === "delete") {
      pusher.trigger("channels", "deleteChannel", {
        change: change,
      });
    }
  });
});

//api routes
// app.get("/", (req, res) => res.status(200).send("Hello world"));

app.use("/api", allRoutes);

// app.post("/new/channel", (req, res) => {});

// app.get("/get/channelList", (req, res) => {
//   mongoData.find((err, data) => {
//     if (err) {
//       res.status(500).send(err);
//     } else {
//       let channels = [];
//       data.map((channelData) => {
//         const channelInfo = {
//           id: channelData._id,
//           name: channelData.channelName,
//         };
//         channels.push(channelInfo);
//       });
//       res.status(201).send(data);
//     }
//   });
// });

// app.post("/new/message", (req, res) => {
//   const newMessage = req.body;

//   mongoData.update(
//     { _id: req.query.id },
//     { $push: { conversation: req.body } },
//     (err, data) => {
//       if (err) {
//         console.log("Error saving message...");
//         console.log(err);
//         res.status(500).send(err);
//       } else {
//         res.status(200).send(data);
//       }
//     }
//   );
// });

// app.get("/get/data", (req, res) => {
//   mongoData.find((err, data) => {
//     if (err) {
//       res.status(500).send(err);
//     } else {
//       res.status(200).send(data);
//     }
//   });
// });

// app.get("/get/conversation", (req, res) => {
//   const id = req.query.id;
//   mongoData.find({ _id: id }, (err, data) => {
//     if (err) {
//       res.status(500).send(err);
//     } else {
//       res.status(200).send(data);
//     }
//   });
// });

// app.delete("/delete/channel/:id", (req, res) => {
//   const channel = req.params.id;
//   mongoData.deleteOne({ _id: channel }, (err, data) => {
//     if (err) {
//       res.status(500).send(err);
//     } else {
//       res.status(201).send(data);
//     }
//   });
// });

//listen
app.listen(port, () => console.log(`listening on localhost:${port}`));
