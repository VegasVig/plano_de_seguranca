/* ============================================================
   Vegas — Conexão com a base

   ESTE É O ÚNICO ARQUIVO QUE VOCÊ PRECISA EDITAR PARA LIGAR
   TODOS OS CELULARES NA MESMA PLANILHA.

   Cole abaixo, entre as aspas:
     url   — o endereço que o Apps Script mostrou ao publicar,
             terminado em /exec
     chave — a chave que a função instalar() gravou no registro
             de execução (dá para revê-la rodando verChave)

   Depois é só subir este arquivo para o GitHub. Todo aparelho
   que abrir o aplicativo já vem ligado, sem digitar nada.

   Se deixar os dois em branco, o aplicativo volta a pedir os
   dados na tela de Configurações, um celular por vez.
   ============================================================ */

window.VEGAS_CONFIG = {

  url: '',

  chave: '',

  /* Apagar a foto do aparelho assim que ela chega ao Drive.
     Deixe true para os 80 postos: sem isso o celular do
     supervisor enche e o aplicativo começa a travar. */
  liberarEspaco: true,

  /* Enviar sozinho ao terminar o levantamento, quando houver
     sinal. Com false, o supervisor toca em Enviar na mão. */
  autoEnvio: true,

  /* Deixe true para travar os campos de conexão na tela de
     Configurações. Evita que alguém altere sem querer. */
  travarCampos: true
};
