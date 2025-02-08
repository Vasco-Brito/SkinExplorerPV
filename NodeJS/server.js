const fs = require("fs"); // <-- Corrigido, usar fs diretamente
const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3001;
const PERSISTENT_VARS_PATH = path.resolve(__dirname, "../data/.cache/persistentVars.json");

app.use(express.json());

app.get("/", async (req, res) => {
    try {

    } catch (error) {
        console.error("Error getting Skins: ", error.message);
        res.status(500).send("Error getting Skins");
    }
})

app.get("/shouldPrecache", async (req, res) => {
    try {
        let storedVars = {};

        if (fs.existsSync(PERSISTENT_VARS_PATH)) {
            storedVars = JSON.parse(fs.readFileSync(PERSISTENT_VARS_PATH, "utf-8"));
        }

        const response = await axios.get("http://localhost:3001/persistentVars");
        const { gameVersion, pbeVersion } = response.data;

        if (!storedVars.gameVersion || !storedVars.pbeVersion) {
            return res.json(true);
        }

        const shouldUpdate = gameVersion !== storedVars.gameVersion || pbeVersion !== storedVars.pbeVersion;
        res.json(shouldUpdate);
    } catch (error) {
        console.error("[Server] Error checking shouldPrecache:", error.message);
        res.status(500).json({ error: "Error checking shouldPrecache" });
    }
});

app.get("/persistentVars", async (req, res) => {
    try {
        const [gameResponse, pbeResponse] = await Promise.all([
            axios.get("https://raw.communitydragon.org/latest/content-metadata.json"),
            axios.get("https://raw.communitydragon.org/pbe/content-metadata.json")
        ]);
        const gameVersion = gameResponse.data?.version || "Unknown";
        const pbeVersion = pbeResponse.data?.version || "Unknown";
        res.json({ gameVersion, pbeVersion });
    } catch (error) {
        console.error("Error getting Persistent Vars:", error.message);
        res.status(500).json({
            error: "Error getting Persistent Vars",
            gameVersion: null,
            pbeVersion: null
        });
    }
});



app.get("/skins", async (req, res) => {
    try {
        const response = await axios.get("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/skins.json");
        res.json(response.data);
    } catch (error) {
        console.error("Error getting Skins: ", error.message);
        res.status(500).send("Error getting Skins");
    }
})

app.get("/added", async (req, res) => {
    try {
        const [pbeResponse, liveResponse] = await Promise.all([
            axios.get("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/skins.json"),
            axios.get("https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/skins.json")
        ]);
        const pbeSkins = pbeResponse.data || {};
        const liveSkins = liveResponse.data || {};
        const liveSkinIds = new Set(Object.keys(liveSkins));
        const newSkins = Object.keys(pbeSkins)
            .filter(skinId => !liveSkinIds.has(skinId)) // Pegamos apenas IDs que não existem no jogo live
            .map(skinId => pbeSkins[skinId]); // Transformamos os IDs de volta em objetos completos de skin
        res.json(newSkins);
    } catch (error) {
        console.error("Erro ao obter as skins adicionadas:", error.message);
        res.status(500).json({
            error: "Erro ao obter as skins adicionadas",
            added: []
        });
    }
});

app.get("/champions", async (req, res) => {
    try {
        const response = await axios.get("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json");
        const champions = response.data?.filter(champ => champ.id !== -1)
            .map(({ alias, ...champions }) => ({
                ...champions,
                key: alias.toLowerCase()
            }))
        res.json(champions);
    } catch (error) {
        console.error("Error getting Champions: ", error.message);
        res.status(500).send("Error getting Champions");
    }
})

app.get("/skinlines", async (req, res) => {
    try {
        const response = await axios.get("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/skinlines.json");
        res.json(response.data);
    } catch (error) {
        console.error("Error getting Champions: ", error.message);
        res.status(500).send("Error getting Champions");
    }
})

app.get("/universes", async (req, res) => {
    try {
        const response = await axios.get("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/universes.json");
        res.json(response.data);
    } catch (error) {
        console.error("Error getting Champions: ", error.message);
        res.status(500).send("Error getting Champions");
    }
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})