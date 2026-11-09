let adminAccessToken: string | null = null;

export function getAdminAccessToken() {
  return adminAccessToken;
}

export function setAdminAccessToken(token: string | null) {
  adminAccessToken = token;
}

export function clearAdminAccessToken() {
  adminAccessToken = null;
}