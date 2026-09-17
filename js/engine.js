/* ============================================================
   Vegas — Motor de análise
   Índice de Maturidade, regras de risco e plano de ação.
   ============================================================ */

/* ---------- Índice de Maturidade em Segurança (0 a 100) ---------- */
window.calcularIndice = function (respostas, segmento) {
  var acumulado = {}, total = {};
  var pontuaveis = 0, neutras = 0;
  Object.keys(window.DIMENSOES).forEach(function (d) { acumulado[d] = 0; total[d] = 0; });

  window.todasPerguntas(segmento).forEach(function (p) {
    if (p.tipo !== 'escala' || !p.dim) return;
    pontuaveis++;
    var r = respostas[p.id];
    if (r === undefined || r === null || r === '') return;   // não respondida não conta
    var op = p.opcoes.find(function (o) { return o[0] === r; });
    if (!op) return;
    /* 'Não se aplica' e 'Sem informação' saem da conta em vez de
       valer zero: senão o índice pune o cliente por uma pergunta
       que nem cabia no posto dele */
    if (op[1] === null || op[1] === undefined) { neutras++; return; }
    acumulado[p.dim] += op[1] * p.peso;
    total[p.dim] += p.peso;
  });

  var dimensoes = {}, somaA = 0, somaT = 0;
  Object.keys(window.DIMENSOES).forEach(function (d) {
    dimensoes[d] = total[d] > 0 ? Math.round((acumulado[d] / total[d]) * 100) : null;
    somaA += acumulado[d]; somaT += total[d];
  });

  /* quanto do questionário realmente entrou na conta. Abaixo de
     70% o número existe, mas descreve pouca coisa, e o documento
     precisa dizer isso em vez de fingir precisão. */
  var contadas = 0;
  window.todasPerguntas(segmento).forEach(function (p) {
    if (p.tipo !== 'escala' || !p.dim) return;
    var r = respostas[p.id];
    if (r === undefined || r === null || r === '') return;
    var op = p.opcoes.find(function (o) { return o[0] === r; });
    if (op && op[1] !== null && op[1] !== undefined) contadas++;
  });

  return {
    geral: somaT > 0 ? Math.round((somaA / somaT) * 100) : 0,
    calculavel: somaT > 0,
    dimensoes: dimensoes,
    respondidas: somaT,
    pontuaveis: pontuaveis,
    contadas: contadas,
    neutras: neutras,
    cobertura: pontuaveis > 0 ? Math.round((contadas / pontuaveis) * 100) : 0
  };
};

/* perguntas marcadas como sem informação: viram lista de pendências
   do próprio levantamento, para o supervisor voltar ao posto */
window.semInformacao = function (respostas, segmento) {
  var fora = [];
  window.todasPerguntas(segmento).forEach(function (p) {
    if (p.tipo !== 'escala') return;
    if (respostas[p.id] === window.SEM_INFO) {
      fora.push({ id: p.id, texto: p.texto, dim: p.dim });
    }
  });
  return fora;
};

/* perguntas marcadas como não se aplica: só o total interessa */
window.naoSeAplica = function (respostas, segmento) {
  var fora = [];
  window.todasPerguntas(segmento).forEach(function (p) {
    if (p.tipo !== 'escala') return;
    if (respostas[p.id] === window.NAO_SE_APLICA) {
      fora.push({ id: p.id, texto: p.texto, dim: p.dim });
    }
  });
  return fora;
};

window.faixaIndice = function (n) {
  if (n >= 80) return { chave: 'avancado', nome: 'Avançado',  cor: '#2FA84F', texto: 'A operação tem controles maduros. O foco passa a ser manter o padrão e medir.' };
  if (n >= 60) return { chave: 'gerenciado', nome: 'Gerenciado', cor: '#7CB518', texto: 'A base está montada. Faltam formalização e consistência para o controle não depender de pessoas.' };
  if (n >= 40) return { chave: 'basico', nome: 'Básico', cor: '#E8A317', texto: 'Existem controles isolados que não se sustentam sozinhos. Falha de uma pessoa derruba a proteção.' };
  if (n >= 20) return { chave: 'incipiente', nome: 'Incipiente', cor: '#E0651A', texto: 'A segurança depende da presença física e da boa vontade de quem está no posto.' };
  return { chave: 'critico', nome: 'Crítico', cor: '#C6282C', texto: 'O local está exposto. Um incidente comum encontra o caminho aberto.' };
};

/* ---------- Regras de risco ----------------------------------- */
/* v(id) devolve 0..1 (valor da opção marcada) ou null se não respondida
   t(id) devolve o texto da resposta                                  */
