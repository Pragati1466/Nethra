// Bengaluru landmarks rendered as labels on the digital twin. Picked for instant
// recognition by traffic operators and judges familiar with the city.
export type Landmark = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: "junction" | "corridor" | "stadium" | "transit" | "district" | "market";
};

export const LANDMARKS: Landmark[] = [
  { id: "silk-board", name: "Silk Board", lat: 12.9176, lng: 77.6233, kind: "junction" },
  { id: "electronic-city", name: "Electronic City", lat: 12.8452, lng: 77.6602, kind: "district" },
  { id: "mg-road", name: "MG Road", lat: 12.9756, lng: 77.6050, kind: "corridor" },
  { id: "kr-market", name: "KR Market", lat: 12.9613, lng: 77.5746, kind: "market" },
  { id: "majestic", name: "Majestic", lat: 12.9774, lng: 77.5710, kind: "transit" },
  { id: "hebbal", name: "Hebbal Flyover", lat: 13.0358, lng: 77.5970, kind: "junction" },
  { id: "whitefield", name: "Whitefield", lat: 12.9698, lng: 77.7500, kind: "district" },
  { id: "marathahalli", name: "Marathahalli", lat: 12.9591, lng: 77.6974, kind: "junction" },
  { id: "kr-puram", name: "KR Puram", lat: 13.0070, lng: 77.6960, kind: "junction" },
  { id: "yeshwanthpur", name: "Yeshwanthpur", lat: 13.0287, lng: 77.5403, kind: "transit" },
  { id: "indiranagar", name: "Indiranagar", lat: 12.9719, lng: 77.6412, kind: "district" },
  { id: "koramangala", name: "Koramangala", lat: 12.9352, lng: 77.6245, kind: "district" },
  { id: "jayanagar", name: "Jayanagar", lat: 12.9250, lng: 77.5938, kind: "district" },
  { id: "btm", name: "BTM Layout", lat: 12.9166, lng: 77.6101, kind: "district" },
  { id: "bel-circle", name: "BEL Circle", lat: 13.0383, lng: 77.5570, kind: "junction" },
  { id: "trinity", name: "Trinity Circle", lat: 12.9722, lng: 77.6196, kind: "junction" },
  { id: "chinnaswamy", name: "Chinnaswamy Stadium", lat: 12.9788, lng: 77.5996, kind: "stadium" },
  { id: "cubbon", name: "Cubbon Park", lat: 12.9763, lng: 77.5929, kind: "district" },
  { id: "orr-bellandur", name: "ORR · Bellandur", lat: 12.9352, lng: 77.6750, kind: "corridor" },
  { id: "orr-marathahalli", name: "ORR · Marathahalli", lat: 12.9590, lng: 77.7010, kind: "corridor" },
  { id: "hosur-road", name: "Hosur Road", lat: 12.8950, lng: 77.6420, kind: "corridor" },
  { id: "bellary-road", name: "Bellary Road", lat: 13.0100, lng: 77.5900, kind: "corridor" },
  { id: "airport", name: "Kempegowda Airport", lat: 13.1986, lng: 77.7066, kind: "transit" },
];
