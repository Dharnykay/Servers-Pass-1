const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/mydatabase", {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // dont know what this means yet
  })
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Database connection error:", err));

module.exports = mongoose;
