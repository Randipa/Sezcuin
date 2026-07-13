export const jwtSecret = new sst.Secret("JwtSecret", "change-me-dev-only");

export const seedAdminEmail = new sst.Secret("SeedAdminEmail", "admin@gmail.com");
export const seedAdminPassword = new sst.Secret("SeedAdminPassword", "Admin0987");
export const seedAdminFirstName = new sst.Secret("SeedAdminFirstName", "Admin");
export const seedAdminLastName = new sst.Secret("SeedAdminLastName", "Admin1");
