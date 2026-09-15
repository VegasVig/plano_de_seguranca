/* ============================================================
   Vegas — Sincronização com o Google Apps Script
   As fotos vão em chamadas separadas, uma a uma, e ficam no
   Drive. Os dados do levantamento seguem sem nenhuma imagem.
   ============================================================ */

window.Sync = {

  configurado: function () {
    return !!(window.Cfg.get('url') && window.Cfg.get('chave'));
  },

  /* O Apps Script não aceita preflight de CORS, por isso o corpo
     vai como text/plain e o roteamento fica no próprio JSON. */
  chamar: function (acao, dados) {
    if (!this.configurado()) return Promise.reject(new Error('Sincronização não configurada'));
    var corpo = Object.assign({ acao: acao, chave: window.Cfg.get('chave') }, dados || {});
    return fetch(window.Cfg.get('url'), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(corpo)
    })
    .then(function (r) { return r.json(); })
    .then(function (j) {
      if (!j.ok) throw new Error(j.erro || 'Erro no servidor');
      return j;
    });
  },

  testar: function () { return this.chamar('ping'); },

  /* Envia um levantamento completo: primeiro cada foto, depois os dados */
  enviar: function (lev, progresso) {
    var self = this;
    var metas = (lev.fotos || []).slice();
    var apagarDepois = window.Cfg.get('liberarEspaco', false);
    var enviadas = 0;

    var cadeia = metas.reduce(function (p, meta) {
      return p.then(function () {
        if (meta.driveId) { enviadas++; return; }        // já está no Drive
        return window.Fotos.ler(meta.id).then(function (f) {
          if (!f || !f.dados) return;
          return self.chamar('foto', {
            levantamentoId: lev.id,
            fotoId: meta.id,
            cliente: lev.respostas.cliente || 'Sem nome',
            local: lev.respostas.local || '',
            legenda: meta.legenda || '',
            secao: meta.secao || '',
            dataUrl: f.dados
          }).then(function (r) {
            meta.driveId = r.driveId;
            meta.driveUrl = r.driveUrl;
            enviadas++;
            if (progresso) progresso('Foto ' + enviadas + ' de ' + metas.length);
            if (apagarDepois) return window.Fotos.apagar(meta.id);
          });
        });
      });
    }, Promise.resolve());

    return cadeia.then(function () {
      if (progresso) progresso('Enviando dados do levantamento');
      var indice = window.calcularIndice(lev.respostas, lev.segmento);
      var riscos = window.avaliarRiscos(lev.respostas, lev.segmento);
      return self.chamar('levantamento', {
        levantamento: {
          id: lev.id,
          segmento: lev.segmento,
          criadoEm: lev.criadoEm,
          atualizadoEm: lev.atualizadoEm,
          respostas: lev.respostas,
          fotos: (lev.fotos || []).map(function (f) {
            return { id: f.id, legenda: f.legenda, secao: f.secao, driveId: f.driveId || '', driveUrl: f.driveUrl || '' };
          })
        },
        indice: indice,
        riscos: riscos.map(function (r) {
          return { id: r.id, titulo: r.titulo, cat: r.cat, nivel: r.nivel, grau: r.grau, prazo: r.prazo };
        })
      });
    }).then(function (r) {
      lev.sincronizado = true;
      lev.sincronizadoEm = new Date().toISOString();
      window.Base.salvar(lev);
      return r;
    });
  },

  baixarFoto: function (driveId) {
    return this.chamar('lerFoto', { driveId: driveId }).then(function (r) { return r.dataUrl; });
  },

  painel: function () { return this.chamar('painel'); }
};
