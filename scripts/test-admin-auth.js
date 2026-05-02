const { existsSync, readFileSync } = require("node:fs");
const { join } = require("node:path");

const root = process.cwd();
const adminShellPath = join(root, "src/components/admin/admin-shell.tsx");
const adminAuthPath = join(root, "src/lib/admin/auth.ts");
const adminLayoutPath = join(root, "src/app/admin/layout.tsx");
const accountPagePath = join(root, "src/app/admin/account/[[...account]]/page.tsx");
const packageJsonPath = join(root, "package.json");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(existsSync(adminShellPath), "Admin shell component is missing");
assert(existsSync(adminAuthPath), "Admin auth helper is missing");
assert(existsSync(adminLayoutPath), "Admin layout is missing");
assert(!existsSync(accountPagePath), "Embedded admin account page should be removed");

const adminShell = readFileSync(adminShellPath, "utf8");
const adminAuth = readFileSync(adminAuthPath, "utf8");
const adminLayout = readFileSync(adminLayoutPath, "utf8");
const packageJson = readFileSync(packageJsonPath, "utf8");

assert(
  !adminShell.includes('href: "/admin/account"') && !adminShell.includes('userProfileUrl="/admin/account"'),
  "Admin shell must not link to the removed embedded account page"
);
assert(
  adminShell.includes("https://accounts.jacobbarkin.com/user") &&
    adminShell.includes("redirect_url="),
  "Admin shell must link account management to Clerk Account Portal with a redirect URL"
);
assert(adminShell.includes("UserButton"), "Admin account chip must use Clerk's UserButton");
assert(adminShell.includes("showName"), "Clerk UserButton should show the signed-in user's name");
assert(adminShell.includes('userProfileMode="navigation"'), "Clerk UserButton must navigate to Account Portal");
assert(!adminShell.includes("SignOutButton"), "Admin shell should not render a duplicate sign-out button");
assert(!adminShell.includes("useClerk"), "Admin shell should not keep custom useClerk sign-out wiring");
assert(!adminShell.includes("useUser"), "Admin shell should not duplicate Clerk's account chip state");
assert(!adminShell.includes("UserRound"), "Admin shell should not render a custom account chip icon");
assert(!adminAuth.includes("ADMIN_EMAIL"), "Admin auth helper must not depend on ADMIN_EMAIL");
assert(!adminAuth.includes("currentUser"), "Admin auth helper should treat signed-in Clerk users as admins");
assert(adminLayout.includes("getAdminAuth") && !adminLayout.includes("notFound"), "Admin layout must only require a signed-in Clerk user");
assert(packageJson.includes("test:admin-auth"), "Package scripts must expose the admin auth regression check");
assert(!packageJson.includes("test:admin-account-access"), "Old embedded account regression script should be removed");

console.log("Admin auth, account portal, and sign-out wiring look correct.");
