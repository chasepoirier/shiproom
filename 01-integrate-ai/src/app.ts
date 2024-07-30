import express, { Express } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ status: `running` });
});

app.post("/generate-schedule", (req, res) => {
  res.json({ payload: req.body });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
