/**
 * ============================================================
 *  VEGAS VIGILÂNCIA E SEGURANÇA
 *  Backend do Plano de Segurança — Google Apps Script
 *
 *  COMO INSTALAR
 *  1. Abra script.google.com e crie um projeto novo
 *  2. Apague o conteúdo do arquivo e cole tudo isto
 *  3. No seletor de função, escolha  instalar  e execute
 *  4. Autorize o acesso quando o Google pedir
 *  5. Copie a CHAVE que aparece no registro de execução
 *  6. Implantar > Nova implantação > Aplicativo da Web
 *       Executar como: Eu
 *       Quem tem acesso: Qualquer pessoa
 *  7. Copie a URL e cole no aplicativo, em Configurações
 *
 *  AO ATUALIZAR ESTE ARQUIVO DEPOIS
 *  Use Implantar > Gerenciar implantações > editar a existente
 *  > Versão: Nova versão > Implantar.
 *  Criar implantação nova troca a URL e derruba todos os celulares.
 * ============================================================
 */

var CONFIG = {
  NOME_PLANILHA: 'Vegas — Base de Planos de Segurança',
  NOME_PASTA:    'Vegas - Planos de Segurança',
  FOTOS_PUBLICAS: false,     // true gera link aberto para as imagens
  VALIDADE_MESES: 12         // prazo de revisão de um levantamento
};

/* Controles acompanhados no comparativo da carteira.
   Para seguir outro item, acrescente aqui o id da pergunta. */
var CONTROLES_CHAVE = [
  ['pro_os',           'Ordem de Serviço escrita'],
  ['pro_livro',        'Registro de ocorrências'],
  ['efe_ronda',        'Ronda programada'],
  ['efe_ronda_registro','Ronda comprovada'],
  ['ace_pedestre',     'Registro de entrada de pedestres'],
  ['ace_veiculo',      'Registro de placa de veículos'],
  ['ace_saida_material','Autorização de saída de material'],
  ['tec_cftv',         'CFTV em funcionamento'],
  ['tec_gravacao',     'Retenção de imagem de 30 dias'],
  ['tec_backup_energia','Nobreak nos sistemas de segurança'],
  ['ilu_perimetral',   'Iluminação perimetral completa'],
  ['con_energia',      'Procedimento para falta de energia'],
  ['eme_plano',        'Plano de emergência escrito'],
  ['eme_avcb',         'AVCB ou CLCB válido'],
  ['gov_pf',           'Autorização da PF verificada pelo cliente'],
  ['gov_dossie',       'Dossiê mensal entregue'],
  ['gov_conferencia',  'Cliente confere FGTS e INSS'],
  ['efe_reciclagem',   'Reciclagem do efetivo em dia'],
  ['pro_supervisao',   'Supervisão com periodicidade definida'],
  ['ilu_sanitario',    'Sanitário e refeitório no posto']
];

var ABAS = {
  painel:        'Painel',
  levantamentos: 'Levantamentos',
  respostas:     'Respostas',
  riscos:        'Riscos',
  fotos:         'Fotos',
  log:           'Log'
};

var DIMENSOES = ['perimetro', 'acesso', 'tecnologia', 'contingencia', 'emergencias', 'operacao', 'governanca'];

/* ============================================================
   INSTALAÇÃO
   ============================================================ */
function instalar() {
  var props = PropertiesService.getScriptProperties();

  var planilha;
  var idExistente = props.getProperty('PLANILHA_ID');
  if (idExistente) {
    try { planilha = SpreadsheetApp.openById(idExistente); } catch (e) { planilha = null; }
  }
  if (!planilha) {
    planilha = SpreadsheetApp.create(CONFIG.NOME_PLANILHA);
    props.setProperty('PLANILHA_ID', planilha.getId());
  }

  criarAbas_(planilha);

  var pasta;
  var pastaId = props.getProperty('PASTA_ID');
  if (pastaId) { try { pasta = DriveApp.getFolderById(pastaId); } catch (e) { pasta = null; } }
  if (!pasta) {
    var busca = DriveApp.getFoldersByName(CONFIG.NOME_PASTA);
    pasta = busca.hasNext() ? busca.next() : DriveApp.createFolder(CONFIG.NOME_PASTA);
    props.setProperty('PASTA_ID', pasta.getId());
  }

  var chave = props.getProperty('CHAVE');
  if (!chave) {
    chave = Utilities.getUuid().replace(/-/g, '').substring(0, 20).toUpperCase();
    props.setProperty('CHAVE', chave);
  }

  var msg =
    '\n============================================================\n' +
    ' INSTALAÇÃO CONCLUÍDA\n' +
    '============================================================\n' +
    ' CHAVE DE ACESSO : ' + chave + '\n' +
    ' PLANILHA        : ' + planilha.getUrl() + '\n' +
    ' PASTA DAS FOTOS : ' + pasta.getUrl() + '\n' +
    '------------------------------------------------------------\n' +
    ' Agora publique: Implantar > Nova implantação >\n' +
    ' Aplicativo da Web, executar como Eu, acesso Qualquer pessoa.\n' +
    ' Depois cole a URL e a chave no aplicativo.\n' +
    '============================================================\n';
  Logger.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) {}
  return msg;
}

