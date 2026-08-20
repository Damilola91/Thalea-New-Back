/**
 * Migrazione amenities: string[] → ILocalizedText[]
 *
 * Uso:
 *   npx ts-node src/scripts/migrateAmenities.ts           (dry run, non scrive)
 *   npx ts-node src/scripts/migrateAmenities.ts --apply   (scrive sul DB)
 *
 * Lo script è idempotente: se le amenities sono già nel nuovo formato
 * (oggetti con chiave `it`) non le tocca.
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import ApartmentModel from "../modules/apartment/apartmentModel";
import type { ILocalizedText } from "../modules/apartment/apartmentTypes";

dotenv.config();

const APPLY = process.argv.includes("--apply");

/**
 * Dizionario di traduzione per le amenities esistenti.
 * Chiave = testo italiano attualmente nel DB.
 */
const TRANSLATIONS: Record<string, Omit<ILocalizedText, "it">> = {
  // ---------- GENERAL ----------
  "Appartamento intero a uso esclusivo": {
    en: "Entire apartment for exclusive use",
    de: "Gesamte Wohnung zur alleinigen Nutzung",
    fr: "Appartement entier à usage exclusif",
    es: "Apartamento entero de uso exclusivo",
    zh: "整套公寓独享",
  },
  "Superficie 53 m²": {
    en: "53 m² floor area",
    de: "Wohnfläche 53 m²",
    fr: "Surface de 53 m²",
    es: "Superficie de 53 m²",
    zh: "面积 53 平方米",
  },
  "Wi-Fi gratuito": {
    en: "Free Wi-Fi",
    de: "Kostenloses WLAN",
    fr: "Wi-Fi gratuit",
    es: "Wi-Fi gratuito",
    zh: "免费无线网络",
  },
  "Wi-Fi veloce (circa 460 Mbps)": {
    en: "Fast Wi-Fi (around 460 Mbps)",
    de: "Schnelles WLAN (ca. 460 Mbit/s)",
    fr: "Wi-Fi rapide (environ 460 Mbps)",
    es: "Wi-Fi rápido (unos 460 Mbps)",
    zh: "高速无线网络（约 460 Mbps）",
  },
  "Aria condizionata": {
    en: "Air conditioning",
    de: "Klimaanlage",
    fr: "Climatisation",
    es: "Aire acondicionado",
    zh: "空调",
  },
  "Camere non fumatori": {
    en: "Non-smoking rooms",
    de: "Nichtraucherzimmer",
    fr: "Chambres non-fumeurs",
    es: "Habitaciones para no fumadores",
    zh: "无烟房间",
  },
  Ascensore: {
    en: "Elevator",
    de: "Aufzug",
    fr: "Ascenseur",
    es: "Ascensor",
    zh: "电梯",
  },
  Insonorizzazione: {
    en: "Soundproofing",
    de: "Schallschutz",
    fr: "Insonorisation",
    es: "Insonorización",
    zh: "隔音",
  },
  "Pavimento piastrellato/in marmo": {
    en: "Tiled/marble flooring",
    de: "Fliesen-/Marmorboden",
    fr: "Sol carrelé/en marbre",
    es: "Suelo de baldosas/mármol",
    zh: "瓷砖/大理石地板",
  },
  Terrazza: {
    en: "Terrace",
    de: "Terrasse",
    fr: "Terrasse",
    es: "Terraza",
    zh: "露台",
  },
  Balcone: {
    en: "Balcony",
    de: "Balkon",
    fr: "Balcon",
    es: "Balcón",
    zh: "阳台",
  },
  "Culla disponibile su richiesta": {
    en: "Crib available on request",
    de: "Kinderbett auf Anfrage",
    fr: "Lit bébé disponible sur demande",
    es: "Cuna disponible bajo petición",
    zh: "可应要求提供婴儿床",
  },
  "Ingresso indipendente": {
    en: "Private entrance",
    de: "Separater Eingang",
    fr: "Entrée indépendante",
    es: "Entrada independiente",
    zh: "独立入口",
  },
  "Piano raggiungibile con ascensore": {
    en: "Floor accessible by elevator",
    de: "Etage mit Aufzug erreichbar",
    fr: "Étage accessible par ascenseur",
    es: "Planta accesible en ascensor",
    zh: "楼层可乘电梯到达",
  },
  TV: {
    en: "TV",
    de: "TV",
    fr: "Télévision",
    es: "TV",
    zh: "电视",
  },
  "Servizi di streaming (Netflix)": {
    en: "Streaming services (Netflix)",
    de: "Streamingdienste (Netflix)",
    fr: "Services de streaming (Netflix)",
    es: "Servicios de streaming (Netflix)",
    zh: "流媒体服务（Netflix）",
  },
  "Connessione Internet in tutte le aree": {
    en: "Internet access in all areas",
    de: "Internetzugang in allen Bereichen",
    fr: "Accès Internet dans toutes les zones",
    es: "Conexión a Internet en todas las áreas",
    zh: "所有区域均有网络连接",
  },
  "Struttura non fumatori": {
    en: "Non-smoking property",
    de: "Nichtraucher-Unterkunft",
    fr: "Établissement non-fumeurs",
    es: "Alojamiento para no fumadores",
    zh: "禁烟住所",
  },
  "Animali non ammessi": {
    en: "Pets not allowed",
    de: "Haustiere nicht erlaubt",
    fr: "Animaux non admis",
    es: "No se admiten mascotas",
    zh: "不允许携带宠物",
  },
  "Feste/eventi non consentiti": {
    en: "Parties/events not allowed",
    de: "Partys/Veranstaltungen nicht gestattet",
    fr: "Fêtes/événements non autorisés",
    es: "No se permiten fiestas/eventos",
    zh: "不允许举办派对/活动",
  },
  "Età minima check-in 18 anni": {
    en: "Minimum check-in age: 18",
    de: "Mindestalter beim Check-in: 18 Jahre",
    fr: "Âge minimum à l'arrivée : 18 ans",
    es: "Edad mínima para el check-in: 18 años",
    zh: "入住最低年龄 18 岁",
  },
  "Fascia di silenzio 01:00–05:00": {
    en: "Quiet hours 01:00–05:00",
    de: "Ruhezeiten 01:00–05:00 Uhr",
    fr: "Heures de silence 01h00–05h00",
    es: "Horario de silencio 01:00–05:00",
    zh: "安静时段 01:00–05:00",
  },
  "Check-in flessibile su accordo": {
    en: "Flexible check-in by arrangement",
    de: "Flexibler Check-in nach Absprache",
    fr: "Arrivée flexible sur accord",
    es: "Check-in flexible previo acuerdo",
    zh: "可协商弹性入住",
  },
  "Assistenza all'arrivo": {
    en: "Assistance on arrival",
    de: "Unterstützung bei der Ankunft",
    fr: "Assistance à l'arrivée",
    es: "Asistencia a la llegada",
    zh: "抵达时提供协助",
  },
  "Informazioni turistiche locali": {
    en: "Local tourist information",
    de: "Lokale Touristeninformationen",
    fr: "Informations touristiques locales",
    es: "Información turística local",
    zh: "当地旅游信息",
  },
  "Consigli su ristoranti e attrazioni": {
    en: "Restaurant and attraction recommendations",
    de: "Empfehlungen zu Restaurants und Sehenswürdigkeiten",
    fr: "Conseils sur les restaurants et attractions",
    es: "Recomendaciones de restaurantes y atracciones",
    zh: "餐厅和景点推荐",
  },
  "Vino/bevanda di benvenuto": {
    en: "Welcome wine/drink",
    de: "Begrüßungswein/-getränk",
    fr: "Vin/boisson de bienvenue",
    es: "Vino/bebida de bienvenida",
    zh: "欢迎酒水",
  },
  "Sedie per esterno": {
    en: "Outdoor chairs",
    de: "Außenstühle",
    fr: "Chaises d'extérieur",
    es: "Sillas de exterior",
    zh: "户外座椅",
  },
  "Tavolo da esterno": {
    en: "Outdoor table",
    de: "Außentisch",
    fr: "Table d'extérieur",
    es: "Mesa de exterior",
    zh: "户外餐桌",
  },
  "Illuminazione e arredi moderni recentemente rinnovati": {
    en: "Recently renovated modern lighting and furnishings",
    de: "Kürzlich renovierte moderne Beleuchtung und Einrichtung",
    fr: "Éclairage et mobilier modernes récemment rénovés",
    es: "Iluminación y mobiliario modernos recientemente renovados",
    zh: "近期翻新的现代照明与家具",
  },

  // ---------- KITCHEN ----------
  "Cucina completa": {
    en: "Fully equipped kitchen",
    de: "Voll ausgestattete Küche",
    fr: "Cuisine entièrement équipée",
    es: "Cocina completa",
    zh: "全套厨房",
  },
  "Piano cottura": {
    en: "Stovetop",
    de: "Kochfeld",
    fr: "Plaque de cuisson",
    es: "Placa de cocina",
    zh: "灶台",
  },
  Frigorifero: {
    en: "Refrigerator",
    de: "Kühlschrank",
    fr: "Réfrigérateur",
    es: "Frigorífico",
    zh: "冰箱",
  },
  Microonde: {
    en: "Microwave",
    de: "Mikrowelle",
    fr: "Micro-ondes",
    es: "Microondas",
    zh: "微波炉",
  },
  "Macchina da caffè": {
    en: "Coffee machine",
    de: "Kaffeemaschine",
    fr: "Machine à café",
    es: "Cafetera",
    zh: "咖啡机",
  },
  "Macchina per tè/caffè": {
    en: "Tea/coffee maker",
    de: "Tee-/Kaffeemaschine",
    fr: "Machine à thé/café",
    es: "Set de té/café",
    zh: "茶/咖啡机",
  },
  "Bollitore elettrico": {
    en: "Electric kettle",
    de: "Wasserkocher",
    fr: "Bouilloire électrique",
    es: "Hervidor eléctrico",
    zh: "电热水壶",
  },
  "Tavolo da pranzo": {
    en: "Dining table",
    de: "Esstisch",
    fr: "Table à manger",
    es: "Mesa de comedor",
    zh: "餐桌",
  },
  "Utensili da cucina": {
    en: "Kitchen utensils",
    de: "Küchenutensilien",
    fr: "Ustensiles de cuisine",
    es: "Utensilios de cocina",
    zh: "厨房用具",
  },
  "Bicchieri e stoviglie": {
    en: "Glassware and tableware",
    de: "Gläser und Geschirr",
    fr: "Verres et vaisselle",
    es: "Vasos y vajilla",
    zh: "玻璃杯与餐具",
  },
  "Calici da vino": {
    en: "Wine glasses",
    de: "Weingläser",
    fr: "Verres à vin",
    es: "Copas de vino",
    zh: "红酒杯",
  },
  "Zona pranzo": {
    en: "Dining area",
    de: "Essbereich",
    fr: "Coin repas",
    es: "Zona de comedor",
    zh: "用餐区",
  },
  "Zona soggiorno": {
    en: "Living area",
    de: "Wohnbereich",
    fr: "Coin salon",
    es: "Zona de estar",
    zh: "起居区",
  },

  // ---------- BATHROOM ----------
  "Bagno privato": {
    en: "Private bathroom",
    de: "Eigenes Badezimmer",
    fr: "Salle de bain privée",
    es: "Baño privado",
    zh: "独立卫浴",
  },
  Doccia: {
    en: "Shower",
    de: "Dusche",
    fr: "Douche",
    es: "Ducha",
    zh: "淋浴",
  },
  Bidet: {
    en: "Bidet",
    de: "Bidet",
    fr: "Bidet",
    es: "Bidé",
    zh: "坐浴盆",
  },
  Asciugamani: {
    en: "Towels",
    de: "Handtücher",
    fr: "Serviettes",
    es: "Toallas",
    zh: "毛巾",
  },
  Accappatoi: {
    en: "Bathrobes",
    de: "Bademäntel",
    fr: "Peignoirs",
    es: "Albornoces",
    zh: "浴袍",
  },
  "Set di cortesia gratuito": {
    en: "Complimentary toiletries",
    de: "Kostenlose Pflegeprodukte",
    fr: "Produits d'accueil gratuits",
    es: "Artículos de aseo gratuitos",
    zh: "免费洗漱用品",
  },
  Asciugacapelli: {
    en: "Hairdryer",
    de: "Haartrockner",
    fr: "Sèche-cheveux",
    es: "Secador de pelo",
    zh: "吹风机",
  },

  // ---------- OUTDOOR ----------
  "Terrazza privata": {
    en: "Private terrace",
    de: "Private Terrasse",
    fr: "Terrasse privée",
    es: "Terraza privada",
    zh: "私人露台",
  },

  // ---------- LAUNDRY ----------
  Lavatrice: {
    en: "Washing machine",
    de: "Waschmaschine",
    fr: "Lave-linge",
    es: "Lavadora",
    zh: "洗衣机",
  },
  "Biancheria da letto inclusa": {
    en: "Bed linen included",
    de: "Bettwäsche inklusive",
    fr: "Linge de lit inclus",
    es: "Ropa de cama incluida",
    zh: "含床上用品",
  },
};

