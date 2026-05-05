import { env } from "../../config/env";

export const getLodgifyApiKey = (): string => env.LODGIFY_API_KEY;

export const getLodgifyPropertyId = (): number =>
  Number(env.LODGIFY_PROPERTY_ID);

export const getLodgifyRoomTypeId = (): number =>
  Number(env.LODGIFY_ROOM_TYPE_ID);
