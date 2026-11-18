-- Seed data for OmniDev website
-- Run with: supabase db seed

-- Insert default site content
INSERT INTO site_content (key, value) VALUES
  ('announcement', '"OmniDev Desktop & CLI — Open-Source AI Development Environment"'),
  ('hero_title', '"The AI-native workbench built for developers who want control."'),
  ('hero_subtitle', '"An open-source Tauri 2, React, and FastAPI workbench with autonomous coding agents, multi-provider LLM orchestration, and explicit permission gates."'),
  ('fallback_version', '"main-dev"')
ON CONFLICT (key) DO NOTHING;

-- Insert default roadmap items
INSERT INTO roadmap_items (title, description, status, display_order) VALUES
  ('Multi-provider LLM orchestration', 'Connect local Ollama models and external API providers in one workspace.', 'completed', 1),
  ('React + Tauri 2 desktop workbench', '4-panel layout with file explorer, code editor, agent panel, and terminal.', 'completed', 2),
  ('FastAPI + SQLite persistent memory', 'Store project context, conversations, and task history locally.', 'completed', 3),
  ('AutoMode & permission boundary controls', 'Fine-grained approval rules for file edits and terminal commands.', 'in-progress', 4),
  ('Teach Mode interactive walkthroughs', 'Step-by-step guided explanations synced with live repository diffs.', 'in-progress', 5),
  ('Dynamic GitHub Releases auto-updater', 'In-app update checks and verified binary downloads from GitHub Releases.', 'planned', 6),
  ('Plugin & custom agent tool SDK', 'Define custom repository tools and validation hooks per project.', 'planned', 7)
ON CONFLICT DO NOTHING;