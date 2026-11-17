/**
 * アフィリエイト案件の一元管理。
 * - url: A8.net の管理画面で発行した広告リンク（https://px.a8.net/... の href 部分）を貼る。
 *        空のままだとボタンは表示されない（未提携の案件を誤って載せないため）。
 * - pixel: A8 の広告リンクに付いてくる 1x1 画像の src（任意）。
 * - reward: 自分用メモ。サイトには表示しない。
 * 報酬・条件は変わるので、定期的に A8 の管理画面で確認して更新する。
 */
export type Program = {
  name: string;
  category: string;
  catch: string; // ボタン上に出す一言（誇大表現NG）
  cta: string;
  url: string;
  pixel?: string;
  reward: string;
  checkedAt: string;
};

export const PROGRAMS: Record<string, Program> = {
  enepoke: {
    name: 'エネポケ',
    category: 'ガス',
    catch: 'プロパンガス会社の切り替えを無料でサポート',
    cta: 'エネポケで料金をチェックする',
    url: '',
    reward: '新規切替完了 10,500円',
    checkedAt: '2026-11-10',
  },
  xmobile_green: {
    name: 'グリーンプラン（X-mobile）',
    category: 'スマホ',
    catch: '1GB単位で選べて、余ったデータは翌月に繰り越し。縛りなしの格安SIM',
    cta: 'グリーンプランの詳細を見る',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BGNCH+JNLRU+5XZ2+5YJRM',
    pixel: 'https://www17.a8.net/0.gif?a8mat=4BGNCH+JNLRU+5XZ2+5YJRM',
    reward: '新規開通 6,000円',
    checkedAt: '2026-11-10',
  },
  au_hikari_globalcast: {
    name: 'auひかり（代理店：グローバルキャスト）',
    category: 'ネット',
    catch: '代理店独自のキャンペーンあり',
    cta: 'auひかりのキャンペーンを見る',
    url: '',
    reward: '新規開通 30,000円',
    checkedAt: '2026-11-10',
  },
  hoken_minaoshi_honpo: {
    name: '保険見直し本舗',
    category: '保険',
    catch: '複数の保険会社から比較して相談できる',
    cta: '無料の保険相談を予約する',
    url: '',
    reward: '新規保険相談実施 15,384円',
    checkedAt: '2026-11-10',
  },
  hoken_navi_setsuyakun: {
    name: 'ほけんNaviせつやくん',
    category: '保険',
    catch: '保険と資産形成をまとめて無料相談',
    cta: 'せつやくんで無料相談する',
    url: '',
    reward: '新規無料相談完了 11,000円',
    checkedAt: '2026-11-10',
  },
  garden_fp: {
    name: 'ガーデン（FP無料相談）',
    category: '家計全体',
    catch: '老後資金・資産形成をFPに無料で相談',
    cta: 'ガーデンでFPに相談する',
    url: '',
    reward: '初回対面無料相談実施 10,250円',
    checkedAt: '2026-11-10',
  },
  manecafe: {
    name: 'マネカフェ',
    category: '家計全体',
    catch: '独立系FPが保険・資産運用をまとめて無料診断',
    cta: 'マネカフェで無料診断する',
    url: '',
    reward: '新規無料相談 10,000円',
    checkedAt: '2026-11-10',
  },
};
