const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

console.log("Connecting to MongoDB URL", url);

mongoose
  .connect(url)
  .then((result) => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });

const numberValidator = (number) => {
  return /^\d{2,3}-\d+$/.test(number);
};

const personSchema = new mongoose.Schema({
  id: String,
  name: { type: String, minLength: 3, required: true },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator: numberValidator,
      message: "Number must be in 12-345678 or 123-45678 format.",
    },
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
