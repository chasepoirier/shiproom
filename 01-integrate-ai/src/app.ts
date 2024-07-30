import express, { Express } from "express";
import bodyParser from "body-parser";
import { generateSchedule } from "./schedulerController";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ status: `running` });
});

app.post("/generate-schedule", generateSchedule);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
