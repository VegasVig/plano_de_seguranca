/* ============================================================
   Vegas Vigilância e Segurança — Estrutura do levantamento
   Este arquivo pode ser editado direto no GitHub para incluir
   ou remover perguntas. Nada mais no sistema precisa mudar.
   ============================================================ */

/* Atalhos para escrever pergunta sem repetir estrutura.
   escala  -> opções com valor 0 a 1, entram no índice
   info    -> não pontua, só registra
   ------------------------------------------------------------ */
function esc(id, texto, dim, peso, opcoes, extra) {
  return Object.assign({ id: id, texto: texto, tipo: 'escala', dim: dim, peso: peso, opcoes: opcoes }, extra || {});
}
function sn(id, texto, dim, peso, extra) {
  return esc(id, texto, dim, peso, [['Não', 0], ['Parcialmente', 0.5], ['Sim', 1]], extra);
}
function info(id, texto, tipo, extra) {
  return Object.assign({ id: id, texto: texto, tipo: tipo || 'texto' }, extra || {});
}

window.DIMENSOES = {
  perimetro:    'Perímetro',
  acesso:       'Controle de acesso',
  tecnologia:   'Tecnologia',
  contingencia: 'Contingência',
  emergencias:  'Emergências',
  operacao:     'Operação',
  governanca:   'Governança'
};

window.SEGMENTOS = [
  { id: 'residencial',    nome: 'Condomínio residencial' },
  { id: 'comercial',      nome: 'Condomínio comercial' },
  { id: 'transportadora', nome: 'Transportadora / logística' },
  { id: 'industria',      nome: 'Indústria' },
  { id: 'empresa',        nome: 'Empresa, comércio e serviços' }
];

/* ============================================================
   1. NÚCLEO COMUM — vale para todos os segmentos
   ============================================================ */
