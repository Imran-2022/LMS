const fs = require("fs");
const path = require("path");

const filePath = path.join(
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

if (!fs.existsSync(filePath)) {
  process.exit(0);
}

const source = fs.readFileSync(filePath, "utf8");
const updated = source.replaceAll(
  ".filter((route)=>route.info.type === 'content-api')",
  ".filter((route)=>route?.info?.type === 'content-api')",
);

if (updated !== source) {
  fs.writeFileSync(filePath, updated);
}
