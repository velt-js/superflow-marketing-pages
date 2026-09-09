"""Build the browser catalog from GeoNames dumps; no runtime API or API key.

Download cities15000.zip, countryInfo.txt, timeZones.txt, admin1CodesASCII.txt
from https://download.geonames.org/export/dump/ into an input directory.
Run: python3 scripts/meeting-planner/build-locations.py /path/to/input
GeoNames data is CC BY 4.0; the tool and data file preserve attribution.
"""
import datetime
import json
import pathlib
import sys
import zipfile

source = pathlib.Path(sys.argv[1])
countries = {}
for line in (source / "countryInfo.txt").read_text().splitlines():
    if not line or line.startswith("#"):
        continue
    cols = line.split("\t")
    countries[cols[0]] = {"name": cols[4], "zones": []}
for line in (source / "timeZones.txt").read_text().splitlines()[1:]:
    cols = line.split("\t")
    if cols[0] in countries:
        countries[cols[0]]["zones"].append(cols[1])
regions = {}
for line in (source / "admin1CodesASCII.txt").read_text().splitlines():
    cols = line.split("\t")
    regions[cols[0]] = cols[1]
rows = []
with zipfile.ZipFile(source / "cities15000.zip") as archive:
    for line in archive.read("cities15000.txt").decode().splitlines():
        c = line.split("\t")
        if c[8] not in countries or not c[17]:
            continue
        # Keep useful alternative spellings without shipping every translation.
        aliases = list(dict.fromkeys([c[2]] + [s for s in c[3].split(",") if s.isascii() and len(s) > 2]))[:12]
        rows.append([c[0], c[1], c[8], regions.get(c[8] + "." + c[10], ""), c[17], int(c[14]), " ".join(aliases)])
rows.sort(key=lambda row: (-row[5], row[0]))
output = pathlib.Path(__file__).resolve().parents[2] / "public/data/meeting-locations.json"
output.write_text(json.dumps({"source": "https://www.geonames.org/", "license": "https://creativecommons.org/licenses/by/4.0/", "built": datetime.date.today().isoformat(), "countries": countries, "cities": rows}, ensure_ascii=False, separators=(",", ":")))
print(f"Wrote {len(rows)} cities, {len(countries)} countries; {output.stat().st_size:,} bytes")
