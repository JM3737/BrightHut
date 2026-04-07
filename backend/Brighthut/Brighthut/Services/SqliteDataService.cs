using Microsoft.Data.Sqlite;

namespace Brighthut.Services;

public sealed class SqliteDataService
{
    private readonly string _dbPath;

    private static readonly HashSet<string> AllowedTables =
    [
        "safehouses",
        "partners",
        "partner_assignments",
        "supporters",
        "social_media_posts",
        "donations",
        "in_kind_donation_items",
        "donation_allocations",
        "residents",
        "process_recordings",
        "home_visitations",
        "education_records",
        "health_wellbeing_records",
        "intervention_plans",
        "incident_reports",
        "safehouse_monthly_metrics",
        "public_impact_snapshots",
    ];

    private static readonly Dictionary<string, string> PrimaryKeys = new(StringComparer.OrdinalIgnoreCase)
    {
        ["safehouses"] = "safehouse_id",
        ["partners"] = "partner_id",
        ["partner_assignments"] = "assignment_id",
        ["supporters"] = "supporter_id",
        ["social_media_posts"] = "post_id",
        ["donations"] = "donation_id",
        ["in_kind_donation_items"] = "item_id",
        ["donation_allocations"] = "allocation_id",
        ["residents"] = "resident_id",
        ["process_recordings"] = "recording_id",
        ["home_visitations"] = "visitation_id",
        ["education_records"] = "education_record_id",
        ["health_wellbeing_records"] = "health_record_id",
        ["intervention_plans"] = "plan_id",
        ["incident_reports"] = "incident_id",
        ["safehouse_monthly_metrics"] = "metric_id",
        ["public_impact_snapshots"] = "snapshot_id",
    };

    public SqliteDataService()
    {
        _dbPath = Path.Combine(AppContext.BaseDirectory, "brighthut.sqlite");
    }

    public bool IsTableAllowed(string tableName) =>
        AllowedTables.Contains(tableName, StringComparer.Ordinal);

    public string GetPrimaryKey(string tableName) =>
        PrimaryKeys.TryGetValue(tableName, out var pk) ? pk : throw new ArgumentException("Unknown table.", nameof(tableName));

    public IReadOnlyList<Dictionary<string, object?>> QueryAll(string tableName)
    {
        if (!IsTableAllowed(tableName))
            throw new ArgumentException("Unknown table.", nameof(tableName));

        EnsureDb();

        var results = new List<Dictionary<string, object?>>();
        using var conn = new SqliteConnection($"Data Source={_dbPath}");
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = $"SELECT * FROM {tableName}";
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var row = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
            for (var i = 0; i < reader.FieldCount; i++)
                row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
            results.Add(row);
        }
        return results;
    }

    public long Insert(string tableName, Dictionary<string, object?> data)
    {
        if (!IsTableAllowed(tableName)) throw new ArgumentException("Unknown table.", nameof(tableName));
        EnsureDb();

        var pk = GetPrimaryKey(tableName);
        data.Remove(pk);

        var columns = data.Keys.ToList();
        var paramNames = columns.Select((_, i) => $"@p{i}").ToList();

        using var conn = new SqliteConnection($"Data Source={_dbPath}");
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = $"INSERT INTO {tableName} ({string.Join(", ", columns)}) VALUES ({string.Join(", ", paramNames)}); SELECT last_insert_rowid();";
        for (var i = 0; i < columns.Count; i++)
            cmd.Parameters.AddWithValue($"@p{i}", data[columns[i]] ?? DBNull.Value);

        return (long)(cmd.ExecuteScalar() ?? 0L);
    }

    public IReadOnlyList<Dictionary<string, object?>> QuerySupporterByEmail(string email)
    {
        const string sql = @"
            SELECT *
            FROM supporters
            WHERE lower(email) = @email;";

        return QueryWithParameters(sql, parameters =>
        {
            parameters.AddWithValue("@email", email.Trim().ToLowerInvariant());
        });
    }

    public IReadOnlyList<Dictionary<string, object?>> QueryDonationsBySupporterEmail(string email)
    {
        const string sql = @"
            SELECT d.*
            FROM donations d
            INNER JOIN supporters s ON s.supporter_id = d.supporter_id
            WHERE lower(s.email) = @email
            ORDER BY d.donation_date DESC;";

        return QueryWithParameters(sql, parameters =>
        {
            parameters.AddWithValue("@email", email.Trim().ToLowerInvariant());
        });
    }

    public IReadOnlyList<Dictionary<string, object?>> QueryDonationAllocationsBySupporterEmail(string email)
    {
        const string sql = @"
            SELECT a.*
            FROM donation_allocations a
            INNER JOIN donations d ON d.donation_id = a.donation_id
            INNER JOIN supporters s ON s.supporter_id = d.supporter_id
            WHERE lower(s.email) = @email
            ORDER BY a.allocation_date DESC;";

        return QueryWithParameters(sql, parameters =>
        {
            parameters.AddWithValue("@email", email.Trim().ToLowerInvariant());
        });
    }

    public IReadOnlyList<Dictionary<string, object?>> QueryInKindItemsBySupporterEmail(string email)
    {
        const string sql = @"
            SELECT i.*
            FROM in_kind_donation_items i
            INNER JOIN donations d ON d.donation_id = i.donation_id
            INNER JOIN supporters s ON s.supporter_id = d.supporter_id
            WHERE lower(s.email) = @email
            ORDER BY d.donation_date DESC, i.item_id DESC;";

        return QueryWithParameters(sql, parameters =>
        {
            parameters.AddWithValue("@email", email.Trim().ToLowerInvariant());
        });
    }

    public bool Update(string tableName, long id, Dictionary<string, object?> data)
    {
        if (!IsTableAllowed(tableName)) throw new ArgumentException("Unknown table.", nameof(tableName));
        EnsureDb();

        var pk = GetPrimaryKey(tableName);
        data.Remove(pk);

        var columns = data.Keys.ToList();
        var setClauses = columns.Select((c, i) => $"{c} = @p{i}").ToList();

        using var conn = new SqliteConnection($"Data Source={_dbPath}");
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = $"UPDATE {tableName} SET {string.Join(", ", setClauses)} WHERE {pk} = @id";
        for (var i = 0; i < columns.Count; i++)
            cmd.Parameters.AddWithValue($"@p{i}", data[columns[i]] ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@id", id);

        return cmd.ExecuteNonQuery() > 0;
    }

    public bool Delete(string tableName, long id)
    {
        if (!IsTableAllowed(tableName)) throw new ArgumentException("Unknown table.", nameof(tableName));
        EnsureDb();

        var pk = GetPrimaryKey(tableName);

        using var conn = new SqliteConnection($"Data Source={_dbPath}");
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = $"DELETE FROM {tableName} WHERE {pk} = @id";
        cmd.Parameters.AddWithValue("@id", id);

        return cmd.ExecuteNonQuery() > 0;
    }

    private IReadOnlyList<Dictionary<string, object?>> QueryWithParameters(
        string sql,
        Action<SqliteParameterCollection> bindParameters)
    {
        var results = new List<Dictionary<string, object?>>();
        using var conn = new SqliteConnection($"Data Source={_dbPath}");
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        bindParameters(cmd.Parameters);
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var row = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
            for (var i = 0; i < reader.FieldCount; i++)
            {
                row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
            }

            results.Add(row);
        }

        return results;
    }

    private void EnsureDb()
    {
        if (!File.Exists(_dbPath))
            throw new InvalidOperationException($"SQLite database not found at {_dbPath}.");
    }
}