function ctx(respostas, segmento) {
  var mapa = {};
  window.todasPerguntas(segmento).forEach(function (p) { mapa[p.id] = p; });
  return {
    t: function (id) { return respostas[id]; },
    v: function (id) {
      var p = mapa[id], r = respostas[id];
      if (!p || p.tipo !== 'escala' || r == null || r === '') return null;
      var op = p.opcoes.find(function (o) { return o[0] === r; });
      if (!op || op[1] === null || op[1] === undefined) return null;
      return op[1];
    },
    /* baixo: respondida e abaixo do limite. Não dispara se não respondeu. */
    baixo: function (id, lim) {
      var x = this.v(id); return x !== null && x <= (lim === undefined ? 0.4 : lim);
    },
    alto: function (id, lim) {
      var x = this.v(id); return x !== null && x >= (lim === undefined ? 0.8 : lim);
    },
    num: function (id) { var n = parseFloat(respostas[id]); return isNaN(n) ? null : n; }
  };
}

var NIVEL = ['', 'Muito baixa', 'Baixa', 'Média', 'Alta', 'Muito alta'];
var IMPACTO = ['', 'Desprezível', 'Pequeno', 'Moderado', 'Grande', 'Severo'];

window.REGRAS = [
  /* -------- perímetro e acesso -------- */
  { id: 'R01', titulo: 'Invasão pelo perímetro', cat: 'Perímetro', p: 4, i: 4,
    quando: function (c) { return c.baixo('per_muro', 0.4) || c.baixo('per_fundos', 0.4); },
    consequencia: 'Entrada sem confronto com o posto de vigilância, normalmente à noite e pelos fundos. Furto de equipamento, cabo de cobre ou veículo.',
    tratamento: 'Recuperar a barreira física, instalar proteção no topo do muro e incluir os fundos na ronda registrada.',
    prazo: 'investimento' },

  { id: 'R02', titulo: 'Ponto cego por falta de iluminação', cat: 'Perímetro', p: 4, i: 3,
    quando: function (c) { return c.baixo('ilu_perimetral', 0.4); },
    consequencia: 'Área escura vira rota preferencial de aproximação e anula a utilidade do CFTV no horário de maior risco.',
    tratamento: 'Levantar os pontos escuros em ronda noturna e instalar iluminação com acionamento automático. É o item de melhor relação custo-benefício do plano.',
    prazo: '30' },

  { id: 'R03', titulo: 'Escalada apoiada em objeto externo', cat: 'Perímetro', p: 3, i: 3,
    quando: function (c) { return c.baixo('per_apoio', 0.4) || c.baixo('per_vegetacao', 0.4); },
    consequencia: 'O muro deixa de ser barreira. Vegetação e materiais encostados também escondem quem já entrou.',
    tratamento: 'Afastar materiais do muro, podar vegetação e definir faixa de 1,5 m livre em todo o perímetro interno.',
    prazo: 'imediato' },

  { id: 'R04', titulo: 'Entrada de pessoa não identificada', cat: 'Acesso', p: 5, i: 4,
    quando: function (c) { return c.baixo('ace_pedestre', 0.4); },
    consequencia: 'Sem registro de quem entrou, não há como investigar depois. É a causa mais comum de furto interno em que ninguém é responsabilizado.',
    tratamento: 'Implantar registro de entrada com documento. Começa em ficha de papel no mesmo dia e evolui para sistema informatizado.',
    prazo: 'imediato' },

  { id: 'R05', titulo: 'Veículo entra sem registro de placa', cat: 'Acesso', p: 4, i: 4,
    quando: function (c) { return c.baixo('ace_veiculo', 0.4); },
    consequencia: 'Veículo é o meio de retirada de volume grande. Sem placa registrada, o caso morre no boletim de ocorrência.',
    tratamento: 'Registrar placa, motorista, horário e destino em toda entrada. Conferir a placa na saída.',
    prazo: 'imediato' },

  { id: 'R06', titulo: 'Prestador de serviço sem verificação', cat: 'Acesso', p: 4, i: 4,
    quando: function (c) { return c.baixo('ace_prestador', 0.4); },
    consequencia: 'Uniforme de prestador é o disfarce mais usado em invasão planejada. Também é a porta de furto de dado e de equipamento.',
    tratamento: 'Exigir ordem de serviço, conferir com o contratante e emitir crachá temporário com devolução obrigatória.',
    prazo: '30' },

  { id: 'R07', titulo: 'Saída de material sem conferência', cat: 'Acesso', p: 4, i: 5,
    quando: function (c) { return c.baixo('ace_saida_material', 0.4); },
    consequencia: 'Perda patrimonial contínua e de difícil detecção, porque ninguém sente falta de item que sai aos poucos.',
    tratamento: 'Criar autorização de saída de material com assinatura de quem liberou e conferência na portaria.',
    prazo: 'imediato' },

  { id: 'R08', titulo: 'Chaves e cópias sem controle', cat: 'Acesso', p: 3, i: 4,
    quando: function (c) { return c.baixo('ace_chaves', 0.4); },
    consequencia: 'Cópia não rastreada permite acesso sem arrombamento, o que costuma invalidar a cobertura do seguro.',
    tratamento: 'Inventariar chaves, implantar quadro com lacre e livro de retirada, trocar segredo das que não têm origem conhecida.',
    prazo: '30' },

  { id: 'R09', titulo: 'Acesso permanece ativo após desligamento', cat: 'Acesso', p: 3, i: 4,
    quando: function (c) { return c.baixo('ace_bloqueio', 0.4) || c.baixo('emp_desligamento', 0.4); },
    consequencia: 'Ex-funcionário com crachá ou chave válida é o perfil clássico de furto com rancor, nas primeiras semanas após a saída.',
    tratamento: 'Incluir bloqueio de crachá, sistema e chave no checklist de desligamento, com prazo de mesmo dia.',
    prazo: 'imediato' },

  /* -------- tecnologia -------- */
  { id: 'R10', titulo: 'Ausência de prova em imagem', cat: 'Tecnologia', p: 4, i: 4,
    quando: function (c) { return c.baixo('tec_cftv', 0.5) || c.baixo('tec_gravacao', 0.4); },
    consequencia: 'Sem imagem, a apuração para no depoimento e o prejuízo não é recuperado. Também impede punir e reincidência vira rotina.',
    tratamento: 'Garantir cobertura dos acessos e do perímetro com retenção mínima de 30 dias.',
    prazo: 'investimento' },

  { id: 'R11', titulo: 'Imagem inútil no período noturno', cat: 'Tecnologia', p: 4, i: 3,
    quando: function (c) { return c.baixo('tec_noturna', 0.4) && !c.baixo('tec_cftv', 0.3); },
    consequencia: 'Existe sistema, existe custo e não existe prova exatamente no horário em que o incidente acontece.',
    tratamento: 'Substituir as câmeras dos acessos por modelos com infravermelho ou colorido noturno e reforçar a iluminação.',
    prazo: '90' },

  { id: 'R12', titulo: 'Sistemas caem junto com a energia', cat: 'Contingência', p: 4, i: 4,
    quando: function (c) { return c.baixo('tec_backup_energia', 0.4); },
    consequencia: 'Basta cortar o poste para derrubar CFTV, alarme e portão eletrônico ao mesmo tempo. É procedimento conhecido de quem planeja.',
    tratamento: 'Instalar nobreak dedicado para gravador, câmeras dos acessos e central de alarme, com autonomia mínima de 4 horas.',
    prazo: '90' },

  { id: 'R13', titulo: 'Alarme instalado e desativado', cat: 'Tecnologia', p: 3, i: 3,
    quando: function (c) { var x = c.v('tec_alarme'); return x !== null && x <= 0.25; },
    consequencia: 'Equipamento que ninguém liga passa falsa sensação de proteção e some do orçamento de manutenção.',
    tratamento: 'Diagnosticar a causa da desativação, geralmente disparo falso, corrigir setorização e retomar o uso com monitoramento.',
    prazo: '30' },

  /* -------- operação -------- */
  { id: 'R14', titulo: 'Posto sem Ordem de Serviço escrita', cat: 'Operação', p: 5, i: 4,
    quando: function (c) { return c.baixo('pro_os', 0.5); },
    consequencia: 'Cada colaborador age de um jeito, não há como cobrar desvio e a empresa fica sem defesa em reclamatória ou em questionamento do cliente.',
    tratamento: 'Emitir Ordem de Serviço do posto, colher assinatura de todo o efetivo e afixar cópia no local.',
    prazo: 'imediato' },

  { id: 'R15', titulo: 'Ocorrências não registradas', cat: 'Operação', p: 5, i: 3,
    quando: function (c) { return c.baixo('pro_livro', 0.4); },
    consequencia: 'Sem histórico, não se identifica padrão, o cliente não enxerga o valor entregue e a supervisão trabalha às cegas.',
    tratamento: 'Padronizar registro por turno, com envio diário à supervisão e leitura semanal em busca de padrão.',
    prazo: 'imediato' },

  { id: 'R16', titulo: 'Ronda ausente ou sem comprovação', cat: 'Operação', p: 4, i: 3,
    quando: function (c) { return c.baixo('efe_ronda', 0.4) || c.baixo('efe_ronda_registro', 0.4); },
    consequencia: 'Ronda que não é comprovada não existe para efeito contratual e tende a deixar de ser feita no turno da madrugada.',
    tratamento: 'Definir percurso com pontos obrigatórios e horário variável, comprovado por bastão eletrônico ou aplicativo.',
    prazo: '30' },

  { id: 'R17', titulo: 'Efetivo insuficiente para a área', cat: 'Operação', p: 4, i: 4,
    quando: function (c) { return c.baixo('efe_dimensionamento', 0.4); },
    consequencia: 'Posto descoberto em algum momento do dia, ronda que não sai e colaborador sem intervalo. Gera incidente e passivo trabalhista ao mesmo tempo.',
    tratamento: 'Redimensionar o posto com base na área e no fluxo, ou reduzir formalmente o escopo em aditivo contratual.',
    prazo: '30' },

  { id: 'R18', titulo: 'Passagem de turno informal', cat: 'Operação', p: 4, i: 3,
    quando: function (c) { return c.baixo('pro_passagem', 0.4); },
    consequencia: 'Informação de pendência se perde na troca. Portão aberto, visitante ainda dentro e equipamento com defeito não chegam ao turno seguinte.',
    tratamento: 'Criar roteiro de passagem de turno com conferência de itens e assinatura das duas partes.',
    prazo: 'imediato' },

  { id: 'R19', titulo: 'Supervisão sem periodicidade definida', cat: 'Governança', p: 4, i: 3,
    quando: function (c) { return c.baixo('pro_supervisao', 0.4) || c.baixo('pro_supervisao_registro', 0.4); },
    consequencia: 'O padrão do serviço cai de forma gradual e só aparece quando o cliente reclama ou quando acontece o incidente.',
    tratamento: 'Fixar frequência mínima de visita, incluir visita noturna surpresa e emitir relatório com foto a cada passagem.',
    prazo: '30' },

  { id: 'R20', titulo: 'Colaborador sem treinamento do posto', cat: 'Operação', p: 4, i: 4,
    quando: function (c) { return c.baixo('efe_treinamento_local', 0.4); },
    consequencia: 'Formação legal não ensina a planta, os riscos e as pessoas daquele local. Erro em emergência costuma nascer aqui.',
    tratamento: 'Criar integração de posto de 4 horas com planta, riscos, contatos e simulação das situações mais prováveis.',
    prazo: '30' },

  /* -------- emergências e contingência -------- */
  { id: 'R21', titulo: 'Sem plano de emergência', cat: 'Emergências', p: 3, i: 5,
    quando: function (c) { return c.baixo('eme_plano', 0.4) || c.baixo('eme_acionamento', 0.4); },
    consequencia: 'Em incêndio ou emergência médica, a resposta depende de improviso. Aqui o risco deixa de ser patrimonial e passa a ser vida.',
    tratamento: 'Elaborar plano com fluxo de acionamento, afixar no posto e treinar todo o efetivo.',
    prazo: 'imediato' },

  { id: 'R22', titulo: 'Situação irregular perante o Corpo de Bombeiros', cat: 'Emergências', p: 3, i: 5,
    quando: function (c) { return c.baixo('eme_avcb', 0.4) || c.baixo('eme_extintores', 0.4); },
    consequencia: 'Interdição, multa e recusa de cobertura do seguro em caso de sinistro. Em condomínio, responsabilidade pessoal do síndico.',
    tratamento: 'Contratar vistoria, regularizar sistema preventivo e criar controle de vencimento dos extintores.',
    prazo: '90' },

  { id: 'R23', titulo: 'Sem procedimento para falta de energia', cat: 'Contingência', p: 4, i: 4,
    quando: function (c) { return c.baixo('con_energia', 0.4) || c.baixo('con_portao_manual', 0.4); },
    consequencia: 'Queda de energia abre portão, apaga câmera e paralisa o acesso. É a janela mais explorada em ação planejada.',
    tratamento: 'Escrever o procedimento, treinar abertura manual de portões e testar a rotina uma vez por trimestre.',
    prazo: 'imediato' },

  { id: 'R24', titulo: 'Comunicação dependente de recurso pessoal', cat: 'Contingência', p: 4, i: 4,
    quando: function (c) { return c.baixo('con_comunicacao', 0.4) || c.baixo('tec_panico', 0.4); },
    consequencia: 'Colaborador sob ameaça não consegue pedir socorro sem ser percebido. Também significa que a empresa não controla o meio de comunicação do posto.',
    tratamento: 'Fornecer rádio ou celular corporativo e instalar botão de pânico discreto ligado à central.',
    prazo: '30' },

  { id: 'R25', titulo: 'Sem reserva de efetivo', cat: 'Contingência', p: 4, i: 4,
    quando: function (c) { return c.baixo('con_reserva_efetivo', 0.4) || c.baixo('efe_revezamento', 0.4); },
    consequencia: 'Uma falta deixa o posto descoberto ou obriga dobra, que gera hora extra, fadiga e risco de acidente.',
    tratamento: 'Manter reserva técnica acionável em até 2 horas e escala de cobertura de férias planejada com 60 dias.',
    prazo: '30' },

  /* -------- governança e compliance -------- */
  { id: 'R26', titulo: 'Risco de responsabilização subsidiária do cliente', cat: 'Governança', p: 4, i: 5,
    quando: function (c) { return c.baixo('gov_conferencia', 0.4) || c.baixo('gov_dossie', 0.4); },
    consequencia: 'Se a contratada não recolhe FGTS e INSS, o tomador responde subsidiariamente. A Súmula 331 do TST exige prova de fiscalização efetiva, não apenas a exigência no contrato.',
    tratamento: 'Instituir dossiê mensal de documentos e conferência formal antes de liberar o pagamento da fatura.',
    prazo: 'imediato' },

  { id: 'R27', titulo: 'Contratada sem autorização verificada da Polícia Federal', cat: 'Governança', p: 3, i: 5,
    quando: function (c) { return c.baixo('gov_pf', 0.4); },
    consequencia: 'Contratar vigilância sem autorização válida da PF expõe o contratante a autuação e anula a defesa em caso de incidente com arma.',
    tratamento: 'Exigir e arquivar o Certificado de Segurança e a autorização de funcionamento, com conferência anual da validade.',
    prazo: 'imediato' },

  { id: 'R28', titulo: 'Reciclagem de vigilante vencida', cat: 'Governança', p: 3, i: 5,
    quando: function (c) { return c.baixo('efe_reciclagem', 0.5); },
    consequencia: 'Vigilante com reciclagem vencida no posto gera autuação da PF, nulidade contratual e responsabilidade direta em qualquer ocorrência.',
    tratamento: 'Controlar vencimento com alerta de 90 dias e bloquear escala de quem estiver irregular.',
    prazo: 'imediato' },

  { id: 'R29', titulo: 'Condição de trabalho irregular no posto', cat: 'Governança', p: 4, i: 4,
    quando: function (c) { return c.baixo('ilu_sanitario', 0.4) || c.baixo('ilu_guarita', 0.35); },
    consequencia: 'Falta de sanitário, local de refeição ou abrigo adequado é autuação do MTE e tema recorrente em reclamatória, com dano moral.',
    tratamento: 'Formalizar com o cliente as condições mínimas do posto e registrar a exigência por escrito, com prazo.',
    prazo: '30' },

  { id: 'R30', titulo: 'Tratamento de dados pessoais fora da LGPD', cat: 'Governança', p: 3, i: 3,
    quando: function (c) { return c.baixo('gov_lgpd', 0.4) || c.baixo('tec_lgpd_cftv', 0.4); },
    consequencia: 'Portaria coleta documento, imagem e placa. Sem base legal, aviso e prazo de descarte, há exposição a sanção da ANPD e a ação individual.',
    tratamento: 'Afixar aviso de monitoramento, definir prazo de retenção e restringir quem acessa imagem e livro de registro.',
    prazo: '90' },

  /* -------- condomínio residencial -------- */
  { id: 'S01', seg: 'residencial', titulo: 'Carona no acesso de pedestres', cat: 'Acesso', p: 5, i: 4,
    quando: function (c) { return c.baixo('res_carona', 0.4); },
    consequencia: 'É o modo de entrada mais usado em roubo a condomínio. O invasor entra colado no morador e o colaborador não tem barreira física para sustentar a recusa.',
    tratamento: 'Instalar catraca ou eclusa na entrada de pedestres e comunicar a regra aos moradores com apoio formal do síndico.',
    prazo: 'investimento' },

  { id: 'S02', seg: 'residencial', titulo: 'Clonagem de controle de garagem', cat: 'Acesso', p: 4, i: 4,
    quando: function (c) { return c.baixo('res_garagem', 0.4) || c.baixo('res_garagem_tempo', 0.4); },
    consequencia: 'Controle de código fixo é copiado em segundos na rua. Portão lento também permite o segundo veículo entrar junto.',
    tratamento: 'Migrar para controle com código rotativo, cadastrar cada dispositivo por unidade e ajustar o tempo de fechamento.',
    prazo: '90' },

  { id: 'S03', seg: 'residencial', titulo: 'Prestador de morador sem cadastro', cat: 'Acesso', p: 4, i: 4,
    quando: function (c) { return c.baixo('res_prestador_morador', 0.4); },
    consequencia: 'Diarista, pintor e técnico circulam sem registro. Em furto dentro de unidade, não há lista de quem esteve no prédio.',
    tratamento: 'Cadastro obrigatório com documento, autorização registrada do morador e crachá de visitante com devolução.',
    prazo: 'imediato' },

  { id: 'S04', seg: 'residencial', titulo: 'Mudança sem controle', cat: 'Operação', p: 3, i: 4,
    quando: function (c) { return c.baixo('res_mudanca', 0.4); },
    consequencia: 'Caminhão de mudança é a forma mais simples de retirar volume sem levantar suspeita, inclusive de outra unidade.',
    tratamento: 'Exigir agendamento, autorização do síndico, identificação da equipe e acompanhamento do colaborador na carga.',
    prazo: 'imediato' },

  { id: 'S05', seg: 'residencial', titulo: 'Chaves de unidades na portaria sem controle', cat: 'Acesso', p: 3, i: 5,
    quando: function (c) { return c.baixo('res_chaves_unidade', 0.4); },
    consequencia: 'Furto sem arrombamento dentro da unidade, com responsabilização direta do condomínio e do colaborador de plantão.',
    tratamento: 'Cofre com chaves numeradas, livro de retirada com assinatura e autorização escrita do proprietário.',
    prazo: 'imediato' },

  /* -------- condomínio comercial -------- */
  { id: 'S10', seg: 'comercial', titulo: 'Funcionários de locatários sem credenciamento', cat: 'Acesso', p: 5, i: 4,
    quando: function (c) { return c.baixo('com_credencial', 0.4) || c.baixo('com_locatarios', 0.4); },
    consequencia: 'Portaria não distingue quem trabalha no prédio de quem só entrou. Funcionário demitido continua entrando por semanas.',
    tratamento: 'Cadastro centralizado por empresa, crachá emitido pelo condomínio e obrigação contratual de comunicar desligamento em 24 horas.',
    prazo: '30' },

  { id: 'S11', seg: 'comercial', titulo: 'Desocupação de sala sem conferência', cat: 'Acesso', p: 3, i: 4,
    quando: function (c) { return c.baixo('com_desocupacao', 0.4); },
    consequencia: 'Saída de equipamento durante desocupação é usada para retirar bem de terceiro, inclusive de sala vizinha, e para deixar débito de condomínio.',
    tratamento: 'Exigir autorização da administração, relação de itens e conferência da portaria antes de liberar o elevador de carga.',
    prazo: 'imediato' },

  { id: 'S12', seg: 'comercial', titulo: 'Acesso noturno sem controle efetivo', cat: 'Acesso', p: 4, i: 4,
    quando: function (c) { return c.baixo('com_noturno', 0.4); },
    consequencia: 'Prédio vazio com acesso livre concentra o furto de equipamento de informática, que é o alvo típico do segmento.',
    tratamento: 'Autorização prévia da empresa, registro de entrada e saída e ronda de conferência do andar após a saída.',
    prazo: 'imediato' },

  { id: 'S13', seg: 'comercial', titulo: 'Áreas técnicas abertas', cat: 'Acesso', p: 3, i: 4,
    quando: function (c) { return c.baixo('com_areas_tecnicas', 0.4); },
    consequencia: 'Quadro elétrico, CPD e casa de máquinas acessíveis permitem sabotagem que derruba a segurança do prédio inteiro.',
    tratamento: 'Trancar com chave controlada, instalar sensor de abertura e registrar todo acesso técnico.',
    prazo: '30' },

  /* -------- transportadora -------- */
  { id: 'S20', seg: 'transportadora', titulo: 'Carga sem lacre rastreável', cat: 'Operação', p: 4, i: 5,
    quando: function (c) { return c.baixo('tra_lacre', 0.4); },
    consequencia: 'Sem numeração conferida nas duas pontas, o desvio parcial de carga não é detectado e a seguradora nega o sinistro.',
    tratamento: 'Implantar lacre numerado com registro no documento de transporte e conferência obrigatória no destino.',
    prazo: 'imediato' },

  { id: 'S21', seg: 'transportadora', titulo: 'Motorista terceiro sem consulta prévia', cat: 'Governança', p: 4, i: 5,
    quando: function (c) { return c.baixo('tra_motorista_terceiro', 0.4); },
    consequencia: 'Motorista sem consulta é vetor direto de roubo com participação interna. Também invalida a apólice de transporte.',
    tratamento: 'Consulta obrigatória em gerenciadora de risco antes da liberação, com prazo de validade do cadastro.',
    prazo: 'imediato' },

  { id: 'S22', seg: 'transportadora', titulo: 'Pátio de pernoite desprotegido', cat: 'Perímetro', p: 4, i: 5,
    quando: function (c) { return c.baixo('tra_patio', 0.4); },
    consequencia: 'Veículo carregado parado é o alvo mais fácil da operação inteira, especialmente na madrugada de sexta.',
    tratamento: 'Pátio fechado com vigilância, CFTV e controle de saída. Enquanto não houver, proibir pernoite com carga.',
    prazo: 'investimento' },

  { id: 'S23', seg: 'transportadora', titulo: 'Sem protocolo para roubo de carga', cat: 'Emergências', p: 3, i: 5,
    quando: function (c) { return c.baixo('tra_protocolo_roubo', 0.4) || c.baixo('tra_gr', 0.4); },
    consequencia: 'Os primeiros 30 minutos definem a recuperação. Sem protocolo, perde-se tempo decidindo quem avisar.',
    tratamento: 'Escrever o protocolo com sequência de acionamento, treinar motoristas e testar o fluxo trimestralmente.',
    prazo: 'imediato' },

  { id: 'S24', seg: 'transportadora', titulo: 'Conferência de carga sem segregação de função', cat: 'Operação', p: 4, i: 4,
    quando: function (c) { return c.baixo('tra_dupla_conferencia', 0.4); },
    consequencia: 'Conferente sozinho consegue liberar carga divergente sem deixar rastro. É o desvio interno mais comum do setor.',
    tratamento: 'Dupla conferência efetiva com assinatura de duas pessoas e revezamento periódico da dupla.',
    prazo: '30' },

  /* -------- indústria -------- */
  { id: 'S30', seg: 'industria', titulo: 'Saída de sucata sem controle', cat: 'Operação', p: 5, i: 4,
    quando: function (c) { return c.baixo('ind_sucata', 0.4); },
    consequencia: 'Sucata é o canal clássico de desvio de material bom misturado ao descarte. A perda é contínua e raramente aparece no inventário.',
    tratamento: 'Pesagem obrigatória, documento com foto da carga e conferência por funcionário de área diferente da que gerou o resíduo.',
    prazo: 'imediato' },

  { id: 'S31', seg: 'industria', titulo: 'Almoxarifado e ferramentaria sem rastreio', cat: 'Acesso', p: 4, i: 4,
    quando: function (c) { return c.baixo('ind_almoxarifado', 0.4); },
    consequencia: 'Ferramenta e insumo saem sem requisição e a diferença só aparece no inventário anual, quando não há mais como apurar.',
    tratamento: 'Acesso restrito, requisição aprovada para toda retirada e inventário rotativo mensal dos itens de maior valor.',
    prazo: '30' },

  { id: 'S32', seg: 'industria', titulo: 'Parada de manutenção sem cadastro prévio', cat: 'Acesso', p: 4, i: 4,
    quando: function (c) { return c.baixo('ind_parada', 0.4); },
    consequencia: 'Dezenas de terceiros entram em poucos dias. Sem cadastro prévio, a portaria vira gargalo e passa a liberar sem conferir.',
    tratamento: 'Exigir lista nominal com antecedência, emitir crachá temporário por data e definir acompanhante responsável por equipe.',
    prazo: '30' },

  { id: 'S33', seg: 'industria', titulo: 'Produtos químicos em área não controlada', cat: 'Emergências', p: 3, i: 5,
    quando: function (c) { return c.baixo('ind_quimicos', 0.4); },
    consequencia: 'Risco de acidente ampliado e desvio de produto de uso controlado, com responsabilidade criminal envolvida.',
    tratamento: 'Área trancada com acesso restrito, inventário e integração com o plano de emergência da planta.',
    prazo: 'imediato' },

  { id: 'S34', seg: 'industria', titulo: 'Sem protocolo para paralisação no portão', cat: 'Emergências', p: 3, i: 4,
    quando: function (c) { return c.baixo('ind_paralisacao', 0.4); },
    consequencia: 'Manifestação no portão vira confronto quando o colaborador decide sozinho. Gera dano de imagem e ação judicial.',
    tratamento: 'Protocolo com conduta de não confronto, acionamento de jurídico e RH e registro em vídeo da movimentação.',
    prazo: '30' },

  /* -------- empresa e comércio -------- */
  { id: 'S40', seg: 'empresa', titulo: 'Exposição de numerário no caixa', cat: 'Operação', p: 4, i: 4,
    quando: function (c) { return c.baixo('emp_sangria', 0.4); },
    consequencia: 'Valor acumulado no caixa aumenta o prejuízo do assalto e o risco à integridade de quem atende.',
    tratamento: 'Sangria em horário aleatório, cofre de depósito sem abertura pelo operador e limite máximo definido em caixa.',
    prazo: 'imediato' },

  { id: 'S41', seg: 'empresa', titulo: 'Transporte de valores irregular', cat: 'Governança', p: 3, i: 5,
    quando: function (c) { return c.baixo('emp_transporte_valores', 0.4); },
    consequencia: 'Funcionário levando malote é prática ilegal e, em caso de assalto com lesão, a responsabilidade da empresa é direta e sem cobertura.',
    tratamento: 'Contratar transporte de valores autorizado pela PF ou reduzir o volume com meios eletrônicos de recebimento.',
    prazo: 'imediato' },

  { id: 'S42', seg: 'empresa', titulo: 'Abertura e fechamento sem protocolo', cat: 'Operação', p: 4, i: 5,
    quando: function (c) { return c.baixo('emp_abertura', 0.4); },
    consequencia: 'Abertura é o momento de maior vulnerabilidade do comércio, porque a pessoa chega sozinha em horário previsível.',
    tratamento: 'Protocolo com duas pessoas, sinal combinado de segurança e conferência externa antes de abrir a porta.',
    prazo: 'imediato' },

  { id: 'S43', seg: 'empresa', titulo: 'Equipe sem orientação para assalto', cat: 'Emergências', p: 3, i: 5,
    quando: function (c) { return c.baixo('emp_assalto', 0.4); },
    consequencia: 'Reação improvisada durante assalto é a principal causa de lesão e morte no varejo.',
    tratamento: 'Treinamento de conduta passiva, definição de quem aciona a polícia e apoio psicológico previsto para depois.',
    prazo: 'imediato' },

  { id: 'S44', seg: 'empresa', titulo: 'Infraestrutura de TI acessível', cat: 'Acesso', p: 3, i: 4,
    quando: function (c) { return c.baixo('emp_ti', 0.4); },
    consequencia: 'Acesso físico ao rack permite furto, sabotagem e captura de dados. A segurança lógica depende da segurança física.',
    tratamento: 'Sala trancada, acesso por lista nominal e registro de toda entrada técnica.',
    prazo: '30' }
];

