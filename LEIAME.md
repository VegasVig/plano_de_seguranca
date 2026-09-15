# Vegas — Plano de Segurança

Aplicativo de campo para levantamento de segurança patrimonial, com geração do plano técnico em PDF, base de dados no Google e painel de gestão da carteira de postos.

Funciona instalado no celular, sem sinal. Os dados ficam no aparelho e são enviados para a planilha quando houver internet. As fotos vão para o Google Drive, nunca para dentro da planilha.

---

## O que tem dentro

| Arquivo | Para que serve |
|---|---|
| `index.html` | O aplicativo de campo. É a tela que o supervisor usa. |
| `painel.html` | Painel de gestão da carteira. Lê a base e mostra ranking, revisões vencidas e comparativo de controles. |
| `Code.gs` | Backend no Google Apps Script. Cria a planilha, a pasta do Drive e responde ao aplicativo. |
| `js/schema.js` | As perguntas. **É o arquivo que você edita** para incluir ou remover itens. |
| `js/engine.js` | Índice de maturidade, 49 regras de risco e plano de ação. |
| `js/pops.js` | Os 40 procedimentos operacionais e a regra que decide quais entram no documento. |
| `js/report.js` | Monta o documento técnico. |
| `js/logo.js` | A logo da Vegas embutida, para funcionar offline e aparecer no PDF. |
| `sw.js`, `manifest.json` | Fazem o aplicativo instalar no celular e rodar sem internet. |

---

## Colocar no ar — parte 1, o aplicativo

Não precisa de terminal em nenhuma etapa.

1. Entre em **github.com**, clique em **New repository**. Dê o nome `plano-vegas`, marque **Public** e crie.
2. Na página do repositório, clique em **uploading an existing file**.
3. Descompacte o zip no computador e **arraste todo o conteúdo** para a página. Arraste as pastas `js`, `css` e `img` junto.
4. Clique em **Commit changes**.
5. Vá em **Settings**, menu lateral **Pages**. Em *Branch*, escolha `main` e a pasta `/ (root)`. Salve.
6. Espere um ou dois minutos e recarregue. O GitHub mostra o endereço, algo como
   `https://seu-usuario.github.io/plano-vegas/`

### Instalar no celular

Abra esse endereço no celular.

- **Android, Chrome** — menu de três pontos, *Adicionar à tela inicial*.
- **iPhone, Safari** — botão de compartilhar, *Adicionar à Tela de Início*. Precisa ser o Safari.

A partir daí ele abre como aplicativo e funciona sem sinal.

---

## Colocar no ar — parte 2, a base de dados

1. Abra **script.google.com** e clique em **Novo projeto**.
2. Apague o conteúdo do editor e cole **todo** o arquivo `Code.gs`.
3. No seletor de função, escolha **instalar** e clique em **Executar**.
4. O Google vai pedir autorização. Aceite. Na tela de aviso, clique em *Avançado* e depois em *Ir para o projeto (não seguro)* — é o seu próprio script.
5. Abra o **registro de execução**. Ele mostra a **CHAVE DE ACESSO**, o link da planilha e o link da pasta de fotos. **Copie a chave.**
6. Clique em **Implantar**, **Nova implantação**, engrenagem, **Aplicativo da Web**.
   - Executar como: **Eu**
   - Quem tem acesso: **Qualquer pessoa**
7. Copie a **URL** que termina em `/exec`.

### Ligar o aplicativo à base

No celular, abra o aplicativo, toque na engrenagem e preencha:

- **Endereço do aplicativo da web** — a URL que termina em `/exec`
- **Chave de acesso** — a chave do passo 5

Toque em **Testar conexão**. Tem que aparecer *Conectado*.

---

## Aviso importante sobre atualizar o Code.gs

Quando você editar o `Code.gs` depois, **não crie uma implantação nova**. Use:

**Implantar → Gerenciar implantações → editar (lápis) a existente → Versão: Nova versão → Implantar**

Criar implantação nova gera uma URL diferente e **todos os celulares param de sincronizar** até alguém reconfigurar um por um.

---

## Como funciona no dia a dia

1. **Novo levantamento** e escolha do tipo de local. A escolha abre um bloco de perguntas próprio do segmento, além das onze seções comuns.
2. O supervisor percorre as seções. Tudo salva sozinho a cada resposta.
3. Na seção de fotos, toca em adicionar, fotografa e escreve a legenda.
4. Ao terminar, aparece o índice, as dimensões e a lista de riscos.
5. **Gerar plano em PDF** abre o documento numa aba nova. Toque em imprimir e escolha *Salvar como PDF*.
6. **Enviar para a base** manda tudo para a planilha e as fotos para o Drive.

