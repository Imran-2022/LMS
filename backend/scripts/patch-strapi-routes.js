const fs = require("fs");
const path = require("path");

const usersPermissionsPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "@strapi",
  "plugin-users-permissions",
  "dist",
  "server",
  "services",
  "users-permissions.js",
);

const coreRoutesPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "@strapi",
  "core",
  "dist",
  "services",
  "server",
  "register-routes.js",
);

if (fs.existsSync(usersPermissionsPath)) {
  const source = fs.readFileSync(usersPermissionsPath, "utf8");
  const updated = source
    .replace(
      ".filter(() => true)",
      ".filter((route)=>typeof route?.path === 'string')",
    )
    .replace(
      ".filter((route)=>route?.info?.type === 'content-api' || route?.info?.apiName)",
      ".filter((route)=>typeof route?.path === 'string')",
    )
    .replaceAll(
      ".filter((route)=>route.info.type === 'content-api')",
      ".filter((route)=>route?.info?.type === 'content-api' || route?.info?.apiName)",
    )
    .replaceAll(
      ".filter((route)=>route?.info?.type === 'content-api')",
      ".filter((route)=>typeof route?.path === 'string')",
    );

  if (updated !== source) {
    fs.writeFileSync(usersPermissionsPath, updated);
  }
}

if (fs.existsSync(coreRoutesPath)) {
  const source = fs.readFileSync(coreRoutesPath, "utf8");
  const updated = source.replace(
    "route.info = {\n                    apiName\n                };",
    "route.info = {\n                    apiName,\n                    type: 'content-api'\n                };",
  );

  if (updated !== source) {
    fs.writeFileSync(coreRoutesPath, updated);
  }
}
