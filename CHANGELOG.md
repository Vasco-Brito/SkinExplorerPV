# Changelog

<header>

## [v1.1.1](https://github.com/preyneyv/lol-skin-explorer/tree/v1.1.1)

###### January 12th, 2022

</header>

- Fixed bug that prevented site from updating due to a universe (Steel Valkyries) with no skinlines in the game files.

---

<header>

## [v1.1.0](https://github.com/preyneyv/lol-skin-explorer/tree/v1.1.0)

###### January 12th, 2022

</header>

- Skins now have a SkinSpotlights jumplink. Implementation is a bit rudimentary,
  but it serves the purpose (for now).
- OpenSearch support! Skin Explorer now registers as a search engine in the
  browser so you can search without even loading the website.
- All data is now cached at build time instead of coming from the Redis cache at
  runtime, including the resources needed for dynamic routes like the Omnisearch
  API.

---

<header>

## [v1.0.6](https://github.com/preyneyv/lol-skin-explorer/tree/v1.0.6)

###### January 5th, 2022

</header>

- Fixed placeholder images not loading sometimes.
- Fixed spacing on info popup in skin viewer on small screens.

---

<header>

## [v1.0.5](https://github.com/preyneyv/lol-skin-explorer/tree/v1.0.5)

###### January 5th, 2022

</header>

- Modified `robots.txt` to disallow internal pages.

---

<header>

## [v1.0.4](https://github.com/preyneyv/lol-skin-explorer/tree/v1.0.4)

###### January 5th, 2022

</header>

- Added a "new additions" section on all indexes that shows all the skins in
  the PBE that aren't on the live patch. Maybe there's a better way to
  determine these, but I'll revisit it later.
- Added a placeholder image for non-existent images (as happens often with
  newly released skins).
- Minor styling changes.

---

<header>

## [v1.0.3](https://github.com/preyneyv/lol-skin-explorer/tree/v1.0.3)

###### January 4th, 2022

</header>

- Turns out skinlines can be empty. Weird. Fixed fatal bugs on universe and
  skinline pages.
- Added a download button to the skin viewer. (Shortcut: `D`)
- Fixed Wukong Teemo.GG hyperlink.

---

<header>

## [v1.0.2](https://github.com/preyneyv/lol-skin-explorer/tree/v1.0.2)

###### December 31th, 2021

</header>

- Added H1 tags to skin viewer to help with SEO indexing.

---

<header>

## [v1.0.1](https://github.com/preyneyv/lol-skin-explorer/tree/v1.0.1)

###### December 27th, 2021

</header>

- Bugfix for scaling on viewer popup.
- Added backlink to universe from skinline.
- Visual bugfix for omnisearch on mobile.
- Added swipe to navigate on indexes.

---

<header>

## [v1.0.0](https://github.com/preyneyv/lol-skin-explorer/tree/v1.0.0)

###### December 27th, 2021

</header>

The first formal release of Skin Explorer! This is pretty much a complete
rewrite of the alpha version that was [initially posted to r/leagueoflegends](https://www.reddit.com/r/leagueoflegends/comments/r7c0ir/i_made_skin_explorer_an_online_skin_splash_art/), with a ton of new features.

- Pre-rework splash art, all the way back to patch 7.1!
- Skin universes to group related skinlines.
- You can also see skin chromas now.
- Touch- and mobile-friendly.
- Supports rich embeds in apps like Discord, Twitter, etc.
- Supports Add to Home Screen (iOS Safari, Android Chrome) and Install (Desktop Chrome).
- More aggressive caching of resources to keep app snappy.
- Statically rendered and SEO optimized.
- Many QoL enhancements throughout.