### Para os 80 postos

Use **Duplicar para outro posto**. O primeiro levantamento de cada posto leva cerca de 40 minutos. A revisão anual leva 10.

### Celular cheio

Em Configurações, ligue **Liberar espaço após enviar**. A foto é apagada do aparelho depois de chegar ao Drive e é baixada de volta na hora de gerar o plano. Com 80 postos e 10 fotos cada, é a diferença entre um aplicativo usável e um que trava.

---

## O painel de gestão

Mesmo endereço, trocando `index.html` por `painel.html`. Também há o botão ▦ no topo do aplicativo.

O que ele mostra:

- Postos levantados, índice médio, postos em nível crítico, riscos críticos abertos e planos com revisão vencida
- Maturidade média por dimensão na carteira inteira
- Distribuição por faixa, clicável para filtrar
- Revisões vencidas e vencendo em 60 dias
- Tabela com filtro por segmento, cidade e supervisor, ordenação por qualquer coluna e exportação em CSV
- Riscos mais recorrentes, por postos afetados vezes gravidade
- Comparativo de controles: o percentual de postos adequados em cada item

A agregação é feita no servidor. O navegador recebe só o consolidado, então o painel continua rápido com a base cheia.

Para acompanhar outros controles no comparativo, edite a lista `CONTROLES_CHAVE` no `Code.gs` e republique.

**Um aviso honesto sobre o índice médio:** com menos de 15 postos levantados ele oscila muito e não serve para decisão. A lista de riscos recorrentes já é útil desde o terceiro posto.

---

## Editar as perguntas

Abra `js/schema.js` direto no GitHub, clique no lápis, edite e salve. O formato é:

```js
sn('ace_chaves', 'Há controle formal de chaves e cópias', 'acesso', 2)
//   id           texto da pergunta                        dimensão   peso
```

Para uma pergunta com opções próprias:

```js
esc('per_muro', 'Situação do muro no perímetro', 'perimetro', 3, [
  ['Inexistente ou com vãos abertos', 0],
  ['Baixo ou danificado em trechos',  0.3],
  ['Íntegro, sem proteção no topo',   0.7],
  ['Íntegro com concertina',          1]
])
```

O número ao lado de cada opção é o quanto ela vale, de 0 a 1. As sete dimensões são `perimetro`, `acesso`, `tecnologia`, `contingencia`, `emergencias`, `operacao` e `governanca`.

Para adicionar um bloco de segmento novo, copie um dos blocos de `window.BLOCOS` e acrescente o segmento em `window.SEGMENTOS`.

---

## Três coisas antes de rodar em escala

1. **Valide o capítulo 8 com o seu jurídico** antes de transformar aquilo em exigência contratual. As referências são reais e verificáveis, mas quem assina cláusula é advogado.
2. **Faça o primeiro levantamento você mesmo**, num posto que conhece bem. Vão faltar duas ou três perguntas para a sua realidade, e o `schema.js` é editável direto no GitHub.
3. **Defina quem consolida os backups.** Levantamento que só existe no celular do supervisor é levantamento que some junto com o celular. Configurações tem *Exportar cópia*.

---

## Se algo der errado

| Sintoma | Causa provável |
|---|---|
| *Não conectou* ao testar | A publicação não está como "Qualquer pessoa", ou a chave está errada. Rode `verChave` no Apps Script para conferir. |
| Painel acusa erro depois de atualizar o Code.gs | Faltou republicar. Implantar → Gerenciar implantações → editar a existente → nova versão. |
| O PDF abre sem a logo | Alguém trocou a logo em Configurações por um arquivo muito grande. Toque em *Usar a padrão*. |
| A janela do documento não abre | O navegador bloqueou pop-ups. Libere para esse endereço. |
| Fotos não aparecem no PDF | O aparelho está com *Liberar espaço* ligado e sem internet na hora de gerar. Conecte e gere de novo. |
| Celular parou de sincronizar do nada | Alguém criou implantação nova no Apps Script e a URL mudou. |

---

## Privacidade

O documento contém o mapa das vulnerabilidades do local. Trate como documento restrito: não mande em grupo de mensagem e não deixe cópia com terceiro sem necessidade.

As fotos ficam privadas no Drive por padrão. Para gerar link aberto, mude `FOTOS_PUBLICAS` para `true` no topo do `Code.gs` e republique.
