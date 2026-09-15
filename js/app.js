/* ============================================================
   Vegas — Aplicativo de campo
   ============================================================ */

var atual = null;      // levantamento aberto
var secoes = [];       // seções do segmento
var iSecao = 0;

var $ = function (id) { return document.getElementById(id); };

function telas(mostrar) {
  ['telaLista', 'telaSegmento', 'telaForm', 'telaResultado', 'telaConfig'].forEach(function (t) {
    $(t).classList.toggle('oculto', t !== mostrar);
  });
  window.scrollTo(0, 0);
}

function toast(msg, ms) {
  var t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function () { t.remove(); }, ms || 2600);
}

/* ---------- lista ---------- */
function renderLista() {
  var lista = window.Base.todos();
  var alvo = $('listaLevantamentos');
  $('tituloTopo').textContent = 'Plano de Segurança';

  if (!lista.length) {
    $('resumoLista').textContent = 'Nenhum levantamento ainda. Comece pelo posto que você conhece melhor.';
    alvo.innerHTML = '<div class="lista-vazia">O primeiro levantamento leva cerca de 40 minutos.<br>A revisão anual do mesmo posto leva 10.</div>';
    return;
  }

  var pendentes = lista.filter(function (l) { return !l.sincronizado; }).length;
  $('resumoLista').textContent = lista.length + (lista.length === 1 ? ' levantamento' : ' levantamentos') +
    (pendentes ? ' · ' + pendentes + ' aguardando envio' : ' · tudo sincronizado');

  alvo.innerHTML = lista.map(function (l) {
    var idx = window.calcularIndice(l.respostas, l.segmento);
    var faixa = window.faixaIndice(idx.geral);
    var seg = (window.SEGMENTOS.find(function (s) { return s.id === l.segmento; }) || {}).nome || '';
    var nome = l.respostas.cliente || 'Sem nome';
    var local = l.respostas.local ? ' — ' + l.respostas.local : '';
    return '<div class="cartao cartao-clicavel" data-id="' + l.id + '">' +
      '<h3>' + escapar(nome + local) + '</h3>' +
      '<div class="meta">' + escapar(seg) + ' · ' + window.formatarData(l.respostas.data || l.criadoEm) +
      ' · <span style="color:' + faixa.cor + '">índice ' + idx.geral + '</span>' +
      (l.sincronizado ? ' · enviado' : ' · não enviado') + '</div></div>';
  }).join('');

  Array.prototype.forEach.call(alvo.querySelectorAll('[data-id]'), function (el) {
    el.addEventListener('click', function () { abrir(el.dataset.id); });
  });
}

