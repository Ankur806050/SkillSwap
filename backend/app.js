import express from "express";
import cors from "cors";
import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";
import authRouter from "./routes/auth.routes.js";



const app = express();

// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL
}));

app.use(express.json());

// Routes
app.use("/api/auth",authRouter);
app.get("/", (req, res) => {
    res.send("SkillSwap API is running");
});

// Error Handling Middlewares
app.use(notFound); // handles unknown routes
app.use(errorHandler);

export default app;