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
  const [selectedMatchTypes, setSelectedMatchTypes] = useState([]);
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
      setTotalObj({
        wins: accountData?.champions[champion.id]?.games?.NORMAL?.total_wins || 0,
        defeats: accountData?.champions[champion.id]?.games?.NORMAL?.total_losses || 0,
        gold: accountData?.champions[champion.id]?.games?.NORMAL?.stats.gold_earned || 0,
        dmgGiven: accountData?.champions[champion.id]?.games?.NORMAL?.stats.total_damage_dealt_to_champions || 0,
        dmgDealt: accountData?.champions[champion.id]?.games?.NORMAL?.stats.total_damage_taken || 0,
        kill: accountData?.champions[champion.id]?.games?.NORMAL?.stats.kill || 0,
        death: accountData?.champions[champion.id]?.games?.NORMAL?.stats.death || 0,
        assist: accountData?.champions[champion.id]?.games?.NORMAL?.stats.assist || 0,
      });
    }
  }, [accountData, champion.id]);



  const toggleMatchType = (type) => {
    setSelectedMatchTypes((prev) =>
        prev.includes(type)
            ? prev.filter((t) => t !== type) // Remover se já estiver selecionado
            : [...prev, type] // Adicionar se não estiver
    );
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
                    {/* SORT BY */}
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
