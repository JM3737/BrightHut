#!/usr/bin/env python3
"""
Build database/brighthut.sqlite from schema_sqlite.sql + database/seed-csv/*.csv

Run from repo root:
  python database/build_sqlite.py

Requires Python 3.9+ (stdlib only).
"""

from __future__ import annotations

import csv
import sqlite3
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = REPO_ROOT / "database" / "brighthut.sqlite"
SCHEMA_PATH = REPO_ROOT / "database" / "schema_sqlite.sql"
SEED_DIR = REPO_ROOT / "database" / "seed-csv"

# CSV uses True/False; SQLite stores these as INTEGER 0/1.
BOOL_COL_NAMES = frozenset(
    {
        "is_primary",
        "is_recurring",
        "has_call_to_action",
        "features_resident_story",
        "is_boosted",
        "sub_cat_orphaned",
        "sub_cat_trafficked",
        "sub_cat_child_labor",
        "sub_cat_physical_abuse",
        "sub_cat_sexual_abuse",
        "sub_cat_osaec",
        "sub_cat_cicl",
        "sub_cat_at_risk",
        "sub_cat_street_child",
        "sub_cat_child_with_hiv",
        "is_pwd",
        "has_special_needs",
        "family_is_4ps",
        "family_solo_parent",
        "family_indigenous",
        "family_parent_pwd",
        "family_informal_settler",
        "progress_noted",
        "concerns_flagged",
        "referral_made",
        "safety_concerns_noted",
        "follow_up_needed",
        "medical_checkup_done",
        "dental_checkup_done",
        "psychological_checkup_done",
        "resolved",
        "follow_up_required",
        "is_published",
    }
)

# Import order respects foreign keys.
TABLE_FILES: list[tuple[str, str]] = [
    ("safehouses", "safehouses.csv"),
    ("partners", "partners.csv"),
    ("partner_assignments", "partner_assignments.csv"),
    ("supporters", "supporters.csv"),
    ("social_media_posts", "social_media_posts.csv"),
    ("donations", "donations.csv"),
    ("in_kind_donation_items", "in_kind_donation_items.csv"),
    ("donation_allocations", "donation_allocations.csv"),
    ("residents", "residents.csv"),
    ("process_recordings", "process_recordings.csv"),
    ("home_visitations", "home_visitations.csv"),
    ("education_records", "education_records.csv"),
    ("health_wellbeing_records", "health_wellbeing_records.csv"),
    ("intervention_plans", "intervention_plans.csv"),
    ("incident_reports", "incident_reports.csv"),
    ("safehouse_monthly_metrics", "safehouse_monthly_metrics.csv"),
    ("public_impact_snapshots", "public_impact_snapshots.csv"),
]


def normalize_cell(column: str, value: str | None) -> str | int | float | None:
    if value is None:
        return None
    s = value.strip()
    if s == "":
        return None
    if column in BOOL_COL_NAMES and s.lower() in ("true", "false"):
        return 1 if s.lower() == "true" else 0
    return value


def load_rows(path: Path) -> list[dict[str, str | None]]:
    with path.open(newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def insert_rows(conn: sqlite3.Connection, table: str, rows: list[dict[str, str | None]]) -> None:
    if not rows:
        return
    cols = list(rows[0].keys())
    placeholders = ",".join("?" * len(cols))
    sql = f'INSERT INTO "{table}" ({",".join(c for c in cols)}) VALUES ({placeholders})'
    tuples: list[tuple] = []
    for raw in rows:
        tuples.append(
            tuple(normalize_cell(c, raw.get(c)) for c in cols)
        )
    conn.executemany(sql, tuples)


def main() -> None:
    if not SCHEMA_PATH.is_file():
        raise SystemExit(f"Missing {SCHEMA_PATH}")
    if not SEED_DIR.is_dir():
        raise SystemExit(f"Missing {SEED_DIR}")

    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    if DB_PATH.exists():
        DB_PATH.unlink()

    schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.executescript(schema_sql)
        for table, filename in TABLE_FILES:
            csv_path = SEED_DIR / filename
            if not csv_path.is_file():
                raise SystemExit(f"Missing seed file: {csv_path}")
            rows = load_rows(csv_path)
            insert_rows(conn, table, rows)
            print(f"Imported {len(rows)} rows -> {table}")
        conn.commit()
    finally:
        conn.close()

    print(f"Done: {DB_PATH} ({DB_PATH.stat().st_size} bytes)")

    # Seed users (requires: pip install bcrypt)
    print("\nSeeding users...")
    try:
        from seed_users import seed  # noqa: PLC0415
        seed(DB_PATH)
    except ImportError:
        print("  Skipped (run 'python database/seed_users.py' separately after installing bcrypt)")


if __name__ == "__main__":
    main()