function verChave() {
  var p = PropertiesService.getScriptProperties();
  var m = 'CHAVE: ' + p.getProperty('CHAVE') +
    '\nPLANILHA: ' + SpreadsheetApp.openById(p.getProperty('PLANILHA_ID')).getUrl();
  Logger.log(m);
  return m;
}

function criarAbas_(ss) {
  var def = {};
  def[ABAS.levantamentos] = ['ID', 'Data', 'Cliente', 'Posto', 'Cidade', 'Endereço', 'Segmento',
    'Finalidade', 'Supervisor', 'Contato', 'Telefone', 'Índice geral', 'Faixa',
    'Perímetro', 'Acesso', 'Tecnologia', 'Contingência', 'Emergências', 'Operação', 'Governança',
    'Riscos críticos', 'Riscos altos', 'Total de riscos', 'Fotos',
    'Revisão até', 'Recebido em', 'JSON'];
  def[ABAS.respostas] = ['ID levantamento', 'Cliente', 'Posto', 'Segmento', 'Data', 'Pergunta', 'Resposta'];
  def[ABAS.riscos]    = ['ID levantamento', 'Cliente', 'Posto', 'Segmento', 'Data',
    'Código', 'Risco', 'Categoria', 'Nível', 'Grau', 'Prazo'];
  def[ABAS.fotos]     = ['ID levantamento', 'Cliente', 'Posto', 'ID foto', 'Legenda', 'Seção',
    'ID no Drive', 'Link', 'Enviada em'];
  def[ABAS.log]       = ['Quando', 'Ação', 'Detalhe', 'Origem'];

  Object.keys(def).forEach(function (nome) {
    var aba = ss.getSheetByName(nome) || ss.insertSheet(nome);
    if (aba.getLastRow() === 0) {
      aba.getRange(1, 1, 1, def[nome].length).setValues([def[nome]]);
    }
    var cab = aba.getRange(1, 1, 1, def[nome].length);
    cab.setFontWeight('bold').setBackground('#12151a').setFontColor('#ffffff').setVerticalAlignment('middle');
    aba.setFrozenRows(1);
    aba.setRowHeight(1, 32);
  });

  var painel = ss.getSheetByName(ABAS.painel) || ss.insertSheet(ABAS.painel, 0);
  montarPainelPlanilha_(ss, painel);
  ss.setActiveSheet(painel);

  var padrao = ss.getSheetByName('Página1') || ss.getSheetByName('Sheet1');
  if (padrao && ss.getSheets().length > 1) ss.deleteSheet(padrao);
}

