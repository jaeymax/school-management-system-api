import express, { Express, Request, Response } from "express";
import errorHandler from "./middlewares/errorHandler";
import routes from "./routes";
import cors from 'cors'

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Base route
app.get("/", (req: Request, res: Response) => {
  res.send("School Management System API");
});

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