window.SECOES = [

{ id: 'identificacao', titulo: 'Identificação do posto', icone: '1', perguntas: [
  info('cliente',    'Razão social ou nome do cliente'),
  info('local',      'Identificação do posto ou unidade'),
  info('endereco',   'Endereço completo'),
  info('cidade',     'Cidade'),
  info('contato',    'Responsável pelo contato no cliente'),
  info('telefone',   'Telefone do responsável'),
  info('supervisor', 'Supervisor Vegas responsável'),
  info('data',       'Data do levantamento', 'data'),
  info('modo',       'Finalidade deste levantamento', 'select',
    { opcoes: ['Pré-venda (prospecção)', 'Contrato ativo (revisão)', 'Licitação / memorial técnico'] }),
  info('area',       'Área aproximada do terreno em m²', 'numero'),
  info('populacao',  'Pessoas que circulam por dia (média)', 'numero'),
  info('funcionamento', 'Horário de funcionamento', 'select',
    { opcoes: ['Comercial', 'Estendido (até 22h)', '24 horas', 'Sazonal / eventos'] }),
  info('historico',  'Ocorrências relevantes nos últimos 24 meses', 'textarea',
    { dica: 'Furto, roubo, invasão, vandalismo, ameaça, acidente. Descreva data e o que aconteceu.' })
]},

{ id: 'perimetro', titulo: 'Perímetro e barreiras físicas', icone: '2', perguntas: [
  esc('per_muro', 'Situação do muro ou cerca no perímetro', 'perimetro', 3, [
    ['Inexistente ou com vãos abertos', 0],
    ['Baixo (menos de 2 m) ou danificado em trechos', 0.3],
    ['Íntegro, altura adequada, sem proteção no topo', 0.7],
    ['Íntegro com concertina, cerca elétrica ou lança', 1]
  ]),
  sn('per_eletrica', 'A cerca elétrica tem manutenção e teste registrados', 'perimetro', 2,
    { dica: 'Vale só se houver cerca elétrica. Marque "Não" se existe mas ninguém testa.' }),
  esc('per_vegetacao', 'Vegetação, entulho ou materiais encostados no muro', 'perimetro', 2, [
    ['Muita coisa encostada, facilita escalada', 0],
    ['Alguns pontos', 0.5],
    ['Perímetro limpo e desobstruído', 1]
  ]),
  esc('per_apoio', 'Existem pontos de apoio externos que permitem escalada', 'perimetro', 2, [
    ['Sim, vários (poste, contêiner, árvore, veículo estacionado)', 0],
    ['Um ou dois pontos', 0.4],
    ['Nenhum', 1]
  ]),
  sn('per_estacionamento', 'O estacionamento é protegido e controlado', 'perimetro', 2),
  esc('per_fundos', 'Área dos fundos e laterais', 'perimetro', 3, [
    ['Abandonada, escura, sem ronda nem câmera', 0],
    ['Coberta só por ronda eventual', 0.4],
    ['Coberta por câmera ou ronda programada', 0.8],
    ['Câmera com gravação e ronda registrada', 1]
  ]),
  sn('per_sinalizacao', 'Há sinalização de área monitorada e proibição de entrada', 'perimetro', 1)
]},

{ id: 'iluminacao', titulo: 'Iluminação e infraestrutura', icone: '3', perguntas: [
  esc('ilu_perimetral', 'Iluminação do perímetro à noite', 'perimetro', 3, [
    ['Ausente ou com grandes áreas escuras', 0],
    ['Parcial, com pontos de sombra', 0.4],
    ['Cobre todo o perímetro', 0.8],
    ['Cobre tudo, com sensor de presença ou acionamento automático', 1]
  ]),
  sn('ilu_manutencao', 'Existe rotina de troca de lâmpadas queimadas', 'perimetro', 2),
  sn('ilu_emergencia', 'Há iluminação de emergência nas rotas de saída', 'emergencias', 2),
  esc('ilu_guarita', 'Condição da guarita ou posto de trabalho', 'operacao', 2, [
    ['Não existe posto abrigado', 0],
    ['Existe, mas insalubre ou sem visibilidade', 0.3],
    ['Adequado, com visibilidade e ventilação', 0.8],
    ['Adequado, blindado ou com vidro de segurança', 1]
  ]),
  sn('ilu_sanitario', 'O vigilante tem sanitário e local para refeição no posto', 'operacao', 2,
    { dica: 'Falta disso é autuação do MTE e reclamatória quase certa.' })
]},

{ id: 'acesso', titulo: 'Controle de acesso', icone: '4', perguntas: [
  esc('ace_pedestre', 'Controle de entrada de pedestres', 'acesso', 3, [
    ['Portão aberto ou liberado sem conferência', 0],
    ['Vigilante abre sem registrar', 0.3],
    ['Registro em livro ou ficha de papel', 0.6],
    ['Sistema informatizado com documento e foto', 1]
  ]),
  esc('ace_veiculo', 'Controle de entrada de veículos', 'acesso', 3, [
    ['Sem controle', 0],
    ['Conferência visual apenas', 0.3],
    ['Registro de placa em papel', 0.6],
    ['Registro informatizado de placa, motorista e destino', 1]
  ]),
  sn('ace_eclusa', 'Existe eclusa, clausura ou duplo portão que impede entrada direta', 'acesso', 2),
  esc('ace_visitante', 'Identificação de visitante dentro da área', 'acesso', 2, [
    ['Não recebe identificação', 0],
    ['Recebe crachá sem controle de devolução', 0.5],
    ['Crachá numerado com controle de devolução', 1]
  ]),
  sn('ace_autorizacao', 'Visitante só entra após autorização do anfitrião', 'acesso', 2),
  esc('ace_prestador', 'Controle de prestadores de serviço e entregas', 'acesso', 3, [
    ['Entram livremente', 0],
    ['Anotação simples de nome', 0.4],
    ['Cadastro com documento e empresa', 0.7],
    ['Cadastro, verificação de ordem de serviço e acompanhamento', 1]
  ]),
  esc('ace_funcionario', 'Identificação de funcionários do cliente', 'acesso', 2, [
    ['Sem identificação, vigilante reconhece de vista', 0],
    ['Crachá sem leitura eletrônica', 0.5],
    ['Crachá com leitura, biometria ou facial', 1]
  ]),
  sn('ace_bloqueio', 'Desligamento de funcionário gera bloqueio imediato de acesso', 'acesso', 2),
  sn('ace_saida_material', 'Saída de material exige autorização formal e conferência', 'acesso', 3),
  sn('ace_chaves', 'Há controle formal de chaves e cópias', 'acesso', 2)
]},

{ id: 'tecnologia', titulo: 'Tecnologia de segurança', icone: '5', perguntas: [
  esc('tec_cftv', 'Sistema de CFTV', 'tecnologia', 3, [
    ['Não existe', 0],
    ['Existe, mas com câmeras quebradas ou sem gravar', 0.2],
    ['Funciona, cobertura parcial', 0.6],
    ['Funciona, cobre acessos e perímetro', 1]
  ]),
  esc('tec_gravacao', 'Prazo de retenção das imagens', 'tecnologia', 2, [
    ['Não grava', 0], ['Menos de 7 dias', 0.3], ['De 7 a 29 dias', 0.7], ['30 dias ou mais', 1]
  ]),
  sn('tec_noturna', 'As câmeras produzem imagem útil à noite', 'tecnologia', 2,
    { dica: 'Imagem que não identifica rosto ou placa à noite não serve como prova.' }),
  sn('tec_remoto', 'As imagens podem ser vistas remotamente pela supervisão', 'tecnologia', 2),
  sn('tec_backup_energia', 'CFTV e alarme têm nobreak ou bateria', 'contingencia', 3),
  esc('tec_alarme', 'Sistema de alarme de intrusão', 'tecnologia', 2, [
    ['Não existe', 0], ['Existe mas está desativado', 0.2],
    ['Ativo, sem monitoramento externo', 0.6], ['Ativo e monitorado 24h', 1]
  ]),
  sn('tec_panico', 'Existe botão de pânico acessível ao vigilante', 'emergencias', 3),
  sn('tec_incendio', 'Há detecção ou alarme de incêndio', 'emergencias', 2),
  sn('tec_lgpd_cftv', 'Há aviso de monitoramento e política de acesso às imagens', 'governanca', 2,
    { dica: 'LGPD: imagem de pessoa identificável é dado pessoal.' })
]},

{ id: 'efetivo', titulo: 'Efetivo e escala', icone: '6', perguntas: [
  info('efe_qtd',    'Quantidade de vigilantes por turno', 'numero'),
  info('efe_escala', 'Escala praticada', 'select',
    { opcoes: ['12x36 diurno', '12x36 noturno', '12x36 diurno e noturno', '44h semanais', '5x1', 'Outra'] }),
  esc('efe_dimensionamento', 'O efetivo é suficiente para o tamanho da área', 'operacao', 3, [
    ['Claramente insuficiente, posto descoberto em momentos do dia', 0],
    ['No limite, sem folga para imprevisto', 0.4],
    ['Adequado', 0.8],
    ['Adequado com cobertura de folga e férias planejada', 1]
  ]),
  sn('efe_ronda', 'Existe ronda programada com percurso definido', 'operacao', 3),
  esc('efe_ronda_registro', 'Registro das rondas', 'operacao', 2, [
    ['Não registra', 0], ['Anotação manual no livro', 0.5],
    ['Bastão eletrônico ou aplicativo com horário', 1]
  ]),
  sn('efe_revezamento', 'Há cobertura formal para intervalo, falta e férias', 'operacao', 2),
  sn('efe_reciclagem', 'Todo o efetivo está com reciclagem em dia (CNV válida)', 'governanca', 3,
    { dica: 'Portaria 3.233/2012 da PF. Vigilante com reciclagem vencida não pode estar no posto.' }),
  sn('efe_uniforme', 'Uniforme e EPI adequados e em bom estado', 'operacao', 2),
  sn('efe_armado', 'O posto exige vigilante armado e isso está atendido', 'operacao', 2),
  sn('efe_treinamento_local', 'O vigilante recebeu treinamento específico deste posto', 'operacao', 3)
]},

{ id: 'procedimentos', titulo: 'Procedimentos e registros', icone: '7', perguntas: [
  esc('pro_os', 'Ordem de Serviço escrita do posto', 'operacao', 3, [
    ['Não existe', 0], ['Existe verbalmente', 0.2],
    ['Existe escrita, desatualizada', 0.6], ['Existe escrita, atual e assinada pelo vigilante', 1]
  ]),
  sn('pro_pop', 'Existem procedimentos escritos para as situações de rotina', 'operacao', 3),
  esc('pro_livro', 'Registro de ocorrências', 'operacao', 3, [
    ['Não existe', 0], ['Livro existe mas raramente é preenchido', 0.3],
    ['Livro preenchido a cada turno', 0.7], ['Registro digital com envio à supervisão', 1]
  ]),
  sn('pro_passagem', 'A passagem de turno é formal e registrada', 'operacao', 2),
  sn('pro_supervisao', 'A supervisão visita o posto com periodicidade definida', 'governanca', 3),
  sn('pro_supervisao_registro', 'As visitas de supervisão geram relatório escrito', 'governanca', 2),
  sn('pro_checklist', 'Existe checklist diário de verificação dos equipamentos', 'operacao', 2),
  sn('pro_fiscalizacao_cliente', 'O cliente acompanha ou audita a execução do serviço', 'governanca', 2)
]},

{ id: 'emergencias', titulo: 'Emergências', icone: '8', perguntas: [
  sn('eme_plano', 'Existe plano de emergência escrito e conhecido pela equipe', 'emergencias', 3),
  sn('eme_avcb', 'O imóvel tem AVCB ou CLCB válido', 'emergencias', 3,
    { dica: 'Auto de Vistoria do Corpo de Bombeiros. Verifique a data de validade.' }),
  esc('eme_extintores', 'Extintores e hidrantes', 'emergencias', 2, [
    ['Ausentes ou vencidos', 0], ['Presentes, alguns vencidos ou obstruídos', 0.4],
    ['Presentes, válidos e sinalizados', 0.8], ['Válidos, sinalizados e com inspeção registrada', 1]
  ]),
  sn('eme_rota', 'Rotas de fuga sinalizadas e desobstruídas', 'emergencias', 2),
  sn('eme_brigada', 'Existe brigada de incêndio treinada', 'emergencias', 2),
  sn('eme_simulado', 'Foi feito simulado de abandono nos últimos 12 meses', 'emergencias', 2),
  sn('eme_primeiros_socorros', 'Há kit de primeiros socorros e alguém treinado', 'emergencias', 2),
  esc('eme_contatos', 'Lista de contatos de emergência no posto', 'emergencias', 2, [
    ['Não existe', 0], ['Existe, desatualizada', 0.4], ['Existe, atual e afixada no posto', 1]
  ]),
  sn('eme_acionamento', 'O vigilante sabe exatamente quem acionar e em que ordem', 'emergencias', 3)
]},

{ id: 'contingencia', titulo: 'Contingência e continuidade', icone: '9', perguntas: [
  sn('con_energia', 'Existe procedimento escrito para falta de energia', 'contingencia', 3),
  sn('con_gerador', 'Há gerador ou nobreak para os sistemas críticos', 'contingencia', 2),
  sn('con_portao_manual', 'Os portões podem ser abertos manualmente com energia cortada', 'contingencia', 2),
  esc('con_comunicacao', 'Meio de comunicação do vigilante com a central', 'contingencia', 3, [
    ['Só celular pessoal do vigilante', 0], ['Celular corporativo', 0.5],
    ['Rádio ou celular corporativo com redundância', 1]
  ]),
  sn('con_falha_sistema', 'Existe plano para queda do sistema de acesso ou do CFTV', 'contingencia', 2),
  sn('con_apoio_tatico', 'Há apoio tático ou pronta resposta contratada', 'contingencia', 2),
  sn('con_reserva_efetivo', 'Existe vigilante reserva acionável em até 2 horas', 'contingencia', 3)
]},

{ id: 'governanca', titulo: 'Governança e compliance', icone: '10', perguntas: [
  sn('gov_contrato', 'O contrato descreve escopo, efetivo e escala com clareza', 'governanca', 2),
  sn('gov_pf', 'O cliente verificou a autorização de funcionamento da PF da contratada', 'governanca', 3,
    { dica: 'Lei 7.102/1983 e Portaria 3.233/2012. Contratar empresa sem autorização é risco solidário do tomador.' }),
  sn('gov_dossie', 'O cliente recebe mensalmente o dossiê de documentos trabalhistas', 'governanca', 3),
  sn('gov_conferencia', 'Alguém do cliente confere FGTS e INSS do efetivo alocado', 'governanca', 3,
    { dica: 'Súmula 331 do TST: o tomador responde subsidiariamente se falhar na fiscalização.' }),
  sn('gov_lgpd', 'Há tratamento adequado dos dados pessoais coletados na portaria', 'governanca', 2),
  sn('gov_indicadores', 'Existem indicadores acordados de qualidade do serviço', 'governanca', 2),
  sn('gov_reuniao', 'Há reunião periódica de acompanhamento com o cliente', 'governanca', 2),
  sn('gov_seguro', 'O cliente tem seguro patrimonial compatível com o risco', 'governanca', 1),
  info('gov_obs', 'Observações gerais do supervisor', 'textarea')
]},

{ id: 'fotos', titulo: 'Registro fotográfico', icone: '11', perguntas: [
  info('fotos', 'Fotos do levantamento', 'fotos',
    { dica: 'Fotografe perímetro, acessos, guarita, pontos frágeis e qualquer irregularidade. Cada foto pede uma legenda.' })
]}

];

