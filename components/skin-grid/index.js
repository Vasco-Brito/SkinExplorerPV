import classNames from "classnames";
import Image from "../image";
import Link from "next/link";
import {asset, chromas, rarity} from "../../data/helpers";
import styles from "./styles.module.scss";
import Tooltip from "@mui/material/Tooltip";
import {colors} from "@mui/material";

export function SkinGrid({ skins, linkTo, champion }) {
  if (skins.length === 0)
    return (
      <div className={styles.grid} style={{ gridTemplateColumns: "1fr" }}>
        <span className={styles.error}>No skins (yet)!</span>
      </div>
    );
  return (
    <div className={styles.grid}>
      {skins.map((skin) => {
        console.log("erro?")
        console.log(skin.id, skin.name, skin.rarity)
        const r = rarity(skin);
        const c = chromas(skin);
        return (
          <Link key={skin.id} href={linkTo(skin)} as={linkTo(skin)}>
            <a>
              <Image
                className={styles.tile}
                unoptimized
                src={asset(skin.tilePath)}
                alt={skin.name}
                width={300}
                height={300}
              />
              <div>
                <Tooltip title={
                  skin.name === champion.name ? (
                      <span style={{fontSize: "16px", fontWeight: "bold"}}>
                        O campeão custa: <br/> ● <span
                          style={{color: "rgb(12,201,228)"}}>{parseInt(champion.prices?.BE)}</span> de BE
                        <br/> ● <span style={{color: "rgb(227,186,61)"}}>{parseInt(champion.prices?.RP)}</span> de RP
                      </span>
                  ) : (
                      <span style={{fontSize: "16px", fontWeight: "bold"}}>
                        A skin custa <span style={{color: "rgb(227,186,61)"}}>{parseInt(skin.prices?.RP) !== 0 ? skin.prices?.RP : "???"}</span> de RP
                      </span>
                  )
                }>
                  {skin.name}
                </Tooltip>
                <div className={classNames({[styles.rarityBadge]: c})}>
                  {c && (
                      <Tooltip
                          title={
                            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                              A skin tem {skin.chromaCount} Chromas
                              <br />
                              Ao todo <span style={{color: "rgb(227,186,61)"}}>{skin.chromaTotalPrice}</span> RP
                            </span>
                              }>
                        <span>
                          <Image
                              src={c}
                              title={skin.id}
                              alt={c}
                              objectFit="contain"
                              objectPosition="center"
                              layout="fill"
                          />
                        </span>
                      </Tooltip>
                  )}
                </div>
                <div className={classNames({[styles.rarityBadge]: r})}>
                  {r && (
                      <Image
                          src={r[0]}
                          title={r[1]}
                          alt={r[1]}
                          objectFit="contain"
                          objectPosition="center"
                          layout="fill"
                      />
                  )}
                </div>
              </div>
            </a>
          </Link>
        );
      })}
    </div>
  );
}
