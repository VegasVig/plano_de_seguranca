/* ============================================================
   Vegas — Geração do Plano de Segurança
   Monta o documento completo e abre em janela própria.
   O supervisor toca em imprimir e salva em PDF.
   ============================================================ */

var DOSSIE = [
  'Folha de pagamento analítica com identificação do posto',
  'Recibos de pagamento de salário assinados pelo efetivo alocado',
  'Comprovante de recolhimento do FGTS do mês, por trabalhador',
  'Relação dos trabalhadores vinculados ao contrato, extraída do eSocial',
  'Guia da contribuição previdenciária quitada, com relação nominal',
  'Comprovante de fornecimento de vale-transporte',
  'Comprovante de fornecimento de vale-refeição ou alimentação, conforme convenção',
  'Espelho de ponto do mês, com marcações de todo o efetivo',
  'Comprovante de pagamento de horas extras, adicional noturno e intervalo suprimido',
  'Recibos de férias e respectivos avisos, quando houver no período',
  'Comprovante de pagamento das parcelas do décimo terceiro, nos meses devidos',
  'Atestados de Saúde Ocupacional válidos de todo o efetivo',
  'Fichas de entrega de uniforme e equipamentos de proteção',
  'Certificados de formação e de reciclagem válidos, com data de vencimento',
  'Certidões negativas de débitos: FGTS, trabalhista e federal, dentro da validade',
  'Autorização de funcionamento da Polícia Federal e Certificado de Segurança vigentes'
];

var PERGUNTAS_CONCORRENTE = [
  { q: 'Qual o número da autorização de funcionamento junto à Polícia Federal e qual a sua validade?',
    p: 'Empresa sem autorização válida não pode prestar vigilância. Contratar nessa condição transfere o risco integral ao contratante.' },
  { q: 'Como se compõe o custo homem-mês apresentado, item a item?',
    p: 'Proposta muito abaixo do mercado costuma não provisionar férias, décimo terceiro e rescisão. A conta chega depois, na reclamatória, e chega para o tomador.' },
  { q: 'De que forma será comprovado, mês a mês, o recolhimento de FGTS e INSS do efetivo alocado neste posto?',
    p: 'A Súmula 331 do TST exige fiscalização efetiva do contratante. Quem não tem rotina de dossiê mensal não consegue produzir essa prova.' },
  { q: 'Qual a frequência de supervisão presencial e como ela é comprovada?',
    p: 'Supervisão sem comprovação não acontece. Peça o modelo do relatório e a periodicidade por escrito no contrato.' },
  { q: 'Qual foi a rotatividade de colaboradores em postos semelhantes nos últimos doze meses?',
    p: 'Rotatividade alta significa colaborador que nunca aprende o posto. É o indicador que melhor prevê falha operacional.' },
  { q: 'Como são cobertas faltas, férias e afastamentos, sem recorrer a dobra de turno?',
    p: 'Cobertura por dobra gera fadiga, hora extra e passivo. Empresa estruturada mantém reserva técnica dimensionada.' }
];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function barra(valor, cor) {
  if (valor === null) return '<div class="barra"><div class="barra-vazia">não avaliado</div></div>';
  return '<div class="barra"><div class="barra-fill" style="width:' + valor + '%;background:' + cor + '"></div></div>';
}

window.gerarRelatorio = function (lev) {
  return window.Fotos.doLevantamento(lev).then(function (fotos) {
    var html = montarHTML(lev, fotos);
    var w = window.open('', '_blank');
    if (!w) { alert('O navegador bloqueou a janela. Libere pop-ups para este site e tente de novo.'); return; }
    w.document.open(); w.document.write(html); w.document.close();
  });
};

