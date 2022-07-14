const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log(
    "Please provide the MongoDB password to list all people in the phonebook: node mongo.js <password>'"
  );
  process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://fullstackopen:${password}@cluster0.izeyd.mongodb.net/phonebook?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
  mongoose
    .connect(url)
    .then(() => {
      console.log("Connected to MongoDb");
      Person.find({})
        .then((result) => {
          console.log("Phonebook");
          result.forEach((person) => console.log(person.name, person.number));
        })
        .then(() => {
          mongoose.connection.close();
        });
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
} else if (process.argv.length === 5) {
  const name = process.argv[3];
  const number = process.argv[4];

  mongoose
    .connect(url)
    .then(() => {
      console.log("Connected to MongoDb");

      const person = new Person({
        name,
        number,
      });

      return person.save();
    })
    .then(() => {
      console.log("Person saved");
      return mongoose.connection.close();
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
} else {
  console.log(
    "Please provide the MongoDB password and the name and phone number of the person to be added as an argument: node mongo.js <password> <name> <number>'"
  );
  process.exit(1);
}