type RawAmenity = string | ILocalizedText | Record<string, unknown>;

const isAlreadyMigrated = (item: RawAmenity): item is ILocalizedText =>
  typeof item === "object" &&
  item !== null &&
  typeof (item as { it?: unknown }).it === "string";

const toLocalized = (item: RawAmenity): ILocalizedText | null => {
  if (isAlreadyMigrated(item)) return item;
  if (typeof item !== "string") return null;

  const translations = TRANSLATIONS[item];
  if (!translations) {
    console.warn(
      `  ⚠ Nessuna traduzione per: "${item}" — resta solo in italiano`,
    );
    return { it: item };
  }
  return { it: item, ...translations };
};

const run = async (): Promise<void> => {
  const uri = process.env.DB_URI;
  if (!uri) {
    console.error("DB_URI mancante nel .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connesso al DB — modalità: ${APPLY ? "APPLY" : "DRY RUN"}\n`);

  const apartments = await ApartmentModel.find({}).lean();
  console.log(`Trovati ${apartments.length} appartamenti\n`);

  const categories = [
    "general",
    "kitchen",
    "bathroom",
    "outdoor",
    "laundry",
  ] as const;
  let missingCount = 0;

  for (const apt of apartments) {
    console.log(`── ${apt.name} (${apt._id})`);

    const migrated: Record<string, ILocalizedText[]> = {};

    for (const cat of categories) {
      const raw = (apt.amenities?.[cat] ?? []) as unknown as RawAmenity[];

      for (const item of raw) {
        if (typeof item === "string" && !TRANSLATIONS[item]) {
          missingCount++;
        }
      }

      const converted = raw
        .map(toLocalized)
        .filter((x): x is ILocalizedText => x !== null);

      migrated[cat] = converted;
      console.log(`   ${cat}: ${raw.length} → ${converted.length}`);
    }

    if (APPLY) {
      await ApartmentModel.updateOne(
        { _id: apt._id },
        { $set: { amenities: migrated } },
      );
      console.log("   ✓ scritto sul DB");
    }
    console.log("");
  }

  if (missingCount > 0) {
    console.log(
      `⚠ ${missingCount} amenities senza traduzione — resteranno in italiano.`,
    );
    console.log("  Puoi tradurle dalla dashboard admin dopo la migrazione.\n");
  }

  if (!APPLY) {
    console.log(
      "DRY RUN completato. Rilancia con --apply per scrivere sul DB.",
    );
  } else {
    console.log("Migrazione completata.");
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Migrazione fallita:", err);
  process.exit(1);
});
