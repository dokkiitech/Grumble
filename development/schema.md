# Grumble Database Schema

このドキュメントはGrumbleアプリケーションのデータベーススキーマを定義します。

## Database: PostgreSQL

---

## Tables

### 1. grumbles (投稿テーブル)

愚痴の投稿を管理する核となるテーブル。24時間で消える機能に対応。

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| grumble_id | UUID | PRIMARY KEY | uuid_generate_v4() | 投稿の一意識別子 |
| user_id | UUID | NOT NULL, FOREIGN KEY → anonymous_users(user_id) | - | 投稿者の匿名ID |
| content | TEXT | NOT NULL, CHECK(length(content) <= 280) | - | 愚痴の本文（最大280文字） |
| toxic_level | INTEGER | NOT NULL, CHECK(toxic_level BETWEEN 1 AND 5) | - | 毒レベル（1-5） |
| vibe_count | INTEGER | NOT NULL | 0 | 「わかる…」の総数（キャッシュ） |
| is_purified | BOOLEAN | NOT NULL | FALSE | 成仏フラグ（Trueでタイムラインから消える） |
| posted_at | TIMESTAMP WITH TIME ZONE | NOT NULL | CURRENT_TIMESTAMP | 投稿日時 |
| expires_at | TIMESTAMP WITH TIME ZONE | NOT NULL | - | 有効期限（posted_at + 24時間） |
| is_event_grumble | BOOLEAN | NOT NULL | FALSE | イベント投稿フラグ |

#### Indexes
```sql
CREATE INDEX idx_grumbles_posted_at ON grumbles(posted_at DESC);
CREATE INDEX idx_grumbles_expires_at ON grumbles(expires_at);
CREATE INDEX idx_grumbles_is_purified ON grumbles(is_purified);
CREATE INDEX idx_grumbles_user_id ON grumbles(user_id);
CREATE INDEX idx_grumbles_toxic_level ON grumbles(toxic_level);
```

#### Business Rules
- `expires_at` は投稿時に自動的に `posted_at + 24時間` で設定
- `vibe_count` が10以上になると成仏可能
- 成仏時に `is_purified = TRUE` に更新
- `is_purified = TRUE` の投稿はタイムラインから非表示
- 自分の投稿のみ成仏済み一覧で確認可能

---

### 2. vibes (共感テーブル)

「わかる…」ボタンの押下履歴を管理。同一ユーザーの二重押しを防止。

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| vibe_id | SERIAL | PRIMARY KEY | - | 共感履歴の一意識別子 |
| grumble_id | UUID | NOT NULL, FOREIGN KEY → grumbles(grumble_id) ON DELETE CASCADE | - | 共感対象の投稿ID |
| user_id | UUID | NOT NULL, FOREIGN KEY → anonymous_users(user_id) | - | 共感したユーザーID |
| vibe_type | VARCHAR(20) | NOT NULL | 'WAKARU' | 共感の種類 |
| voted_at | TIMESTAMP WITH TIME ZONE | NOT NULL | CURRENT_TIMESTAMP | 共感日時 |

#### Constraints
```sql
ALTER TABLE vibes ADD CONSTRAINT unique_vibe_per_user
  UNIQUE (grumble_id, user_id);
```

#### Indexes
```sql
CREATE INDEX idx_vibes_grumble_id ON vibes(grumble_id);
CREATE INDEX idx_vibes_user_id ON vibes(user_id);
```

#### Business Rules
- 1ユーザーにつき1投稿1回のみ「わかる…」可能
- `vibe_type` は将来的なスタンプ機能拡張を考慮
- 共感時に対象投稿の `vibe_count` をインクリメント
- 共感したユーザーには徳ポイント付与

---

### 3. anonymous_users (匿名ユーザーテーブル)

匿名ユーザーの永続的な情報を管理。徳ポイントシステムに対応。

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| user_id | UUID | PRIMARY KEY | uuid_generate_v4() | 匿名ユーザーの一意識別子 |
| virtue_points | INTEGER | NOT NULL | 0 | 徳ポイント（共感で獲得） |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | CURRENT_TIMESTAMP | ユーザー作成日時 |
| profile_title | VARCHAR(50) | NULL | NULL | 称号（例：「今週の菩薩」） |

