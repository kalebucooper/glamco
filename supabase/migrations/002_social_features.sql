-- ============================================================
-- GLAM.CO — Social Features Migration
-- ============================================================

-- ─── Artist Posts ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  caption TEXT,
  image_url TEXT NOT NULL,
  genre TEXT,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Post Likes ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS post_likes (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- ─── Post Comments ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Follow System ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- ─── Artist Profile Columns ──────────────────────────────────

ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS follower_count INT DEFAULT 0;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS post_count INT DEFAULT 0;

-- ─── Kit Products ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS kit_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  affiliate_url TEXT NOT NULL,
  price_display TEXT,
  category TEXT,
  is_favorite BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS Policies
-- ============================================================

-- ─── posts ───────────────────────────────────────────────────

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select_all" ON posts
  FOR SELECT USING (true);

CREATE POLICY "posts_insert_own" ON posts
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    artist_id IN (SELECT id FROM artist_profiles WHERE profile_id = auth.uid())
  );

CREATE POLICY "posts_update_own" ON posts
  FOR UPDATE USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE profile_id = auth.uid())
  );

CREATE POLICY "posts_delete_own" ON posts
  FOR DELETE USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE profile_id = auth.uid())
  );

-- ─── post_likes ──────────────────────────────────────────────

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_likes_select_all" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "post_likes_insert_own" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "post_likes_delete_own" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ─── post_comments ───────────────────────────────────────────

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_comments_select_all" ON post_comments
  FOR SELECT USING (true);

CREATE POLICY "post_comments_insert_auth" ON post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "post_comments_delete_own" ON post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- ─── follows ─────────────────────────────────────────────────

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follows_select_all" ON follows
  FOR SELECT USING (true);

CREATE POLICY "follows_insert_own" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "follows_delete_own" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- ─── kit_products ────────────────────────────────────────────

ALTER TABLE kit_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kit_products_select_all" ON kit_products
  FOR SELECT USING (true);

CREATE POLICY "kit_products_insert_own" ON kit_products
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    artist_id IN (SELECT id FROM artist_profiles WHERE profile_id = auth.uid())
  );

CREATE POLICY "kit_products_update_own" ON kit_products
  FOR UPDATE USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE profile_id = auth.uid())
  );

CREATE POLICY "kit_products_delete_own" ON kit_products
  FOR DELETE USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE profile_id = auth.uid())
  );

-- ============================================================
-- Trigger Functions — Count Maintenance
-- ============================================================

-- ─── likes_count on posts ────────────────────────────────────

CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_post_likes_count ON post_likes;
CREATE TRIGGER trg_post_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- ─── comments_count on posts ─────────────────────────────────

CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_post_comments_count ON post_comments;
CREATE TRIGGER trg_post_comments_count
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- ─── follower_count on artist_profiles ───────────────────────

CREATE OR REPLACE FUNCTION update_artist_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE artist_profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE artist_profiles SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_artist_follower_count ON follows;
CREATE TRIGGER trg_artist_follower_count
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_artist_follower_count();

-- ─── post_count on artist_profiles ───────────────────────────

CREATE OR REPLACE FUNCTION update_artist_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE artist_profiles SET post_count = post_count + 1 WHERE id = NEW.artist_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE artist_profiles SET post_count = GREATEST(post_count - 1, 0) WHERE id = OLD.artist_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_artist_post_count ON posts;
CREATE TRIGGER trg_artist_post_count
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_artist_post_count();
