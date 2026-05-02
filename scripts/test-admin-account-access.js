const { existsSync, readFileSync } = require("node:fs");
const { join } = require("node:path");

const root = process.cwd();
const adminShellPath = join(root, "src/components/admin/admin-shell.tsx");
const accountPagePath = join(root, "src/app/admin/account/[[...account]]/page.tsx");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(existsSync(adminShellPath), "Admin shell component is missing");
assert(existsSync(accountPagePath), "Admin account settings page is missing");

const adminShell = readFileSync(adminShellPath, "utf8");
const accountPage = readFileSync(accountPagePath, "utf8");

assert(
  adminShell.includes('href: "/admin/account"'),
  "Admin shell must expose an Account Security nav item"
);
assert(
  adminShell.includes('userProfileMode="navigation"') &&
    adminShell.includes('userProfileUrl="/admin/account"'),
  "Admin UserButton must route Manage account to /admin/account"
);
assert(
  accountPage.includes("UserProfile") &&
    accountPage.includes('routing="path"') &&
    accountPage.includes('path="/admin/account"'),
  "Admin account page must mount Clerk UserProfile with path routing"
);

console.log("Admin account settings access is wired to Clerk UserProfile.");
