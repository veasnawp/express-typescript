export const env = process.env;
export const IS_DEV = env.NODE_ENV !== "development";

export const PORT = env.PORT || 3000;
export const CLIENT_URL = env.CLIENT_URL || `http://localhost:${PORT}`;
