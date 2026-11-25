#!/usr/bin/env node
// みんなの作品の管理(運営用)。公開はしない。
//   node tools/gallery.mjs list
//   node tools/gallery.mjs add "<申し込み文 または リンク>" [--by 名前] [--note ひとこと] [--yes] [--force]
//   node tools/gallery.mjs remove <id>
// add は --yes を付けるまで書き込まず、載る中身を表示するだけ。
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const docs = join(dirname(fileURLToPath(import.meta.url)), "..", "docs");
const dataPath = join(docs, "gallery-data.js");
globalThis.window = {};
globalThis.location = { href: "https://before-ai.github.io/jibun-app-kobo/" };
globalThis.document = {};
createRequire(import.meta.url)(join(docs, "templates.js"));
const { decode, encode, TEMPLATES } = globalThis.window.Jibun;

const HEAD = "// みんなの作品(運営が確認して載せたものだけ)。手で書かず tools/gallery.mjs で追加・削除する\nwindow.JibunGallery = [\n";
function load() {
  const s = readFileSync(dataPath, "utf8");
  const m = s.match(/window\.JibunGallery = (\[[\s\S]*\]);/);
  if (!m) throw new Error("gallery-data.js が読めません");
  return JSON.parse(m[1].replace(/,\s*\]$/, "]"));
}
function save(list) {
  writeFileSync(dataPath, HEAD + list.map((e) => `  ${JSON.stringify(e)},\n`).join("") + "];\n");
}
function opt(args, name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}
const clean = (s, max) => String(s || "").replace(/\s+/g, " ").trim().slice(0, max);

// 機械で止めるもの。属性いじりなどは機械では分からないので、表示された中身を人が読む
const NG = [
  [/0\d{1,4}[-(]?\d{1,4}[-)]?\d{3,4}/, "電話番号らしきもの"],
  [/[\w.+-]+@[\w-]+\.[\w.-]+/, "メールアドレスらしきもの"],
  [/https?:\/\/|www\./i, "外部リンク"],
  [/〒|\b\d{3}-\d{4}\b/, "郵便番号らしきもの"],
  [/検問/, "載せない情報(検問)"],
];

const [cmd, ...args] = process.argv.slice(2);
if (cmd === "list") {
  const list = load();
  if (!list.length) console.log("(まだ0本)");
  for (const e of list) console.log(`${e.id}  ${e.added}  ${decode(e.code)?.name ?? "(読めない)"}  作: ${e.by}`);
} else if (cmd === "add") {
  const text = args[0] || "";
  const cfg = decode(text);
  if (!cfg) { console.error("共有コード(JA1.…)が読めません"); process.exit(1); }
  const values = [cfg.name, cfg.desc, ...Object.values(cfg.fields)];
  if (values.some((v) => typeof v !== "string") || !TEMPLATES[cfg.type] || !/^#[0-9a-f]{6}$/i.test(cfg.color)) {
    console.error("中身の形が正しくありません"); process.exit(1);
  }
  const code = encode(cfg);
  if (code.length > 6000) { console.error("大きすぎます(6000字まで)"); process.exit(1); }
  const by = clean(opt(args, "--by") ?? text.match(/^作者[::][^\S\r\n]*(.*)$/m)?.[1], 20) || "名無し";
  const note = clean(opt(args, "--note") ?? text.match(/^ひとこと[::][^\S\r\n]*(.*)$/m)?.[1], 60);
  const id = createHash("sha1").update(code).digest("hex").slice(0, 8);
  const list = load();
  if (list.some((e) => e.id === id)) { console.error(`同じアプリがすでに載っています: ${id}`); process.exit(1); }

  console.log(`--- 載る中身(${id})\n型: ${TEMPLATES[cfg.type].name}\n名前: ${cfg.name}\n説明: ${cfg.desc}\n作者: ${by}\nひとこと: ${note}`);
  for (const [k, v] of Object.entries(cfg.fields)) console.log(`${k}: ${v}`);
  const hits = NG.filter(([re]) => [...values, by, note].some((v) => re.test(v))).map(([, why]) => why);
  if (hits.length) console.log(`\n⚠ 要確認: ${hits.join("、")}`);
  if (hits.length && !args.includes("--force")) { console.error("止めました。問題なければ --force を付けてください"); process.exit(1); }
  if (!args.includes("--yes")) { console.log("\n(まだ書き込んでいません。中身を読んで問題なければ --yes を付けて再実行)"); process.exit(0); }
  const d = new Date();
  const added = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  list.push({ id, code, by, note, added });
  save(list);
  console.log(`\n追加しました(全${list.length}本)。本番へは /publish jibun-app-kobo`);
} else if (cmd === "remove") {
  const list = load();
  const next = list.filter((e) => e.id !== args[0]);
  if (next.length === list.length) { console.error("その id はありません"); process.exit(1); }
  save(next);
  console.log(`取り下げました(残り${next.length}本)。本番へは /publish jibun-app-kobo`);
} else {
  console.log("使い方: node tools/gallery.mjs list | add \"<申し込み文>\" [--by 名前] [--note ひとこと] [--yes] [--force] | remove <id>");
}