function montarPainelPlanilha_(ss, aba) {
  aba.clear();
  var L = "'" + ABAS.levantamentos + "'";
  var conteudo = [
    ['VEGAS — PLANOS DE SEGURANÇA', ''],
    ['', ''],
    ['Postos levantados',      '=COUNTA(' + L + '!A2:A)'],
    ['Índice médio da carteira', '=IFERROR(ROUND(AVERAGE(' + L + '!L2:L)),0)'],
    ['Postos em nível crítico ou incipiente', '=COUNTIF(' + L + '!L2:L,"<40")'],
    ['Riscos críticos em aberto', '=IFERROR(SUM(' + L + '!U2:U),0)'],
    ['Planos com revisão vencida', '=COUNTIF(' + L + '!Y2:Y,"<"&TODAY())'],
    ['', ''],
    ['MATURIDADE MÉDIA POR DIMENSÃO', ''],
    ['Perímetro',    '=IFERROR(ROUND(AVERAGE(' + L + '!N2:N)),0)'],
    ['Acesso',       '=IFERROR(ROUND(AVERAGE(' + L + '!O2:O)),0)'],
    ['Tecnologia',   '=IFERROR(ROUND(AVERAGE(' + L + '!P2:P)),0)'],
    ['Contingência', '=IFERROR(ROUND(AVERAGE(' + L + '!Q2:Q)),0)'],
    ['Emergências',  '=IFERROR(ROUND(AVERAGE(' + L + '!R2:R)),0)'],
    ['Operação',     '=IFERROR(ROUND(AVERAGE(' + L + '!S2:S)),0)'],
    ['Governança',   '=IFERROR(ROUND(AVERAGE(' + L + '!T2:T)),0)'],
    ['', ''],
    ['PIORES POSTOS', ''],
    ['=IFERROR(QUERY(' + L + '!A2:Y,"select C,D,L,Y where L is not null order by L asc limit 15",0),"aguardando dados")', '']
  ];
  aba.getRange(1, 1, conteudo.length, 2).setValues(conteudo);
  aba.getRange('A1').setFontSize(15).setFontWeight('bold');
  [9, 18].forEach(function (r) { aba.getRange(r, 1).setFontWeight('bold').setFontColor('#c98c0c'); });
  aba.getRange(3, 1, 5, 1).setFontWeight('bold');
  aba.getRange(3, 2, 5, 1).setFontSize(14).setFontWeight('bold');
  aba.setColumnWidth(1, 320); aba.setColumnWidth(2, 140);
}

/* ============================================================
   ROTEAMENTO
   ============================================================ */
function doGet(e) {
  var acao = (e && e.parameter && e.parameter.acao) || '';
  if (acao === 'painel' && conferirChave_(e.parameter.chave)) {
    return json_({ ok: true, painel: montarPainel_() });
  }
  return HtmlService.createHtmlOutput(
    '<div style="font-family:system-ui;padding:40px;max-width:520px;margin:auto">' +
    '<h2>Vegas — Backend do Plano de Segurança</h2>' +
    '<p>O serviço está no ar. Este endereço é usado pelo aplicativo, não pelo navegador.</p>' +
    '<p>Cole esta URL em Configurações, no aplicativo, junto com a chave de acesso.</p></div>');
}

