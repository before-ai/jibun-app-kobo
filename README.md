# じぶんアプリ工房

型をえらんで書きかえるだけ。自分だけのアプリがその場で動き、リンクひとつで人に渡せる。

公開先: (まだ。`../site-factory/publish.sh jibun-app-kobo` で https://before-ai.github.io/jibun-app-kobo/ に出る)

## 動かす

ビルド不要。Claude の preview「jibun-app-kobo」か、次のコマンドで http://localhost:8810 を開く。

```bash
python3 -m http.server 8810 --directory docs
```

## 構成

```
docs/index.html      画面
docs/style.css       見た目(色は :root だけ)
docs/app.js          動き。render() が本体
docs/data/*.json     固定データ
```

## データ源と注意

- (出典、更新頻度、載せないと決めたものをここに書く)
