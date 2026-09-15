/* ============================================================
   Vegas — Armazenamento local
   Levantamentos em localStorage. Fotos em IndexedDB, para não
   estourar a cota e não travar o aparelho do supervisor.
   ============================================================ */

var DB_NOME = 'vegas_fotos';
var DB_STORE = 'fotos';
var CHAVE_LEV = 'vegas_levantamentos';
var CHAVE_CFG = 'vegas_config';

/* ---------- configuração ---------- */
window.Cfg = {
  ler: function () {
    try { return JSON.parse(localStorage.getItem(CHAVE_CFG)) || {}; }
    catch (e) { return {}; }
  },
  gravar: function (c) { localStorage.setItem(CHAVE_CFG, JSON.stringify(c)); },
  set: function (k, v) { var c = this.ler(); c[k] = v; this.gravar(c); },
  get: function (k, padrao) { var c = this.ler(); return c[k] === undefined ? padrao : c[k]; }
};

/* ---------- IndexedDB para fotos ---------- */
var _db = null;
function abrirDB() {
  return new Promise(function (ok, erro) {
    if (_db) return ok(_db);
    var req = indexedDB.open(DB_NOME, 1);
    req.onupgradeneeded = function (e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = function (e) { _db = e.target.result; ok(_db); };
    req.onerror = function () { erro(req.error); };
  });
}

window.Fotos = {
  salvar: function (foto) {
    return abrirDB().then(function (db) {
      return new Promise(function (ok, erro) {
        var tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).put(foto);
        tx.oncomplete = function () { ok(foto); };
        tx.onerror = function () { erro(tx.error); };
      });
    });
  },
  ler: function (id) {
    return abrirDB().then(function (db) {
      return new Promise(function (ok, erro) {
        var r = db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get(id);
        r.onsuccess = function () { ok(r.result || null); };
        r.onerror = function () { erro(r.error); };
      });
    });
  },
  apagar: function (id) {
    return abrirDB().then(function (db) {
      return new Promise(function (ok) {
        var tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).delete(id);
        tx.oncomplete = ok;
      });
    });
  },
  /* Devolve as fotos de um levantamento, buscando no Drive
     as que já foram enviadas e apagadas do aparelho. */
  doLevantamento: function (lev) {
    var lista = (lev.fotos || []);
    return Promise.all(lista.map(function (meta) {
      return window.Fotos.ler(meta.id).then(function (local) {
        if (local && local.dados) return Object.assign({}, meta, { dados: local.dados });
        if (meta.driveId) {
          return window.Sync.baixarFoto(meta.driveId)
            .then(function (d) { return Object.assign({}, meta, { dados: d }); })
            .catch(function () { return Object.assign({}, meta, { dados: null }); });
        }
        return Object.assign({}, meta, { dados: null });
      });
    }));
  }
};

/* ---------- levantamentos ---------- */
window.Base = {
  todos: function () {
    try { return JSON.parse(localStorage.getItem(CHAVE_LEV)) || []; }
    catch (e) { return []; }
  },
  gravarTodos: function (lista) {
    localStorage.setItem(CHAVE_LEV, JSON.stringify(lista));
  },
  ler: function (id) {
    return this.todos().find(function (l) { return l.id === id; }) || null;
  },
  salvar: function (lev) {
    var lista = this.todos();
    var i = lista.findIndex(function (l) { return l.id === lev.id; });
    lev.atualizadoEm = new Date().toISOString();
    if (i >= 0) lista[i] = lev; else lista.unshift(lev);
    this.gravarTodos(lista);
    return lev;
  },
  apagar: function (id) {
    var lev = this.ler(id);
    if (lev) (lev.fotos || []).forEach(function (f) { window.Fotos.apagar(f.id); });
    this.gravarTodos(this.todos().filter(function (l) { return l.id !== id; }));
  },
  duplicar: function (id) {
    var o = this.ler(id);
    if (!o) return null;
    var novo = JSON.parse(JSON.stringify(o));
    novo.id = window.novoId();
    novo.criadoEm = new Date().toISOString();
    novo.sincronizado = false;
    novo.fotos = [];                         // foto não se duplica
    novo.respostas = Object.assign({}, novo.respostas);
    novo.respostas.local = (novo.respostas.local || '') + ' (cópia)';
    novo.respostas.data = new Date().toISOString().slice(0, 10);
    return this.salvar(novo);
  },
  novo: function (segmento) {
    return {
      id: window.novoId(),
      segmento: segmento,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      respostas: { data: new Date().toISOString().slice(0, 10) },
      fotos: [],
      sincronizado: false
    };
  }
};

window.novoId = function () {
  return 'LV' + Date.now().toString(36).toUpperCase() +
         Math.random().toString(36).slice(2, 6).toUpperCase();
};

/* ---------- utilidades ---------- */
window.comprimirImagem = function (file, larguraMax, qualidade) {
  larguraMax = larguraMax || 1280; qualidade = qualidade || 0.72;
  return new Promise(function (ok, erro) {
    var leitor = new FileReader();
    leitor.onload = function () {
      var img = new Image();
      img.onload = function () {
        var w = img.width, h = img.height;
        if (w > larguraMax) { h = Math.round(h * larguraMax / w); w = larguraMax; }
        var cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        ok(cv.toDataURL('image/jpeg', qualidade));
      };
      img.onerror = erro;
      img.src = leitor.result;
    };
    leitor.onerror = erro;
    leitor.readAsDataURL(file);
  });
};

window.formatarData = function (iso) {
  if (!iso) return '';
  var d = new Date(iso.length <= 10 ? iso + 'T12:00:00' : iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('pt-BR');
};
