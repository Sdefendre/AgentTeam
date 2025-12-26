-- Migration: Create Agent Team Schema
-- Run this in your Supabase SQL Editor

-- Content table - stores all generated content
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  topic_slug TEXT NOT NULL,
  blog_post TEXT,
  x_post TEXT,
  linkedin_post TEXT,
  image_url TEXT,
  image_data BYTEA,
  status TEXT DEFAULT 'draft',
  platforms TEXT[] DEFAULT ARRAY['x', 'linkedin'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Publishing history - track what was published where
CREATE TABLE IF NOT EXISTS publishing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  draft_id TEXT,
  status TEXT DEFAULT 'scheduled',
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings - store API keys and user preferences
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_topic_slug ON content(topic_slug);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_publishing_history_content_id ON publishing_history(content_id);
CREATE INDEX IF NOT EXISTS idx_publishing_history_platform ON publishing_history(platform);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_content_updated_at ON content;
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations (you can restrict these later)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON content;
CREATE POLICY "Allow all for authenticated users" ON content
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON publishing_history;
CREATE POLICY "Allow all for authenticated users" ON publishing_history
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON settings;
CREATE POLICY "Allow all for authenticated users" ON settings
  FOR ALL USING (true);

