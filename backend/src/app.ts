import express from "express";
const port = 3000;
const app = express();

app.use("/", (req, res) => {
    res.send("<h1>App is healthy</h1>");
})

app.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`)
})