function escapar(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ---------- segmento ---------- */
var DESCRICOES = {
  residencial: 'Carona no acesso, controle de garagem, prestador de morador, mudança, chaves de unidades',
  comercial: 'Locatários, credencial de funcionários, desocupação, acesso noturno, áreas técnicas',
  transportadora: 'Lacre, checklist de saída, conferência de carga, gerenciadora de risco, pátio de pernoite',
  industria: 'Sucata, almoxarifado, expedição, parada de manutenção, químicos, paralisação no portão',
  empresa: 'Sangria, transporte de valores, abertura e fechamento, sala de TI, conduta em assalto'
};

function renderSegmentos() {
  $('listaSegmentos').innerHTML = window.SEGMENTOS.map(function (s, i) {
    return '<button class="seg" data-seg="' + s.id + '">' +
      '<span class="seg-n">' + (i + 1) + '</span>' +
      '<span><span class="seg-t">' + s.nome + '</span><br><span class="seg-d">' + DESCRICOES[s.id] + '</span></span>' +
      '</button>';
  }).join('');
  Array.prototype.forEach.call($('listaSegmentos').querySelectorAll('[data-seg]'), function (el) {
    el.addEventListener('click', function () {
      atual = window.Base.novo(el.dataset.seg);
      atual.respostas.supervisor = window.Cfg.get('supervisor', '');
      window.Base.salvar(atual);
      iniciarForm();
    });
  });
}

/* ---------- formulário ---------- */
function iniciarForm() {
  secoes = window.montarSecoes(atual.segmento);
  iSecao = 0;
  telas('telaForm');
  renderAbas();
  renderSecao();
}

function renderAbas() {
  $('abas').innerHTML = secoes.map(function (s, i) {
    return '<button class="aba' + (i === iSecao ? ' ativa' : '') + (secaoCompleta(s) ? ' completa' : '') +
      '" data-i="' + i + '">' + s.titulo + '</button>';
  }).join('');
  Array.prototype.forEach.call($('abas').querySelectorAll('[data-i]'), function (el) {
    el.addEventListener('click', function () { iSecao = +el.dataset.i; renderAbas(); renderSecao(); });
  });
  var ativa = $('abas').querySelector('.ativa');
  if (ativa) ativa.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
}

function secaoCompleta(s) {
  return s.perguntas.every(function (p) {
    if (p.tipo === 'fotos') return true;
    var v = atual.respostas[p.id];
    return v !== undefined && v !== null && v !== '';
  });
}

function progresso() {
  var todas = [], ok = 0;
  secoes.forEach(function (s) {
    s.perguntas.forEach(function (p) {
      if (p.tipo === 'fotos') return;
      todas.push(p);
      var v = atual.respostas[p.id];
      if (v !== undefined && v !== null && v !== '') ok++;
    });
  });
  var pct = todas.length ? Math.round(ok / todas.length * 100) : 0;
  $('progTexto').textContent = ok + ' de ' + todas.length + ' respondidas';
  $('progPct').textContent = pct + '%';
  $('progFill').style.width = pct + '%';
}

function renderSecao() {
  var s = secoes[iSecao];
  $('secaoTitulo').textContent = s.titulo;
  $('tituloTopo').textContent = atual.respostas.cliente || 'Novo levantamento';
  $('perguntas').innerHTML = s.perguntas.map(campoHTML).join('');
  ligarCampos(s);
  progresso();
  $('btnAnterior').disabled = iSecao === 0;
  $('btnProximo').textContent = iSecao === secoes.length - 1 ? 'Ver resultado' : 'Próxima';
  window.scrollTo(0, 0);
}

function campoHTML(p) {
  var v = atual.respostas[p.id];
  var dica = p.dica ? '<p class="dica">' + escapar(p.dica) + '</p>' : '';
  var cabeca = '<label class="rotulo" for="c_' + p.id + '">' + escapar(p.texto) + '</label>' + dica;

  if (p.tipo === 'fotos') {
    return '<div class="pergunta">' + cabeca +
      '<button class="btn secundario" id="btnAddFoto">Adicionar foto</button>' +
      '<input type="file" id="arqFoto" accept="image/*" capture="environment" multiple class="oculto">' +
      '<div class="fotos-grid" id="gridFotos"></div></div>';
  }
  if (p.tipo === 'escala') {
    return '<div class="pergunta">' + cabeca + '<div class="opcoes">' +
      p.opcoes.map(function (o, i) {
        var marcada = v === o[0];
        return '<label class="opcao' + (marcada ? ' marcada' : '') + '">' +
          '<input type="radio" name="' + p.id + '" value="' + escapar(o[0]) + '"' + (marcada ? ' checked' : '') + '>' +
          '<span class="marca"></span><span class="txt">' + escapar(o[0]) + '</span></label>';
      }).join('') + '</div></div>';
  }
  if (p.tipo === 'select') {
    return '<div class="pergunta">' + cabeca + '<select id="c_' + p.id + '" data-id="' + p.id + '">' +
      '<option value="">Selecione</option>' +
      p.opcoes.map(function (o) {
        return '<option' + (v === o ? ' selected' : '') + '>' + escapar(o) + '</option>';
      }).join('') + '</select></div>';
  }
  if (p.tipo === 'textarea') {
    return '<div class="pergunta">' + cabeca +
      '<textarea id="c_' + p.id + '" data-id="' + p.id + '">' + escapar(v || '') + '</textarea></div>';
  }
  var tipo = p.tipo === 'numero' ? 'number' : p.tipo === 'data' ? 'date' : 'text';
  return '<div class="pergunta">' + cabeca +
    '<input type="' + tipo + '" id="c_' + p.id + '" data-id="' + p.id + '" value="' + escapar(v || '') + '"></div>';
}

function ligarCampos(s) {
  Array.prototype.forEach.call($('perguntas').querySelectorAll('[data-id]'), function (el) {
    el.addEventListener('change', function () {
      atual.respostas[el.dataset.id] = el.value;
      if (el.dataset.id === 'supervisor') window.Cfg.set('supervisor', el.value);
      if (el.dataset.id === 'cliente') $('tituloTopo').textContent = el.value || 'Novo levantamento';
      salvar();
    });
  });
  Array.prototype.forEach.call($('perguntas').querySelectorAll('input[type=radio]'), function (el) {
    el.addEventListener('change', function () {
      atual.respostas[el.name] = el.value;
      var grupo = $('perguntas').querySelectorAll('input[name="' + el.name + '"]');
      Array.prototype.forEach.call(grupo, function (g) {
        g.closest('.opcao').classList.toggle('marcada', g.checked);
      });
      salvar();
    });
  });
  if (s.perguntas.some(function (p) { return p.tipo === 'fotos'; })) ligarFotos();
}

function salvar() {
  window.Base.salvar(atual);
  progresso();
  renderAbas();
}

/* ---------- fotos ---------- */
function ligarFotos() {
  $('btnAddFoto').addEventListener('click', function () { $('arqFoto').click(); });
  $('arqFoto').addEventListener('change', function (e) {
    var arquivos = Array.prototype.slice.call(e.target.files);
    if (!arquivos.length) return;
    toast('Processando ' + arquivos.length + (arquivos.length === 1 ? ' foto' : ' fotos'));
    arquivos.reduce(function (p, f) {
      return p.then(function () {
        return window.comprimirImagem(f).then(function (dados) {
          var id = 'FT' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
          return window.Fotos.salvar({ id: id, dados: dados }).then(function () {
            atual.fotos.push({ id: id, legenda: '', secao: secoes[iSecao].id });
            window.Base.salvar(atual);
          });
        });
      });
    }, Promise.resolve()).then(function () { e.target.value = ''; renderFotos(); });
  });
  renderFotos();
}

function renderFotos() {
  var grid = $('gridFotos');
  if (!grid) return;
  if (!atual.fotos.length) {
    grid.innerHTML = '<div class="lista-vazia" style="grid-column:1/-1">Nenhuma foto ainda. Fotografe perímetro, acessos e pontos frágeis.</div>';
    return;
  }
  grid.innerHTML = atual.fotos.map(function (f) {
    return '<div class="foto-item" data-f="' + f.id + '">' +
      '<img data-img="' + f.id + '" alt="">' +
      (f.driveId ? '<div class="foto-nuvem">no Drive</div>' : '') +
      '<div class="cap"><input type="text" placeholder="Legenda" data-leg="' + f.id + '" value="' + escapar(f.legenda || '') + '"></div>' +
      '<button class="remover" data-rm="' + f.id + '">Remover</button></div>';
  }).join('');

  atual.fotos.forEach(function (f) {
    window.Fotos.ler(f.id).then(function (x) {
      var img = grid.querySelector('[data-img="' + f.id + '"]');
      if (!img) return;
      if (x && x.dados) img.src = x.dados;
      else if (f.driveUrl) img.src = 'https://drive.google.com/thumbnail?id=' + f.driveId;
    });
  });

  Array.prototype.forEach.call(grid.querySelectorAll('[data-leg]'), function (el) {
    el.addEventListener('change', function () {
      var f = atual.fotos.find(function (x) { return x.id === el.dataset.leg; });
      if (f) { f.legenda = el.value; window.Base.salvar(atual); }
    });
  });
  Array.prototype.forEach.call(grid.querySelectorAll('[data-rm]'), function (el) {
    el.addEventListener('click', function () {
      var id = el.dataset.rm;
      window.Fotos.apagar(id);
      atual.fotos = atual.fotos.filter(function (x) { return x.id !== id; });
      window.Base.salvar(atual);
      renderFotos();
    });
  });
}

/* ---------- resultado ---------- */
function abrir(id) {
  atual = window.Base.ler(id);
  if (!atual) return;
  secoes = window.montarSecoes(atual.segmento);
  mostrarResultado();
}

function mostrarResultado() {
  telas('telaResultado');
  var r = atual.respostas;
  var idx = window.calcularIndice(r, atual.segmento);
  var faixa = window.faixaIndice(idx.geral);
  var riscos = window.avaliarRiscos(r, atual.segmento);
  var res = window.resumoRiscos(riscos);
  var seg = (window.SEGMENTOS.find(function (s) { return s.id === atual.segmento; }) || {}).nome || '';

  $('tituloTopo').textContent = r.cliente || 'Levantamento';
  $('resTitulo').textContent = r.cliente || 'Levantamento sem nome';
  $('resSub').textContent = [r.local, seg, window.formatarData(r.data)].filter(Boolean).join(' · ');

  $('resIndice').style.borderLeftColor = faixa.cor;
  $('resIndice').innerHTML =
    '<div class="n" style="color:' + faixa.cor + '">' + idx.geral + '</div>' +
    '<div><div class="f">' + faixa.nome + '</div><div class="d">' + faixa.texto + '</div></div>';

  $('resDimensoes').innerHTML = Object.keys(window.DIMENSOES).map(function (d) {
    var v = idx.dimensoes[d];
    var cor = v === null ? '#2b3139' : window.faixaIndice(v).cor;
    return '<div class="dim-linha"><span class="nome">' + window.DIMENSOES[d] + '</span>' +
      '<span class="trilha"><span style="display:block;height:100%;width:' + (v || 0) + '%;background:' + cor + '"></span></span>' +
      '<span class="val">' + (v === null ? '—' : v) + '</span></div>';
  }).join('');

  $('resChips').innerHTML =
    '<span class="chip"><b style="color:#d34b4f">' + res.critico + '</b> críticos</span>' +
    '<span class="chip"><b style="color:#e0651a">' + res.alto + '</b> altos</span>' +
    '<span class="chip"><b style="color:#e8a317">' + res.medio + '</b> médios</span>' +
    '<span class="chip"><b style="color:#2fa84f">' + res.baixo + '</b> baixos</span>';

  $('resRiscos').innerHTML = riscos.length
    ? riscos.map(function (x) {
        return '<div class="risco-item ' + x.nivel.toLowerCase().replace('í', 'i').replace('é', 'e') + '">' +
          '<h4>' + escapar(x.titulo) + '</h4><p>' + escapar(x.tratamento) + '</p></div>';
      }).join('')
    : '<div class="lista-vazia">Nenhum risco acionado pelas respostas registradas.</div>';

  $('btnEnviar').textContent = atual.sincronizado ? 'Reenviar para a base' : 'Enviar para a base';
}

/* ---------- configurações ---------- */
function abrirConfig() {
  telas('telaConfig');
  $('cfgUrl').value = window.Cfg.get('url', '');
  $('cfgChave').value = window.Cfg.get('chave', '');

  var travado = window.Cfg.travado();
  $('cfgUrl').disabled = travado;
  $('cfgChave').disabled = travado;
  $('cfgFixa').style.display = travado ? 'block' : 'none';
  if (travado) {
    /* mostra só o começo e o fim da chave, para conferência */
    var k = window.Cfg.get('chave', '');
    $('cfgChave').value = k.length > 12 ? k.slice(0, 6) + '••••••' + k.slice(-4) : k;
  }

  $('cfgEspaco').checked = window.Cfg.get('liberarEspaco', false);
  $('cfgAuto').checked = window.Cfg.get('autoEnvio', false);
  $('cfgStatus').innerHTML = '';
}

/* ---------- ligações ---------- */
function medirTopo() {
  var t = document.querySelector('.topo');
  if (t) document.documentElement.style.setProperty('--h-topo', t.offsetHeight + 'px');
}

document.addEventListener('DOMContentLoaded', function () {
  medirTopo();
  window.addEventListener('resize', medirTopo);
  window.addEventListener('orientationchange', medirTopo);

  if (window.VEGAS_LOGO_PERSONALIZADA) $('logoTopo').src = window.VEGAS_LOGO_PERSONALIZADA;
  var salva = window.Cfg.get('logo');
  if (salva) { window.VEGAS_LOGO_PERSONALIZADA = salva; $('logoTopo').src = salva; }

  renderSegmentos();
  renderLista();
  telas('telaLista');

  $('btnNovo').addEventListener('click', function () { telas('telaSegmento'); });
  $('btnVoltarLista').addEventListener('click', function () { renderLista(); telas('telaLista'); });
  $('btnConfig').addEventListener('click', abrirConfig);
  $('btnPainel').addEventListener('click', function () { location.href = 'painel.html'; });
  $('btnFecharConfig').addEventListener('click', function () { renderLista(); telas('telaLista'); });

  $('btnAnterior').addEventListener('click', function () {
    if (iSecao > 0) { iSecao--; renderAbas(); renderSecao(); }
  });
  $('btnProximo').addEventListener('click', function () {
    if (iSecao < secoes.length - 1) { iSecao++; renderAbas(); renderSecao(); }
    else {
      mostrarResultado();
      if (window.Cfg.get('autoEnvio', false) && window.Sync.configurado() && navigator.onLine) enviar(true);
    }
  });
  $('btnSalvarSair').addEventListener('click', function () { salvar(); renderLista(); telas('telaLista'); });

  $('btnEditar').addEventListener('click', function () { iniciarForm(); });
  $('btnGerar').addEventListener('click', function () {
    toast('Montando o documento');
    window.gerarRelatorio(atual);
  });
  $('btnEnviar').addEventListener('click', function () { enviar(false); });
  $('btnDuplicar').addEventListener('click', function () {
    var novo = window.Base.duplicar(atual.id);
    if (novo) { atual = novo; toast('Cópia criada. As fotos não vieram junto.'); iniciarForm(); }
  });
  $('btnApagar').addEventListener('click', function () {
    if (!confirm('Apagar este levantamento do aparelho? O que já foi enviado permanece na planilha.')) return;
    window.Base.apagar(atual.id);
    atual = null; renderLista(); telas('telaLista');
  });

  /* config */
  ['cfgUrl', 'cfgChave'].forEach(function (id) {
    $(id).addEventListener('change', function () {
      if (window.Cfg.travado()) return;
      window.Cfg.set(id === 'cfgUrl' ? 'url' : 'chave', $(id).value.trim());
    });
  });
  $('cfgEspaco').addEventListener('change', function () { window.Cfg.set('liberarEspaco', this.checked); });
  $('cfgAuto').addEventListener('change', function () { window.Cfg.set('autoEnvio', this.checked); });

  $('btnTestar').addEventListener('click', function () {
    if (!window.Cfg.travado()) {
      window.Cfg.set('url', $('cfgUrl').value.trim());
      window.Cfg.set('chave', $('cfgChave').value.trim());
    }
    $('cfgStatus').innerHTML = '<div class="aviso info">Testando…</div>';
    window.Sync.testar()
      .then(function (r) {
        $('cfgStatus').innerHTML = '<div class="aviso ok">Conectado. Planilha: ' + escapar(r.planilha || 'ok') + '</div>';
      })
      .catch(function (e) {
        $('cfgStatus').innerHTML = '<div class="aviso erro">Não conectou. ' + escapar(e.message) +
          '<br>Confira se a publicação está como "qualquer pessoa" e se a chave está correta.</div>';
      });
  });

  $('btnLogo').addEventListener('click', function () { $('arqLogo').click(); });
  $('arqLogo').addEventListener('change', function (e) {
    var f = e.target.files[0]; if (!f) return;
    window.comprimirImagem(f, 900, 0.92).then(function (d) {
      window.Cfg.set('logo', d); window.VEGAS_LOGO_PERSONALIZADA = d;
      $('logoTopo').src = d; toast('Logo atualizada');
    });
  });
  $('btnLogoPadrao').addEventListener('click', function () {
    var c = window.Cfg.ler(); delete c.logo; window.Cfg.gravar(c);
    window.VEGAS_LOGO_PERSONALIZADA = null;
    $('logoTopo').src = 'img/logo-branca.png'; toast('Voltou para a logo padrão');
  });

  $('btnExportar').addEventListener('click', function () {
    var dados = { versao: 2, exportadoEm: new Date().toISOString(), levantamentos: window.Base.todos() };
    var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vegas-levantamentos-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
  });
  $('btnImportar').addEventListener('click', function () { $('arqImportar').click(); });
  $('arqImportar').addEventListener('change', function (e) {
    var f = e.target.files[0]; if (!f) return;
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var d = JSON.parse(fr.result);
        var atuais = window.Base.todos();
        var ids = atuais.map(function (x) { return x.id; });
        var novos = (d.levantamentos || []).filter(function (x) { return ids.indexOf(x.id) < 0; });
        window.Base.gravarTodos(novos.concat(atuais));
        toast(novos.length + ' levantamentos importados');
      } catch (err) { toast('Arquivo inválido'); }
    };
    fr.readAsText(f);
  });
});

function enviar(silencioso) {
  if (!window.Sync.configurado()) {
    if (!silencioso) { toast('Configure o endereço e a chave primeiro'); abrirConfig(); }
    return;
  }
  $('btnEnviar').disabled = true;
  $('btnEnviar').textContent = 'Enviando…';
  window.Sync.enviar(atual, function (msg) { $('btnEnviar').textContent = msg; })
    .then(function () {
      $('btnEnviar').textContent = 'Enviado';
      toast('Levantamento na base');
      setTimeout(function () { $('btnEnviar').disabled = false; $('btnEnviar').textContent = 'Reenviar para a base'; }, 1800);
    })
    .catch(function (e) {
      $('btnEnviar').disabled = false;
      $('btnEnviar').textContent = 'Tentar enviar de novo';
      if (!silencioso) toast('Falhou: ' + e.message, 4200);
    });
}

/* service worker */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  });
}
