import app, { port, hostname } from "./App.ts";

app.post("/serie/", (req, res) => {
  const body = req.body;
  if (!body.name) {
    res.status(400).send({ message: "Name is required" });
    return;
  }

  res.send("POST request to the homepage");
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

//! Delete next line
setTimeout(() => process.exit(0), 1000);
