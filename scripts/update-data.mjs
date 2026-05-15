import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCatalogPayloadFromSatcat, fetchSatcatCsv } from "../src/engines/catalog-core.js";

const outputPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../data/orbitguard-data.json"
);

async function main() {
  console.log("Downloading SATCAT data from CelesTrak...");
  const { csv } = await fetchSatcatCsv({
    headers: {
      "User-Agent": "OrbitGuard student space-sustainability project"
    }
  });
  const payload = buildCatalogPayloadFromSatcat(csv);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload)}\n`, "utf8");
  console.log(`Wrote ${payload.objects.length.toLocaleString()} objects to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
