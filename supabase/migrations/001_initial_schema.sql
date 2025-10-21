-- Whop Pulse: Member Activity Monitor
-- Initial Schema Migration

-- ============================================================================
-- 1. Create updated_at trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. Create member_activity table
-- ============================================================================
CREATE TABLE IF NOT EXISTS member_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Whop identifiers
    company_id TEXT NOT NULL,
    member_id TEXT NOT NULL,

    -- Member information
    member_email TEXT,
    member_username TEXT,
    member_name TEXT,

    -- Activity tracking
    last_active TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active',
    activity_score INTEGER NOT NULL DEFAULT 100,

    -- Activity metrics
    total_sessions INTEGER DEFAULT 0,
    last_login TIMESTAMPTZ,
    days_since_active INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT member_activity_status_check
        CHECK (status IN ('active', 'at_risk', 'inactive')),
    CONSTRAINT member_activity_score_check
        CHECK (activity_score >= 0 AND activity_score <= 100),
    CONSTRAINT member_activity_unique_member
        UNIQUE (company_id, member_id)
);

-- ============================================================================
-- 3. Create indexes for performance
-- ============================================================================
CREATE INDEX idx_member_activity_company_id
    ON member_activity(company_id);

CREATE INDEX idx_member_activity_status
    ON member_activity(status);

CREATE INDEX idx_member_activity_company_status
    ON member_activity(company_id, status);

CREATE INDEX idx_member_activity_last_active
    ON member_activity(last_active DESC);

CREATE INDEX idx_member_activity_activity_score
    ON member_activity(activity_score);

-- ============================================================================
-- 4. Create updated_at trigger
-- ============================================================================
CREATE TRIGGER update_member_activity_updated_at
    BEFORE UPDATE ON member_activity
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. Enable Row Level Security (RLS)
-- ============================================================================
ALTER TABLE member_activity ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for service role (backend)
CREATE POLICY "Service role has full access to member_activity"
    ON member_activity
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Allow users to read their own company's data
CREATE POLICY "Users can view their company's member activity"
    ON member_activity
    FOR SELECT
    TO authenticated
    USING (
        company_id = current_setting('app.company_id', true)
    );

-- Policy: Allow users to insert for their company
CREATE POLICY "Users can insert member activity for their company"
    ON member_activity
    FOR INSERT
    TO authenticated
    WITH CHECK (
        company_id = current_setting('app.company_id', true)
    );

-- Policy: Allow users to update their company's data
CREATE POLICY "Users can update their company's member activity"
    ON member_activity
    FOR UPDATE
    TO authenticated
    USING (
        company_id = current_setting('app.company_id', true)
    )
    WITH CHECK (
        company_id = current_setting('app.company_id', true)
    );

-- Policy: Allow users to delete their company's data
CREATE POLICY "Users can delete their company's member activity"
    ON member_activity
    FOR DELETE
    TO authenticated
    USING (
        company_id = current_setting('app.company_id', true)
    );

-- ============================================================================
-- 6. Create helpful views
-- ============================================================================

-- View: Active members summary by company
CREATE OR REPLACE VIEW member_activity_summary AS
SELECT
    company_id,
    COUNT(*) as total_members,
    COUNT(*) FILTER (WHERE status = 'active') as active_members,
    COUNT(*) FILTER (WHERE status = 'at_risk') as at_risk_members,
    COUNT(*) FILTER (WHERE status = 'inactive') as inactive_members,
    ROUND(AVG(activity_score), 2) as avg_activity_score,
    MAX(updated_at) as last_updated
FROM member_activity
GROUP BY company_id;

-- Grant access to the view
GRANT SELECT ON member_activity_summary TO authenticated, service_role;

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE member_activity IS 'Tracks member activity status and engagement scores for Whop companies';
COMMENT ON COLUMN member_activity.company_id IS 'Whop company identifier (biz_*)';
COMMENT ON COLUMN member_activity.member_id IS 'Whop member/user identifier (user_*)';
COMMENT ON COLUMN member_activity.status IS 'Member activity status: active, at_risk, or inactive';
COMMENT ON COLUMN member_activity.activity_score IS 'Activity engagement score from 0-100';
COMMENT ON COLUMN member_activity.days_since_active IS 'Number of days since last activity';
