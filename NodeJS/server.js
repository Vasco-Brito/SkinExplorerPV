const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("index");
})

app.get("/skins", async (req, res) => {
    try {
        const response = await axios.get("https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/skins.json");
        res.json(response.data);
    } catch (error) {
        console.error("Error getting Skins: ", error.message);
        res.status(500).send("Error getting Skins");
    }
})

app.get("/champions", async (req, res) => {
    try {
        const response = await axios.get("https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json");
        res.json(response.data);
    } catch (error) {
        console.error("Error getting Champions: ", error.message);
        res.status(500).send("Error getting Champions");
    }
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})