function doPost(e) {
  var dados;
  try { dados = JSON.parse(e.postData.contents); }
  catch (err) { return json_({ ok: false, erro: 'Corpo inválido' }); }

  if (!conferirChave_(dados.chave)) return json_({ ok: false, erro: 'Chave de acesso inválida' });

  try {
    switch (dados.acao) {
      case 'ping':          return json_(acaoPing_());
      case 'foto':          return json_(acaoFoto_(dados));
      case 'levantamento':  return json_(acaoLevantamento_(dados));
      case 'lerFoto':       return json_(acaoLerFoto_(dados));
      case 'painel':        return json_({ ok: true, painel: montarPainel_() });
      default:              return json_({ ok: false, erro: 'Ação desconhecida: ' + dados.acao });
    }
  } catch (err) {
    registrar_('ERRO', dados.acao + ' — ' + err.message, '');
    return json_({ ok: false, erro: err.message });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function conferirChave_(chave) {
  var certa = PropertiesService.getScriptProperties().getProperty('CHAVE');
  return !!certa && chave === certa;
}

function planilha_() {
  var id = PropertiesService.getScriptProperties().getProperty('PLANILHA_ID');
  if (!id) throw new Error('Execute a função instalar antes de usar');
  return SpreadsheetApp.openById(id);
}

function pastaRaiz_() {
  var id = PropertiesService.getScriptProperties().getProperty('PASTA_ID');
  if (!id) throw new Error('Execute a função instalar antes de usar');
  return DriveApp.getFolderById(id);
}

function subpasta_(pai, nome) {
  var it = pai.getFoldersByName(nome);
  return it.hasNext() ? it.next() : pai.createFolder(nome);
}

function registrar_(acao, detalhe, origem) {
  try {
    planilha_().getSheetByName(ABAS.log)
      .appendRow([new Date(), acao, String(detalhe).substring(0, 400), origem || '']);
  } catch (e) {}
}

/* ============================================================
   AÇÕES
   ============================================================ */
function acaoPing_() {
  var ss = planilha_();
  return {
    ok: true,
    planilha: ss.getName(),
    url: ss.getUrl(),
    levantamentos: Math.max(0, ss.getSheetByName(ABAS.levantamentos).getLastRow() - 1),
    versao: '2.0'
  };
}

/**
 * Recebe UMA foto e grava no Drive.
 * Na planilha entra somente id, link e legenda. Base64 nunca é gravado
 * em célula: o limite é de 50 mil caracteres e duas fotos já estouram.
 */
function acaoFoto_(d) {
  if (!d.dataUrl) throw new Error('Foto sem conteúdo');

  var partes = d.dataUrl.match(/^data:(image\/[a-z0-9.+-]+);base64,(.*)$/i);
  if (!partes) throw new Error('Formato de imagem não reconhecido');

  var mes = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM');
  var nomeCliente = limpar_(d.cliente || 'Sem nome');
  var pasta = subpasta_(subpasta_(pastaRaiz_(), mes), nomeCliente + ' - ' + d.levantamentoId);

  var ext = partes[1].split('/')[1].replace('jpeg', 'jpg');
  var nome = (d.fotoId || 'foto') + (d.legenda ? ' - ' + limpar_(d.legenda).substring(0, 60) : '') + '.' + ext;
  var blob = Utilities.newBlob(Utilities.base64Decode(partes[2]), partes[1], nome);
  var arquivo = pasta.createFile(blob);

  if (CONFIG.FOTOS_PUBLICAS) {
    arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }

  planilha_().getSheetByName(ABAS.fotos).appendRow([
    d.levantamentoId, d.cliente || '', d.local || '', d.fotoId || '',
    d.legenda || '', d.secao || '', arquivo.getId(), arquivo.getUrl(), new Date()
  ]);

  return { ok: true, driveId: arquivo.getId(), driveUrl: arquivo.getUrl() };
}

function acaoLerFoto_(d) {
  var arq = DriveApp.getFileById(d.driveId);
  var blob = arq.getBlob();
  return {
    ok: true,
    dataUrl: 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes())
  };
}

/**
 * Grava o levantamento. O payload chega sem nenhuma imagem.
 * Reenvio do mesmo ID substitui as linhas anteriores.
 */
function acaoLevantamento_(d) {
  var lev = d.levantamento, ss = planilha_();
  if (!lev || !lev.id) throw new Error('Levantamento sem identificação');

  var r = lev.respostas || {};
  var idx = d.indice || { geral: 0, dimensoes: {} };
  var riscos = d.riscos || [];

  removerLinhas_(ss.getSheetByName(ABAS.levantamentos), 1, lev.id);
  removerLinhas_(ss.getSheetByName(ABAS.respostas), 1, lev.id);
  removerLinhas_(ss.getSheetByName(ABAS.riscos), 1, lev.id);

  var criticos = riscos.filter(function (x) { return x.nivel === 'Crítico'; }).length;
  var altos    = riscos.filter(function (x) { return x.nivel === 'Alto'; }).length;
  var dataLev  = r.data ? new Date(r.data + 'T12:00:00') : new Date(lev.criadoEm);
  var revisao  = new Date(dataLev.getTime());
  revisao.setMonth(revisao.getMonth() + CONFIG.VALIDADE_MESES);

  var d7 = DIMENSOES.map(function (k) {
    var v = idx.dimensoes ? idx.dimensoes[k] : null;
    return (v === null || v === undefined) ? '' : v;
  });

  ss.getSheetByName(ABAS.levantamentos).appendRow([
    lev.id, dataLev, r.cliente || '', r.local || '', r.cidade || '', r.endereco || '',
    nomeSegmento_(lev.segmento), r.modo || '', r.supervisor || '', r.contato || '', r.telefone || '',
    idx.geral, faixa_(idx.geral)
  ].concat(d7).concat([
    criticos, altos, riscos.length, (lev.fotos || []).length,
    revisao, new Date(), JSON.stringify(lev).substring(0, 45000)
  ]));

  /* formato longo: é o que permite cruzar os postos depois */
  var linhas = [];
  Object.keys(r).forEach(function (k) {
    var v = r[k];
    if (v === '' || v === null || v === undefined) return;
    linhas.push([lev.id, r.cliente || '', r.local || '', nomeSegmento_(lev.segmento), dataLev, k, String(v)]);
  });
  if (linhas.length) {
    ss.getSheetByName(ABAS.respostas)
      .getRange(ss.getSheetByName(ABAS.respostas).getLastRow() + 1, 1, linhas.length, 7)
      .setValues(linhas);
  }

  if (riscos.length) {
    var lr = riscos.map(function (x) {
      return [lev.id, r.cliente || '', r.local || '', nomeSegmento_(lev.segmento), dataLev,
        x.id, x.titulo, x.cat, x.nivel, x.grau, x.prazo];
    });
    ss.getSheetByName(ABAS.riscos)
      .getRange(ss.getSheetByName(ABAS.riscos).getLastRow() + 1, 1, lr.length, 11)
      .setValues(lr);
  }

  registrar_('LEVANTAMENTO', (r.cliente || '') + ' / ' + (r.local || '') + ' — índice ' + idx.geral, lev.id);
  return { ok: true, id: lev.id, planilha: ss.getUrl() };
}

function removerLinhas_(aba, coluna, valor) {
  var ultima = aba.getLastRow();
  if (ultima < 2) return;
  var col = aba.getRange(2, coluna, ultima - 1, 1).getValues();
  for (var i = col.length - 1; i >= 0; i--) {
    if (String(col[i][0]) === String(valor)) aba.deleteRow(i + 2);
  }
}

function nomeSegmento_(id) {
  return ({
    residencial: 'Condomínio residencial',
    comercial: 'Condomínio comercial',
    transportadora: 'Transportadora / logística',
    industria: 'Indústria',
    empresa: 'Empresa, comércio e serviços'
  })[id] || id || '';
}

function faixa_(n) {
  if (n >= 80) return 'Avançado';
  if (n >= 60) return 'Gerenciado';
  if (n >= 40) return 'Básico';
  if (n >= 20) return 'Incipiente';
  return 'Crítico';
}

function limpar_(s) {
  return String(s).replace(/[\/\\:*?"<>|]/g, '-').trim();
}

/* ============================================================
   PAINEL — a agregação acontece aqui, não no navegador
   ============================================================ */
function montarPainel_() {
  var ss = planilha_();
  var abaL = ss.getSheetByName(ABAS.levantamentos);
  var abaR = ss.getSheetByName(ABAS.riscos);
  var abaP = ss.getSheetByName(ABAS.respostas);

  var postos = [];
  if (abaL.getLastRow() > 1) {
    var v = abaL.getRange(2, 1, abaL.getLastRow() - 1, 26).getValues();
    postos = v.map(function (l) {
      return {
        id: l[0], data: iso_(l[1]), cliente: l[2], posto: l[3], cidade: l[4],
        segmento: l[6], finalidade: l[7], supervisor: l[8],
        indice: Number(l[11]) || 0, faixa: l[12],
        dimensoes: {
          perimetro: num_(l[13]), acesso: num_(l[14]), tecnologia: num_(l[15]),
          contingencia: num_(l[16]), emergencias: num_(l[17]), operacao: num_(l[18]),
          governanca: num_(l[19])
        },
        criticos: Number(l[20]) || 0, altos: Number(l[21]) || 0,
        riscos: Number(l[22]) || 0, fotos: Number(l[23]) || 0,
        revisao: iso_(l[24])
      };
    }).filter(function (p) { return p.id; });
  }

  /* médias por dimensão */
  var medias = {};
  DIMENSOES.forEach(function (d) {
    var vals = postos.map(function (p) { return p.dimensoes[d]; })
                     .filter(function (x) { return x !== null; });
    medias[d] = vals.length ? Math.round(vals.reduce(function (a, b) { return a + b; }, 0) / vals.length) : null;
  });

  /* riscos recorrentes */
  var mapaR = {};
  if (abaR.getLastRow() > 1) {
    abaR.getRange(2, 6, abaR.getLastRow() - 1, 5).getValues().forEach(function (l) {
      var cod = l[0]; if (!cod) return;
      if (!mapaR[cod]) mapaR[cod] = { id: cod, titulo: l[1], cat: l[2], nivel: l[3], grau: Number(l[4]) || 0, postos: 0 };
      mapaR[cod].postos++;
    });
  }
  var recorrentes = Object.keys(mapaR).map(function (k) { return mapaR[k]; })
    .sort(function (a, b) { return (b.postos * b.grau) - (a.postos * a.grau); })
    .slice(0, 15);

  /* comparativo de controles: percentual de postos adequados */
  var respostasPorPergunta = {};
  if (abaP.getLastRow() > 1) {
    abaP.getRange(2, 6, abaP.getLastRow() - 1, 2).getValues().forEach(function (l) {
      var pergunta = l[0], resposta = String(l[1] || '');
      if (!pergunta) return;
      if (!respostasPorPergunta[pergunta]) respostasPorPergunta[pergunta] = [];
      respostasPorPergunta[pergunta].push(resposta);
    });
  }
  var controles = CONTROLES_CHAVE.map(function (c) {
    var lista = respostasPorPergunta[c[0]] || [];
    var adequados = lista.filter(adequado_).length;
    return {
      id: c[0], nome: c[1], avaliados: lista.length,
      adequados: adequados,
      pct: lista.length ? Math.round(adequados / lista.length * 100) : null
    };
  });

  var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  var em60 = new Date(hoje.getTime() + 60 * 86400000);
  var vencidos = postos.filter(function (p) { return p.revisao && new Date(p.revisao) < hoje; })
                       .sort(function (a, b) { return new Date(a.revisao) - new Date(b.revisao); });
  var vencendo = postos.filter(function (p) {
    if (!p.revisao) return false;
    var d = new Date(p.revisao);
    return d >= hoje && d <= em60;
  }).sort(function (a, b) { return new Date(a.revisao) - new Date(b.revisao); });

  var comIndice = postos.filter(function (p) { return p.indice > 0; });

  return {
    geradoEm: new Date().toISOString(),
    total: postos.length,
    indiceMedio: comIndice.length
      ? Math.round(comIndice.reduce(function (a, p) { return a + p.indice; }, 0) / comIndice.length) : 0,
    criticos: postos.filter(function (p) { return p.indice > 0 && p.indice < 40; }).length,
    riscosCriticos: postos.reduce(function (a, p) { return a + p.criticos; }, 0),
    vencidos: vencidos.length,
    distribuicao: {
      critico:    postos.filter(function (p) { return p.indice < 20; }).length,
      incipiente: postos.filter(function (p) { return p.indice >= 20 && p.indice < 40; }).length,
      basico:     postos.filter(function (p) { return p.indice >= 40 && p.indice < 60; }).length,
      gerenciado: postos.filter(function (p) { return p.indice >= 60 && p.indice < 80; }).length,
      avancado:   postos.filter(function (p) { return p.indice >= 80; }).length
    },
    medias: medias,
    postos: postos,
    listaVencidos: vencidos.slice(0, 40),
    listaVencendo: vencendo.slice(0, 40),
    recorrentes: recorrentes,
    controles: controles
  };
}

/* Considera adequada a resposta que indica controle efetivo. */
function adequado_(txt) {
  var t = String(txt).toLowerCase();
  if (t === 'sim') return true;
  if (t === 'não' || t === 'nao' || t === 'parcialmente') return false;
  var bons = ['informatizado', 'sistema informatizado', '30 dias ou mais', 'bastão eletrônico',
    'atual e assinada', 'registro digital', 'íntegro com concertina', 'cobre tudo',
    'cobre todo o perímetro', 'ativo e monitorado', 'funciona, cobre', 'atualizado com',
    'registro com requisição', 'rotativo com cadastro', 'lacre numerado com conferência',
    'dupla conferência efetiva', 'consulta em gerenciadora', 'pátio fechado, vigilância',
    'pesagem, documento, foto', 'cadastro prévio', 'sangria aleatória', 'protocolo escrito',
    'crachá numerado', 'crachá com leitura', 'válidos, sinalizados e com inspeção',
    'existe, atual e afixada', 'rádio ou celular corporativo', 'perímetro limpo',
    'adequado com cobertura', 'nenhum', 'reserva registrada', 'crachá com acesso eletrônico',
    'autorização prévia da empresa', 'adequado, blindado'];
  for (var i = 0; i < bons.length; i++) if (t.indexOf(bons[i]) === 0 || t.indexOf(bons[i]) > -1) return true;
  return false;
}

function num_(v) { var n = Number(v); return (v === '' || v === null || isNaN(n)) ? null : n; }
function iso_(v) {
  if (!v) return '';
  if (v instanceof Date) return Utilities.formatDate(v, 'America/Sao_Paulo', 'yyyy-MM-dd');
  return String(v);
}

/* ============================================================
   MANUTENÇÃO
   ============================================================ */
function reconstruirPainelDaPlanilha() {
  var ss = planilha_();
  montarPainelPlanilha_(ss, ss.getSheetByName(ABAS.painel) || ss.insertSheet(ABAS.painel, 0));
  Logger.log('Painel da planilha refeito');
}

function gerarNovaChave() {
  var nova = Utilities.getUuid().replace(/-/g, '').substring(0, 20).toUpperCase();
  PropertiesService.getScriptProperties().setProperty('CHAVE', nova);
  Logger.log('Nova chave: ' + nova + '\nAtualize em todos os celulares.');
  return nova;
}
