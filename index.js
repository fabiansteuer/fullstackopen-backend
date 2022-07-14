require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("build"));
app.use(cors());

morgan.token("body", function (request, response) {
  return JSON.stringify(request.body);
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

// Routes
app.get("/info", (request, response) => {
  const dateTime = new Date();

  Person.find({})
    .then((persons) => {
      return response.send(
        `
        <!DOCTYPE html>
        <html>
          <head>
          </head>
          <body>
            <h1>Phonebook</h1>
            <p>Phonebook contains ${persons.length} persons.</>
            <p>${dateTime}</p>
          </body>
        </html>
        `
      );
    })
    .catch((error) => next(error));
});

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const name = request.body.name;
  const number = request.body.number;

  const person = new Person({ name, number });

  person
    .validate()
    .then((result) => {
      Person.findOneAndUpdate(
        { name },
        { name, number },
        { runValidators: true, upsert: true, new: true }
      )
        .then((upsertedPerson) => {
          return response.json(upsertedPerson);
        })
        .catch((error) => next(error));
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, {
    runValidators: true,
    new: true,
  })
    .then((updatedPerson) => {
      return response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end();
      }
      return response.json(person);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      return response.status(204).end();
    })
    .catch((error) => next(error));
});

// Middleware
const unknownEndpoint = (request, response) => {
  return response.status(404).send({ error: "Unknown endpoint" });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "Malformatted ID" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  return response.status(500).send({ error: "Internal server error" });
};
app.use(errorHandler);

// Listener
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