function montarHTML(lev, fotos) {
  var r = lev.respostas || {};
  var seg = (window.SEGMENTOS.find(function (s) { return s.id === lev.segmento; }) || {}).nome || '—';
  var indice = window.calcularIndice(r, lev.segmento);
  var faixa = window.faixaIndice(indice.geral);
  var riscos = window.avaliarRiscos(r, lev.segmento);
  var resumo = window.resumoRiscos(riscos);
  var plano = window.montarPlanoAcao(riscos);
  var pops = window.selecionarPops(r, lev.segmento);
  var preVenda = (r.modo || '').indexOf('Pré-venda') === 0 || (r.modo || '').indexOf('Licita') === 0;
  var logo = window.VEGAS_LOGO_PERSONALIZADA || window.VEGAS_LOGO.branca;
  var hoje = new Date().toLocaleDateString('pt-BR');
  var perguntas = window.todasPerguntas(lev.segmento);

  /* lacunas de compliance a partir das respostas */
  var lacunas = [];
  if (window.valorBaixo(r, lev.segmento, 'gov_dossie')) lacunas.push('O cliente não recebe o dossiê mensal de documentos trabalhistas. Sem ele, não há prova de fiscalização.');
  if (window.valorBaixo(r, lev.segmento, 'gov_conferencia')) lacunas.push('Ninguém do cliente confere FGTS e INSS do efetivo alocado. A exigência em contrato, isolada, não afasta a responsabilidade subsidiária.');
  if (window.valorBaixo(r, lev.segmento, 'gov_pf')) lacunas.push('A autorização de funcionamento da Polícia Federal da empresa contratada não foi verificada.');
  if (window.valorBaixo(r, lev.segmento, 'efe_reciclagem')) lacunas.push('Há indício de reciclagem vencida no efetivo. Vigilante irregular no posto é autuação e nulidade contratual.');
  if (window.valorBaixo(r, lev.segmento, 'ilu_sanitario')) lacunas.push('O posto não oferece sanitário ou local de refeição adequados. É autuação do Ministério do Trabalho e tema recorrente em ação com pedido de dano moral.');
  if (window.valorBaixo(r, lev.segmento, 'gov_contrato')) lacunas.push('O contrato não descreve escopo, efetivo e escala com clareza suficiente para ser cobrado.');
  if (window.valorBaixo(r, lev.segmento, 'gov_lgpd') || window.valorBaixo(r, lev.segmento, 'tec_lgpd_cftv')) lacunas.push('O tratamento de dados pessoais na portaria e no CFTV não atende à LGPD: falta aviso, base legal ou prazo de descarte.');

  /* ---------- montagem ---------- */
  var P = [];

  /* capa */
  P.push(
  '<section class="capa">' +
    '<img class="logo-capa" src="' + logo + '" alt="Vegas Vigilância e Segurança">' +
    '<div class="capa-tipo">Plano de Segurança Patrimonial</div>' +
    '<h1>' + esc(r.cliente || 'Cliente não identificado') + '</h1>' +
    '<div class="capa-local">' + esc(r.local || '') + (r.cidade ? ' &middot; ' + esc(r.cidade) : '') + '</div>' +
    '<div class="capa-selo" style="border-color:' + faixa.cor + '">' +
      '<div class="selo-num" style="color:' + faixa.cor + '">' + indice.geral + '</div>' +
      '<div class="selo-txt">Índice de Maturidade<br><strong>' + faixa.nome + '</strong></div>' +
    '</div>' +
    '<table class="capa-dados"><tbody>' +
      linha('Segmento', seg) +
      linha('Finalidade', r.modo || '—') +
      linha('Data do levantamento', window.formatarData(r.data)) +
      linha('Supervisor responsável', r.supervisor || '—') +
      linha('Documento emitido em', hoje) +
      linha('Código do levantamento', lev.id) +
    '</tbody></table>' +
    '<div class="capa-rodape">Documento técnico de uso restrito. Contém informações sobre vulnerabilidades do local e não deve ser divulgado fora das pessoas autorizadas pelo contratante.</div>' +
  '</section>');

  /* sumário */
  var sumario = ['Apresentação e método', 'Caracterização do local', 'Índice de Maturidade em Segurança',
    'Leitura por dimensão', 'Riscos identificados', 'Plano de ação', 'Procedimentos operacionais',
    'Conformidade trabalhista e contratual'];
  if (preVenda) sumario.push('Critérios para avaliar propostas de vigilância');
  if (fotos.length) sumario.push('Registro fotográfico');
  sumario.push('Responsabilidade técnica');

  P.push(bloco('Sumário',
    '<ol class="sumario">' + sumario.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'));

  /* 1 apresentação */
  P.push(cap(1, 'Apresentação e método',
    '<p>Este documento apresenta o diagnóstico de segurança patrimonial do local identificado na capa, realizado por meio de inspeção presencial e entrevista com o responsável designado pelo contratante.</p>' +
    '<p>A avaliação percorre ' + perguntas.filter(function (p) { return p.tipo === 'escala'; }).length +
    ' pontos de verificação, distribuídos em sete dimensões. Cada resposta recebe um valor proporcional ao grau de controle efetivamente encontrado, ponderado pela relevância do item. A soma produz o Índice de Maturidade em Segurança, em escala de 0 a 100.</p>' +
    '<p>As respostas alimentam um conjunto de regras que identifica riscos concretos. Cada risco recebe probabilidade e impacto, e desses dois fatores decorre a ordem de prioridade do plano de ação. Os procedimentos operacionais reproduzidos no capítulo 7 foram selecionados pela realidade encontrada: só aparecem aqui os que se aplicam a este local.</p>' +
    '<p class="nota">O diagnóstico retrata o momento da visita. Alterações no local, no efetivo ou no contrato exigem nova avaliação. A vigência recomendada deste documento é de doze meses.</p>'));

  /* 2 caracterização */
  var caract = '<table class="dados"><tbody>' +
    linha('Cliente', r.cliente) + linha('Posto ou unidade', r.local) +
    linha('Endereço', r.endereco) + linha('Cidade', r.cidade) +
    linha('Segmento', seg) +
    linha('Área aproximada', r.area ? r.area + ' m²' : '') +
    linha('Circulação diária estimada', r.populacao ? r.populacao + ' pessoas' : '') +
    linha('Horário de funcionamento', r.funcionamento) +
    linha('Responsável no cliente', r.contato) + linha('Telefone', r.telefone) +
    linha('Efetivo por turno', r.efe_qtd) + linha('Escala praticada', r.efe_escala) +
    '</tbody></table>';
  if (r.historico) {
    caract += '<h3>Histórico de ocorrências relatado</h3><p>' + esc(r.historico).replace(/\n/g, '<br>') + '</p>';
  }
  P.push(cap(2, 'Caracterização do local', caract));

  /* 3 índice */
  var dims = Object.keys(window.DIMENSOES).map(function (d) {
    var v = indice.dimensoes[d];
    return '<tr><th>' + window.DIMENSOES[d] + '</th><td class="num">' + (v === null ? '—' : v) + '</td>' +
      '<td>' + barra(v, v === null ? '#ccc' : window.faixaIndice(v).cor) + '</td>' +
      '<td class="faixa">' + (v === null ? 'não avaliado' : window.faixaIndice(v).nome) + '</td></tr>';
  }).join('');

  /* o que ficou de fora da conta, e por quê */
  var semInfo = window.semInformacao(r, lev.segmento);
  var naoAplica = window.naoSeAplica(r, lev.segmento);

  var ressalva = '';
  if (!indice.calculavel) {
    ressalva = '<div class="nota"><strong>Índice não calculado.</strong> Nenhum item pontuável foi ' +
      'respondido com valor. Enquanto o levantamento não for concluído, este documento vale como ' +
      'registro de visita, não como diagnóstico.</div>';
  } else if (indice.cobertura < 70) {
    ressalva = '<div class="nota"><strong>Leia este número com reserva.</strong> Ele foi calculado sobre ' +
      indice.contadas + ' dos ' + indice.pontuaveis + ' itens pontuáveis, ou seja, ' + indice.cobertura +
      '% do questionário. Os demais ficaram como não aplicáveis ou sem informação e foram excluídos da ' +
      'conta, em vez de contados como zero. Abaixo de 70% de cobertura o índice indica tendência, ' +
      'não posição.</div>';
  }

  var excluidos = '';
  if (semInfo.length || naoAplica.length) {
    excluidos = '<h3>Itens fora da conta</h3>' +
      '<p>Item marcado como não aplicável ou sem informação sai do cálculo em vez de valer zero. ' +
      'Um posto sem garagem não pode ser penalizado por não ter controle de garagem.</p>' +
      '<table class="dados"><tbody>' +
      '<tr><th>Não se aplica ao local</th><td>' + naoAplica.length + ' ' +
        (naoAplica.length === 1 ? 'item' : 'itens') + '</td></tr>' +
      '<tr><th>Sem informação no momento</th><td>' + semInfo.length + ' ' +
        (semInfo.length === 1 ? 'item' : 'itens') + '</td></tr>' +
      '<tr><th>Itens que entraram no índice</th><td>' + indice.contadas + ' de ' + indice.pontuaveis + '</td></tr>' +
      '</tbody></table>';

    if (semInfo.length) {
      excluidos += '<h3>Pendências deste levantamento</h3>' +
        '<p>Os itens abaixo ficaram sem informação e precisam de uma segunda passagem no posto. ' +
        'Enquanto não forem respondidos, o índice permanece incompleto.</p>' +
        '<ul class="lacunas">' + semInfo.map(function (x) {
          return '<li>' + esc(x.texto) + ' <span style="color:var(--tinta3)">(' +
            esc(window.DIMENSOES[x.dim] || '') + ')</span></li>';
        }).join('') + '</ul>';
    }
  }

  P.push(cap(3, 'Índice de Maturidade em Segurança',
    '<div class="destaque" style="border-color:' + faixa.cor + '">' +
      '<div class="destaque-num" style="color:' + faixa.cor + '">' +
        (indice.calculavel ? indice.geral : '—') + '<span>/100</span></div>' +
      '<div class="destaque-txt"><strong>' + (indice.calculavel ? faixa.nome : 'Não calculado') + '</strong>' +
      '<p>' + (indice.calculavel ? faixa.texto : 'Levantamento sem itens pontuados.') + '</p></div>' +
    '</div>' +
    ressalva +
    '<table class="dims"><thead><tr><th>Dimensão</th><th>Índice</th><th></th><th>Faixa</th></tr></thead><tbody>' +
    dims + '</tbody></table>' +
    '<h3>Como ler a escala</h3>' +
    '<table class="escala"><tbody>' +
      '<tr><td class="e" style="background:#C6282C">0 a 19</td><td>Crítico. O local está exposto e um incidente comum encontra o caminho aberto.</td></tr>' +
      '<tr><td class="e" style="background:#E0651A">20 a 39</td><td>Incipiente. A proteção depende da presença física e da boa vontade de quem está no posto.</td></tr>' +
      '<tr><td class="e" style="background:#E8A317">40 a 59</td><td>Básico. Há controles isolados que não se sustentam sozinhos.</td></tr>' +
      '<tr><td class="e" style="background:#7CB518">60 a 79</td><td>Gerenciado. A base existe e falta consistência para não depender de pessoas.</td></tr>' +
      '<tr><td class="e" style="background:#2FA84F">80 a 100</td><td>Avançado. Controles maduros, com foco em manter o padrão e medir.</td></tr>' +
    '</tbody></table>' + excluidos));

  /* 4 leitura por dimensão */
  var leitura = Object.keys(window.DIMENSOES).map(function (d) {
    var v = indice.dimensoes[d];
    if (v === null) return '';
    var fracos = perguntas.filter(function (p) {
      if (p.tipo !== 'escala' || p.dim !== d) return false;
      var resp = r[p.id]; if (!resp) return false;
      var op = p.opcoes.find(function (o) { return o[0] === resp; });
      return op && op[1] <= 0.5;
    });
    var li = fracos.length
      ? '<ul>' + fracos.map(function (p) { return '<li>' + esc(p.texto) + ': <em>' + esc(r[p.id]) + '</em></li>'; }).join('') + '</ul>'
      : '<p class="ok">Nenhum ponto frágil registrado nesta dimensão.</p>';
    return '<div class="dim-bloco"><h3>' + window.DIMENSOES[d] +
      ' <span class="pill" style="background:' + window.faixaIndice(v).cor + '">' + v + '</span></h3>' + li + '</div>';
  }).join('');
  P.push(cap(4, 'Leitura por dimensão',
    '<p>Abaixo estão listados os itens que puxaram cada dimensão para baixo. São eles que o plano de ação ataca.</p>' + leitura));

  /* 5 riscos */
  var tabelaRiscos = riscos.map(function (x) {
    return '<tr><td>' + x.id + '</td><td>' + esc(x.titulo) + '</td><td>' + x.cat + '</td>' +
      '<td>' + x.probabilidade + '</td><td>' + x.impacto + '</td>' +
      '<td><span class="nivel n-' + x.nivel.toLowerCase().replace('í', 'i').replace('é', 'e') + '">' + x.nivel + '</span></td></tr>';
  }).join('');

  var detalheRiscos = riscos.map(function (x) {
    return '<div class="risco n-' + x.nivel.toLowerCase().replace('í', 'i').replace('é', 'e') + '">' +
      '<h3>' + x.id + ' &middot; ' + esc(x.titulo) + '</h3>' +
      '<div class="risco-meta">' + x.cat + ' &nbsp;|&nbsp; Probabilidade ' + x.probabilidade.toLowerCase() +
      ' &nbsp;|&nbsp; Impacto ' + x.impacto.toLowerCase() + ' &nbsp;|&nbsp; Nível ' + x.nivel + '</div>' +
      '<p><strong>O que pode acontecer.</strong> ' + esc(x.consequencia) + '</p>' +
      '<p><strong>Tratamento recomendado.</strong> ' + esc(x.tratamento) + '</p>' +
      '</div>';
  }).join('');

  P.push(cap(5, 'Riscos identificados',
    (riscos.length === 0
      ? '<p>Nenhuma regra de risco foi acionada pelas respostas registradas. Isso indica um conjunto de controles consistente. Mantenha a revisão anual.</p>'
      : '<div class="contadores">' +
          cont(resumo.critico, 'Críticos', '#C6282C') + cont(resumo.alto, 'Altos', '#E0651A') +
          cont(resumo.medio, 'Médios', '#E8A317') + cont(resumo.baixo, 'Baixos', '#7CB518') +
        '</div>' +
        '<p>Foram identificados ' + riscos.length + ' riscos a partir das respostas registradas. O nível resulta do cruzamento entre probabilidade e impacto.</p>' +
        '<table class="riscos"><thead><tr><th>Cód.</th><th>Risco</th><th>Categoria</th><th>Probab.</th><th>Impacto</th><th>Nível</th></tr></thead><tbody>' +
        tabelaRiscos + '</tbody></table>' +
        '<h3 class="quebra">Detalhamento</h3>' + detalheRiscos)));

  /* 6 plano de ação */
  var planoHtml = plano.map(function (g) {
    return '<div class="prazo"><h3>' + g.meta.nome + '</h3>' +
      '<div class="prazo-tag">' + g.meta.tipo + ' &middot; ' + g.meta.nota + '</div>' +
      '<table class="acoes"><thead><tr><th>Cód.</th><th>Ação</th><th>Responsável</th><th>Concluído</th></tr></thead><tbody>' +
      g.itens.map(function (x) {
        return '<tr><td>' + x.id + '</td><td><strong>' + esc(x.titulo) + '</strong><br>' + esc(x.tratamento) + '</td>' +
          '<td class="resp"></td><td class="check"></td></tr>';
      }).join('') + '</tbody></table></div>';
  }).join('');

  P.push(cap(6, 'Plano de ação',
    (plano.length === 0 ? '<p>Não há ações pendentes decorrentes deste levantamento.</p>' :
    '<p>As ações estão ordenadas por prazo. A primeira faixa não depende de compra: depende de decidir, escrever e cobrar. As faixas seguintes exigem orçamento e por isso entram depois, sem que isso reduza a importância delas.</p>' +
    planoHtml +
    '<p class="nota">Preencha responsável e data de conclusão a cada revisão. Este quadro é o instrumento de acompanhamento entre uma visita de supervisão e a seguinte.</p>')));

  /* 7 POPs */
  var popsHtml = pops.map(function (p) {
    return '<div class="pop"><h3>' + p.id + ' &middot; ' + esc(p.nome) + '</h3>' +
      '<p class="pop-obj"><strong>Objetivo.</strong> ' + esc(p.objetivo) + '</p>' +
      '<ol class="pop-passos">' + p.passos.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
      (p.atencao ? '<p class="pop-atencao">' + esc(p.atencao) + '</p>' : '') + '</div>';
  }).join('');

  P.push(cap(7, 'Procedimentos operacionais',
    '<p>Foram selecionados ' + pops.length + ' procedimentos aplicáveis a este local, considerando o segmento e os sistemas existentes. Eles devem ser anexados à Ordem de Serviço do posto e assinados por todo o efetivo.</p>' +
    popsHtml));

  /* 8 compliance */
  P.push(cap(8, 'Conformidade trabalhista e contratual',
    '<p>A contratação de vigilância patrimonial cria responsabilidade subsidiária para o tomador do serviço. A Súmula 331 do Tribunal Superior do Trabalho condiciona o afastamento dessa responsabilidade à fiscalização efetiva do cumprimento das obrigações pela contratada. Exigência escrita em contrato, sozinha, não tem sido aceita como prova de fiscalização.</p>' +
    '<p>A atividade também é regulada pela Lei 7.102 de 1983 e pela Portaria 3.233 de 2012 da Polícia Federal, que condicionam o exercício à autorização de funcionamento vigente e à formação e reciclagem válidas de cada vigilante.</p>' +
    '<h3>Dossiê mensal recomendado</h3>' +
    '<p>Antes de liberar o pagamento da fatura de cada mês, o contratante deve receber e conferir:</p>' +
    '<ol class="dossie">' + DOSSIE.map(function (d) { return '<li>' + d + '<span class="box"></span></li>'; }).join('') + '</ol>' +
    '<h3>Lacunas identificadas neste local</h3>' +
    (lacunas.length
      ? '<ul class="lacunas">' + lacunas.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>'
      : '<p class="ok">Nenhuma lacuna relevante foi identificada nas respostas sobre conformidade.</p>') +
    '<p class="nota">Este capítulo tem caráter informativo e não substitui parecer jurídico. Antes de transformar estes itens em exigência contratual, submeta o texto ao seu jurídico.</p>'));

  /* 9 comercial, só pré-venda */
  if (preVenda) {
    P.push(cap(9, 'Critérios para avaliar propostas de vigilância',
      '<p>A comparação entre propostas costuma se resumir ao preço, o que premia quem não provisiona encargos. As seis perguntas abaixo devem ser feitas, por escrito, a todas as empresas participantes, inclusive à Vegas. As respostas revelam mais que a planilha de custo.</p>' +
      PERGUNTAS_CONCORRENTE.map(function (x, i) {
        return '<div class="pergunta"><h3>' + (i + 1) + '. ' + esc(x.q) + '</h3><p>' + esc(x.p) + '</p></div>';
      }).join('') +
      '<h3>Sobre o custo homem-mês</h3>' +
      '<p>Proposta significativamente abaixo da média do mercado, no mesmo escopo, costuma indicar ausência de provisão para férias, décimo terceiro e rescisão, ou efetivo menor que o declarado. O valor economizado no contrato costuma reaparecer como passivo do contratante, com correção e honorários.</p>'));
  }

  /* 10 fotos */
  if (fotos.length) {
    var n = preVenda ? 10 : 9;
    var grid = fotos.map(function (f, i) {
      return '<figure class="foto">' +
        (f.dados ? '<img src="' + f.dados + '" alt="">' : '<div class="foto-ausente">Imagem não disponível neste dispositivo</div>') +
        '<figcaption>Figura ' + (i + 1) + '. ' + esc(f.legenda || 'Sem legenda') + '</figcaption></figure>';
    }).join('');
    P.push(cap(n, 'Registro fotográfico', '<div class="fotos">' + grid + '</div>'));
  }

  /* encerramento */
  var nEnc = (preVenda ? 10 : 9) + (fotos.length ? 1 : 0);
  P.push(cap(nEnc, 'Responsabilidade técnica',
    '<p>O levantamento que originou este documento foi realizado em ' + window.formatarData(r.data) +
    ' por ' + esc(r.supervisor || 'supervisor não identificado') + ', da Vegas Vigilância e Segurança.</p>' +
    (r.gov_obs ? '<h3>Observações do supervisor</h3><p>' + esc(r.gov_obs).replace(/\n/g, '<br>') + '</p>' : '') +
    '<div class="assinaturas">' +
      '<div class="ass"><div class="linha"></div>' + esc(r.supervisor || '') + '<br><small>Supervisor Vegas</small></div>' +
      '<div class="ass"><div class="linha"></div>' + esc(r.contato || '') + '<br><small>Responsável pelo contratante</small></div>' +
    '</div>' +
    '<p class="nota">Documento gerado eletronicamente em ' + hoje + '. Código de referência ' + lev.id + '.</p>'));

  return pagina(P.join(''), r.cliente || 'Plano de Segurança', logo, esc(r.local || ''));
}

/* ---------- helpers de marcação ---------- */
function linha(k, v) {
  if (v === undefined || v === null || v === '') v = '—';
  return '<tr><th>' + k + '</th><td>' + esc(v) + '</td></tr>';
}
function cont(n, rot, cor) {
  return '<div class="cont"><div class="cont-n" style="color:' + cor + '">' + n + '</div><div>' + rot + '</div></div>';
}
function bloco(titulo, corpo) {
  return '<section class="cap"><h2 class="sem-num">' + titulo + '</h2>' + corpo + '</section>';
}
function cap(n, titulo, corpo) {
  return '<section class="cap"><h2><span class="cap-n">' + n + '</span>' + titulo + '</h2>' + corpo + '</section>';
}

window.valorBaixo = function (respostas, segmento, id) {
  var p = window.todasPerguntas(segmento).find(function (x) { return x.id === id; });
  if (!p || p.tipo !== 'escala') return false;
  var resp = respostas[id]; if (!resp) return false;
  var op = p.opcoes.find(function (o) { return o[0] === resp; });
  if (!op || op[1] === null || op[1] === undefined) return false;
  return op[1] <= 0.5;
};

/* ---------- documento ---------- */
window.AVISO_USO = 'Uso exclusivo da Vegas Vigilância (sujeito a penalidade contratual)';

function pagina(corpo, titulo, logo, sub) {
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<meta name="color-scheme" content="dark">' +
  '<title>Plano de Segurança — ' + esc(titulo) + '</title><style>' + CSS_DOC + '</style></head><body>' +

  '<div class="barra-topo no-print">' +
    '<span>Documento pronto. Toque em imprimir e escolha <b>Salvar como PDF</b>. ' +
    'Mantenha marcada a opção <b>Gráficos em segundo plano</b>, senão o fundo escuro não sai.</span>' +
    '<button onclick="window.print()">Imprimir ou salvar em PDF</button>' +
  '</div>' +

  /* Fundo escuro cobrindo a folha inteira, margens inclusive.
     É position:fixed com recuo negativo igual dos quatro lados,
     então não depende de qual borda o navegador usa como âncora. */
  '<div class="folha-fundo" aria-hidden="true"></div>' +

  /* Cabeçalho e rodapé repetidos vão em thead e tfoot de uma tabela.
     É a única forma que o Chrome repete de verdade em toda página:
     com position:fixed ele troca top por bottom na impressão e a
     logo acaba no pé da folha. */
  '<table class="folha"><thead><tr><td>' +
      '<div class="marca-pagina"><img src="' + logo + '" alt="">' +
      '<span>' + esc(titulo) + (sub ? ' — ' + sub : '') + '</span></div>' +
    '</td></tr></thead>' +
    '<tfoot><tr><td>' +
      '<div class="aviso-pagina">' + esc(window.AVISO_USO) + '</div>' +
    '</td></tr></tfoot>' +
    '<tbody><tr><td><div class="doc">' + corpo + '</div></td></tr></tbody>' +
  '</table>' +

  '<p class="aviso-tela no-print">' + esc(window.AVISO_USO) + '</p>' +
  '</body></html>';
}

var CSS_DOC = [
/* ============================================================
   Documento em tema escuro.

   Duas coisas seguram este arquivo:

   1. print-color-adjust:exact — sem isso o Chrome descarta os
      fundos na impressão e o PDF sai branco com texto branco,
      ou seja, ilegível.
   2. position:fixed dentro de @media print — o navegador repete
      esses elementos em todas as páginas. É o que coloca a logo
      no alto e o aviso de uso no pé de cada folha.
   ============================================================ */
'@page{size:A4;margin:24mm 16mm 20mm}',
'*{box-sizing:border-box}',
'html{-webkit-print-color-adjust:exact;print-color-adjust:exact}',

/* ---- paleta ---- */
':root{',
'  --tinta:#e7ebf1;',      /* texto principal */
'  --tinta2:#a8b2bf;',     /* texto secundário */
'  --tinta3:#7a8593;',     /* legendas */
'  --fundo:#0f1216;',      /* folha */
'  --bloco:#171c23;',      /* caixas e destaques */
'  --bloco2:#1d232c;',     /* cabeçalho de tabela */
'  --linha:#2b323c;',
'  --linha2:#222831;',
'  --ambar:#e8a317;',
'}',

'body{margin:0;background:var(--fundo);color:var(--tinta);',
'  font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;',
'  font-size:10.5pt;line-height:1.55}',
'.doc{max-width:190mm;margin:0 auto;padding:18mm 16mm 20mm}',

/* ---- barra de ação, só na tela ---- */
'.barra-topo{position:sticky;top:0;z-index:9;background:#1d232c;color:#e6e9ee;',
'  display:flex;gap:16px;align-items:center;justify-content:center;padding:10px 16px;',
'  font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:13px;flex-wrap:wrap;',
'  border-bottom:1px solid #2b323c}',
'.barra-topo b{color:var(--ambar);font-weight:600}',
'.barra-topo button{background:var(--ambar);color:#12151a;border:0;border-radius:6px;',
'  padding:9px 16px;font-weight:700;font-size:13px;cursor:pointer}',
'.aviso-tela{max-width:190mm;margin:0 auto 30px;padding:0 16mm;',
'  font-family:system-ui,sans-serif;font-size:8.5pt;color:var(--tinta3);text-align:center}',

/* ---- marca e aviso que se repetem em cada página ---- */
'.folha{width:100%;border-collapse:collapse}',
'.folha > thead td,.folha > tfoot td{padding:0;border:0}',
'.folha > tbody > tr > td{padding:0;border:0}',
'.folha-fundo{display:none}',
'.marca-pagina,.aviso-pagina{display:none}',

/* ---- títulos ---- */
'h1{font-size:23pt;line-height:1.15;margin:6px 0 4px;font-weight:600;letter-spacing:-.01em}',
'h2{font-size:15pt;margin:0 0 14px;font-weight:600;display:flex;align-items:baseline;gap:10px;',
'  border-bottom:2px solid var(--linha);padding-bottom:7px}',
'h2.sem-num{border-bottom-width:1px}',
'.cap-n{font-family:system-ui,sans-serif;font-size:10pt;font-weight:700;background:var(--ambar);',
'  color:#12151a;width:22px;height:22px;border-radius:3px;display:inline-flex;align-items:center;',
'  justify-content:center;flex:0 0 auto}',
'h3{font-size:11.5pt;margin:18px 0 7px;font-weight:600}',
'p{margin:0 0 9px;max-width:72ch}',
'.cap{page-break-before:always;padding-top:2mm}',

/* ---- capa ---- */
/* page-break-after aqui desliga a repetição do tfoot no Chrome, e o
   rodapé de uso restrito sairia só na última página. A quebra depois
   da capa já vem do .cap do sumário, então esta era redundante. */
'.capa{text-align:left;padding-top:8mm}',
'.logo-capa{width:62mm;display:block;margin-bottom:22mm}',
'.capa-tipo{font-family:system-ui,sans-serif;font-size:9.5pt;letter-spacing:.14em;',
'  text-transform:uppercase;color:var(--ambar);margin-bottom:4px}',
'.capa-local{font-size:12pt;color:var(--tinta2);margin-bottom:16mm}',
'.capa-selo{display:flex;align-items:center;gap:16px;border-left:5px solid;padding:12px 18px;',
'  background:var(--bloco);margin-bottom:14mm;max-width:100mm}',
'.selo-num{font-family:system-ui,sans-serif;font-size:38pt;font-weight:800;line-height:1}',
'.selo-txt{font-family:system-ui,sans-serif;font-size:10pt;line-height:1.4;color:var(--tinta2)}',
'.capa-rodape{margin-top:18mm;font-size:8.5pt;color:var(--tinta3);border-top:1px solid var(--linha);',
'  padding-top:8px;max-width:120mm}',

/* ---- tabelas ---- */
'table{width:100%;border-collapse:collapse;margin:10px 0 14px;font-size:9.8pt}',
'.capa-dados th,.dados th{text-align:left;width:52mm;font-weight:600;color:var(--tinta2);',
'  padding:5px 10px 5px 0;vertical-align:top;border-bottom:1px solid var(--linha2)}',
'.capa-dados td,.dados td{padding:5px 0;border-bottom:1px solid var(--linha2)}',

'.sumario{font-size:11pt;line-height:2;padding-left:20px}',
'.nota{background:var(--bloco);border-left:3px solid var(--linha);padding:9px 13px;',
'  font-size:9.5pt;color:var(--tinta2);margin-top:14px}',

/* ---- índice ---- */
'.destaque{display:flex;gap:20px;align-items:center;border-left:6px solid;background:var(--bloco);',
'  padding:16px 20px;margin:4px 0 18px}',
'.destaque-num{font-family:system-ui,sans-serif;font-size:44pt;font-weight:800;line-height:1}',
'.destaque-num span{font-size:14pt;font-weight:600;color:var(--tinta3)}',
'.destaque-txt strong{font-size:13pt}.destaque-txt p{margin:3px 0 0;font-size:10pt;color:var(--tinta2)}',
'.dims th{text-align:left;padding:7px 8px;border-bottom:1px solid var(--linha)}',
'.dims td{padding:7px 8px;border-bottom:1px solid var(--linha2);vertical-align:middle}',
'.dims thead th{background:var(--bloco2);color:var(--tinta);font-size:9pt;font-weight:600}',
'.dims .num{font-family:system-ui,sans-serif;font-weight:700;width:14mm;text-align:right}',
'.dims .faixa{width:28mm;font-size:9pt;color:var(--tinta2)}',
'.barra{background:#262d37;height:9px;border-radius:5px;overflow:hidden;min-width:34mm}',
'.barra-fill{height:100%;border-radius:5px}',
'.barra-vazia{font-size:7.5pt;color:var(--tinta3);padding-left:4px;line-height:9px}',
'.escala td{padding:5px 8px;border-bottom:1px solid var(--linha2);font-size:9.5pt}',
'.escala .e{color:#12151a;font-family:system-ui,sans-serif;font-weight:700;width:20mm;',
'  text-align:center;font-size:9pt}',

/* ---- leitura por dimensão ---- */
'.dim-bloco{margin-bottom:14px;break-inside:avoid}',
'.dim-bloco ul{margin:4px 0 0;padding-left:18px;font-size:10pt}',
'.dim-bloco li{margin-bottom:3px}',
'.dim-bloco em{color:#f0938c;font-style:normal}',
'.pill{font-family:system-ui,sans-serif;font-size:8.5pt;font-weight:700;color:#12151a;',
'  padding:2px 8px;border-radius:10px;vertical-align:middle}',
'.ok{color:#7fd39b}',

/* ---- riscos ---- */
'.contadores{display:flex;gap:10px;margin-bottom:14px}',
'.cont{flex:1;background:var(--bloco);padding:10px;text-align:center;',
'  font-family:system-ui,sans-serif;font-size:9pt;border-radius:4px;color:var(--tinta2)}',
'.cont-n{font-size:24pt;font-weight:800;line-height:1.1;color:var(--tinta)}',
'.riscos th{background:var(--bloco2);color:var(--tinta);text-align:left;padding:6px 8px;',
'  font-size:8.8pt;font-weight:600}',
'.riscos td{padding:6px 8px;border-bottom:1px solid var(--linha2);font-size:9.3pt}',
'.nivel{font-family:system-ui,sans-serif;font-size:8pt;font-weight:700;color:#fff;',
'  padding:2px 7px;border-radius:3px;white-space:nowrap}',
'.n-critico .nivel,.nivel.n-critico{background:#C6282C}',
'.n-alto .nivel,.nivel.n-alto{background:#E0651A}',
'.n-medio .nivel,.nivel.n-medio{background:#E8A317;color:#12151a}',
'.n-baixo .nivel,.nivel.n-baixo{background:#7CB518;color:#12151a}',
'.risco{border-left:4px solid var(--linha);padding:10px 0 10px 14px;margin-bottom:14px;break-inside:avoid}',
'.risco.n-critico{border-color:#C6282C}.risco.n-alto{border-color:#E0651A}',
'.risco.n-medio{border-color:#E8A317}.risco.n-baixo{border-color:#7CB518}',
'.risco h3{margin:0 0 3px}',
'.risco-meta{font-family:system-ui,sans-serif;font-size:8.5pt;color:var(--tinta3);margin-bottom:7px}',

/* ---- plano de ação ---- */
'.quebra{page-break-before:always;padding-top:4mm}',
'.prazo{margin-bottom:18px;break-inside:avoid}',
'.prazo-tag{font-family:system-ui,sans-serif;font-size:8.5pt;color:var(--tinta3);margin:-4px 0 7px}',
'.acoes th{background:var(--bloco);text-align:left;padding:6px 8px;font-size:8.8pt;',
'  border-bottom:1px solid var(--linha);color:var(--tinta2)}',
'.acoes td{padding:7px 8px;border-bottom:1px solid var(--linha2);font-size:9.5pt;vertical-align:top}',
'.acoes .resp{width:32mm;border-left:1px solid var(--linha2)}',
'.acoes .check{width:16mm;border-left:1px solid var(--linha2)}',

/* ---- POPs ---- */
'.pop{break-inside:avoid;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--linha2)}',
'.pop h3{margin-top:0}',
'.pop-obj{font-size:10pt;color:var(--tinta2)}',
'.pop-passos{margin:6px 0;padding-left:20px;font-size:10pt}',
'.pop-passos li{margin-bottom:4px}',
'.pop-atencao{background:#2a2213;border-left:3px solid var(--ambar);padding:8px 12px;',
'  font-size:9.5pt;margin-top:8px;color:#f0e2c2}',

/* ---- conformidade ---- */
'.dossie{padding-left:20px;font-size:10pt}',
'.dossie li{margin-bottom:6px;position:relative}',
'.dossie .box{display:inline-block;width:11px;height:11px;border:1px solid var(--tinta3);',
'  margin-left:8px;vertical-align:baseline}',
'.lacunas{padding-left:18px;font-size:10pt}.lacunas li{margin-bottom:6px}',
'.pergunta{break-inside:avoid;margin-bottom:12px}',
'.pergunta h3{margin:0 0 4px;font-size:11pt}',

/* ---- fotos ---- */
'.fotos{display:grid;grid-template-columns:1fr 1fr;gap:12px}',
'.foto{margin:0;break-inside:avoid}',
'.foto img{width:100%;border:1px solid var(--linha);display:block}',
'.foto-ausente{border:1px dashed var(--linha);padding:26px 10px;text-align:center;',
'  font-size:8.5pt;color:var(--tinta3)}',
'.foto figcaption{font-size:8.5pt;color:var(--tinta2);margin-top:4px;line-height:1.35}',

/* ---- assinaturas ---- */
'.assinaturas{display:flex;gap:30px;margin-top:26mm;font-size:9.5pt}',
'.ass{flex:1;text-align:center}',
'.ass .linha{border-top:1px solid var(--tinta2);margin-bottom:5px}',
'.ass small{color:var(--tinta3)}',

/* ============================================================
   IMPRESSÃO
   ============================================================ */
'@media print{',
'  .no-print{display:none!important}',
'  .doc{max-width:none;padding:0}',
'  .capa{padding-top:2mm}',

/* fundo escuro cobrindo a folha inteira, margens inclusive */
'  .folha-fundo{display:block;position:fixed;top:-40mm;left:-40mm;right:-40mm;bottom:-40mm;',
'    background:var(--fundo);z-index:-2}',

/* thead e tfoot: o navegador repete os dois em cada página */
'  .folha > thead td{padding:0 0 5mm}',
'  .folha > tfoot td{padding:5mm 0 0}',
'  .marca-pagina{display:flex;align-items:center;gap:8px;padding-bottom:3px;',
'    border-bottom:1px solid var(--linha2);font-family:system-ui,sans-serif;',
'    font-size:7.5pt;color:var(--tinta3)}',
'  .marca-pagina img{height:5mm;width:auto;flex:0 0 auto}',
'  .marca-pagina span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'  .aviso-pagina{display:block;text-align:center;font-family:system-ui,sans-serif;',
'    font-size:7pt;letter-spacing:.02em;color:var(--tinta3);',
'    border-top:1px solid var(--linha2);padding-top:3px}',
'}'
].join('\n');
