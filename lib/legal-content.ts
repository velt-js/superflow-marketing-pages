import fs from "node:fs";
import path from "node:path";

function loadAndClean(fileName: string): string {
  const filePath = path.join(process.cwd(), fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  return raw
    .replace(/\sclass="framer-text(?:[^"]*)"/g, "")
    .replace(/\sclass="trailing-break"/g, "")
    .replace(/\sdata-styles-preset="[^"]*"/g, "")
    .replace(/\sdata-framer-component-type="[^"]*"/g, "")
    .replace(/\sdata-framer-name="[^"]*"/g, "")
    .replace(/<!--\$-->/g, "")
    .replace(/<!--\/\$-->/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/‍/g, "")
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, "");
}

export const privacyHtml = loadAndClean("privacy.html");
export const termsHtml = loadAndClean("terms.html");
