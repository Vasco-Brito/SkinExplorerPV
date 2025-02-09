import Link from "next/link";
import styles from "./styles.module.scss";
import Image from "next/image";
import classNames from "classnames";
import logo from "../../assets/logo.png";
import { Omnisearch } from "../omnisearch";
import { useEscapeTo } from "../../data/helpers";
import { ArrowLeft, ExternalLink, Menu, Search, X } from "lucide-react";
import { useLayoutEffect, useEffect, useRef, useState } from "react";

export const Header = ({ flat, backTo }) => {
  const back =
    typeof window !== "undefined" ? localStorage.lastIndex ?? backTo : backTo;
  useEscapeTo(back);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const omnisearch = useRef();
  (typeof window === "undefined" ? useEffect : useLayoutEffect)(() => {
    if (showSearch) omnisearch.current?.focus();
  }, [showSearch]);

  const handleLogin = () => {
    if (username && password) {
      console.log(username, password);
      localStorage.setItem("user", username);
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <>
      <header
        className={classNames(styles.header, {
          [styles.flat]: flat,
          [styles.search]: showSearch,
        })}
      >
        <Link href={back ?? "/"} as={back ?? "/"}>
          <a className={styles.logo}>
            {backTo && <ArrowLeft />}
            <Image
              priority
              src={logo}
              alt="Skin Explorer"
              height={36}
              width={178}
            />
          </a>
        </Link>
        <div className={styles.loginInput}>
          <Omnisearch ref={omnisearch} />
        </div>
        <div
          className={styles.omnisearchIcon}
          onClick={() => {
            setShowSearch(!showSearch);
          }}
        >
          {showSearch ? <X /> : <Search />}
        </div>
        <div
            className={classNames(styles.menuIcon, {[styles.open]: menuOpen})}
            onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu/>
          <ul className={styles.loginContainer}>
            <li>
              <Link href="/shortcuts">
                <a>Keybinds &amp; Gestures</a>
              </Link>
            </li>
            <li className={styles.divider}/>
            {!isLoggedIn ? (
                <>
                  <li>
                    <input
                        className={styles.loginInput}
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                  </li>
                  <li>
                    <input
                        className={styles.loginInput}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                  </li>
                  <li>
                    <button onClick={handleLogin} className={styles.loginBtn}>
                      Login
                    </button>
                  </li>
                </>
            ) : (
                <>
                  <li className={styles.loggedUser}>
                    <a>Bem-vindo, <strong>{localStorage.getItem("user")}</strong>!</a>
                  </li>
                  <li>
                    <button onClick={handleLogout} className={styles.loginBtn}>
                      Logout
                    </button>
                  </li>
                </>
            )}
            <li className={styles.divider}/>
            <li>
              <Link href="/shortcuts">
                <a>Keybinds &amp; Gestures</a>
              </Link>
            </li>
          </ul>

          {/*<li>*/}
          {/*  <Link href="/changelog" as="/changelog">*/}
          {/*    <a>Changelog</a>*/}
          {/*  </Link>*/}
          {/*</li>*/}
          {/*/!* <li>*/}
          {/*  <Link href="/about" as="/about">*/}
          {/*    <a>About</a>*/}
          {/*  </Link>*/}
          {/*</li> *!/*/}
          {/*/!* <li>*/}
          {/*  <Link href="/sponsor" as="/sponsor">*/}
          {/*    <a>Sponsor</a>*/}
          {/*  </Link>*/}
          {/*</li> *!/*/}
          {/*<li className={styles.divider} />*/}
          {/*/!* <li>*/}
          {/*  <a href="https://discord.gg" target="_blank" rel="noreferrer">*/}
          {/*    Discord <ExternalLink />*/}
          {/*  </a>*/}
          {/*</li> *!/*/}
          {/*<li>*/}
          {/*  <a*/}
          {/*    href="https://analytics.skinexplorer.lol/share/JlbPP3v4/Skin%20Explorer"*/}
          {/*    target="_blank"*/}
          {/*    rel="noreferrer"*/}
          {/*  >*/}
          {/*    Analytics <ExternalLink />*/}
          {/*  </a>*/}
          {/*</li>*/}
          {/*<li>*/}
          {/*  <a*/}
          {/*    href="https://github.com/preyneyv/lol-skin-explorer/issues/new/choose"*/}
          {/*    target="_blank"*/}
          {/*    rel="noreferrer"*/}
          {/*  >*/}
          {/*    Bug Report <ExternalLink />*/}
          {/*  </a>*/}
          {/*</li>*/}
          {/*<li>*/}
          {/*  <a*/}
          {/*    href="https://github.com/preyneyv/lol-skin-explorer/"*/}
          {/*    target="_blank"*/}
          {/*    rel="noreferrer"*/}
          {/*  >*/}
          {/*    View on GitHub <ExternalLink />*/}
          {/*  </a>*/}
          {/*</li>*/}
        </div>
      </header>
      <div className={styles.headerSpacer}/>
    </>
  )
      ;
};
