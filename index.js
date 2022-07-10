const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

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

// Data
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// Routes
app.get("/info", (request, response) => {
  const dateTime = new Date();
  response.send(
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
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.post("/api/persons", (request, response) => {
  let person = { ...request.body };

  if (!person.name) {
    return response.status(400).json({ error: "name missing" });
  }

  if (typeof person.name !== "string") {
    return response.status(400).json({ error: "name is not a string" });
  }

  if (!person.number) {
    return response.status(400).json({ error: "number missing" });
  }

  if (typeof person.number !== "string") {
    return response.status(400).json({ error: "number is not a string" });
  }

  if (persons.find((p) => p.name === person.name)) {
    return response.status(409).json({ error: "person already exists" });
  }

  person.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

  persons = persons.concat(person);

  response.json(person);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);

  if (!person) {
    response.status(404).end();
  }

  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((p) => p.id !== id);
  response.status(204).end();
});

// Listener
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
