const cloud =
  "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/";
const night = "dhs-nighttime-spectaculars/";
const holiday =
  "hollywood-studios-shows/holidays-in-hollywood/storefront-assets/";
export const storefrontThemes = {
  "nighttime-spectaculars": {
    title: "Nighttime Spectaculars",
    short: "After the lights come on.",
    intro: "A collection for the people behind the spectacle.",
    background:
      cloud + "v1788371336/" + night + "hero/ns-hero-dhs-desktop-v1.webp",
    logo:
      cloud +
      "v1788370498/" +
      night +
      "artwork/dhs-nighttime-full-back-logo-v1.png",
    left: cloud + "v1788370513/" + night + "models/ns-model-j333-black-v1.webp",
    right:
      cloud + "v1788370516/" + night + "models/ns-model-l333-black-v1.webp",
    products: [
      {
        name: "J333",
        category: "Jackets",
        image:
          cloud + "v1788370513/" + night + "models/ns-model-j333-black-v1.webp",
      },
      {
        name: "L333",
        category: "Jackets",
        image:
          cloud + "v1788370516/" + night + "models/ns-model-l333-black-v1.webp",
      },
      {
        name: "J717",
        category: "Layers",
        image:
          cloud + "v1788375950/" + night + "models/ns-model-j717-black-v2.png",
      },
      {
        name: "L717",
        category: "Layers",
        image:
          cloud + "v1788370509/" + night + "models/ns-model-l717-black-v1.webp",
      },
      {
        name: "DT800",
        category: "T-shirts",
        image:
          cloud +
          "v1788370502/" +
          night +
          "models/ns-model-dt800-black-v1.webp",
      },
    ],
  },
  "holidays-in-hollywood": {
    title: "Holidays in Hollywood",
    short: "Your next wardrobe call.",
    intro: "Bring a little of the boulevard home.",
    background:
      cloud +
      "v1786469690/" +
      holiday +
      "hih-hero-boulevard-blue-hour-desktop-v1.webp",
    logo: cloud + "v1786472472/" + holiday + "hih-vector-title-v3.png",
    left:
      cloud + "v1786992233/" + holiday + "hih-hero-cast-left-decorated-v2.png",
    right:
      cloud + "v1786992123/" + holiday + "hih-hero-cast-right-decorated-v2.png",
    products: [
      {
        name: "Jackets",
        category: "Jackets",
        image:
          cloud +
          "v1786991507/" +
          holiday +
          "hih-widget-jackets-decorated-v2.png",
      },
      {
        name: "Hoodies",
        category: "Hoodies",
        image:
          cloud +
          "v1786991487/" +
          holiday +
          "hih-widget-hoodies-decorated-v2.png",
      },
      {
        name: "Headwear",
        category: "Headwear",
        image:
          cloud +
          "v1786722005/" +
          holiday +
          "hih-widget-headwear-decorated-v2.png",
      },
      {
        name: "Pants",
        category: "Pants",
        image:
          cloud +
          "v1786721983/" +
          holiday +
          "hih-widget-pants-decorated-v2.png",
      },
    ],
  },
};
export type StorefrontTheme = keyof typeof storefrontThemes;