#### Indexes
```sql
CREATE INDEX idx_users_virtue_points ON anonymous_users(virtue_points DESC);
```

#### Business Rules
- FirebaseのAnonymous Authenticationと連携
- メールアドレスでアップグレード可能
- 「わかる…」を押すと徳ポイント+1
- 徳ポイントランキングで菩薩を決定

---

### 4. events (イベントテーブル)

「お焚き上げ」「大怨霊討伐」などのイベント管理。

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| event_id | SERIAL | PRIMARY KEY | - | イベントの一意識別子 |
| event_name | VARCHAR(100) | NOT NULL | - | イベント名（例：「今夜のお焚き上げ」） |
| event_type | VARCHAR(50) | NOT NULL, CHECK(event_type IN ('OTAKINAGE', 'DAIONRYO')) | - | イベント種類 |
| start_time | TIMESTAMP WITH TIME ZONE | NOT NULL | - | 開始時刻 |
| end_time | TIMESTAMP WITH TIME ZONE | NOT NULL | - | 終了時刻 |
| current_hp | INTEGER | NULL | NULL | 大怨霊の現在HP（DAIONRYOのみ） |
| max_hp | INTEGER | NULL | NULL | 大怨霊の最大HP（DAIONRYOのみ） |
| is_active | BOOLEAN | NOT NULL | FALSE | 開催中フラグ |

#### Indexes
```sql
CREATE INDEX idx_events_is_active ON events(is_active);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_end_time ON events(end_time);
```

#### Business Rules
- お焚き上げ（OTAKINAGE）: 毎日深夜0時に自動開催
- 大怨霊討伐（DAIONRYO）: 特定曜日に開催（現在は未実装）
- `current_hp`、`max_hp` は DAIONRYO のみ使用

---

### 5. polls (投票テーブル) - 将来実装

「これって私だけ？」投票機能用。

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| poll_id | SERIAL | PRIMARY KEY | - | 投票の一意識別子 |
| grumble_id | UUID | NOT NULL, FOREIGN KEY → grumbles(grumble_id) ON DELETE CASCADE | - | 紐づく投稿ID |
| question | VARCHAR(255) | NOT NULL | - | 投票の質問文 |
| option_1 | VARCHAR(100) | NOT NULL | - | 選択肢A |
| option_2 | VARCHAR(100) | NOT NULL | - | 選択肢B |

---

### 6. poll_votes (投票結果テーブル) - 将来実装

投票への回答を記録。二重投票を防止。

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| poll_vote_id | SERIAL | PRIMARY KEY | - | 投票結果の一意識別子 |
| poll_id | INTEGER | NOT NULL, FOREIGN KEY → polls(poll_id) ON DELETE CASCADE | - | 対象の投票ID |
| user_id | UUID | NOT NULL, FOREIGN KEY → anonymous_users(user_id) | - | 投票したユーザーID |
| selected_option | INTEGER | NOT NULL, CHECK(selected_option IN (1, 2)) | - | 選択した選択肢（1 or 2） |
| voted_at | TIMESTAMP WITH TIME ZONE | NOT NULL | CURRENT_TIMESTAMP | 投票日時 |

#### Constraints
```sql
ALTER TABLE poll_votes ADD CONSTRAINT unique_vote_per_user
  UNIQUE (poll_id, user_id);
```

---

## Enums

### vibe_type
```sql
CREATE TYPE vibe_type AS ENUM ('WAKARU');
-- 将来的にスタンプ追加時に拡張
```

### event_type
```sql
CREATE TYPE event_type AS ENUM ('OTAKINAGE', 'DAIONRYO');
```

---

## Relationships

### Entity Relationship Diagram (概要)

```
anonymous_users (1) ──< (N) grumbles
                (1) ──< (N) vibes
                (1) ──< (N) poll_votes

grumbles (1) ──< (N) vibes
         (1) ──< (1) polls

polls (1) ──< (N) poll_votes
```

---

## Triggers & Functions

### 1. 投稿時の expires_at 自動設定

```sql
CREATE OR REPLACE FUNCTION set_expires_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := NEW.posted_at + INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_expires_at
  BEFORE INSERT ON grumbles
  FOR EACH ROW
  EXECUTE FUNCTION set_expires_at();
```

### 2. vibe_count の自動更新

