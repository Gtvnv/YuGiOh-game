# Yu-Gi-Oh! | Jo-Ken-Po Edition

Um mini-jogo de cartas no estilo **pedra-papel-tesoura**, ambientado no universo
de Yu-Gi-Oh!, feito com **HTML, CSS e JavaScript puro** (sem frameworks).

![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-f7df1e)
![No Dependencies](https://img.shields.io/badge/dependencies-none-success)

## 🎮 Como jogar

1. Abra o jogo no navegador.
2. Passe o mouse sobre uma carta da sua mão para ver os detalhes no painel lateral.
3. Clique (ou pressione `Enter`/`Espaço`) em uma carta para jogá-la.
4. O oponente joga uma carta aleatória e o resultado aparece no centro.
5. Clique em **Próximo duelo** para começar uma nova rodada.

### Regras (Jo-Ken-Po)

| Carta                 | Vence        | Perde para   |
| --------------------- | ------------ | ------------ |
| Blue Eyes White Dragon| Dark Magician| Exodia       |
| Dark Magician         | Exodia       | Blue Eyes    |
| Exodia                | Blue Eyes    | Dark Magician|

## ✨ Melhorias desta versão

Além da base original do desafio, esta versão inclui:

- **Placar persistente** de vitórias e derrotas durante a sessão.
- **Acessibilidade**: cartas jogáveis por teclado (`Tab` + `Enter`/`Espaço`),
  `aria-label` e regiões `aria-live` para anunciar resultados.
- **Bloqueio de jogada** durante a rodada (evita duplo clique / estado inconsistente).
- **Código reorganizado** em estado centralizado, funções puras para a lógica de
  duelo e separação clara entre dados, lógica e DOM.
- **Animações** de entrada das cartas e layout responsivo.
- **Áudio** com trilha de fundo e efeitos de vitória/derrota, respeitando a política
  de autoplay dos navegadores (som liberado na primeira interação).

## 🧠 Conceitos aplicados

- Gerenciamento de estado manual com um único objeto `state`.
- Funções pequenas e, quando possível, puras (`duel`, `getCardById`, `drawHand`).
- Organização de código por responsabilidade (dados ⇢ lógica ⇢ render).
- Manipulação do DOM e eventos sem bibliotecas externas.

## 📁 Estrutura

```
.
├── index.html
└── src
    ├── assets        # imagens, áudios, cursores e vídeo
    ├── scripts
    │   └── engine.js # motor do jogo
    └── styles        # reset, botões, frames e layout principal
```

## 🚀 Executando localmente

Como é um projeto estático, basta abrir o `index.html`. Para evitar bloqueios de
`módulo`/áudio em `file://`, recomenda-se um servidor local simples:

```bash
# Python
python -m http.server 8000

# ou Node
npx serve .
```

Depois acesse `http://localhost:8000`.

## 🎨 Créditos de assets

- UI estilo RPG baseada no [RPGUI](http://ronenness.github.io/RPGUI/).
- Fonte [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P).
- Artes das cartas e sprites do universo Yu-Gi-Oh! (uso educacional/não comercial).
