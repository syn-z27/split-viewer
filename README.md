# Split Viewer

Ctrl+Shift を押しながらリンクをクリックすると、そのリンクを Chrome の分割ビュー（Split view）で開く拡張機能です。

## 使い方

| 操作 | 動作 |
| --- | --- |
| Ctrl+Shift+クリック（macOS は Cmd+Shift+クリック） | リンクを今のタブの右側に分割ビューで開く |
| 分割ビュー中に同じ操作 | もう片方のペインにリンクを読み込む |

分割ビューが使えない環境では、今のタブの隣に通常のタブとして開きます。

## 動作環境

- Chrome 155 以上（Tabs Split View API を使用）
- 追加の権限は不要

## インストール（開発版）

1. `chrome://extensions` を開く
2. 右上の「デベロッパー モード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」でこのフォルダを選ぶ
4. 開いているページを再読み込みする

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `manifest.json` | 拡張機能の設定 |
| `content.js` | ページ上の Ctrl+Shift+クリックを検出し、既定の「新しいタブで開く」動作を止める |
| `background.js` | `chrome.tabs.create({ url, splitWithTabId })` で分割ビューを作る |

## セキュリティ

- 実際のユーザー操作によるクリック（`event.isTrusted`）だけに反応します。ページのスクリプトから作った偽のクリックではタブを開きません。
- 開くのは `http:` と `https:` のリンクだけです。`javascript:`、`data:`、`file:` などのリンクは対象外で、Chrome の通常の動作に任せます。
- URL はページ側（`content.js`）とバックグラウンド側（`background.js`）の両方で確認します。バックグラウンド側では長さの上限と送信元も確認します。
- コンテンツスクリプトは `http://` と `https://` のページでだけ動きます。追加の権限は要求しません。

## 制限事項

- `chrome://` ページや Chrome ウェブストアなど、拡張機能のスクリプトが動かないページでは使えません。
- `file://` のページや、`http:` / `https:` 以外のリンクでは使えません。
- インストール前から開いていたタブは、再読み込みするまで動作しません。

## トラブルシューティング

`chrome://extensions` の Split Viewer の「Service Worker」リンクから DevTools を開くと、エラーを確認できます。

## 参考

- [Enhance multitasking extensions with the new Tabs Split View API](https://developer.chrome.com/blog/split-view-api-extensions)
