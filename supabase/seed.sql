-- Whop Pulse: Seed Data for Testing
-- This file populates the database with mock member data

-- Note: Replace 'biz_5I0ycVO1857oWD' with your actual company ID from .env.local if different

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE member_activity CASCADE;

-- Insert mock member data
INSERT INTO member_activity (
    company_id,
    member_id,
    member_email,
    member_username,
    member_name,
    last_active,
    status,
    activity_score,
    total_sessions,
    last_login,
    days_since_active
) VALUES
    -- Active Members (last active 0-7 days ago)
    ('biz_5I0ycVO1857oWD', 'user_active_001', 'alex.johnson@example.com', 'alexj', 'Alex Johnson', NOW() - INTERVAL '2 days', 'active', 95, 47, NOW() - INTERVAL '2 days', 2),
    ('biz_5I0ycVO1857oWD', 'user_active_002', 'sarah.williams@example.com', 'sarahw', 'Sarah Williams', NOW() - INTERVAL '1 day', 'active', 98, 62, NOW() - INTERVAL '1 day', 1),
    ('biz_5I0ycVO1857oWD', 'user_active_003', 'michael.brown@example.com', 'mikeb', 'Michael Brown', NOW() - INTERVAL '3 hours', 'active', 100, 89, NOW() - INTERVAL '3 hours', 0),
    ('biz_5I0ycVO1857oWD', 'user_active_004', 'emma.davis@example.com', 'emmad', 'Emma Davis', NOW() - INTERVAL '4 days', 'active', 88, 34, NOW() - INTERVAL '4 days', 4),
    ('biz_5I0ycVO1857oWD', 'user_active_005', 'james.wilson@example.com', 'jamesw', 'James Wilson', NOW() - INTERVAL '5 days', 'active', 85, 28, NOW() - INTERVAL '5 days', 5),
    ('biz_5I0ycVO1857oWD', 'user_active_006', 'olivia.moore@example.com', 'oliviam', 'Olivia Moore', NOW() - INTERVAL '6 days', 'active', 82, 41, NOW() - INTERVAL '6 days', 6),
    ('biz_5I0ycVO1857oWD', 'user_active_007', 'william.taylor@example.com', 'willt', 'William Taylor', NOW() - INTERVAL '7 days', 'active', 80, 55, NOW() - INTERVAL '7 days', 7),
    ('biz_5I0ycVO1857oWD', 'user_active_008', 'sophia.anderson@example.com', 'sophiaa', 'Sophia Anderson', NOW() - INTERVAL '1 day', 'active', 96, 72, NOW() - INTERVAL '1 day', 1),
    ('biz_5I0ycVO1857oWD', 'user_active_009', 'benjamin.thomas@example.com', 'benjt', 'Benjamin Thomas', NOW() - INTERVAL '2 days', 'active', 91, 38, NOW() - INTERVAL '2 days', 2),
    ('biz_5I0ycVO1857oWD', 'user_active_010', 'isabella.jackson@example.com', 'bellaj', 'Isabella Jackson', NOW() - INTERVAL '3 days', 'active', 89, 44, NOW() - INTERVAL '3 days', 3),

    -- At Risk Members (last active 8-30 days ago)
    ('biz_5I0ycVO1857oWD', 'user_risk_001', 'lucas.white@example.com', 'lucasw', 'Lucas White', NOW() - INTERVAL '10 days', 'at_risk', 72, 26, NOW() - INTERVAL '10 days', 10),
    ('biz_5I0ycVO1857oWD', 'user_risk_002', 'mia.harris@example.com', 'miah', 'Mia Harris', NOW() - INTERVAL '15 days', 'at_risk', 65, 19, NOW() - INTERVAL '15 days', 15),
    ('biz_5I0ycVO1857oWD', 'user_risk_003', 'henry.martin@example.com', 'henrym', 'Henry Martin', NOW() - INTERVAL '12 days', 'at_risk', 68, 31, NOW() - INTERVAL '12 days', 12),
    ('biz_5I0ycVO1857oWD', 'user_risk_004', 'charlotte.thompson@example.com', 'chart', 'Charlotte Thompson', NOW() - INTERVAL '20 days', 'at_risk', 58, 22, NOW() - INTERVAL '20 days', 20),
    ('biz_5I0ycVO1857oWD', 'user_risk_005', 'daniel.garcia@example.com', 'dang', 'Daniel Garcia', NOW() - INTERVAL '25 days', 'at_risk', 48, 15, NOW() - INTERVAL '25 days', 25),
    ('biz_5I0ycVO1857oWD', 'user_risk_006', 'amelia.martinez@example.com', 'ameliam', 'Amelia Martinez', NOW() - INTERVAL '18 days', 'at_risk', 61, 27, NOW() - INTERVAL '18 days', 18),
    ('biz_5I0ycVO1857oWD', 'user_risk_007', 'matthew.robinson@example.com', 'mattr', 'Matthew Robinson', NOW() - INTERVAL '22 days', 'at_risk', 54, 18, NOW() - INTERVAL '22 days', 22),
    ('biz_5I0ycVO1857oWD', 'user_risk_008', 'evelyn.clark@example.com', 'evelync', 'Evelyn Clark', NOW() - INTERVAL '14 days', 'at_risk', 67, 29, NOW() - INTERVAL '14 days', 14),

    -- Inactive Members (last active 30+ days ago)
    ('biz_5I0ycVO1857oWD', 'user_inactive_001', 'ethan.rodriguez@example.com', 'ethanr', 'Ethan Rodriguez', NOW() - INTERVAL '35 days', 'inactive', 35, 12, NOW() - INTERVAL '35 days', 35),
    ('biz_5I0ycVO1857oWD', 'user_inactive_002', 'ava.lewis@example.com', 'aval', 'Ava Lewis', NOW() - INTERVAL '45 days', 'inactive', 28, 8, NOW() - INTERVAL '45 days', 45),
    ('biz_5I0ycVO1857oWD', 'user_inactive_003', 'alexander.lee@example.com', 'alexl', 'Alexander Lee', NOW() - INTERVAL '60 days', 'inactive', 18, 5, NOW() - INTERVAL '60 days', 60),
    ('biz_5I0ycVO1857oWD', 'user_inactive_004', 'harper.walker@example.com', 'harperw', 'Harper Walker', NOW() - INTERVAL '40 days', 'inactive', 30, 10, NOW() - INTERVAL '40 days', 40),
    ('biz_5I0ycVO1857oWD', 'user_inactive_005', 'sebastian.hall@example.com', 'sebh', 'Sebastian Hall', NOW() - INTERVAL '50 days', 'inactive', 22, 7, NOW() - INTERVAL '50 days', 50),
    ('biz_5I0ycVO1857oWD', 'user_inactive_006', 'ella.allen@example.com', 'ellaa', 'Ella Allen', NOW() - INTERVAL '90 days', 'inactive', 10, 3, NOW() - INTERVAL '90 days', 90),
    ('biz_5I0ycVO1857oWD', 'user_inactive_007', 'jack.young@example.com', 'jacky', 'Jack Young', NOW() - INTERVAL '75 days', 'inactive', 15, 4, NOW() - INTERVAL '75 days', 75),

    -- Additional variety
    ('biz_5I0ycVO1857oWD', 'user_active_011', 'grace.hernandez@example.com', 'graceh', 'Grace Hernandez', NOW() - INTERVAL '1 hour', 'active', 99, 105, NOW() - INTERVAL '1 hour', 0),
    ('biz_5I0ycVO1857oWD', 'user_active_012', 'logan.king@example.com', 'logank', 'Logan King', NOW() - INTERVAL '5 days', 'active', 84, 36, NOW() - INTERVAL '5 days', 5),
    ('biz_5I0ycVO1857oWD', 'user_risk_009', 'chloe.wright@example.com', 'chloew', 'Chloe Wright', NOW() - INTERVAL '16 days', 'at_risk', 63, 20, NOW() - INTERVAL '16 days', 16),
    ('biz_5I0ycVO1857oWD', 'user_risk_010', 'jackson.lopez@example.com', 'jacksonl', 'Jackson Lopez', NOW() - INTERVAL '28 days', 'at_risk', 45, 14, NOW() - INTERVAL '28 days', 28),
    ('biz_5I0ycVO1857oWD', 'user_inactive_008', 'lily.hill@example.com', 'lilyh', 'Lily Hill', NOW() - INTERVAL '120 days', 'inactive', 5, 2, NOW() - INTERVAL '120 days', 120),
    ('biz_5I0ycVO1857oWD', 'user_inactive_009', 'noah.scott@example.com', 'noahs', 'Noah Scott', NOW() - INTERVAL '65 days', 'inactive', 20, 6, NOW() - INTERVAL '65 days', 65)
ON CONFLICT (company_id, member_id) DO NOTHING;

-- Verify the data was inserted
SELECT
    status,
    COUNT(*) as count,
    ROUND(AVG(activity_score), 2) as avg_score
FROM member_activity
WHERE company_id = 'biz_5I0ycVO1857oWD'
GROUP BY status
ORDER BY status;
