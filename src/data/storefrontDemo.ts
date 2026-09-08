export type DemoProduct = {
  name: string;
  category: string;
  image: string;
  back?: string;
  description: string;
  sizes: string[];
};
export type DemoTheme = {
  title: string;
  style: "night" | "holiday" | "villains" | "anniversary" | "jingle";
  eyebrow: string;
  headline: string;
  short: string;
  intro: string;
  story: string;
  background: string;
  logo?: string;
  left?: string;
  right?: string;
  categoryImages?: Record<string, string>;
  products: DemoProduct[];
};
// Saved project artwork. Product names and options are illustrative demo labels,
// not an inventory feed. Keep category compositions separate from item mockups.
export const storefrontThemes: Record<StorefrontTheme, DemoTheme> = {
  "nighttime-spectaculars": {
    title: "Nighttime Spectaculars",
    style: "night",
    eyebrow: "The cast & crew collection",
    headline: "Made for the night.",
    short: "After the lights come on.",
    intro: "A collection for the people behind the spectacle.",
    story:
      "From the first spotlight to the last burst of color. Explore the layers that carry the show beyond the stage.",
    background:
      "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_1600/v1788371336/dhs-nighttime-spectaculars/hero/ns-hero-dhs-desktop-v1.webp",
    logo: "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1788370498/dhs-nighttime-spectaculars/artwork/dhs-nighttime-full-back-logo-v1.png",
    left: "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1788370513/dhs-nighttime-spectaculars/models/ns-model-j333-black-v1.webp",
    right:
      "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1788370516/dhs-nighttime-spectaculars/models/ns-model-l333-black-v1.webp",
    products: [
      {
        name: "J333",
        category: "Jackets",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1788370513/dhs-nighttime-spectaculars/models/ns-model-j333-black-v1.webp",
        description:
          "The saved J333 apparel look, staged for a night under the lights.",
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
      {
        name: "L333",
        category: "Jackets",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1788370516/dhs-nighttime-spectaculars/models/ns-model-l333-black-v1.webp",
        description:
          "The saved L333 apparel look, staged for a night under the lights.",
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
      {
        name: "J717",
        category: "Layers",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1788375950/dhs-nighttime-spectaculars/models/ns-model-j717-black-v2.png",
        description:
          "The saved J717 apparel look, staged for a night under the lights.",
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
      {
        name: "L717",
        category: "Layers",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1788370509/dhs-nighttime-spectaculars/models/ns-model-l717-black-v1.webp",
        description:
          "The saved L717 apparel look, staged for a night under the lights.",
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
      {
        name: "DT800",
        category: "T-shirts",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1788370502/dhs-nighttime-spectaculars/models/ns-model-dt800-black-v1.webp",
        description:
          "The saved DT800 apparel look, staged for a night under the lights.",
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
    ],
  },
  "holidays-in-hollywood": {
    title: "Holidays in Hollywood",
    style: "holiday",
    eyebrow: "Cast & crew · Wardrobe call",
    headline: "Bring on the holiday.",
    short: "Your next wardrobe call.",
    intro: "Bring a little of the boulevard home.",
    story:
      "Blue-hour lights, warm gold, and a little showtime spirit. Find your next layer in a collection made for the season.",
    background:
      "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_1600/v1786469690/hollywood-studios-shows/holidays-in-hollywood/storefront-assets/hih-hero-boulevard-blue-hour-desktop-v1.webp",
    logo: "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1786472472/hollywood-studios-shows/holidays-in-hollywood/storefront-assets/hih-vector-title-v3.png",
    left: "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1786992233/hollywood-studios-shows/holidays-in-hollywood/storefront-assets/hih-hero-cast-left-decorated-v2.png",
    right:
      "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1786992123/hollywood-studios-shows/holidays-in-hollywood/storefront-assets/hih-hero-cast-right-decorated-v2.png",
    products: [
      {
        name: "The jacket look",
        category: "Jackets",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1786040242/hollywood-studios-shows/holidays-in-hollywood/storefront-assets/hih-model-jackets-v1.png",
        description:
          "A saved jackets styling mockup from the Holidays in Hollywood collection. This preview demonstrates the look and selection flow.",
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
      {
        name: "The hoodie look",
        category: "Hoodies",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1786040245/hollywood-studios-shows/holidays-in-hollywood/storefront-assets/hih-model-hoodies-v1.png",
        description:
          "A saved hoodies styling mockup from the Holidays in Hollywood collection. This preview demonstrates the look and selection flow.",
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
      {
        name: "The headwear look",
        category: "Headwear",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1786040235/hollywood-studios-shows/holidays-in-hollywood/storefront-assets/hih-model-headwear-v1.png",
        description:
          "A saved headwear styling mockup from the Holidays in Hollywood collection. This preview demonstrates the look and selection flow.",
        sizes: ["One size"],
      },
      {
        name: "The pants look",
        category: "Pants",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1786040283/hollywood-studios-shows/holidays-in-hollywood/storefront-assets/hih-model-pants-v1.png",
        description:
          "A saved pants styling mockup from the Holidays in Hollywood collection. This preview demonstrates the look and selection flow.",
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
    ],
    categoryImages: {
      Jackets:
        "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1786991507/hollywood-studios-shows/holidays-in-hollywood/storefront-assets/hih-widget-jackets-decorated-v2.png",
      Hoodies:
        "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1786991487/hollywood-studios-shows/holidays-in-hollywood/storefront-assets/hih-widget-hoodies-decorated-v2.png",
      Headwear:
        "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1786722005/hollywood-studios-shows/holidays-in-hollywood/storefront-assets/hih-widget-headwear-decorated-v2.png",
      Pants:
        "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1786721983/hollywood-studios-shows/holidays-in-hollywood/storefront-assets/hih-widget-pants-decorated-v2.png",
    },
  },
  "disney-villains": {
    title: "Disney Villains",
    style: "villains",
    eyebrow: "The cast & crew collection",
    headline: "For the team behind the curtain.",
    short: "A little darkness. A lot of character.",
    intro: "Step through the mirror. Find your next look.",
    story:
      "An enchanted forest, an ornate mirror, and a collection with a darker side. Browse the silhouettes in violet, emerald, and midnight.",
    background:
      "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_1600/v1782237353/new_villains_hero_rwdigj.png",
    products: [
      {
        name: "The shadow hoodie",
        category: "Hoodies",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1787861539/hollywood-studios-shows/disney-villains/storefront-assets/dvst-category-hoodie-v17.png",
        description:
          "A dark hoodie study edged with the collection’s signature violet and green light.",
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
      {
        name: "The backstage polo",
        category: "Polos",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1787861517/hollywood-studios-shows/disney-villains/storefront-assets/dvst-category-polo-v17.png",
        description:
          "A polo silhouette presented in the same theatrical light as the storefront.",
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
      {
        name: "The midnight tee",
        category: "T-shirts",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1788285208/hollywood-studios-shows/disney-villains/storefront-assets/dvst-category-tshirt-v18.png",
        description:
          "A tee styling study with the collection’s dramatic, after-dark treatment.",
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
      {
        name: "The offstage jogger",
        category: "Pants",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1788285205/hollywood-studios-shows/disney-villains/storefront-assets/dvst-category-joggers-v18.png",
        description:
          "An easygoing silhouette for the quieter side of the collection.",
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
      {
        name: "The finishing cap",
        category: "Headwear",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1787861541/hollywood-studios-shows/disney-villains/storefront-assets/dvst-category-cap-v17.png",
        description: "The headwear concept from the saved collection artwork.",
        sizes: ["One size"],
      },
      {
        name: "The curtain-call backpack",
        category: "Bags",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1787861544/hollywood-studios-shows/disney-villains/storefront-assets/dvst-category-backpack-v17.png",
        description:
          "An accessory concept carried through the same rich visual world.",
        sizes: ["One size"],
      },
    ],
  },
  "beauty-and-the-beast": {
    title: "Beauty and the Beast",
    style: "anniversary",
    eyebrow: "The anniversary collection · Design study",
    headline: "A tale. A stage. A little magic.",
    short: "An encore, in every detail.",
    intro: "The story continues beyond the curtain.",
    story:
      "Gilded details, deep theatre blue, and the warmth of an illuminated stage. A collection entrance with a sense of occasion.",
    background:
      "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_1600/v1788284155/batb30-home-hero-desktop-v1.png",
    products: [
      {
        name: "The charcoal hoodie",
        category: "Hoodies",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1781633673/PC850ZH_charcoal_flat_back_copyc_otoipr.png",
        description:
          "A saved decorated hoodie mockup, shown from the back so you can inspect the show artwork.",
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
      {
        name: "The black hoodie",
        category: "Hoodies",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1781633672/PC850ZH_jetBlack_flat_back_copy_c_zidai6.png",
        description:
          "The black hoodie mockup with the collection artwork on the back.",
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
      {
        name: "The black pullover",
        category: "Pullovers",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1781633431/ST850_Black_Form_Back_copy_fwkcns.png",
        description:
          "A saved pullover mockup presented against the collection’s theatrical setting.",
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
      {
        name: "The gray jacket",
        category: "Jackets",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1781632506/OE700_geargrey_flat_back_copy_nhgypg.png",
        description:
          "The gray jacket mockup from the saved show apparel artwork.",
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
      {
        name: "The black cap",
        category: "Headwear",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1781632481/CP80_Black_Flat_Straight_copy_kjxogg.png",
        description:
          "The saved cap artwork, presented as a one-size selection example.",
        sizes: ["One size"],
      },
    ],
  },
  "jingle-bell-jingle-bam": {
    title: "Jingle Bell, Jingle BAM!",
    style: "jingle",
    eyebrow: "The holiday cast & crew collection",
    headline: "A little jingle. A whole lot of BAM.",
    short: "Shake up your holiday wardrobe.",
    intro: "The show may end. The holiday feeling doesn’t.",
    story:
      "A theatre full of color. A flurry of snow. Find your favorite piece inside a collection of miniature winter worlds.",
    background:
      "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_1600/v1788535387/hollywood-studios-shows/jingle-bell-jingle-bam/visual-assets-v1/core/jbjb-hero-theatre-base-desktop-v1.webp",
    logo: "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1788535616/hollywood-studios-shows/jingle-bell-jingle-bam/visual-assets-v1/artwork/jbjb-full-back-alpha-v1.png",
    right:
      "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1788535417/hollywood-studios-shows/jingle-bell-jingle-bam/visual-assets-v1/core/jbjb-wayne-lanny-cutout-v1.webp",
    products: [
      {
        name: "J333",
        category: "Jackets",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/e_background_removal/f_png/q_auto/c_limit,w_900/v1788533870/jbjb-source-j333-front.png",
        description:
          "A clean J333 garment reference. Switch between front and back to inspect the silhouette without a misplaced decoration.",
        sizes: ["S", "M", "L", "XL", "2XL"],
        back: "https://res.cloudinary.com/dhcmpzn9e/image/upload/e_background_removal/f_png/q_auto/c_limit,w_900/v1788533897/jbjb-source-j333-back.png",
      },
      {
        name: "L333",
        category: "Jackets",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/e_background_removal/f_png/q_auto/c_limit,w_900/v1788533895/jbjb-source-l333-front.png",
        description:
          "A clean L333 garment reference. Switch between front and back to inspect the silhouette without a misplaced decoration.",
        sizes: ["S", "M", "L", "XL", "2XL"],
        back: "https://res.cloudinary.com/dhcmpzn9e/image/upload/e_background_removal/f_png/q_auto/c_limit,w_900/v1788533892/jbjb-source-l333-back.png",
      },
      {
        name: "J717",
        category: "Layers",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/e_background_removal/f_png/q_auto/c_limit,w_900/v1788533759/j717-deep-black-flat-front-source.png",
        description:
          "A clean J717 garment reference. Switch between front and back to inspect the silhouette without a misplaced decoration.",
        sizes: ["S", "M", "L", "XL", "2XL"],
        back: "https://res.cloudinary.com/dhcmpzn9e/image/upload/e_background_removal/f_png/q_auto/c_limit,w_900/v1788533866/jbjb-source-j717-back.png",
      },
      {
        name: "L717",
        category: "Layers",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/e_background_removal/f_png/q_auto/c_limit,w_900/v1788533864/jbjb-source-l717-front.png",
        description:
          "A clean L717 garment reference. Switch between front and back to inspect the silhouette without a misplaced decoration.",
        sizes: ["S", "M", "L", "XL", "2XL"],
        back: "https://res.cloudinary.com/dhcmpzn9e/image/upload/e_background_removal/f_png/q_auto/c_limit,w_900/v1788533868/jbjb-source-l717-back.png",
      },
      {
        name: "DT800",
        category: "T-shirts",
        image:
          "https://res.cloudinary.com/dhcmpzn9e/image/upload/e_background_removal/f_png/q_auto/c_limit,w_900/v1788533901/jbjb-source-dt800-front.png",
        description:
          "A clean DT800 garment reference. Switch between front and back to inspect the silhouette without a misplaced decoration.",
        sizes: ["S", "M", "L", "XL", "2XL"],
        back: "https://res.cloudinary.com/dhcmpzn9e/image/upload/e_background_removal/f_png/q_auto/c_limit,w_900/v1788533899/jbjb-source-dt800-back.png",
      },
    ],
    categoryImages: {
      Jackets:
        "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1788535566/hollywood-studios-shows/jingle-bell-jingle-bam/visual-assets-v1/globes/jbjb-globe-j333-l333-v1.webp",
      Layers:
        "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1788535568/hollywood-studios-shows/jingle-bell-jingle-bam/visual-assets-v1/globes/jbjb-globe-j717-l717-v1.webp",
      "T-shirts":
        "https://res.cloudinary.com/dhcmpzn9e/image/upload/f_auto,q_auto,w_900/v1788535557/hollywood-studios-shows/jingle-bell-jingle-bam/visual-assets-v1/globes/jbjb-globe-dt800-v1.webp",
    },
  },
};
export type StorefrontTheme =
  | "nighttime-spectaculars"
  | "holidays-in-hollywood"
  | "disney-villains"
  | "beauty-and-the-beast"
  | "jingle-bell-jingle-bam";
