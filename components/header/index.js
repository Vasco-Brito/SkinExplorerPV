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
  let storedUser = {};
  (typeof window === "undefined" ? useEffect : useLayoutEffect)(() => {
    if (showSearch) omnisearch.current?.focus();
  }, [showSearch]);

  const handleLogin = async () => {
    if (username && password) {

      try {
        const response = await fetch("http://localhost:3001/accounts/login", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ user: username, pdw: password }),
        })

        if (!response.ok) {
          console.log("Erro ao logar")
        }

        const data = await response.json();
        console.log(data);

        localStorage.setItem("account", JSON.stringify(data));
        setIsLoggedIn(true);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("account");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  useEffect(() => {
    storedUser = JSON.parse(localStorage.getItem("account") || {});
    console.log(storedUser.account.user);
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
                    <a>Bem-vindo, <strong>{storedUser.account?.user}</strong>!</a>
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
        </div>
      </header>
      <div className={styles.headerSpacer}/>
    </>
  )
      ;
};