```sql
CREATE OR REPLACE FUNCTION update_vibe_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE grumbles
    SET vibe_count = vibe_count + 1
    WHERE grumble_id = NEW.grumble_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE grumbles
    SET vibe_count = vibe_count - 1
    WHERE grumble_id = OLD.grumble_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vibe_count
  AFTER INSERT OR DELETE ON vibes
  FOR EACH ROW
  EXECUTE FUNCTION update_vibe_count();
```

### 3. 徳ポイントの自動更新

```sql
CREATE OR REPLACE FUNCTION update_virtue_points()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE anonymous_users
    SET virtue_points = virtue_points + 1
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE anonymous_users
    SET virtue_points = virtue_points - 1
    WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_virtue_points
  AFTER INSERT OR DELETE ON vibes
  FOR EACH ROW
  EXECUTE FUNCTION update_virtue_points();
```

---

## Batch Jobs

### 1. 24時間経過した投稿の削除

毎時実行される想定のバッチ処理。

```sql
DELETE FROM grumbles
WHERE expires_at < CURRENT_TIMESTAMP
  AND is_purified = FALSE;
```

### 2. お焚き上げイベントの自動生成

毎日深夜0時に実行。

```sql
INSERT INTO events (event_name, event_type, start_time, end_time, is_active)
VALUES (
  '今夜のお焚き上げ',
  'OTAKINAGE',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 day' - INTERVAL '1 second',
  TRUE
);
```

---

## Performance Considerations

### 推奨する最適化

1. **タイムラインクエリの高速化**
   - `posted_at DESC` のインデックスを活用
   - LIMIT/OFFSET によるページネーション実装

2. **成仏判定の効率化**
   - `vibe_count` をキャッシュカラムとして保持
   - トリガーで自動更新

3. **期限切れ投稿の削除**
   - `expires_at` インデックスを活用
   - バッチ処理で一括削除

4. **接続プーリング**
   - アプリケーション層で接続プールを使用
   - 推奨: pgBouncer または Supabase の組み込みプール

---

## Data Retention Policy

| データ種類 | 保持期間 | 削除方法 |
|-----------|---------|----------|
| 未成仏の投稿 | 24時間 | バッチ処理で自動削除 |
| 成仏済み投稿 | 永続保存 | ユーザーの手動削除のみ |
| 共感履歴 | 投稿削除時にカスケード削除 | ON DELETE CASCADE |
| ユーザーデータ | アカウント削除まで永続 | ユーザー要求時のみ |
| イベントデータ | 終了後30日 | バッチ処理で削除 |

---

## Migration Strategy

### 初期セットアップ

```sql
-- 1. UUIDエクステンション有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. テーブル作成（依存関係順）
-- anonymous_users → grumbles → vibes
-- grumbles → polls → poll_votes
-- events

-- 3. トリガー作成

-- 4. インデックス作成

-- 5. 制約追加
```

### バージョン管理

- マイグレーションツール: **Prisma** または **Supabase Migrations**
- バージョニング: セマンティックバージョニング
- ロールバック戦略: ダウンマイグレーションスクリプト必須

---

## Security

### アクセス制御

```sql
-- アプリケーション用ロール
CREATE ROLE grumble_app WITH LOGIN PASSWORD 'secure_password';

-- 読み取り専用ロール（分析用）
CREATE ROLE grumble_readonly WITH LOGIN PASSWORD 'readonly_password';

-- 権限付与
GRANT SELECT, INSERT, UPDATE ON grumbles, vibes, anonymous_users TO grumble_app;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO grumble_readonly;
```

### Row Level Security (RLS)

Supabase使用時はRLSポリシーを設定:

```sql
-- ユーザーは自分の投稿のみ更新可能
CREATE POLICY user_update_own_grumbles ON grumbles
  FOR UPDATE USING (user_id = auth.uid());

-- 全ユーザーが全投稿を閲覧可能
CREATE POLICY public_read_grumbles ON grumbles
  FOR SELECT USING (true);
```

---

## Notes

- このスキーマは PostgreSQL 14+ を想定
- Firebase Authentication と連携する場合、`user_id` は Firebase UID と同期
- 将来的な拡張（投票、大怨霊）に対応する設計
- すべてのタイムスタンプは UTC で保存

---

**Last Updated:** 2025-10-27
**Schema Version:** 1.0.0
