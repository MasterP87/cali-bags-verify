/**
 * CALI WEED — OFFICIAL 6-DIGIT PRODUCT VERIFICATION CODE LIST
 * ============================================================
 * How to add your product codes:
 * Option A: Paste your 6-digit codes (one per line, space-separated, or comma-separated)
 *           inside the `RAW_CODES_LIST` template string below.
 * Option B: Add 6-digit strings directly into the `VALID_PRODUCT_CODES` array.
 *
 * Every 6-digit code listed in either `RAW_CODES_LIST` or `VALID_PRODUCT_CODES`
 * will be recognized as an AUTHENTIC Cali Weed product.
 */

const RAW_CODES_LIST = `
420710
849201
104938
773829
550192
918273
604821
339104
284719
004200
112233
654321
888420
900100
710420
`;

const VALID_PRODUCT_CODES = [
  "420710",
  "849201",
  "104938",
  "773829",
  "550192",
  "918273",
  "604821",
  "339104",
  "284719",
  "004200",
  "112233",
  "654321",
  "888420",
  "900100",
  "710420"
];

/**
 * Optional strain & batch telemetry mapped to verified codes.
 * Any valid 6-digit code without an explicit entry below automatically receives
 * deterministic California batch telemetry from this catalog.
 */
const CALI_STRAIN_CATALOG = [
  {
    name: "Blue Dream",
    genetics: "Blueberry × Super Silver Haze",
    type: "Sativa-Dominant Hybrid",
    thc: "24.8%",
    terpenes: "Myrcene, Pinene, Caryophyllene",
    breeder: "Vanessa Malwin — Master Horticulture Lead",
    origin: "Sunny Av., CA 10019",
    url: "https://cali-weed.com/blue-dream/",
    image: "https://cali-weed.com/wp-content/uploads/2020/09/blue-dream-1.jpg",
    price: "$16.00",
    description: "This signature cut of Blue Dream is crafted from classic Blueberry crossed with a selected Super Silver Haze phenotype."
  },
  {
    name: "Girl Scout Cookies",
    genetics: "OG Kush × Durban Poison",
    type: "Indica-Dominant Hybrid",
    thc: "27.4%",
    terpenes: "Caryophyllene, Limonene, Humulene",
    breeder: "Vanessa Malwin — Master Horticulture Lead",
    origin: "Sunny Av., CA 10019",
    url: "https://cali-weed.com/girl-scout-cookies/",
    image: "https://cali-weed.com/wp-content/uploads/2020/09/girl-scout-1.jpg",
    price: "$16.00",
    description: "With a sweet and earthy aroma, Girl Scout Cookies launches you to euphoria’s top floor where full-body relaxation meets a time-bending cerebral space."
  },
  {
    name: "Cali Glue",
    genetics: "Chem's Sister × Sour Dubb × Chocolate Diesel",
    type: "Indica-Dominant (GG #4 Cut)",
    thc: "29.1%",
    terpenes: "Caryophyllene, Myrcene, Limonene",
    breeder: "Vanessa Malwin — Master Horticulture Lead",
    origin: "Sunny Av., CA 10019",
    url: "https://cali-weed.com/cali-glue/",
    image: "https://cali-weed.com/wp-content/uploads/2020/09/cali-glue-1.jpg",
    price: "$16.00",
    description: "An indica-dominant powerhouse, Cali Glue (aka Gorilla Glue #4) is renowned for its intense cerebral elevation and heavy resin production."
  },
  {
    name: "Sunset Sherbet",
    genetics: "Girl Scout Cookies × Pink Panties",
    type: "Indica-Dominant Reserve",
    thc: "26.6%",
    terpenes: "Caryophyllene, Limonene, Linalool",
    breeder: "Vanessa Malwin — Master Horticulture Lead",
    origin: "Sunny Av., CA 10019",
    url: "https://cali-weed.com/sunset-sherbet/",
    image: "https://cali-weed.com/wp-content/uploads/2020/09/sunset-1.jpg",
    price: "$21.50",
    description: "Sunset Sherbet is a notorious indica-dominant hybrid with a deep full-body effect descended from the legendary Girl Scout Cookies."
  }
];

window.CALI_VERIFICATION_CONFIG = {
  RAW_CODES_LIST,
  VALID_PRODUCT_CODES,
  CALI_STRAIN_CATALOG
};
