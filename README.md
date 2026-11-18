# じぶんアプリ工房

型をえらんで書きかえるだけ。自分だけのアプリがその場で動き、リンクひとつで人に渡せる。
将来は「自作アプリの作成プラットフォーム」にしていくための、最初の一歩(作れる体験)。

公開先: (まだ。`../site-factory/publish.sh jibun-app-kobo` で https://before-ai.github.io/jibun-app-kobo/ に出る)

## 動かす

ビルド不要。Claude の preview「jibun-app-kobo」か、次のコマンドで http://localhost:8810 を開く。

```bash
python3 -m http.server 8810 --directory docs
```

## 構成

```
docs/index.html      トップ(コンセプト・3ステップ・型・作品例・これから)
docs/make.html       工房(1 型をえらぶ → 2 書きかえる → 3 できあがり)
docs/app.html        アプリページ(リンクの # に入った共有コードからアプリを組み立てる)
docs/runtime.js      できあがったアプリの本体(runApp)。書き出す単体 HTML にもそのまま入る
docs/templates.js    型6種・色・見本アプリ・共有コードの変換・共通ヘルパー(window.Jibun)
docs/nav.js          共通ナビ(スマホ幅のメニュー開閉)
docs/site.js         トップの動き
docs/kobo.js         工房の動き
docs/app.js          アプリページの動き
docs/style.css       見た目(色は :root だけ。2026-11-07 に白地+オレンジの構成へ作り替え)
artifact.html        旧版(claude.ai アーティファクト用の1ファイル版)。サイトとは別物
```

## 仕組みと決めごと

- **共有コード** = `JA1.` + アプリ設定 JSON の base64(URL 安全版)。`app.html#JA1...` がそのままアプリのリンクになる。`#` の中身はサーバーに送られない。
- **保存先は端末内だけ**。工房の一覧は `localStorage` の `jibun-app-kobo:v1`、各アプリの記録は `jibun-app:<id>`(アプリページはリンクの文字列から鍵を作るので、同じリンクなら同じ記録が続く)。
- **アカウント・サーバー・ユーザー投稿なし**。「作品例」はいまは見本の固定データ(`templates.js` の `GALLERY`)。みんなの作品ギャラリーは次の段階。
- 型を増やすときは `runtime.js` の `views` と `templates.js` の `TEMPLATES` の両方に足す。

## データ源

- 外部データなし。見本アプリの中身はすべて自作。