window.avaliarRiscos = function (respostas, segmento) {
  var c = ctx(respostas, segmento);
  return window.REGRAS
    .filter(function (r) { return (!r.seg || r.seg === segmento) && r.quando(c); })
    .map(function (r) {
      var grau = r.p * r.i;
      return {
        id: r.id, titulo: r.titulo, cat: r.cat,
        probabilidade: NIVEL[r.p], impacto: IMPACTO[r.i],
        p: r.p, i: r.i, grau: grau,
        nivel: grau >= 20 ? 'Crítico' : grau >= 12 ? 'Alto' : grau >= 6 ? 'Médio' : 'Baixo',
        consequencia: r.consequencia, tratamento: r.tratamento, prazo: r.prazo
      };
    })
    .sort(function (a, b) { return b.grau - a.grau; });
};

/* ---------- Plano de ação ---------- */
window.PRAZOS = {
  imediato:     { nome: 'Imediato — até 15 dias', tipo: 'Disciplina operacional', nota: 'Não depende de compra. Depende de decidir e cobrar.' },
  '30':         { nome: 'Curto prazo — 30 dias', tipo: 'Disciplina operacional', nota: 'Exige organizar rotina e treinar a equipe.' },
  '90':         { nome: 'Médio prazo — 90 dias', tipo: 'Investimento leve', nota: 'Exige compra de baixo valor ou serviço pontual.' },
  investimento: { nome: 'Investimento — 6 a 12 meses', tipo: 'Obra ou aquisição', nota: 'Exige orçamento próprio e aprovação.' }
};

window.montarPlanoAcao = function (riscos) {
  var ordem = ['imediato', '30', '90', 'investimento'], grupos = [];
  ordem.forEach(function (p) {
    var itens = riscos.filter(function (r) { return r.prazo === p; });
    if (itens.length) grupos.push({ prazo: p, meta: window.PRAZOS[p], itens: itens });
  });
  return grupos;
};

window.resumoRiscos = function (riscos) {
  var r = { critico: 0, alto: 0, medio: 0, baixo: 0 };
  riscos.forEach(function (x) {
    if (x.nivel === 'Crítico') r.critico++;
    else if (x.nivel === 'Alto') r.alto++;
    else if (x.nivel === 'Médio') r.medio++;
    else r.baixo++;
  });
  return r;
};