/* ============================================================
   2. BLOCOS POR SEGMENTO
   Abrem automaticamente conforme a escolha na primeira tela.
   ============================================================ */
window.BLOCOS = {

residencial: { id: 'bloco_residencial', titulo: 'Específico do condomínio residencial', icone: 'S', perguntas: [
  esc('res_carona', 'Carona no acesso de pedestres (entrar junto com morador)', 'acesso', 3, [
    ['Acontece direto, ninguém barra', 0],
    ['Acontece às vezes', 0.4],
    ['O vigilante barra, sem apoio físico', 0.7],
    ['Existe catraca, eclusa ou porta com fecho que impede', 1]
  ]),
  esc('res_garagem', 'Risco de clonagem do controle de garagem', 'acesso', 3, [
    ['Controle fixo antigo, sem código rotativo', 0],
    ['Controle rotativo, sem cadastro de quem tem', 0.5],
    ['Rotativo com cadastro e bloqueio de perdidos', 1]
  ]),
  sn('res_garagem_tempo', 'O portão da garagem fecha antes do próximo veículo entrar', 'acesso', 2),
  esc('res_prestador_morador', 'Prestador contratado diretamente por morador', 'acesso', 3, [
    ['Sobe sem cadastro nem autorização', 0],
    ['Autorização por interfone, sem registro', 0.4],
    ['Cadastro com documento e autorização registrada', 1]
  ]),
  sn('res_mudanca', 'Existe procedimento de mudança com agendamento e autorização do síndico', 'operacao', 2),
  sn('res_entrega', 'Entregas e aplicativos param na portaria, sem subir', 'acesso', 2),
  esc('res_areas_comuns', 'Controle das áreas comuns (salão, piscina, academia)', 'acesso', 2, [
    ['Sem controle nem reserva', 0], ['Reserva informal', 0.5], ['Reserva registrada com responsável identificado', 1]
  ]),
  sn('res_chaves_unidade', 'Chaves de unidades guardadas na portaria têm controle de retirada', 'acesso', 2),
  sn('res_regimento', 'O regimento interno trata de segurança e é aplicado', 'governanca', 2),
  sn('res_visitante_recorrente', 'Visitante recorrente tem cadastro validado pelo morador', 'acesso', 1),
  sn('res_crianca', 'Há regra para saída de criança ou adolescente desacompanhado', 'operacao', 2),
  sn('res_obra', 'Obras em unidades exigem comunicação prévia e cadastro da equipe', 'acesso', 1)
]},

comercial: { id: 'bloco_comercial', titulo: 'Específico do condomínio comercial', icone: 'S', perguntas: [
  esc('com_locatarios', 'Cadastro das empresas locatárias', 'governanca', 3, [
    ['Não existe cadastro atualizado', 0], ['Existe, desatualizado', 0.4],
    ['Atualizado com responsável e contato de emergência', 1]
  ]),
  esc('com_credencial', 'Credenciamento dos funcionários das empresas', 'acesso', 3, [
    ['Nenhum, entram livremente', 0], ['Lista informal na portaria', 0.4],
    ['Crachá emitido pelo condomínio', 0.8], ['Crachá com acesso eletrônico e baixa no desligamento', 1]
  ]),
  sn('com_desocupacao', 'Saída de equipamento em desocupação exige autorização e conferência', 'acesso', 3),
  sn('com_obras', 'Obras e reformas em salas têm cadastro de equipe e horário definido', 'acesso', 2),
  esc('com_noturno', 'Acesso fora do horário comercial', 'acesso', 3, [
    ['Livre para qualquer pessoa com chave', 0],
    ['Registrado em livro', 0.5],
    ['Autorização prévia da empresa + registro + ronda de conferência', 1]
  ]),
  sn('com_escadas', 'Escadas de emergência têm porta com alarme ou fecho antipânico monitorado', 'emergencias', 2),
  sn('com_elevador', 'Elevadores têm bloqueio por andar ou identificação para visitante', 'acesso', 2),
  sn('com_estacionamento_rotativo', 'O estacionamento distingue vaga fixa de visitante', 'perimetro', 2),
  sn('com_limpeza', 'Equipes de limpeza e manutenção são cadastradas e identificadas', 'acesso', 2),
  sn('com_areas_tecnicas', 'Casa de máquinas, CPD e quadros elétricos ficam trancados', 'acesso', 2),
  sn('com_correspondencia', 'Existe protocolo de recebimento e entrega de correspondência', 'operacao', 1),
  sn('com_brigada_predial', 'Há brigada com representantes de cada empresa do prédio', 'emergencias', 2)
]},

transportadora: { id: 'bloco_transportadora', titulo: 'Específico de transportadora e logística', icone: 'S', perguntas: [
  esc('tra_lacre', 'Uso de lacre numerado nas cargas', 'operacao', 3, [
    ['Não usa lacre', 0], ['Usa lacre sem controle de numeração', 0.4],
    ['Lacre numerado registrado no documento de transporte', 0.8],
    ['Lacre numerado com conferência na saída e na chegada', 1]
  ]),
  sn('tra_checklist_saida', 'Existe checklist de saída de veículo (documentos, lacre, motorista)', 'operacao', 3),
  esc('tra_dupla_conferencia', 'Conferência de carga no carregamento', 'operacao', 3, [
    ['Uma pessoa confere sozinha', 0], ['Confere e um segundo assina sem conferir', 0.4],
    ['Dupla conferência efetiva com assinatura', 1]
  ]),
  esc('tra_motorista_terceiro', 'Consulta cadastral de motorista agregado ou terceiro', 'governanca', 3, [
    ['Não consulta', 0], ['Consulta informal', 0.4],
    ['Consulta em gerenciadora de risco antes de liberar', 1]
  ]),
  sn('tra_gr', 'Há gerenciadora de risco contratada com plano de viagem', 'contingencia', 3),
  sn('tra_rastreador', 'Os veículos têm rastreamento monitorado em tempo real', 'tecnologia', 3),
  sn('tra_isca', 'Cargas de alto valor usam isca ou tecnologia de bloqueio', 'tecnologia', 2),
  esc('tra_patio', 'Pátio de pernoite', 'perimetro', 3, [
    ['Veículo pernoita na rua', 0], ['Pátio sem vigilância', 0.3],
    ['Pátio fechado com vigilância', 0.8], ['Pátio fechado, vigilância, CFTV e controle de saída', 1]
  ]),
  sn('tra_protocolo_roubo', 'Existe protocolo escrito para roubo de carga', 'emergencias', 3),
  sn('tra_doca', 'As docas impedem acesso de pessoa não autorizada durante o carregamento', 'acesso', 2),
  sn('tra_camera_doca', 'Há CFTV cobrindo docas e área de carregamento', 'tecnologia', 3),
  sn('tra_pesagem', 'Existe pesagem ou conferência de volume na entrada e saída', 'operacao', 2),
  sn('tra_jornada', 'A jornada do motorista é controlada conforme a Lei 13.103', 'governanca', 2),
  sn('tra_produto_perigoso', 'Se transporta produto perigoso, há sinalização e plano de atendimento', 'emergencias', 2)
]},

industria: { id: 'bloco_industria', titulo: 'Específico de indústria', icone: 'S', perguntas: [
  esc('ind_sucata', 'Controle de sucata e resíduos', 'operacao', 3, [
    ['Sai sem pesagem nem documento', 0], ['Documento sem pesagem', 0.4],
    ['Pesagem e documento', 0.8], ['Pesagem, documento, foto da carga e conferência por segundo funcionário', 1]
  ]),
  esc('ind_almoxarifado', 'Controle do almoxarifado e da ferramentaria', 'acesso', 3, [
    ['Acesso livre', 0], ['Trancado, retirada sem registro', 0.4],
    ['Retirada registrada', 0.8], ['Registro com requisição aprovada e inventário periódico', 1]
  ]),
  sn('ind_expedicao_lacre', 'A expedição usa lacre numerado com registro', 'operacao', 3),
  esc('ind_parada', 'Parada de manutenção com equipe externa', 'acesso', 3, [
    ['Entram sem cadastro prévio', 0], ['Cadastro no dia', 0.4],
    ['Cadastro prévio, crachá temporário e acompanhamento', 1]
  ]),
  sn('ind_quimicos', 'Produtos químicos e inflamáveis ficam em área controlada e trancada', 'emergencias', 3),
  sn('ind_conferencia_volumes', 'Conferência de volumes na entrada e na saída de material', 'operacao', 2),
  sn('ind_paralisacao', 'Existe protocolo para manifestação ou paralisação no portão', 'emergencias', 3),
  sn('ind_turno_madrugada', 'O turno da madrugada tem cobertura de vigilância equivalente', 'operacao', 2),
  sn('ind_epi_area', 'O vigilante que entra na área fabril usa EPI adequado', 'operacao', 2),
  sn('ind_bolsa', 'Há revista de bolsa ou mochila, com política formal e sem constrangimento', 'acesso', 2,
    { dica: 'Revista íntima é ilegal. Revista de volume precisa de política escrita e critério impessoal.' }),
  sn('ind_ferramenta_particular', 'Existe registro de ferramenta particular que entra e sai', 'acesso', 1),
  sn('ind_cipa', 'A CIPA e o SESMT participam das análises de risco de segurança patrimonial', 'governanca', 1)
]},

empresa: { id: 'bloco_empresa', titulo: 'Específico de empresa, comércio e serviços', icone: 'S', perguntas: [
  esc('emp_sangria', 'Sangria de caixa e guarda de valores', 'operacao', 3, [
    ['Dinheiro fica no caixa o dia todo', 0],
    ['Sangria sem horário definido', 0.4],
    ['Sangria em horário aleatório com cofre de depósito', 0.8],
    ['Sangria aleatória, cofre boca de lobo e transporte por empresa autorizada', 1]
  ]),
  sn('emp_transporte_valores', 'O transporte de valores é feito por empresa autorizada pela PF', 'governanca', 3,
    { dica: 'Funcionário levando malote ao banco é ilegal e gera responsabilidade direta.' }),
  esc('emp_abertura', 'Rotina de abertura e fechamento', 'operacao', 3, [
    ['Uma pessoa sozinha, sem protocolo', 0],
    ['Duas pessoas, sem protocolo escrito', 0.5],
    ['Protocolo escrito com sinal de segurança e conferência externa antes de entrar', 1]
  ]),
  sn('emp_ti', 'A sala de TI ou o rack de rede fica trancado e com acesso controlado', 'acesso', 3),
  sn('emp_desligamento', 'O desligamento de funcionário bloqueia crachá, sistema e chaves no mesmo dia', 'acesso', 3),
  sn('emp_assalto', 'A equipe foi orientada sobre conduta em caso de assalto', 'emergencias', 3),
  sn('emp_pos_incidente', 'Existe apoio à vítima e registro formal após incidente', 'emergencias', 2),
  sn('emp_atendimento', 'A recepção identifica e anuncia visitantes antes de liberar', 'acesso', 2),
  sn('emp_estoque', 'O estoque tem acesso restrito e inventário periódico', 'acesso', 2),
  sn('emp_documentos', 'Documentos sensíveis ficam guardados e não expostos', 'governanca', 1),
  sn('emp_horario_extra', 'Trabalho fora do horário exige autorização e comunicação à segurança', 'acesso', 2),
  sn('emp_publico', 'Se atende público, há orientação para lidar com pessoa alterada ou agressiva', 'emergencias', 2)
]}

};

/* Monta a lista final de seções conforme o segmento escolhido.
   O bloco entra antes do registro fotográfico. */
window.montarSecoes = function (segmento) {
  var base = window.SECOES.slice();
  var bloco = window.BLOCOS[segmento];
  if (!bloco) return base;
  var iFotos = base.findIndex(function (s) { return s.id === 'fotos'; });
  base.splice(iFotos, 0, bloco);
  return base;
};

window.todasPerguntas = function (segmento) {
  var out = [];
  window.montarSecoes(segmento).forEach(function (s) {
    s.perguntas.forEach(function (p) { out.push(Object.assign({ secao: s.id, secaoTitulo: s.titulo }, p)); });
  });
  return out;
};
