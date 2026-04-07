#!/usr/bin/env python3
"""
Seed users into database/brighthut.sqlite.

Requires: pip install bcrypt

Run from repo root:
  python database/seed_users.py

Edit USERS below to add/modify test users before deploying.
role must be 'staff' or 'donor'.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

try:
    import bcrypt
except ImportError:
    raise SystemExit("Missing 'bcrypt' package. Install it with:  pip install bcrypt")

REPO_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = REPO_ROOT / "database" / "brighthut.sqlite"

# ── Edit this list to define your users ──────────────────────────────────────
USERS: list[dict] = [
    {
        "email": "staff@brighthut.org",
        "password": "BrightHut2024!",
        "role": "staff",
        "first_name": "Staff",
        "last_name": "Admin",
    },
    {
        "email": "donor@brighthut.org",
        "password": "BrightHut2024!",
        "role": "donor",
        "first_name": "Test",
        "last_name": "Donor",
    },
]
# ─────────────────────────────────────────────────────────────────────────────


def seed(db_path: Path = DB_PATH) -> None:
    if not db_path.exists():
        raise SystemExit(f"Database not found at {db_path}. Run build_sqlite.py first.")

    conn = sqlite3.connect(db_path)
    try:
        created = updated = 0
        for u in USERS:
            email = u["email"].lower()
            password_hash = bcrypt.hashpw(
                u["password"].encode(), bcrypt.gensalt(rounds=12)
            ).decode()

            existing = conn.execute(
                "SELECT user_id FROM users WHERE email = ?", (email,)
            ).fetchone()

            if existing:
                conn.execute(
                    "UPDATE users SET password_hash = ?, role = ?, is_active = 1 WHERE email = ?",
                    (password_hash, u["role"], email),
                )
                print(f"  Updated : {email}  (role={u['role']})")
                updated += 1
            else:
                conn.execute(
                    """INSERT INTO users
                         (email, password_hash, role, first_name, last_name,
                          organization_name, phone, country, region,
                          relationship_type, acquisition_channel, supporter_type)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        email,
                        password_hash,
                        u["role"],
                        u.get("first_name"),
                        u.get("last_name"),
                        u.get("organization_name"),
                        u.get("phone"),
                        u.get("country"),
                        u.get("region"),
                        u.get("relationship_type"),
                        u.get("acquisition_channel"),
                        u.get("supporter_type"),
                    ),
                )
                print(f"  Created : {email}  (role={u['role']})")
                created += 1

        conn.commit()
        print(f"Users seeded — {created} created, {updated} updated.")
    finally:
        conn.close()


if __name__ == "__main__":
    seed()
