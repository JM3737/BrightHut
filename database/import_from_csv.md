## Importing the 17 CSV files into PostgreSQL (works for Azure too)

These steps assume you already created a PostgreSQL database and ran `database/schema.sql`.

### 1) Create the schema/tables

From repo root:

```bash
psql "postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require" -f database/schema.sql
```

For Azure Database for PostgreSQL Flexible Server, the Azure portal gives you `HOST`, `USER`, and SSL requirements.

### 2) Put your CSVs in one folder

Example structure (names can differ; update the commands accordingly):

```
database/seed-csv/
  safehouses.csv
  partners.csv
  partner_assignments.csv
  supporters.csv
  social_media_posts.csv
  donations.csv
  in_kind_donation_items.csv
  donation_allocations.csv
  residents.csv
  process_recordings.csv
  home_visitations.csv
  education_records.csv
  health_wellbeing_records.csv
  intervention_plans.csv
  incident_reports.csv
  safehouse_monthly_metrics.csv
  public_impact_snapshots.csv
```

### 3) Import order (important for foreign keys)

Run in this order:

1. `safehouses`
2. `partners`
3. `partner_assignments`
4. `supporters`
5. `social_media_posts`
6. `donations`
7. `in_kind_donation_items`
8. `donation_allocations`
9. `residents`
10. `process_recordings`
11. `home_visitations`
12. `education_records`
13. `health_wellbeing_records`
14. `intervention_plans`
15. `incident_reports`
16. `safehouse_monthly_metrics`
17. `public_impact_snapshots`

### 4) Import with `\copy` (recommended)

`\copy` reads CSVs from *your machine* (works even when the DB is in Azure).

Open `psql`:

```bash
psql "postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
```

Then run:

```sql
SET search_path = brighthut;

\copy safehouses FROM 'database/seed-csv/safehouses.csv' WITH (FORMAT csv, HEADER true);
\copy partners FROM 'database/seed-csv/partners.csv' WITH (FORMAT csv, HEADER true);
\copy partner_assignments FROM 'database/seed-csv/partner_assignments.csv' WITH (FORMAT csv, HEADER true);
\copy supporters FROM 'database/seed-csv/supporters.csv' WITH (FORMAT csv, HEADER true);
\copy social_media_posts FROM 'database/seed-csv/social_media_posts.csv' WITH (FORMAT csv, HEADER true);
\copy donations FROM 'database/seed-csv/donations.csv' WITH (FORMAT csv, HEADER true);
\copy in_kind_donation_items FROM 'database/seed-csv/in_kind_donation_items.csv' WITH (FORMAT csv, HEADER true);
\copy donation_allocations FROM 'database/seed-csv/donation_allocations.csv' WITH (FORMAT csv, HEADER true);
\copy residents FROM 'database/seed-csv/residents.csv' WITH (FORMAT csv, HEADER true);
\copy process_recordings FROM 'database/seed-csv/process_recordings.csv' WITH (FORMAT csv, HEADER true);
\copy home_visitations FROM 'database/seed-csv/home_visitations.csv' WITH (FORMAT csv, HEADER true);
\copy education_records FROM 'database/seed-csv/education_records.csv' WITH (FORMAT csv, HEADER true);
\copy health_wellbeing_records FROM 'database/seed-csv/health_wellbeing_records.csv' WITH (FORMAT csv, HEADER true);
\copy intervention_plans FROM 'database/seed-csv/intervention_plans.csv' WITH (FORMAT csv, HEADER true);
\copy incident_reports FROM 'database/seed-csv/incident_reports.csv' WITH (FORMAT csv, HEADER true);
\copy safehouse_monthly_metrics FROM 'database/seed-csv/safehouse_monthly_metrics.csv' WITH (FORMAT csv, HEADER true);
\copy public_impact_snapshots FROM 'database/seed-csv/public_impact_snapshots.csv' WITH (FORMAT csv, HEADER true);
```

### 5) If your CSV headers don’t match column names exactly

Specify a column list, e.g.:

```sql
\copy safehouses (safehouse_id, safehouse_code, name, region, city, province, country, open_date, status, capacity_girls, capacity_staff, current_occupancy, notes)
FROM 'database/seed-csv/safehouses.csv'
WITH (FORMAT csv, HEADER true);
```

### 6) `partner_assignments.safehouse_id` (decimals → integers)

The seed file `database/seed-csv/partner_assignments.csv` had `safehouse_id` values exported as floats (e.g. `8.0`). Those are **rounded to whole integers** (e.g. `8`) so they load into PostgreSQL `integer` columns. Nullable rows still use an **empty field** between commas for `safehouse_id` (not `""`), which `COPY` reads as **NULL**.

### 7) If your CSV includes explicit IDs

This schema uses identity columns, but PostgreSQL will still accept explicit values during import. If you import explicit IDs, run this afterward so future inserts don’t collide:

```sql
SELECT setval(pg_get_serial_sequence('brighthut.safehouses','safehouse_id'), (SELECT coalesce(max(safehouse_id),1) FROM brighthut.safehouses));
SELECT setval(pg_get_serial_sequence('brighthut.partners','partner_id'), (SELECT coalesce(max(partner_id),1) FROM brighthut.partners));
SELECT setval(pg_get_serial_sequence('brighthut.supporters','supporter_id'), (SELECT coalesce(max(supporter_id),1) FROM brighthut.supporters));
-- Repeat for other tables if needed.
```

