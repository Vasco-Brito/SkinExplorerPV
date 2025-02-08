import { store } from "../../data/store";
import { splitId } from "../../data/helpers";

export async function prepareAdditions() {
    const { added, champions } = store.patch;


    return Array.isArray(added)
        ? added
            .sort((a, b) => (a.name > b.name ? 1 : -1))
            .map((skin) => {
                const cId = splitId(skin.id)[0];
                const champ = champions.find((c) => c.id === cId);

                return { ...skin, $$key: champ ? champ.id : "unknown", champName: champ.name.toLowerCase() };
            })
        : [];
}

