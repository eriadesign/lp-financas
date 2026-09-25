# Minhas Finanças — Landing Page

LP de aquisição para o **Minhas Finanças**, ferramenta AUVP de organização financeira pessoal.

## Abordagem

O produto é o protagonista da página: em vez de ilustrações ou banco de imagens, a LP é construída
com componentes de UI (dashboard, lista de transações, categorização, gráficos, metas, fluxo de
conexão Open Finance, cadastro manual e estados vazios) que reproduzem a interface real do app,
seguindo a referência visual do Copilot Money e do Monarch Money.

A narrativa segue a progressão do briefing:

1. **Espalhado** — contas e apps desconectados
2. **Centralizado** — tudo em um painel único
3. **Entendimento** — categorização automática
4. **Organização** — lista de transações organizada
5. **Acompanhamento** — metas com progresso

## Identidade visual

Tokens extraídos diretamente de [`ProdutosAUVP/central`](https://github.com/ProdutosAUVP/central)
(`src/index.css` / `docs/figma/design-tokens.json`), marca **Capital**:

- Cor primária `#023620` (verde AUVP), tipografia **Anek Latin** (display), **Sora** (UI/botões),
  **Roboto** (corpo de texto), radius `0.75rem`.
- Ver `css/tokens.css` para a lista completa de variáveis (cores semânticas, paleta de gráficos,
  sombras).

## Stack

Site estático (HTML/CSS/JS puro, sem build step) — fácil de publicar em qualquer host estático
(Vercel, GitHub Pages, Netlify) e de portar depois para Next.js/React se o time decidir evoluir
para um projeto com componentes reais do produto.

```
index.html
css/
  tokens.css    → design tokens da LP (cores, tipografia, radius, sombras)
  base.css      → reset, tipografia, botões, cards, utilitários
  mockups.css   → moldura de navegador (.frame) e a dobra "espalhado" (.scatter)
  app-ui.css    → réplica dos componentes do app Minhas Finanças (escopo .app)
  layout.css    → header, hero, storytelling, features, tour, prova social, footer
js/
  main.js       → encaixe das réplicas (zoom), scroll reveal, tabs do tour, menu mobile
```

## Réplicas do app

Todas as telas de produto da LP (Home, Contas, Cartões, Transações, Orçamento,
Visualização de uso, Nova conta, Lançamento manual, estados vazios) são réplicas em
HTML/CSS dos componentes do app `financeiro-master`, com os tokens do tema claro dele
(`app/globals.css`) e as medidas das classes Tailwind originais. O cabeçalho de
`css/app-ui.css` mapeia cada bloco ao componente de origem.

Cada réplica é montada no tamanho real do app dentro de um `.app-fit` e reduzida por
`zoom`, como uma captura de tela:

```html
<div class="app-fit" data-w="1000,720" data-h="720,1040">
  <div class="app">…</div>
</div>
```

- `data-w`: larguras de projeto, da maior para a menor. Vale a primeira que caiba com
  zoom ≥ 0,5; a última liga a variante `.compact` (sem sidebar, grades em uma coluna).
- `data-h` (opcional): altura de recorte para cada largura.

Ao mudar um componente no app, atualize a classe `a-*` correspondente em `app-ui.css`.

## Rodando localmente

```
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Próximos passos sugeridos

- Integrar formulário de cadastro/login com o backend real (CTAs `#comecar` / `#login`).
- Validar copy e números de prova social (depoimentos, estatísticas) com dados reais antes do
  lançamento — os atuais são placeholders ilustrativos.
