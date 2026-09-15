/* ============================================================
   Vegas — Procedimentos Operacionais Padrão
   Cada POP só entra no documento quando faz sentido para o
   local levantado. A função "quando" decide.
   ============================================================ */

function _v(respostas, id, mapa) {
  var p = mapa[id], r = respostas[id];
  if (!p || p.tipo !== 'escala' || r == null || r === '') return null;
  var op = p.opcoes.find(function (o) { return o[0] === r; });
  return op ? op[1] : null;
}

window.POPS = [

{ id: 'POP-01', nome: 'Controle de acesso de pedestres', sempre: true,
  objetivo: 'Garantir que nenhuma pessoa entre na área sem ser identificada e autorizada.',
  passos: [
    'Receber a pessoa no ponto de controle, sem abrir o acesso antes da identificação.',
    'Solicitar documento com foto e perguntar o destino e o nome de quem vai receber.',
    'Confirmar a autorização com o anfitrião por telefone, interfone ou aplicativo.',
    'Registrar nome, documento, destino, horário de entrada e placa se houver veículo.',
    'Entregar crachá de visitante numerado e orientar a devolução na saída.',
    'Liberar o acesso somente após a autorização confirmada.',
    'Na saída, recolher o crachá e registrar o horário.'
  ],
  atencao: 'Não existe exceção por pressa, por autoridade ou por conhecimento pessoal. Se a pessoa se recusa a identificar, acione a supervisão em vez de discutir.' },

{ id: 'POP-02', nome: 'Controle de acesso de veículos', sempre: true,
  objetivo: 'Registrar todo veículo que entra e impedir que a saída leve o que não deveria.',
  passos: [
    'Parar o veículo antes do portão, com o portão ainda fechado.',
    'Identificar motorista e passageiros e registrar a placa.',
    'Confirmar o destino e a autorização.',
    'Inspecionar visualmente o compartimento de carga na entrada.',
    'Abrir o portão, aguardar a passagem completa e fechar antes de atender o próximo.',
    'Na saída, conferir a placa com o registro de entrada e verificar autorização para qualquer material transportado.'
  ],
  atencao: 'Um veículo por vez. O portão nunca fica aberto aguardando o próximo.' },

{ id: 'POP-03', nome: 'Acesso de prestadores de serviço', sempre: true,
  objetivo: 'Evitar que uniforme e discurso técnico sirvam de passaporte para a área interna.',
  passos: [
    'Exigir documento com foto, identificação da empresa e ordem de serviço.',
    'Confirmar o chamado com o setor que contratou o serviço, antes de liberar.',
    'Registrar nome, empresa, serviço, local e horário.',
    'Emitir crachá de prestador com validade do dia.',
    'Registrar as ferramentas e os equipamentos que entram, para conferência na saída.',
    'Acompanhar ou monitorar o deslocamento até o local do serviço.',
    'Na saída, conferir ferramentas e material e recolher o crachá.'
  ],
  atencao: 'Serviço não agendado exige confirmação com a administração. Concessionária de energia, água ou telefonia também passa pela confirmação.' },

{ id: 'POP-04', nome: 'Ronda e verificação periódica', sempre: true,
  objetivo: 'Verificar fisicamente os pontos de risco em horários que não sejam previsíveis.',
  passos: [
    'Consultar o percurso definido na Ordem de Serviço do posto.',
    'Informar a central o início da ronda.',
    'Percorrer todos os pontos obrigatórios, variando o horário e o sentido.',
    'Verificar portões, janelas, iluminação, câmeras, extintores e sinais de tentativa de acesso.',
    'Registrar a passagem em cada ponto de controle.',
    'Comunicar imediatamente qualquer anormalidade.',
    'Registrar a ronda no livro ao retornar, com horário e ocorrências.'
  ],
  atencao: 'Ronda em horário fixo ensina o intervalo seguro para quem observa. Varie sempre.' },

{ id: 'POP-05', nome: 'Registro de ocorrências', sempre: true,
  objetivo: 'Produzir o histórico que sustenta apuração, contrato e defesa judicial.',
  passos: [
    'Registrar toda anormalidade no momento em que acontece, sem deixar para o fim do turno.',
    'Descrever data, hora, local, pessoas envolvidas e o que foi feito.',
    'Usar linguagem objetiva e descritiva, sem opinião e sem julgamento.',
    'Fotografar quando houver dano, avaria ou material apreendido.',
    'Comunicar a supervisão nos casos graves, antes de terminar o registro.',
    'Enviar o registro à supervisão ao fim do turno.'
  ],
  atencao: 'Rasura invalida o registro. Erro se corrige com nova linha, não apagando a anterior.' },

{ id: 'POP-06', nome: 'Passagem de turno', sempre: true,
  objetivo: 'Impedir que informação pendente se perca na troca de vigilante.',
  passos: [
    'Chegar com antecedência mínima de 10 minutos.',
    'Ler o registro de ocorrências do turno anterior por inteiro.',
    'Conferir em conjunto: chaves, rádio, lanterna, livro, equipamentos e estado dos acessos.',
    'Receber verbalmente as pendências, inclusive visitantes e prestadores ainda na área.',
    'Verificar o funcionamento de câmeras, alarme e portões.',
    'Assinar a passagem os dois vigilantes.',
    'Comunicar qualquer divergência à supervisão antes de assumir.'
  ],
  atencao: 'Nenhum posto fica sem vigilante durante a passagem. A saída do anterior só acontece depois da assinatura.' },

{ id: 'POP-07', nome: 'Falta de energia elétrica', sempre: true,
  objetivo: 'Manter o controle do acesso quando os sistemas eletrônicos param.',
  passos: [
    'Confirmar se a falta é geral na região ou restrita ao imóvel.',
    'Acionar a iluminação de emergência e a lanterna.',
    'Verificar se o nobreak assumiu CFTV, alarme e central.',
    'Passar imediatamente para o controle manual de acesso, com registro em papel.',
    'Destravar os portões para operação manual conforme o treinamento.',
    'Intensificar a ronda no perímetro, com atenção aos pontos que ficaram sem câmera.',
    'Comunicar a central e o responsável do cliente.',
    'Registrar horário de início, ações tomadas e horário de normalização.'
  ],
  atencao: 'Falta de energia pode ser provocada como preparação para invasão. Trate sempre como alerta, nunca como rotina.' },

{ id: 'POP-08', nome: 'Emergência médica', sempre: true,
  objetivo: 'Reduzir o tempo entre o evento e o atendimento qualificado.',
  passos: [
    'Isolar o local e afastar curiosos.',
    'Acionar o SAMU pelo 192 informando endereço completo, ponto de referência e estado da vítima.',
    'Não movimentar a vítima em caso de queda, trauma ou suspeita de fratura.',
    'Prestar primeiros socorros apenas dentro do que foi treinado.',
    'Designar alguém para aguardar e orientar a ambulância na entrada.',
    'Liberar o acesso e o caminho para a equipe de socorro.',
    'Comunicar a supervisão e o responsável do cliente.',
    'Registrar tudo no livro, incluindo horários de acionamento e de chegada.'
  ],
  atencao: 'Na dúvida sobre o estado da vítima, acione. O erro de acionar sem necessidade não se compara ao de não acionar.' },

{ id: 'POP-09', nome: 'Princípio de incêndio', sempre: true,
  objetivo: 'Agir nos primeiros minutos e garantir a saída das pessoas.',
  passos: [
    'Acionar o alarme e comunicar o Corpo de Bombeiros pelo 193.',
    'Avaliar se o foco é combatível com extintor, sem assumir risco pessoal.',
    'Usar o extintor adequado, sempre com rota de fuga às costas.',
    'Se o fogo não for controlado em curto tempo, abandonar o combate e iniciar a evacuação.',
    'Orientar a saída pelas rotas sinalizadas, sem uso de elevador.',
    'Conduzir as pessoas ao ponto de encontro e conferir a presença.',
    'Desligar a energia do setor quando for seguro fazê-lo.',
    'Receber e orientar os bombeiros, informando o que já foi feito.'
  ],
  atencao: 'Vida antes de patrimônio, sem exceção.' },

{ id: 'POP-10', nome: 'Tentativa de invasão', sempre: true,
  objetivo: 'Proteger a integridade do vigilante e preservar o registro do evento.',
  passos: [
    'Não expor a própria posição e não enfrentar.',
    'Acionar o botão de pânico ou a central, com a discrição possível.',
    'Ligar para a Polícia Militar pelo 190, informando endereço, número de invasores e se há arma.',
    'Direcionar as câmeras para o ponto de entrada, se o sistema permitir.',
    'Orientar as pessoas presentes a se abrigarem em local seguro.',
    'Não perseguir e não tentar recuperar material.',
    'Preservar o local até a chegada da polícia.',
    'Registrar tudo e comunicar imediatamente a supervisão.'
  ],
  atencao: 'A função é registrar, alertar e acionar. Confronto não faz parte do procedimento.' },

{ id: 'POP-11', nome: 'Conduta em assalto', sempre: true,
  objetivo: 'Preservar vidas e produzir informação útil depois do fato.',
  passos: [
    'Não reagir e não fazer movimento brusco.',
    'Obedecer às determinações sem discutir.',
    'Manter as mãos visíveis e evitar contato visual prolongado.',
    'Observar características: número de pessoas, altura, sotaque, tatuagem, roupa, veículo e placa.',
    'Acionar o alarme silencioso apenas se for absolutamente seguro.',
    'Após a saída dos criminosos, trancar o acesso e acionar o 190.',
    'Não tocar em nada e preservar o local.',
    'Registrar as características enquanto a memória está fresca, antes de conversar com outras pessoas.'
  ],
  atencao: 'Nada do que está no local vale a vida de quem trabalha nele.' },

{ id: 'POP-12', nome: 'Controle de chaves', sempre: true,
  objetivo: 'Garantir que toda chave tenha responsável identificado a qualquer momento.',
  passos: [
    'Manter as chaves em armário fechado, numeradas e identificadas por código, não pelo nome do ambiente.',
    'Registrar cada retirada com nome, horário, motivo e assinatura.',
    'Conferir o quadro completo na passagem de turno.',
    'Registrar a devolução com horário.',
    'Comunicar imediatamente qualquer chave não devolvida até o fim do turno.',
    'Proibir cópia sem autorização formal da administração.'
  ],
  atencao: 'Chave que não volta é ocorrência, não é pendência. Comunique no mesmo turno.' },

{ id: 'POP-13', nome: 'Recebimento de entregas e encomendas', sempre: true,
  objetivo: 'Impedir que a entrega sirva de meio de acesso ou de introdução de objeto perigoso.',
  passos: [
    'Receber sempre no ponto de controle, sem permitir a entrada do entregador.',
    'Conferir destinatário e registrar remetente, empresa e horário.',
    'Recusar volume sem destinatário identificado.',
    'Não receber volume com aspecto suspeito: mancha, odor, fio aparente, peso incompatível.',
    'Comunicar o destinatário e protocolar a entrega com assinatura.',
    'Não guardar volume perecível ou de valor sem autorização expressa.'
  ],
  atencao: 'Entregador de aplicativo não passa do ponto de controle, mesmo com o cliente insistindo.' },

{ id: 'POP-14', nome: 'Uso e guarda de equipamentos do posto', sempre: true,
  objetivo: 'Manter operacional aquilo de que a segurança depende.',
  passos: [
    'Conferir na assunção do turno: rádio, lanterna, chaves, livro, botão de pânico e telefone.',
    'Testar o rádio com a central no início do turno.',
    'Verificar diariamente se as câmeras estão gravando e se a data e a hora estão corretas.',
    'Registrar imediatamente qualquer equipamento com defeito.',
    'Não improvisar reparo em equipamento elétrico ou eletrônico.',
    'Manter carregadores conectados e baterias em carga.'
  ],
  atencao: 'Data e hora erradas no gravador tiram o valor probatório da imagem. Confira toda semana.' },

{ id: 'POP-15', nome: 'Atendimento a autoridades e fiscalização', sempre: true,
  objetivo: 'Atender sem obstruir e sem liberar o que não deve ser liberado.',
  passos: [
    'Solicitar identificação funcional e registrar nome, órgão e matrícula.',
    'Comunicar imediatamente o responsável do cliente e a supervisão.',
    'Confirmar a autenticidade pelo telefone institucional do órgão, quando houver dúvida.',
    'Não liberar acesso a área interna sem autorização do responsável, salvo mandado judicial ou situação de flagrante.',
    'Acompanhar a autoridade durante toda a permanência.',
    'Registrar horário de entrada, de saída e o que foi solicitado.'
  ],
  atencao: 'Falsa autoridade é método conhecido de invasão. Verificar não é desacato.' },

{ id: 'POP-16', nome: 'Comunicação com a supervisão', sempre: true,
  objetivo: 'Definir o que é comunicado na hora e o que entra no relatório.',
  passos: [
    'Comunicar imediatamente: tentativa de invasão, assalto, incêndio, emergência médica, falta de energia prolongada, ausência de vigilante e falha de sistema crítico.',
    'Comunicar no mesmo turno: equipamento com defeito, chave não devolvida, conflito com morador, usuário ou funcionário do cliente.',
    'Registrar no relatório diário: ocorrências de rotina, visitas, entregas e rondas.',
    'Usar o canal oficial, nunca grupo pessoal de mensagem.',
    'Confirmar o recebimento pela supervisão nos casos imediatos.'
  ],
  atencao: 'Na dúvida entre comunicar e não comunicar, comunique.' },

/* ---------- condicionais por controle existente ---------- */
{ id: 'POP-17', nome: 'Operação e guarda de imagens de CFTV',
  quando: function (v) { return v('tec_cftv') !== null && v('tec_cftv') > 0.2; },
  objetivo: 'Manter o sistema útil como prova e dentro da LGPD.',
  passos: [
    'Verificar diariamente se todas as câmeras estão gravando e com imagem nítida.',
    'Conferir semanalmente a data e a hora do gravador.',
    'Registrar em livro toda extração de imagem: solicitante, motivo, período e destino.',
    'Liberar imagem somente com autorização do responsável do cliente ou por requisição de autoridade.',
    'Nunca compartilhar imagem em grupo de mensagem ou rede social.',
    'Manter o gravador em local trancado, com acesso restrito.',
    'Respeitar o prazo de retenção definido e não conservar imagem além do necessário.'
  ],
  atencao: 'Imagem de pessoa identificável é dado pessoal. Vazamento gera responsabilidade da empresa e do vigilante.' },

{ id: 'POP-18', nome: 'Operação do portão de veículos',
  quando: function (v, r) { return (v('ace_veiculo') !== null) || (r.per_estacionamento !== undefined); },
  objetivo: 'Impedir a entrada de segundo veículo na mesma abertura.',
  passos: [
    'Manter o portão fechado como situação padrão.',
    'Identificar e autorizar antes de qualquer acionamento.',
    'Acionar a abertura com o veículo já parado e posicionado.',
    'Observar a passagem completa e acionar o fechamento imediatamente.',
    'Confirmar visualmente o travamento antes de retornar à guarita.',
    'Nunca deixar o portão aberto para fluxo contínuo, mesmo em horário de pico.',
    'Comunicar defeito no fechamento como ocorrência de mesmo turno.'
  ],
  atencao: 'A maior parte da entrada indevida por veículo acontece na abertura que já estava autorizada.' },

{ id: 'POP-19', nome: 'Verificação de alarme disparado',
  quando: function (v) { return v('tec_alarme') !== null && v('tec_alarme') > 0.2; },
  objetivo: 'Tratar todo disparo como real até prova em contrário.',
  passos: [
    'Identificar na central o setor do disparo.',
    'Consultar as câmeras do setor antes de se deslocar.',
    'Comunicar a central o início da verificação e o setor.',
    'Deslocar-se com cautela, sem se expor e com rota de recuo definida.',
    'Se houver indício de presença, não entrar, recuar e acionar o 190.',
    'Registrar o disparo, a causa identificada e o horário de normalização.',
    'Comunicar disparos repetidos no mesmo setor à supervisão, para manutenção.'
  ],
  atencao: 'Disparo falso recorrente que não é corrigido termina em disparo real ignorado.' },

{ id: 'POP-20', nome: 'Autorização de saída de material',
  quando: function (v) { return v('ace_saida_material') !== null; },
  objetivo: 'Garantir que nada saia sem responsável identificado.',
  passos: [
    'Exigir autorização escrita e assinada por pessoa com alçada definida pelo cliente.',
    'Conferir item a item contra o documento, sem aceitar descrição genérica.',
    'Registrar quantidade, descrição, destino, veículo e horário.',
    'Fotografar a carga em caso de volume ou valor relevante.',
    'Reter a via da autorização no posto e enviar cópia à supervisão.',
    'Em caso de divergência, não liberar e acionar o responsável.'
  ],
  atencao: 'Autorização verbal não existe. Nem por telefone, nem de diretor.' },

/* ---------- condomínio residencial ---------- */
{ id: 'POP-R1', nome: 'Acesso de prestador contratado por morador', seg: 'residencial',
  objetivo: 'Identificar quem sobe, por ordem de quem e por quanto tempo.',
  passos: [
    'Confirmar a autorização com o morador pelo interfone, antes de qualquer liberação.',
    'Exigir documento com foto e registrar nome, unidade de destino e serviço.',
    'Emitir crachá de prestador com a unidade indicada.',
    'Orientar o uso do elevador de serviço, conforme o regimento.',
    'Registrar o horário de saída e recolher o crachá.',
    'Comunicar a administração em caso de prestador recorrente, para cadastro permanente.'
  ],
  atencao: 'Autorização dada por terceiro na unidade não substitui a do morador responsável.' },

{ id: 'POP-R2', nome: 'Mudança e transporte de móveis', seg: 'residencial',
  objetivo: 'Impedir que a mudança sirva de saída para bens de outra unidade.',
  passos: [
    'Exigir agendamento prévio e autorização do síndico ou da administradora.',
    'Conferir se está dentro do dia e do horário autorizados.',
    'Identificar e registrar todos os integrantes da equipe e o veículo.',
    'Verificar a proteção do elevador antes do início.',
    'Acompanhar ou monitorar o carregamento por câmera.',
    'Na saída, conferir se o volume corresponde à unidade autorizada.',
    'Registrar início, término e ocorrências.'
  ],
  atencao: 'Mudança fora do horário autorizado não começa. Autorize apenas a administração, nunca o vigilante.' },

{ id: 'POP-R3', nome: 'Controle de áreas comuns e reservas', seg: 'residencial',
  objetivo: 'Manter responsável identificado em cada uso de área comum.',
  passos: [
    'Conferir a reserva antes de liberar o espaço.',
    'Registrar a unidade responsável e o horário previsto.',
    'Registrar a lista de convidados, quando o regimento exigir.',
    'Verificar as condições do espaço na entrega e na devolução.',
    'Registrar dano ou anormalidade com foto.',
    'Comunicar à administração excesso de ruído ou de pessoas.'
  ],
  atencao: 'Convidado de festa é visitante e passa pelo controle de acesso normalmente.' },

{ id: 'POP-R4', nome: 'Guarda de chaves de unidades', seg: 'residencial',
  quando: function (v) { return v('res_chaves_unidade') !== null; },
  objetivo: 'Proteger o condomínio e o vigilante da responsabilidade por furto sem arrombamento.',
  passos: [
    'Aceitar guarda apenas com autorização escrita do proprietário, com validade definida.',
    'Guardar em cofre ou armário trancado, identificado por código e nunca pelo número da unidade.',
    'Liberar somente às pessoas nomeadas na autorização, mediante documento.',
    'Registrar retirada e devolução com nome, horário e assinatura.',
    'Conferir o quadro completo em toda passagem de turno.',
    'Comunicar imediatamente qualquer ausência.'
  ],
  atencao: 'Chave sem autorização escrita não é aceita para guarda, em nenhuma hipótese.' },

/* ---------- condomínio comercial ---------- */
{ id: 'POP-C1', nome: 'Credenciamento de funcionários de locatários', seg: 'comercial',
  objetivo: 'Manter atualizada a lista de quem tem direito de entrar sem ser anunciado.',
  passos: [
    'Receber a solicitação por representante formal da empresa locatária.',
    'Conferir documento e emitir crachá do condomínio com foto.',
    'Registrar empresa, sala, cargo e data de emissão.',
    'Exigir comunicação de desligamento em até 24 horas, prevista em contrato.',
    'Bloquear o crachá no sistema no mesmo dia da comunicação.',
    'Revisar o cadastro completo a cada seis meses com cada empresa.'
  ],
  atencao: 'Crachá não devolvido é bloqueado, não é esquecido.' },

{ id: 'POP-C2', nome: 'Acesso fora do horário comercial', seg: 'comercial',
  objetivo: 'Controlar o período em que o prédio está vazio e o risco é maior.',
  passos: [
    'Exigir autorização prévia da empresa, registrada na portaria.',
    'Conferir a identidade contra a lista de credenciados.',
    'Registrar entrada, andar de destino e horário previsto de saída.',
    'Acompanhar por CFTV o deslocamento até a sala.',
    'Fazer ronda de conferência do andar após a saída, verificando portas e janelas.',
    'Registrar a saída e comunicar qualquer permanência além do previsto.'
  ],
  atencao: 'Sem autorização prévia registrada não há liberação, mesmo para sócio da empresa.' },

{ id: 'POP-C3', nome: 'Desocupação de sala e saída de equipamentos', seg: 'comercial',
  objetivo: 'Impedir a retirada de bem de terceiro durante a saída de um locatário.',
  passos: [
    'Exigir autorização da administração, com relação de itens a retirar.',
    'Conferir item a item contra a relação antes do carregamento.',
    'Registrar equipe, veículo, horário de início e de término.',
    'Monitorar por CFTV todo o carregamento.',
    'Não liberar item fora da relação sem nova autorização.',
    'Emitir registro final com foto do estado da sala.'
  ],
  atencao: 'Desocupação em fim de semana ou feriado exige presença de representante da administração.' },

/* ---------- transportadora ---------- */
{ id: 'POP-T1', nome: 'Lacre e conferência de carga', seg: 'transportadora',
  objetivo: 'Tornar detectável qualquer abertura não autorizada do compartimento.',
  passos: [
    'Conferir o carregamento contra o documento antes de fechar o compartimento.',
    'Aplicar lacre numerado e registrar o número no documento de transporte.',
    'Fotografar o lacre aplicado, com o número legível.',
    'Registrar na portaria placa, motorista, lacre e horário de saída.',
    'Orientar o motorista sobre a proibição de abrir o lacre em trânsito.',
    'No destino, conferir a integridade e o número do lacre antes da descarga.',
    'Registrar imediatamente qualquer divergência de número ou lacre rompido.'
  ],
  atencao: 'Lacre rompido ou com número diferente é ocorrência grave. A descarga para e a supervisão é acionada.' },

{ id: 'POP-T2', nome: 'Checklist de saída de veículo', seg: 'transportadora',
  objetivo: 'Garantir que nada saia do pátio sem conferência completa.',
  passos: [
    'Conferir CNH, documento do veículo e cadastro do motorista.',
    'Confirmar a liberação da gerenciadora de risco quando exigida.',
    'Verificar o plano de viagem e a rota autorizada.',
    'Conferir lacre, documento de transporte e nota fiscal.',
    'Testar o rastreador antes da saída do pátio.',
    'Registrar horário de saída e conferir a placa no portão.',
    'Não liberar veículo com qualquer item pendente.'
  ],
  atencao: 'Pressa de cliente não autoriza saída sem checklist completo. Quem libera assina.' },

{ id: 'POP-T3', nome: 'Roubo de carga em trânsito', seg: 'transportadora',
  objetivo: 'Reduzir o tempo de resposta na única janela em que a recuperação é possível.',
  passos: [
    'Ao receber o alerta, confirmar a posição do veículo pelo rastreador.',
    'Acionar imediatamente a gerenciadora de risco e a central.',
    'Acionar a Polícia Militar pelo 190 e a Polícia Rodoviária quando for rodovia federal.',
    'Registrar horário, local, rota prevista, carga e dados do motorista.',
    'Manter linha aberta com a gerenciadora durante todo o acompanhamento.',
    'Comunicar o embarcador e a seguradora dentro do prazo da apólice.',
    'Prestar apoio ao motorista e registrar seu relato ainda no mesmo dia.',
    'Elaborar relatório completo em até 24 horas.'
  ],
  atencao: 'Os primeiros 30 minutos definem a recuperação. Nenhuma etapa espera autorização hierárquica.' },

{ id: 'POP-T4', nome: 'Controle do pátio de veículos', seg: 'transportadora',
  objetivo: 'Proteger o veículo carregado parado, que é o alvo mais exposto da operação.',
  passos: [
    'Registrar entrada e saída de todo veículo, com placa, motorista e carga.',
    'Posicionar veículos carregados na área mais protegida e sob cobertura de câmera.',
    'Manter as portas de carga voltadas para parede ou para outro veículo.',
    'Recolher as chaves dos veículos em pernoite para o quadro controlado.',
    'Intensificar a ronda no pátio na madrugada, com registro nos pontos de controle.',
    'Não permitir permanência de motorista terceiro na cabine durante a madrugada, salvo área designada.'
  ],
  atencao: 'Carga que pernoita em pátio sem vigilância deve ser recusada pela operação, não gerenciada pelo posto.' },

/* ---------- indústria ---------- */
{ id: 'POP-I1', nome: 'Saída de sucata e resíduos', seg: 'industria',
  objetivo: 'Fechar o canal mais usado de desvio de material com valor.',
  passos: [
    'Exigir documento de saída emitido pela área geradora e aprovado.',
    'Pesar o veículo vazio na entrada e carregado na saída.',
    'Conferir visualmente a carga em busca de material bom misturado ao descarte.',
    'Fotografar a carga antes do fechamento.',
    'Registrar placa, motorista, empresa, peso, tipo de material e horário.',
    'Exigir que a conferência seja feita por funcionário de área diferente da geradora.',
    'Arquivar o comprovante de pesagem junto ao documento de saída.'
  ],
  atencao: 'Sem pesagem não há saída de sucata, mesmo com documento assinado por gerente.' },

{ id: 'POP-I2', nome: 'Controle do almoxarifado e da ferramentaria', seg: 'industria',
  objetivo: 'Tornar rastreável toda retirada de material e ferramenta.',
  passos: [
    'Manter acesso restrito às pessoas designadas.',
    'Exigir requisição aprovada para qualquer retirada.',
    'Registrar item, quantidade, requisitante, centro de custo e horário.',
    'Controlar ferramentas em regime de empréstimo, com prazo de devolução.',
    'Fazer inventário rotativo mensal dos itens de maior valor ou maior giro.',
    'Comunicar toda divergência no mesmo dia da constatação.'
  ],
  atencao: 'Retirada urgente sem requisição se regulariza no mesmo turno, nunca no dia seguinte.' },

{ id: 'POP-I3', nome: 'Parada de manutenção com equipes externas', seg: 'industria',
  objetivo: 'Absorver um grande volume de terceiros sem perder o controle de acesso.',
  passos: [
    'Receber a lista nominal com no mínimo 48 horas de antecedência.',
    'Conferir documentação de segurança do trabalho exigida antes da emissão do crachá.',
    'Emitir crachá temporário com data de validade e cor distinta.',
    'Registrar ferramentas e equipamentos que entram, para conferência na saída.',
    'Definir acompanhante responsável por equipe e área autorizada.',
    'Conferir a devolução de todos os crachás ao término de cada dia.',
    'Bloquear os crachás não devolvidos ao fim da parada.'
  ],
  atencao: 'Nome fora da lista prévia não entra. A exceção precisa de autorização formal registrada.' },

{ id: 'POP-I4', nome: 'Manifestação ou paralisação no portão', seg: 'industria',
  objetivo: 'Preservar pessoas e imagem da empresa sem gerar confronto.',
  passos: [
    'Comunicar imediatamente a supervisão, o RH e o jurídico do cliente.',
    'Manter os portões fechados e não permitir entrada de pessoa não identificada.',
    'Não confrontar, não discutir e não retirar fisicamente ninguém.',
    'Registrar a movimentação em vídeo, sem abordar os participantes.',
    'Manter livre o acesso de emergência para ambulância e bombeiros.',
    'Orientar funcionários a aguardar dentro da área, sem sair pelo portão bloqueado.',
    'Acionar a Polícia Militar apenas por determinação do responsável do cliente, salvo violência iminente.',
    'Emitir relatório com horários, número aproximado de pessoas e ocorrências.'
  ],
  atencao: 'Manifestação é assunto jurídico e de relações de trabalho. O posto registra e protege, não negocia.' },

/* ---------- empresa, comércio e serviços ---------- */
{ id: 'POP-E1', nome: 'Sangria de caixa e guarda de valores', seg: 'empresa',
  objetivo: 'Reduzir o valor exposto e a previsibilidade da operação com dinheiro.',
  passos: [
    'Definir limite máximo de valor em caixa e sangrar ao atingir o limite.',
    'Variar os horários de sangria, sem rotina identificável de fora.',
    'Fazer a sangria fora da vista do público, em sala reservada.',
    'Depositar em cofre de boca de lobo, que o operador não consegue abrir.',
    'Registrar valor, horário e responsável, com dupla assinatura.',
    'Nunca comentar valores, horários ou dia de coleta.'
  ],
  atencao: 'Cofre que o operador abre não é cofre, é gaveta. Sob ameaça, não existe resistência.' },

{ id: 'POP-E2', nome: 'Abertura e fechamento do estabelecimento', seg: 'empresa',
  objetivo: 'Proteger os dois momentos de maior exposição do dia.',
  passos: [
    'Realizar sempre com duas pessoas, nunca sozinho.',
    'Na chegada, observar o entorno antes de descer do veículo ou se aproximar.',
    'Verificar sinais de arrombamento nas portas, grades e fechaduras antes de abrir.',
    'Usar sinal combinado de segurança: se o sinal não for dado, a segunda pessoa não entra e aciona a polícia.',
    'Desarmar o alarme somente após a conferência interna.',
    'No fechamento, conferir todos os ambientes, sanitários e depósito antes de armar o alarme.',
    'Conferir o travamento e sair juntos.'
  ],
  atencao: 'Se algo parecer diferente, não entre. Chame apoio e acione o 190 do lado de fora.' },

{ id: 'POP-E3', nome: 'Desligamento de funcionário e revogação de acessos', seg: 'empresa',
  objetivo: 'Eliminar o acesso de quem deixou de ter vínculo, no mesmo dia.',
  passos: [
    'Receber a comunicação do RH no dia do desligamento.',
    'Bloquear crachá, biometria e senha de alarme imediatamente.',
    'Recolher chaves, crachá, controle de portão e equipamentos.',
    'Trocar segredo ou cilindro quando houver chave não devolvida.',
    'Atualizar a lista de acesso da portaria e informar o efetivo do posto.',
    'Registrar a revogação com data, horário e responsável.'
  ],
  atencao: 'Desligamento com conflito exige acompanhamento na retirada de pertences e bloqueio antes da comunicação ao funcionário.' }

];

/* Seleciona os POPs aplicáveis ao levantamento */
window.selecionarPops = function (respostas, segmento) {
  var mapa = {};
  window.todasPerguntas(segmento).forEach(function (p) { mapa[p.id] = p; });
  var v = function (id) { return _v(respostas, id, mapa); };

  return window.POPS.filter(function (pop) {
    if (pop.seg && pop.seg !== segmento) return false;
    if (pop.sempre) return true;
    if (typeof pop.quando === 'function') return pop.quando(v, respostas);
    return true;   // POP de segmento sem condição entra sempre para aquele segmento
  });
};
