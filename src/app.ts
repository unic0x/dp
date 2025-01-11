import cors from "cors";
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import figlet from 'figlet';
import helmet from "helmet";
import morgan from 'morgan';
import path from 'path';
import routes from "./routes";

function ascii(message: string, width: number = 80): string {
    return figlet.textSync(message, {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: width,
        whitespaceBreak: true,
    })
}

function rateLimiter() {
    return rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        limit: 20, // Limit each IP to 20 requests per window.
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        skip: (req) => req.url === '/api/health',
        handler: (req, res) => {
            res
                .status(429)
                .json({
                    error: 'Too many requests, please try again later.'
                });
        }
    })
}

async function init() {
    const app = express();
    app.use(express.static(path.resolve(__dirname, 'public')));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use((req, res, next) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        req.setTimeout(2 * 60000);
        res.setTimeout(2 * 60000);

        next();
    });
    // TODO: Improve it to avoid abuse by malicious users
    app.set('trust proxy', 1);

    // Set up rate limiter
    app.use(rateLimiter())

    // Use helmet to secure Express with various HTTP headers
    app.use(helmet());

    // Add morgan for logging
    app.use(morgan('combined'));

    // Add custom routes
    app.use(routes);

    app.listen(3000, "localhost", () => {
        console.log();
        console.log(ascii("Aurora Dispenser"));
        console.log("Version: 1.0.0");
        console.log("Server listening on port 3000");
    });

    process.on("SIGINT", () => gracefullyExit());
    process.on("SIGTERM", () => gracefullyExit());
    process.on("uncaughtException", (error) => {
        console.error("Uncaught exception:", error);
    });
}

function gracefullyExit() {
    console.log();
    console.log(ascii("Bye!", 40));
    process.exit();
}

init();