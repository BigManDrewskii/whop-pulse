-- Member Activity History Tracking
-- Stores daily snapshots of member engagement scores for trend analysis

-- ============================================================================
-- 1. Create member_history table
-- ============================================================================
CREATE TABLE IF NOT EXISTS member_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    company_id TEXT NOT NULL,
    member_id TEXT NOT NULL,

    -- Snapshot data
    engagement_score INTEGER NOT NULL CHECK (engagement_score >= 0 AND engagement_score <= 100),
    status TEXT NOT NULL CHECK (status IN ('active', 'at_risk', 'inactive')),

    -- Timestamp
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. Create indexes for fast queries
-- ============================================================================

-- Query by member
CREATE INDEX idx_member_history_member_id
    ON member_history(member_id);

-- Query by company
CREATE INDEX idx_member_history_company_id
    ON member_history(company_id);

-- Query by date (for time-series queries)
CREATE INDEX idx_member_history_recorded_at
    ON member_history(recorded_at DESC);

-- Composite index for company + date queries (most common)
CREATE INDEX idx_member_history_company_date
    ON member_history(company_id, recorded_at DESC);

-- Composite index for member + date queries (trend lines)
CREATE INDEX idx_member_history_member_date
    ON member_history(member_id, recorded_at DESC);

-- ============================================================================
-- 3. Enable Row Level Security
-- ============================================================================
ALTER TABLE member_history ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access
CREATE POLICY "Service role has full access to member_history"
    ON member_history
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Authenticated users can read their company's history
CREATE POLICY "Users can view their company's member history"
    ON member_history
    FOR SELECT
    TO authenticated
    USING (
        company_id = current_setting('app.company_id', true)
    );

-- Policy: Allow anon to read (since we use anon key on server)
CREATE POLICY "Allow anonymous read access to member_history"
    ON member_history
    FOR SELECT
    TO anon
    USING (true);

-- ============================================================================
-- 4. Create helpful views for analytics
-- ============================================================================

-- View: Daily engagement trends by company
CREATE OR REPLACE VIEW daily_engagement_trends AS
SELECT
    company_id,
    DATE(recorded_at) as date,
    COUNT(*) as total_members,
    ROUND(AVG(engagement_score), 2) as avg_score,
    COUNT(*) FILTER (WHERE status = 'active') as active_count,
    COUNT(*) FILTER (WHERE status = 'at_risk') as at_risk_count,
    COUNT(*) FILTER (WHERE status = 'inactive') as inactive_count
FROM member_history
GROUP BY company_id, DATE(recorded_at)
ORDER BY date DESC;

-- Grant access to the view
GRANT SELECT ON daily_engagement_trends TO authenticated, anon, service_role;

-- ============================================================================
-- 5. Create function to get latest snapshot per member
-- ============================================================================
CREATE OR REPLACE FUNCTION get_latest_snapshots(p_company_id TEXT, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    member_id TEXT,
    engagement_score INTEGER,
    status TEXT,
    recorded_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (h.member_id)
        h.member_id,
        h.engagement_score,
        h.status,
        h.recorded_at
    FROM member_history h
    WHERE h.company_id = p_company_id
      AND h.recorded_at >= NOW() - (p_days || ' days')::INTERVAL
    ORDER BY h.member_id, h.recorded_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. Comments for documentation
-- ============================================================================
COMMENT ON TABLE member_history IS 'Daily snapshots of member engagement scores for historical trend analysis';
COMMENT ON COLUMN member_history.company_id IS 'Whop company identifier (biz_*)';
COMMENT ON COLUMN member_history.member_id IS 'Whop member identifier (user_*)';
COMMENT ON COLUMN member_history.engagement_score IS 'Engagement score at time of snapshot (0-100)';
COMMENT ON COLUMN member_history.status IS 'Member status at time of snapshot';
COMMENT ON COLUMN member_history.recorded_at IS 'When this snapshot was taken';

-- ============================================================================
-- 7. Initial data migration (optional)
-- ============================================================================
-- If you have existing members, create initial snapshot:
-- INSERT INTO member_history (company_id, member_id, engagement_score, status, recorded_at)
-- SELECT company_id, member_id, activity_score, status, NOW()
-- FROM member_activity;
