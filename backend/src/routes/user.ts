import express from "express";
import { deleteUser, getAllUser, getUser, newUser } from "../controllers/user.js";

const app = express.Router();

app.post("/new", newUser);
app.get("/all", getAllUser);

// chaning
app.route("/:id").get(getUser).delete(deleteUser);

export default app;