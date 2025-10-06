-- Chess Arena Database Initialization
-- This file is executed when PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom functions for chess-specific operations
CREATE OR REPLACE FUNCTION calculate_rating_change(
  player_rating INTEGER,
  opponent_rating INTEGER,
  result DECIMAL(1,0) -- 1 for win, 0.5 for draw, 0 for loss
) RETURNS INTEGER AS $$
DECLARE
  expected_score DECIMAL(4,3);
  k_factor INTEGER := 32;
  rating_change INTEGER;
BEGIN
  -- Calculate expected score using Elo formula
  expected_score := 1.0 / (1.0 + POWER(10.0, (opponent_rating - player_rating) / 400.0));
  
  -- Calculate rating change
  rating_change := ROUND(k_factor * (result - expected_score));
  
  RETURN rating_change;
END;
$$ LANGUAGE plpgsql;

-- Create function to update peak rating
CREATE OR REPLACE FUNCTION update_peak_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update peak rating if current rating is higher
  IF NEW.rating > COALESCE(OLD.peak_rating, 0) THEN
    NEW.peak_rating := NEW.rating;
    NEW.peak_date := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update peak rating
CREATE TRIGGER trigger_update_peak_rating
  BEFORE UPDATE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_peak_rating();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_white_player ON games(white_player_id);
CREATE INDEX IF NOT EXISTS idx_games_black_player ON games(black_player_id);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at);
CREATE INDEX IF NOT EXISTS idx_games_tournament ON games(tournament_id);

CREATE INDEX IF NOT EXISTS idx_moves_game_id ON moves(game_id);
CREATE INDEX IF NOT EXISTS idx_moves_created_at ON moves(created_at);

CREATE INDEX IF NOT EXISTS idx_messages_game_id ON messages(game_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rating_type ON ratings(rating_type);
CREATE INDEX IF NOT EXISTS idx_ratings_rating ON ratings(rating);

-- Create view for leaderboard
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  u.id,
  u.name,
  u.avatar,
  r.rating,
  r.games_played,
  r.wins,
  r.losses,
  r.draws,
  r.peak_rating,
  r.peak_date,
  ROUND(
    CASE 
      WHEN r.games_played > 0 THEN (r.wins::DECIMAL / r.games_played) * 100
      ELSE 0
    END, 2
  ) as win_percentage
FROM users u
JOIN ratings r ON u.id = r.user_id
WHERE r.rating_type = 'CLASSIC'
  AND u.is_active = true
ORDER BY r.rating DESC;

-- Create view for active games
CREATE OR REPLACE VIEW active_games AS
SELECT 
  g.id,
  g.status,
  g.game_type,
  g.time_control,
  g.is_rated,
  g.current_fen,
  g.turn,
  g.white_time_left,
  g.black_time_left,
  g.created_at,
  g.started_at,
  w.name as white_name,
  w.avatar as white_avatar,
  b.name as black_name,
  b.avatar as black_avatar
FROM games g
LEFT JOIN users w ON g.white_player_id = w.id
LEFT JOIN users b ON g.black_player_id = b.id
WHERE g.status IN ('WAITING', 'ACTIVE')
ORDER BY g.created_at DESC;

-- Create view for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.name,
  u.avatar,
  COUNT(DISTINCT g.id) as total_games,
  COUNT(DISTINCT CASE WHEN g.status = 'FINISHED' THEN g.id END) as finished_games,
  COUNT(DISTINCT CASE WHEN g.status = 'ACTIVE' THEN g.id END) as active_games,
  COUNT(DISTINCT CASE WHEN g.status = 'WAITING' THEN g.id END) as waiting_games,
  COUNT(DISTINCT CASE WHEN g.white_player_id = u.id AND g.winner = 'WHITE' THEN g.id END) as wins_as_white,
  COUNT(DISTINCT CASE WHEN g.black_player_id = u.id AND g.winner = 'BLACK' THEN g.id END) as wins_as_black,
  COUNT(DISTINCT CASE WHEN g.result = 'DRAW' THEN g.id END) as draws,
  COUNT(DISTINCT f.id) as friends_count,
  MAX(g.created_at) as last_game_at
FROM users u
LEFT JOIN games g ON (g.white_player_id = u.id OR g.black_player_id = u.id)
LEFT JOIN friendships f ON u.id = f.user_id
WHERE u.is_active = true
GROUP BY u.id, u.name, u.avatar;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;
