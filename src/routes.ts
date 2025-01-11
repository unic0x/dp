import express from "express";
import fs from "fs";
import _ from "lodash";
import path from "path";
import { buildAnonymousAuthBundle, buildAuthBundle } from "./authBundleProvider";

const accounts = fs.readFileSync(path.resolve(`resources/accounts.txt`), "utf-8").split("\n");
const router = express.Router();

function getRandomAccount() {
  const account = _.sample(accounts) as string;
  const [email, aasToken] = account.split(" ");

  return { email, aasToken };
}

router
  // Health
  .get("/api/health", (req, res) => {
    res
      .status(200)
      .json({
        status: "Aurora Dispenser is alive!",
        uptime: process.uptime(),
        dateTime: new Date().toISOString(),
      });
  })

  .post("/api/auth", async (req, res) => {
    const deviceConfig = req.body;

    if (_.isEmpty(deviceConfig)) {
      res
        .status(400)
        .json({
          error: "Missing device configuration",
        });

      return;
    }

    try {
      const { email, aasToken } = getRandomAccount();
      const authBUndle = await buildAuthBundle({ email, aasToken, }, deviceConfig)

      res
        .status(200)
        .json(authBUndle);
    } catch (error: any) {
      res
        .status(400)
        .json(error.message || error.code);
    }
  })

  // Dispense
  .get("/api/auth", async (req, res) => {
    try {
      const { email, aasToken } = getRandomAccount();
      const authBUndle = await buildAnonymousAuthBundle({ email, aasToken, }, "arm64_xxhdpi")

      res
        .status(200)
        .json(authBUndle);
    } catch (error: any) {
      res
        .status(400)
        .json(error.message || error.code);
    }
  });

export default router;
