## データベース設計：Grumble (PostgreSQL)

### 1. 投稿 (Grumble) テーブル

愚痴の投稿そのものを管理する核となるテーブルです。「24時間で消える」機能に対応するため、投稿日時を重要視します。

| **フィールド名** | **データ型** | **NULL可** | **制約/備考** | **目的** |
| --- | --- | --- | --- | --- |
| **grumble_id** | UUID / SERIAL | NOT NULL | PRIMARY KEY | 投稿の一意識別子。 |
| **user_id** | UUID | NOT NULL | FOREIGN KEY (AnonymousUser) | 投稿者の匿名ID。 |
| **content** | TEXT | NOT NULL | 文字数制限あり（例：280文字） | 愚痴の本文。 |
| **toxic_level** | INT | NOT NULL | 1〜5の範囲 | 投稿者が自己申告した毒レベル。 |
| **vibe_count** | INT | NOT NULL | DEFAULT 0 | 「わかる…」の総数（キャッシュ）。 |
| **is_purified** | BOOLEAN | NOT NULL | DEFAULT FALSE | 成仏フラグ。Trueになるとタイムラインから消える。 |
| **posted_at** | TIMESTAMP WITH TIME ZONE | NOT NULL |  | 投稿時刻。**24時間削除処理の基準。** |
| **expires_at** | TIMESTAMP WITH TIME ZONE | NOT NULL |  | 投稿後24時間後の時刻。 |
| **is_event_grumble** | BOOLEAN | NOT NULL | DEFAULT FALSE | イベント（お焚き上げ/大怨霊）投稿か否か。 |

### 💡 インデックスの最適化

- `posted_at`: タイムライン表示（新しい順）の高速化。
- `expires_at`: 24時間削除バッチ処理での効率的なレコード検索。
- `is_purified`: タイムライン表示でのフィルタリング。

### 2. 共感 (Vibe) テーブル

ユーザーが「わかる…」ボタンを押した履歴を管理します。一意性を担保し、二重押しを防ぎます。

| **フィールド名** | **データ型** | **NULL可** | **制約/備考** | **目的** |
| --- | --- | --- | --- | --- |
| **vibe_id** | SERIAL | NOT NULL | PRIMARY KEY | 共感履歴の一意識別子。 |
| **grumble_id** | UUID | NOT NULL | FOREIGN KEY (Grumble) | 共感対象の投稿ID。 |
| **user_id** | UUID | NOT NULL | FOREIGN KEY (AnonymousUser) | 共感した匿名ユーザーID。 |
| **vibe_type** | VARCHAR(20) | NOT NULL | 'WAKARU' (わかる...) またはスタンプ名 | 共感の種類（将来的なスタンプ機能を見越して）。 |
| **voted_at** | TIMESTAMP WITH TIME ZONE | NOT NULL |  | 共感した時刻。 |

### 💡 インデックスの最適化

- `grumble_id`: ある投稿の「わかる…」数を集計する際の高速化。
- `(grumble_id, user_id)`: **UNIQUE制約**を設定し、同一ユーザーによる同一投稿への二重共感を防止。

### 3. 匿名ユーザー (AnonymousUser) テーブル

匿名ユーザーの永続的な情報を管理します。「菩薩ランキング」に必要な「徳ポイント」を保持します。

| **フィールド名** | **データ型** | **NULL可** | **制約/備考** | **目的** |
| --- | --- | --- | --- | --- |
| **user_id** | UUID | NOT NULL | PRIMARY KEY | 匿名ユーザーの一意識別子 (デバイスIDなどから生成)。 |
| **virtue_points** | INT | NOT NULL | DEFAULT 0 | 共感（「わかる…」を押す行為）によって貯まる徳ポイント。 |
| **created_at** | TIMESTAMP WITH TIME ZONE | NOT NULL |  | ユーザー作成日時。 |
| **profile_title** | VARCHAR(50) | NULL | 例：「今週の菩薩」などの称号。 |  |

### 💡 インデックスの最適化

- `virtue_points`: 菩薩ランキング（徳ポイントの降順）表示の高速化。

### 4. 投票 (Poll) テーブル （将来機能）

「これって私だけ？」投票機能の実装に対応します。

| **フィールド名** | **データ型** | **NULL可** | **制約/備考** | **目的** |
| --- | --- | --- | --- | --- |
| **poll_id** | SERIAL | NOT NULL | PRIMARY KEY | 投票の一意識別子。 |
| **grumble_id** | UUID | NOT NULL | FOREIGN KEY (Grumble) | 投票が紐づく愚痴投稿ID。 |
| **question** | VARCHAR(255) | NOT NULL |  | 投票の質問文。 |
| **option_1** | VARCHAR(100) | NOT NULL |  | 選択肢Aのテキスト。 |
| **option_2** | VARCHAR(100) | NOT NULL |  | 選択肢Bのテキスト。 |

### 5. 投票結果 (PollVote) テーブル （将来機能）

各投票へのユーザーの回答を記録します。

| **フィールド名** | **データ型** | **NULL可** | **制約/備考** | **目的** |
| --- | --- | --- | --- | --- |
| **poll_vote_id** | SERIAL | NOT NULL | PRIMARY KEY | 投票結果の一意識別子。 |
| **poll_id** | INT | NOT NULL | FOREIGN KEY (Poll) | 対象の投票ID。 |
| **user_id** | UUID | NOT NULL | FOREIGN KEY (AnonymousUser) | 投票した匿名ユーザーID。 |
| **selected_option** | INT | NOT NULL | 1または2 (選択肢のインデックス) | ユーザーが選んだ選択肢。 |

### 💡 インデックスの最適化

- `(poll_id, user_id)`: **UNIQUE制約**を設定し、二重投票を防止。

### 6. イベント (Event) テーブル

「大怨霊討伐イベント」や「お焚き上げ」のステータス管理に使用します。

| **フィールド名** | **データ型** | **NULL可** | **制約/備考** | **目的** |
| --- | --- | --- | --- | --- |
| **event_id** | SERIAL | NOT NULL | PRIMARY KEY | イベントの一意識別子。 |
| **event_name** | VARCHAR(100) | NOT NULL | 例：「月曜日の大怨霊」 | イベントの名称。 |
| **event_type** | VARCHAR(50) | NOT NULL | 'DAIONRYO' または 'OTAKINAGE' | イベントの種類。 |
| **start_time** | TIMESTAMP WITH TIME ZONE | NOT NULL |  | イベント開始時刻。 |
| **end_time** | TIMESTAMP WITH TIME ZONE | NOT NULL |  | イベント終了時刻。 |
| **current_hp** | INT | NOT NULL | 大怨霊の場合のみ利用 | イベントの進行度（HPゲージ）。 |
| **max_hp** | INT | NOT NULL | 大怨霊の場合のみ利用 | 大怨霊の初期HP。 |
| **is_active** | BOOLEAN | NOT NULL | DEFAULT FALSE | 現在開催中のイベントか否か。 |