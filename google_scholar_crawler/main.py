from scholarly import scholarly
import json
from datetime import datetime
import os
import sys

# =========================
# CONFIG
# =========================
DEFAULT_SCHOLAR_ID = "8Ni9HBQAAAAJ"
OUTPUT_DIR = "../google-scholar-stats"   # ← 关键修改

# =========================
# GET SCHOLAR ID
# =========================
scholar_id = os.getenv("GOOGLE_SCHOLAR_ID", DEFAULT_SCHOLAR_ID)
print(f"[INFO] Using Scholar ID: {scholar_id}")

# =========================
# FETCH DATA
# =========================
try:
    author = scholarly.search_author_id(scholar_id)
    scholarly.fill(author, sections=["basics", "indices", "counts", "publications"])
except Exception as e:
    print("[ERROR] Failed to fetch scholar data")
    print(e)
    sys.exit(1)

# =========================
# PROCESS DATA
# =========================
author["updated"] = datetime.utcnow().isoformat()
author["publications"] = {
    v["author_pub_id"]: v for v in author.get("publications", [])
}

citations = author.get("citedby", "0")
print(f"[INFO] Current citations: {citations}")

# =========================
# SAVE FILES
# =========================
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Full data
with open(f"{OUTPUT_DIR}/gs_data.json", "w") as f:
    json.dump(author, f, ensure_ascii=False, indent=2)

# Shields.io data
shieldio_data = {
    "schemaVersion": 1,
    "label": "citations",
    "message": str(citations),
    "color": "9cf"
}

with open(f"{OUTPUT_DIR}/gs_data_shieldsio.json", "w") as f:
    json.dump(shieldio_data, f, ensure_ascii=False)

print("[SUCCESS] Scholar data updated successfully!")

