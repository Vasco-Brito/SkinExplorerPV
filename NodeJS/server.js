import fs from "fs";
import express from "express";
import axios from "axios";
import path from "path";
import cors from "cors";
import { fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3001;
const PERSISTENT_VARS_PATH = path.resolve(__dirname, "../data/.cache/persistentVars.json");
const ACCOUNTS_FOLDER_PATH = path.resolve(__dirname, "../data/accounts/");
let statusCode;

app.use(cors())
app.use(express.json());

statusCode = {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INVALID_REQUEST: 405,
    ERROR: 500,
}

app.get("/", async (req, res) => {
    try {

    } catch (error) {
        console.error("Error getting Skins: ", error.message);
        res.status(statusCode.ERROR).send("Error getting Skins");
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
            return res.status(statusCode.OK).json(true);
        }

        const shouldUpdate = gameVersion !== storedVars.gameVersion || pbeVersion !== storedVars.pbeVersion;
        res.status(statusCode.OK).json(shouldUpdate);
    } catch (error) {
        console.error("[Server] Error checking shouldPrecache:", error.message);
        res.status(statusCode.ERROR).json({ error: "Error checking shouldPrecache" });
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
        res.status(statusCode.OK).json({ gameVersion, pbeVersion });
    } catch (error) {
        console.error("Error getting Persistent Vars:", error.message);
        res.status(statusCode.ERROR).json({
            error: "Error getting Persistent Vars",
            gameVersion: null,
            pbeVersion: null
        });
    }
});

app.get("/skins", async (req, res) => {
    try {
        const skinsResponse = await axios.get("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/skins.json");
        const skins = skinsResponse.data;
        const pricesResponse = await axios.get("https://api.store.leagueoflegends.co.kr/catalog/KR/v1/items?language=en_US&inventorytype=CHAMPION_SKIN");
        const pricesData = pricesResponse.data;
        const pricesMap = {};
        const chromaPricesMap = {};
        pricesData.forEach(item => {
            const priceEntry = item.prices.reduce((acc, price) => {
                if (price.currency === "RP") acc.RP = price.cost;
                return acc;
            }, { RP: 0 });
            if (item.inventoryType === "CHAMPION_SKIN" && (!item.subInventoryType || item.subInventoryType !== "RECOLOR")) {
                pricesMap[item.itemId] = priceEntry;
            }
            if (item.subInventoryType === "RECOLOR") {
                chromaPricesMap[item.itemId] = priceEntry;
            }
        });
        for (const skinId in skins) {
            if (skins.hasOwnProperty(skinId)) {
                const skin = skins[skinId];
                skin.prices = pricesMap[skin.id] || { RP: 0 };
                if (skin.chromas && Array.isArray(skin.chromas)) {
                    let totalChromaPrice = 0;
                    skin.chromas = skin.chromas.map(chroma => {
                        const chromaPrice = chromaPricesMap[chroma.id] || { RP: 0 };
                        totalChromaPrice += chromaPrice.RP;
                        return {
                            ...chroma,
                            prices: chromaPrice
                        };
                    });
                    skin.chromaCount = skin.chromas.length;
                    skin.chromaTotalPrice = totalChromaPrice;
                } else {
                    skin.chromaCount = 0;
                    skin.chromaTotalPrice = 0;
                }
            }
        }
        res.status(statusCode.OK).json(skins);
    } catch (error) {
        console.error("Error getting Skins: ", error.message);
        res.status(statusCode.ERROR).send("Error getting Skins");
    }
});




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
        res.status(statusCode.OK).json(newSkins);
    } catch (error) {
        console.error("Erro ao obter as skins adicionadas:", error.message);
        res.status(statusCode.ERROR).json({
            error: "Erro ao obter as skins adicionadas",
            added: []
        });
    }
});

app.get("/champions", async (req, res) => {
    try {
        const championsResponse = await axios.get("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json");
        const champions = championsResponse.data?.filter(champ => champ.id !== -1)
            .map(({ alias, id, ...champions }) => ({
                ...champions,
                key: alias.toLowerCase(),
                id: id
            }));

        const pricesResponse = await axios.get("https://api.store.leagueoflegends.co.kr/catalog/KR/v1/items?language=en_US&inventorytype=CHAMPION");
        const pricesData = pricesResponse.data;

        const pricesMap = {};
        pricesData.forEach(item => {
            const priceEntry = item.prices.reduce((acc, price) => {
                if (price.currency === "IP") acc.BE = price.cost;
                if (price.currency === "RP") acc.RP = price.cost;
                return acc;
            }, { BE: 0, RP: 0 });

            pricesMap[item.itemId] = priceEntry;
        });

        const championsWithPrices = champions.map(champ => ({
            ...champ,
            prices: pricesMap[champ.id] || { BE: 0, RP: 0 } // Caso não encontre, retorna 0
        }));

        res.status(statusCode.OK).json(championsWithPrices);
    } catch (error) {
        console.error("Error getting Champions: ", error.message);
        res.status(statusCode.ERROR).send("Error getting Champions");
    }
});


