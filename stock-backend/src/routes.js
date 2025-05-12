import express from "express";
import {
  getAverageStockPriceInTimeRange,
  getStockPriceCorrelation,
} from "./controller.js";

const router = express.Router();

router.get("/stocks/:ticker", getAverageStockPriceInTimeRange);
router.get("/stockcorrelation", getStockPriceCorrelation);

export default router;
