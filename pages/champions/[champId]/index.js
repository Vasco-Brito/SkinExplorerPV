import Image from "next/image";
import Head from "next/head";
import { useProps } from "../../../data/contexts";
import {
  championSkins,
  useLocalStorageState,
  useSortedSkins,
  makeTitle,
  makeImage,
  makeDescription,
} from "../../../data/helpers";
import { store } from "../../../data/store";
import { Header } from "../../../components/header";
import { SkinGrid } from "../../../components/skin-grid";
import { Footer, FooterContainer } from "../../../components/footer";
import {useEffect, useMemo, useState} from "react";
import { Fallback } from "../../../components/fallback";
import { asset } from "../../../data/helpers";
import styles from "../../../styles/collection.module.scss";

function _Page() {
  const matchTypes = ["NORMAL", "URF", "ARAM", "FLEXRANKED", "SOLORANKED"];
  const { champion, skins } = useProps();
  const [sortBy, setSortBy] = useLocalStorageState(
    "champion__sortBy",
    "release"
  );
  const [accountData, setAccountData] = useState(null);
  const [selectedMatchTypes, setSelectedMatchTypes] = useState(["NORMAL"]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [totalObj, setTotalObj] = useState({
    wins: 0,
    defeats: 0,
    gold: 0,
    dmgGiven: 0,
    dmgDealt: 0,
    kill: 0,
    death: 0,
    assist: 0,
  });


  useEffect(() => {
    const storedAccount = localStorage.getItem("account");
    if (storedAccount) {
      setAccountData(JSON.parse(storedAccount));
    }
  }, []);

  useEffect(() => {
    if (accountData) {
      let updatedTotals = {
        wins: 0,
        defeats: 0,
        gold: 0,
        dmgGiven: 0,
        dmgDealt: 0,
        kill: 0,
        death: 0,
        assist: 0,
      };

      selectedMatchTypes.forEach((type) => {
        updatedTotals.wins += accountData?.champions[champion.id]?.games?.[type]?.total_wins || 0;
        updatedTotals.defeats += accountData?.champions[champion.id]?.games?.[type]?.total_losses || 0;
        updatedTotals.gold += accountData?.champions[champion.id]?.games?.[type]?.stats.gold_earned || 0;
        updatedTotals.dmgGiven += accountData?.champions[champion.id]?.games?.[type]?.stats.total_damage_dealt_to_champions || 0;
        updatedTotals.dmgDealt += accountData?.champions[champion.id]?.games?.[type]?.stats.total_damage_taken || 0;
        updatedTotals.kill += accountData?.champions[champion.id]?.games?.[type]?.stats.kill || 0;
        updatedTotals.death += accountData?.champions[champion.id]?.games?.[type]?.stats.death || 0;
        updatedTotals.assist += accountData?.champions[champion.id]?.games?.[type]?.stats.assist || 0;
      });

      setTotalObj(updatedTotals);
    }
  }, [accountData, champion.id, selectedMatchTypes]);

  const toggleMatchType = (type) => {
    setSelectedMatchTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };


  const base = useMemo(() => skins.find((s) => s.isBase), [skins]);

  const linkTo = (skin) => `/champions/${champion.key}/skins/${skin.id}`;

  const sortedSkins = useSortedSkins(sortBy === "rarity", skins);
  const selectedText =
      selectedMatchTypes.length === 0
          ? "All"
          : selectedMatchTypes.join(", ");

  return (
    <>
      <Head>
        {makeTitle(champion.name)}
        {makeDescription(
          `Browse through the ${skins.length} skin${
            skins.length == 1 ? "" : "s"
          } that ${champion.name} has!`
        )}
        {makeImage(asset(base.uncenteredSplashPath), champion.name)}
      </Head>
      <div className={styles.container}>
        <FooterContainer>
          <div>
            <div className={styles.background}>
              <Image
                  unoptimized
                  layout="fill"
                  objectFit="cover"
                  src={asset(base.uncenteredSplashPath)}
                  alt={champion.name}
              />
            </div>
            <Header backTo="/" flat/>
            <main className={styles.mainContainer}>
              <div className={styles.topSection}>
                <div className={styles.infoSection}>
                  <h1 className={styles.title}>{champion.name}</h1>
                  <div className={styles.controls}>

                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>Sort By</label>
                      <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="release">Release</option>
                        <option value="rarity">Rarity</option>
                      </select>
                    </div>

                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel} style={{marginLeft: 10}}>Match Type</label>
                      <div className={styles.matchTypeSelector} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <span>{selectedText}</span>
                        <span className={styles.arrow}>{isDropdownOpen ? "▲" : "▼"}</span>
                      </div>

                      {isDropdownOpen && (
                          <ul className={styles.matchTypeDropdown}>
                            {matchTypes.map((type) => (
                                <li key={type} onClick={() => toggleMatchType(type)}>
                                  <input type="checkbox" checked={selectedMatchTypes.includes(type)} readOnly />
                                  {type}
                                </li>
                            ))}
                          </ul>
                      )}
                    </div>

                  </div>
                </div>

                {accountData && (
                    <div className={styles.championStats}>
                      <table>
                        <tbody>
                        <tr>
                          <td><b>Desbloqueado?</b></td>
                          <td>{accountData?.champions[champion.id]?.owned === false ? "Não" : "Sim" ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <td><b>Skins</b></td>
                          <td>{accountData?.champions[champion.id]?.skins?.length ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <td><b>Vitorias</b></td>
                          <td>{totalObj.wins ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <td><b>Derrotas</b></td>
                          <td>{totalObj.defeats ?? "N/A"}</td>
                        </tr>
                        </tbody>
                      </table>
                      <table>
                        <tbody>
                        <tr>
                          <td><b>Ouro</b></td>
                          <td>{totalObj.gold ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <td><b>Dmg Dado</b></td>
                          <td>{totalObj.dmgGiven ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <td><b>Dmg Recebido</b></td>
                          <td>{totalObj.dmgDealt ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <td><b>KDA</b></td>
                          <td>{totalObj.kill + " / " + totalObj.death + " / " + totalObj.assist ?? "N/A"}</td>
                        </tr>
                        </tbody>
                      </table>
                    </div>
                )}
              </div>
              <SkinGrid
                  skins={sortedSkins}
                  linkTo={linkTo}
                  viewerPage="/champions/[key]/skins/[id]"
              />
            </main>
          </div>
          <Footer flat/>
        </FooterContainer>
      </div>
    </>
  );
}

export default function Page() {
  return (
      <Fallback>
        <_Page/>
      </Fallback>
  );
}

export async function getStaticProps(ctx) {
  const {champId} = ctx.params;

  const {champions, skins: allSkins} = store.patch;

  const champion = champions.find((c) => c.key === champId);
  if (!champion) {
    return {
      notFound: true,
    };
  }

  const skins = championSkins(champion.id, allSkins);

  return {
    props: {
      champion,
      skins,
      patch: store.patch.fullVersionString,
    },
  };
}

export async function getStaticPaths() {
  let paths = [];
  if (process.env.NODE_ENV === "production") {
    const {champions} = store.patch;
    paths = champions.map((c) => ({params: {champId: c.key.toString()}}));
  }

  return {
    paths,
    fallback: "blocking",
  };
}