app.get("/skinlines", async (req, res) => {
    try {
        const response = await axios.get("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/skinlines.json");
        res.status(statusCode.OK).json(response.data);
    } catch (error) {
        console.error("Error getting Champions: ", error.message);
        res.status(statusCode.ERROR).send("Error getting Champions");
    }
})

app.get("/universes", async (req, res) => {
    try {
        const response = await axios.get("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/universes.json");
        res.status(statusCode.OK).json(response.data);
    } catch (error) {
        console.error("Error getting Champions: ", error.message);
        res.status(statusCode.ERROR).send("Error getting Champions");
    }
})

app.post("/accounts/create/:gameName-:gameTag", async (req, res) => {
    try {
        const { gameName, gameTag } = req.params;
        const { user, pdw } = req.query;

        if (!user || !pdw) {
            return res.status(statusCode.BAD_REQUEST).send("Missing credentials");
        }

        const filePath = path.join(ACCOUNTS_FOLDER_PATH, `conta-${user}.json`)

        if (fs.existsSync(filePath)) {
            return res.status(statusCode.BAD_REQUEST).send("Account already exists");
        }

        const opggUrl = `https://www.op.gg/_next/data/y6NI7HYxFC2iU6uOpWHXL/en_US/summoners/euw/${gameName}-${gameTag}.json?region=euw&summoner=${gameName}-${gameTag}`;
        const response = await fetch(opggUrl);
        const data = await response.json();
        if (!data || !data.pageProps || !data.pageProps.data) {
            return res.status(statusCode.NOT_FOUND).send("Summoner not found");
        }
        const summoner = data.pageProps.data;

        const filteredData = {
            account: {
                id: summoner.id,
                summoner_id: summoner.summoner_id,
                acct_id: summoner.acct_id,
                puuid: summoner.puuid,
                game_name: summoner.game_name,
                tagline: summoner.tagline,
                user: user,
                pdw: pdw
            }
        };

        fs.writeFileSync(filePath, JSON.stringify(filteredData, null, 2));

        res.status(200).json(filteredData);
    } catch (error) {
        console.error("Error getting Summoner Data: ", error.message);
        res.status(statusCode.ERROR).send("Error fetching the account data");
    }
});

app.post("/accounts/login", async (req, res) => {
    const { user, pdw } = req.body;
    const filePath = path.join(ACCOUNTS_FOLDER_PATH, `conta-${user}.json`);

    if (!fs.existsSync(filePath)) {
        console.log(filePath)
        return res.status(statusCode.BAD_REQUEST).send("Account not exist");
    }

    const accountData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (accountData.account.pdw !== pdw) {
        return res.status(statusCode.INVALID_REQUEST).send("Account password don't match");
    }
    accountData.request = {}
    accountData.request.message = "Login Successfull";
    accountData.request.codaStatus = statusCode.OK;

    res.status(statusCode.OK).json(accountData);
})

