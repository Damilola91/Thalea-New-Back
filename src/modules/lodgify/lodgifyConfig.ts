export const getLodgifyApiKey = (): string => {
  const apiKey = process.env.LODGIFY_API_KEY;

  if (!apiKey) {
    throw new Error("LODGIFY_API_KEY mancante nel file .env");
  }

  return apiKey;
};

export const getLodgifyPropertyId = (): number => {
  const propertyId = process.env.LODGIFY_PROPERTY_ID;

  if (!propertyId) {
    throw new Error("LODGIFY_PROPERTY_ID mancante nel file .env");
  }

  return Number(propertyId);
};

export const getLodgifyRoomTypeId = (): number => {
  const roomTypeId = process.env.LODGIFY_ROOM_TYPE_ID;

  if (!roomTypeId) {
    throw new Error("LODGIFY_ROOM_TYPE_ID mancante nel file .env");
  }

  return Number(roomTypeId);
};
