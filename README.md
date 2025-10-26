# Grumble - 愚痴を吐き出すアプリ

愚痴を匿名で投稿して、共感しあい、成仏させるアプリです。

## 🎯 コンセプト

- **匿名性**: アカウント登録不要。完全匿名で愚痴を吐き出せます
- **24時間で消える**: 投稿は24時間後に自動削除されます
- **成仏システム**: 「わかる…」が一定数集まると投稿が成仏します
- **お焚き上げイベント**: 深夜0時に全ての愚痴を浄化する儀式があります

## 🚀 技術スタック

### フロントエンド
- **React Native / Expo** - クロスプラットフォーム開発
- **TypeScript** - 型安全性
- **Expo Router** - ファイルベースルーティング
- **Firebase Authentication** - 匿名認証・メール認証
- **TanStack Query (React Query)** - サーバーステート管理
- **Zustand** - クライアントステート管理
- **React Native Reanimated** - アニメーション
- **axios** - HTTP通信

### バックエンド (別プロジェクトで開発中)
- **Go** - バックエンドAPI
- **PostgreSQL** - データベース
- **WebSocket** - リアルタイム通信
- **Firebase Authentication** - 認証のみ利用

### スキーマ駆動開発
- **OpenAPI 3.0** - API仕様定義
- **openapi-typescript** - TypeScript型自動生成

## 📱 主な機能

### 実装済み機能

#### FE-01: タイムライン表示
- 愚痴投稿を新しい順に表示
- プルリフレッシュ対応
- スムーズなスクロール(60fps)

#### FE-02: 投稿機能
- テキストのみ投稿(最大280文字)
- 毒レベル選択(Lv.1〜5)
- リアルタイムバリデーション

#### FE-03: 「わかる…」ボタン
- 1ユーザー1投稿につき1回のみ
- リアルタイムカウント更新
- ハプティックフィードバック

#### FE-04: 成仏演出
- 「わかる…」が一定数に達すると発動
- アニメーション付き消滅エフェクト
- パーティクル効果

#### FE-05: フィルター機能
- 毒レベルでフィルタリング
- 未成仏投稿のみ表示
- モーダルUIで直感的な操作

#### FE-06: お焚き上げイベントUI
- イベント情報の表示
- 炎のアニメーション
- グラデーション背景

#### WebSocket統合
- リアルタイム更新
- 自動再接続機能
- イベント駆動アーキテクチャ

## 🏗 プロジェクト構造

```
Grumble/
├── app/                      # Expo Router画面
│   ├── (tabs)/              # タブナビゲーション
│   │   ├── index.tsx        # タイムライン画面
│   │   └── explore.tsx      # イベント画面
│   ├── _layout.tsx          # ルートレイアウト
│   └── create-grumble.tsx   # 投稿作成モーダル
├── src/
│   ├── components/          # 共通コンポーネント
│   │   ├── GrumbleCard.tsx             # 投稿カード
│   │   ├── ToxicLevelFilter.tsx        # フィルターモーダル
│   │   └── PurificationAnimation.tsx   # 成仏アニメーション
│   ├── services/            # API通信層
│   │   ├── api.ts                      # APIクライアント
│   │   ├── grumble.service.ts          # 投稿API
│   │   ├── user.service.ts             # ユーザーAPI
│   │   ├── event.service.ts            # イベントAPI
│   │   └── websocket.service.ts        # WebSocket
│   ├── stores/              # グローバルステート
│   │   └── userStore.ts                # ユーザー情報管理
│   ├── hooks/               # カスタムフック
│   │   └── useWebSocket.ts             # WebSocket統合
│   ├── types/               # 型定義
│   │   └── api.ts                      # OpenAPI生成型
│   └── constants/           # 定数
│       └── config.ts                   # アプリ設定
├── openapi.yaml             # OpenAPI仕様
└── package.json
```

## 🛠 セットアップ

### 前提条件
- Node.js 20.18.3以上
- npm 11.5.1以上
- Expo CLI

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm start

# iOSシミュレータで起動
npm run ios

# Androidエミュレータで起動
npm run android

# Webブラウザで起動
npm run web
```

### Firebase設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Authentication > Sign-in methodで以下を有効化:
   - メール/パスワード
   - 匿名認証
3. プロジェクト設定からFirebase SDKの構成を取得
4. `.env`ファイルを作成（`.env.example`を参考に）:

```bash
cp .env.example .env
```

5. `.env`にFirebaseの設定値を記入:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 環境変数

`src/constants/config.ts` でAPI URLを設定:

```typescript
export const API_BASE_URL = __DEV__
  ? 'http://localhost:8080/api/v1'  // 開発環境
  : 'https://api.grumble.app/v1';    // 本番環境
```

## 📝 API仕様

OpenAPIスキーマから型を自動生成:

```bash
npx openapi-typescript openapi.yaml -o src/types/api.ts
```

## 🎨 デザインガイドライン

### 毒レベルカラー
- Lv.1: `#4CAF50` (緑) - ちょっとモヤモヤ
- Lv.2: `#8BC34A` (黄緑) - イライラする
- Lv.3: `#FFC107` (黄) - かなりムカつく
- Lv.4: `#FF9800` (オレンジ) - 激おこ
- Lv.5: `#F44336` (赤) - 大爆発寸前

### アクセントカラー
- プライマリ: `#4CAF50` (成仏グリーン)
- セカンダリ: `#FF5722` (炎のオレンジ)

## 🔮 今後の実装予定

- 大怨霊討伐イベント
- 投票機能
- 菩薩ランキング
- プッシュ通知
- 成仏演出のカスタマイズ

## 📄 ライセンス

Private

## 👥 開発チーム

4名体制でフロント/バック分離開発

---

Powered by DeveloperX
