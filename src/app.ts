import dotenv from "dotenv";
import express, { Express } from "express";
import { checkEvents } from "./controllers/event";

dotenv.config();

const app: Express = express();

checkEvents();

export default app;