app.post("/accounts/games", async (req, res) => {
    try {
        const TARGET_DATE = new Date("2025-01-01T00:00:00+09:00");
        const { user } = req.body;
        if (!user) {
            return res.status(statusCode.BAD_REQUEST).json({ error: "Missing user" });
        }
        const filePath = path.join(ACCOUNTS_FOLDER_PATH, `conta-${user}.json`);
        if (!fs.existsSync(filePath)) {
            return res.status(statusCode.NOT_FOUND).json({ error: "Account not found" });
        }
        const accountData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const summonerId = accountData.account.summoner_id;
        if (!summonerId) {
            return res.status(statusCode.BAD_REQUEST).json({ error: "Summoner ID not found in account" });
        }
        let allGames = accountData.games?.matches || [];
        let existingGameIds = new Set(allGames.map(game => game.id));
        let url = `https://lol-web-api.op.gg/api/v1.0/internal/bypass/games/euw/summoners/${summonerId}?&limit=20&hl=en_US`;
        let keepFetching = true;
        let gameTypeCount = accountData.games?.game_modes || {};
        let totalWins = accountData.games?.total_wins || 0;
        let totalLosses = accountData.games?.total_losses || 0;
        const champions = accountData.champions || {};

        while (keepFetching) {
            const response = await axios.get(url);
            const gamesData = response.data;
            if (!gamesData || !gamesData.data || gamesData.data.length === 0) {
                break;
            }

            const processedGames = gamesData.data
                .filter(game => new Date(game.created_at) >= TARGET_DATE)
                .filter(game => !existingGameIds.has(game.id))
                .map(game => {
                    existingGameIds.add(game.id);
                    const result = game.myData.stats.result === "WIN" ? 1 : 0;
                    const championId = game.myData.champion_id;
                    const gameType = game.game_type?.trim() || "Unknown";

                    // Atualizar contagem de modos de jogo
                    if (!gameTypeCount[gameType]) {
                        gameTypeCount[gameType] = 0;
                    }
                    gameTypeCount[gameType] += 1;

                    // Inicializar campeão se não existir
                    if (!champions[championId]) {
                        champions[championId] = {
                            name: game.myData.champion_name,
                            wins: 0,
                            losses: 0,
                            total_games: 0,
                            owned: false,
                            skins: [],
                            games: {} // Inicializa a chave "games"
                        };
                    }

                    // Atualizar estatísticas gerais do campeão
                    champions[championId].total_games += 1;
                    if (result === 1) {
                        champions[championId].wins += 1;
                        totalWins += 1;
                    } else {
                        champions[championId].losses += 1;
                        totalLosses += 1;
                    }

                    // Inicializar a estrutura do modo de jogo dentro de "games"
                    if (!champions[championId].games[gameType]) {
                        champions[championId].games[gameType] = {
                            total_games: 0,
                            total_wins: 0,
                            total_losses: 0,
                            stats: {
                                kill: 0,
                                death: 0,
                                assist: 0,
                                gold_earned: 0,
                                total_damage_dealt_to_champions: 0,
                                total_damage_taken: 0,
                                vision_score: 0,
                                minion_kill: 0,
                                turret_kill: 0,
                                barrack_kill: 0
                            }
                        };
                    }

                    // Atualizar estatísticas do modo de jogo
                    let gameStats = champions[championId].games[gameType];
                    gameStats.total_games += 1;
                    if (result === 1) {
                        gameStats.total_wins += 1;
                    } else {
                        gameStats.total_losses += 1;
                    }

                    // Somar estatísticas do jogo ao acumulado
                    gameStats.stats.kill += game.myData.stats.kill;
                    gameStats.stats.death += game.myData.stats.death;
                    gameStats.stats.assist += game.myData.stats.assist;
                    gameStats.stats.gold_earned += game.myData.stats.gold_earned;
                    gameStats.stats.total_damage_dealt_to_champions += game.myData.stats.total_damage_dealt_to_champions;
                    gameStats.stats.total_damage_taken += game.myData.stats.total_damage_taken;
                    gameStats.stats.vision_score += game.myData.stats.vision_score;
                    gameStats.stats.minion_kill += game.myData.stats.minion_kill;
                    gameStats.stats.turret_kill += game.myData.stats.turret_kill;
                    gameStats.stats.barrack_kill += game.myData.stats.barrack_kill;

                    return {
                        id: game.id,
                        created_at: game.created_at,
                        patch: game.meta_version,
                        game_map: game.game_map,
                        game_type: gameType,
                        game_length_second: game.game_length_second,
                        is_remake: game.is_remake,
                        result,
                        champion_id: championId,
                        stats: {
                            kill: game.myData.stats.kill,
                            death: game.myData.stats.death,
                            assist: game.myData.stats.assist,
                            gold_earned: game.myData.stats.gold_earned,
                            total_damage_dealt_to_champions: game.myData.stats.total_damage_dealt_to_champions,
                            total_damage_taken: game.myData.stats.total_damage_taken,
                            vision_score: game.myData.stats.vision_score,
                            minion_kill: game.myData.stats.minion_kill,
                            turret_kill: game.myData.stats.turret_kill,
                            barrack_kill: game.myData.stats.barrack_kill,
                            team: game.myData.team_key,
                            position: game.myData.position,
                        }
                    };
                });

            allGames = [...allGames, ...processedGames];

            const lastGameDate = new Date(gamesData.meta.last_game_created_at);
            if (lastGameDate < TARGET_DATE) {
                keepFetching = false;
            } else {
                url = `https://lol-web-api.op.gg/api/v1.0/internal/bypass/games/euw/summoners/${summonerId}?&ended_at=${encodeURIComponent(gamesData.meta.last_game_created_at)}&limit=20&hl=en_US`;
            }
        }

        allGames.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        accountData.games = {
            total_games: allGames.length,
            total_wins: totalWins,
            total_losses: totalLosses,
            game_modes: gameTypeCount,
            matches: allGames
        };
        accountData.champions = champions;

        fs.writeFileSync(filePath, JSON.stringify(accountData, null, 2));
        res.status(statusCode.OK).json({
            message: "Games retrieved and account updated successfully",
            total_games: allGames.length,
            games: accountData.games,
            champions: accountData.champions
        });

    } catch (error) {
        console.error("Error fetching games:", error.message);
        res.status(statusCode.ERROR).json({ error: "Error fetching games" });
    }
});


//https://lol-web-api.op.gg/api/v1.0/internal/bypass/games/euw/summoners/AqZXktTGP7RwusD7PH_JBgfYLVH-eCdKBwNtsiKcKv77MYs5fBsQescvvA?&limit=20&hl=en_US //1o request
//https://lol-web-api.op.gg/api/v1.0/internal/bypass/games/euw/summoners/AqZXktTGP7RwusD7PH_JBgfYLVH-eCdKBwNtsiKcKv77MYs5fBsQescvvA?&ended_at=2025-02-06T01%3A01%3A24%2B09%3A00&limit=20&hl=en_US //ignorar por agora
//https://lol-web-api.op.gg/api/v1.0/internal/bypass/summoners/euw/AqZXktTGP7RwusD7PH_JBgfYLVH-eCdKBwNtsiKcKv77MYs5fBsQescvvA/renewal-status

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})