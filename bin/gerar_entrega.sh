#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
NAME="Grupo79-Challenge-OTIS-Sprint2"
MEMBERS_FILE="$REPO_DIR/integrantes.txt"
DEPLOY_URL="https://guilhermegor.github.io/central-ocorrencias-elevadores/"
REPO_URL="https://github.com/guilhermegor/central-ocorrencias-elevadores"
MVP_ZIP="mvp-central-ocorrencias-elevadores.zip"

require_inputs() {
    if [ ! -s "$MEMBERS_FILE" ]; then
        print_status "error" "Crie $MEMBERS_FILE com uma linha 'Nome completo;RM' por integrante."
        exit 1
    fi
    if [ -n "$(git -C "$REPO_DIR" status --porcelain)" ]; then
        print_status "error" "Há alterações não commitadas; a entrega deve sair do que está no GitHub."
        exit 1
    fi
}

build_mvp() {
    local work_dir="$1"
    print_status "info" "1/3 Gerando o MVP em JavaScript puro (ship/)..."
    (cd "$REPO_DIR" && npm run -s delivery)
    (cd "$REPO_DIR" && zip -qr "$work_dir/$MVP_ZIP" ship -x 'ship/node_modules/*')
}

member_rows() {
    local name rm
    while IFS=';' read -r name rm; do
        [ -n "$name" ] || continue
        printf '    <tr><td>%s</td><td class="rm">RM %s</td></tr>\n' "$name" "$rm"
    done < "$MEMBERS_FILE"
}

write_html() {
    local video_url="$1" html_path="$2" rows
    rows="$(member_rows)"
    cat > "$html_path" <<HTML
<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><style>
  body { font-family: 'Liberation Serif', 'Times New Roman', serif; margin: 3cm 2.5cm; color: #111; }
  h1 { font-size: 22pt; margin: 0 0 4pt; } h2 { font-size: 14pt; margin: 28pt 0 8pt; }
  .sub { font-size: 13pt; color: #444; margin: 0; }
  table { border-collapse: collapse; width: 100%; font-size: 12pt; }
  td { border-bottom: 1px solid #ccc; padding: 6pt 4pt; } td.rm { text-align: right; width: 30%; }
  a { color: #0b4f9c; word-break: break-all; } p { font-size: 12pt; line-height: 1.5; }
</style></head><body>
  <h1>Central de Ocorrências · Elevadores</h1>
  <p class="sub">FIAP · Challenge OTIS · Sprint 2</p>
  <h2>Grupo 79</h2>
  <table>
$rows
  </table>
  <h2>Links</h2>
  <p><strong>Vídeo (até 3 min):</strong> <a href="$video_url">$video_url</a></p>
  <p><strong>Deploy:</strong> <a href="$DEPLOY_URL">$DEPLOY_URL</a></p>
  <p><strong>Código-fonte:</strong> <a href="$REPO_URL">$REPO_URL</a></p>
</body></html>
HTML
}

render_pdf() {
    local html_path="$1" pdf_path="$2"
    print_status "info" "2/3 Gerando o PDF..."
    (cd "$REPO_DIR" && HTML="$html_path" PDF="$pdf_path" node -e "
      const { chromium } = require('@playwright/test');
      (async () => {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto('file://' + process.env.HTML);
        await page.pdf({ path: process.env.PDF, format: 'A4' });
        await browser.close();
      })().catch((error) => { console.error(error); process.exit(1); });
    ")
}

pack_zip() {
    local work_dir="$1"
    print_status "info" "3/3 Montando o ZIP final..."
    cp "$REPO_DIR/$NAME.pdf" "$work_dir/"
    rm -f "$REPO_DIR/$NAME.zip"
    (cd "$work_dir" && zip -q "$REPO_DIR/$NAME.zip" "$NAME.pdf" "$MVP_ZIP")
}

main() {
    local video_url="${1:?uso: bin/gerar_entrega.sh <link-publico-do-video>}"
    require_inputs
    WORK_DIR="$(mktemp -d)"
    trap 'rm -rf "$WORK_DIR"' EXIT
    build_mvp "$WORK_DIR"
    write_html "$video_url" "$WORK_DIR/entrega.html"
    render_pdf "$WORK_DIR/entrega.html" "$REPO_DIR/$NAME.pdf"
    pack_zip "$WORK_DIR"
    print_status "success" "PDF: $REPO_DIR/$NAME.pdf"
    print_status "success" "ZIP: $REPO_DIR/$NAME.zip"
}

main "$@"
