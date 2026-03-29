/**
 * NOTICIAS FINANCIERAS EN TIEMPO REAL — Frontend
 * Joel Pasapera · Trading Algorítmico
 *
 * Este script hace TODO automáticamente:
 *   1. Carga news-section.html y lo inyecta en <div id="news-section-root">
 *   2. Renderiza noticias, filtros, sidebar
 *   3. Se auto-actualiza cada 5 minutos
 *
 * EN index.html SOLO necesitas:
 *   <head>  → <link rel="stylesheet" href="news-section.css">
 *   <body>  → <div id="news-section-root"></div>  (donde quieras la sección)
 *   <body>  → <script src="news-section.js"></script>  (al final)
 */

;(function () {
    'use strict';

    // ================================================
    // CONFIGURACIÓN
    // ================================================
    const CFG = {
        // Archivo HTML de la sección (se carga automáticamente)
        HTML_FILE:   'news-section.html',
        // ID del div placeholder en index.html
        ROOT_ID:     'news-section-root',
        // Endpoint del backend — única fuente de datos
        BACKEND_URL: 'https://joelpasapera.pythonanywhere.com/api/news',
        // UI
        UPDATE_MS:    5 * 60 * 1000,
        INITIAL_SHOW: 6,
        LOAD_MORE:    3,
        // Clasificación local
        CATEGORIES: {
            forex:       ['forex','eur/usd','gbp/usd','usd/jpy','dollar','euro','currency','exchange rate','central bank','dxy'],
            crypto:      ['bitcoin','ethereum','crypto','cryptocurrency','blockchain','btc','eth','solana','altcoin','defi','nft'],
            stocks:      ['stock market','shares','equity','nasdaq','dow jones','s&p 500','earnings','ipo','wall street','nyse','tech stocks'],
            commodities: ['gold','silver','oil','wti','brent','commodities','xau','natural gas','copper','platinum'],
            economy:     ['fed','federal reserve','ecb','interest rate','inflation','gdp','economy','recession','employment','nonfarm','cpi','pmi']
        }
    };

    // ================================================
    // DATOS DEMO
    // ================================================
    function ago (mins) { return new Date(Date.now() - mins * 60000).toISOString(); }
    function future (days) { return new Date(Date.now() + days * 86400000); }

    const DEMO_NEWS = [
        { title: 'La Fed mantiene tasas sin cambios y señala posible recorte en septiembre', description: 'La Reserva Federal decidió mantener las tasas de interés en su nivel actual durante la última reunión del FOMC. Jerome Powell indicó que los datos de inflación recientes son "alentadores" y que un recorte podría considerarse si la tendencia continúa.', url: '#', urlToImage: null, publishedAt: ago(25), source: { name: 'Reuters' }, category: 'economy', impact: 'high', tags: ['Fed','Tasas','FOMC'] },
        { title: 'Bitcoin rompe los $72,000 tras aprobación de ETF spot por parte de la SEC', description: 'El precio de Bitcoin alcanzó un nuevo máximo histórico después de que la SEC aprobara un segundo lote de ETF spot. Los volúmenes de negociación alcanzaron niveles récord mientras los inversores institucionales aumentan sus posiciones.', url: '#', urlToImage: null, publishedAt: ago(40), source: { name: 'CoinDesk' }, category: 'crypto', impact: 'high', tags: ['Bitcoin','ETF','SEC'] },
        { title: 'Oro se dispara a $2,450 ante escalada de tensiones en Medio Oriente', description: 'El XAU/USD superó la resistencia clave de $2,400 impulsado por la demanda de activos refugio. Los analistas de Goldman Sachs elevan su objetivo a $2,600 para fin de año.', url: '#', urlToImage: null, publishedAt: ago(55), source: { name: 'Bloomberg' }, category: 'commodities', impact: 'high', tags: ['Oro','XAU/USD','Safe Haven'] },
        { title: 'EUR/USD cae tras PMI manufacturero débil en la zona euro', description: 'El par euro/dólar retrocedió al nivel de 1.0720 después de que el PMI manufacturero de la eurozona se ubicara en 45.6, por debajo de las expectativas. El BCE podría acelerar sus recortes de tasas.', url: '#', urlToImage: null, publishedAt: ago(80), source: { name: 'ForexLive' }, category: 'forex', impact: 'medium', tags: ['EUR/USD','PMI','BCE'] },
        { title: 'Nasdaq marca nuevo récord impulsado por resultados de Nvidia y Meta', description: 'Las acciones tecnológicas lideraron una sesión alcista en Wall Street. Nvidia reportó ingresos que superaron las estimaciones en un 18%, mientras que Meta anunció un aumento significativo en la inversión en IA.', url: '#', urlToImage: null, publishedAt: ago(110), source: { name: 'CNBC' }, category: 'stocks', impact: 'high', tags: ['Nasdaq','Nvidia','Tech'] },
        { title: 'Petróleo WTI sube 3.2% tras recortes de producción extendidos por OPEC+', description: 'Los precios del crudo subieron con fuerza después de que la OPEC+ anunciara una extensión de los recortes de producción hasta el cuarto trimestre. Los inventarios de EE.UU. cayeron más de lo previsto.', url: '#', urlToImage: null, publishedAt: ago(140), source: { name: 'Reuters' }, category: 'commodities', impact: 'medium', tags: ['WTI','OPEC','Petróleo'] },
        { title: 'Ethereum lanza actualización Dencun y reduce tarifas en Layer 2 un 90%', description: 'La red Ethereum completó con éxito la actualización Dencun, reduciendo drásticamente los costos de transacción en redes Layer 2. El precio de ETH subió un 4.8% tras la noticia.', url: '#', urlToImage: null, publishedAt: ago(175), source: { name: 'The Block' }, category: 'crypto', impact: 'medium', tags: ['Ethereum','Dencun','L2'] },
        { title: 'Datos de empleo de EE.UU. sorprenden al alza: NFP +272K', description: 'Las nóminas no agrícolas de mayo superaron ampliamente las expectativas, generando volatilidad en los mercados. El dólar se fortaleció y las probabilidades de recorte de tasas disminuyeron.', url: '#', urlToImage: null, publishedAt: ago(210), source: { name: 'Bloomberg' }, category: 'economy', impact: 'high', tags: ['NFP','Empleo','USD'] },
        { title: 'GBP/USD avanza tras sorpresa positiva en datos de PIB del Reino Unido', description: 'La libra esterlina ganó terreno frente al dólar después de que el PIB del Reino Unido registrara un crecimiento del 0.6% en el primer trimestre, superando las estimaciones del 0.4%.', url: '#', urlToImage: null, publishedAt: ago(250), source: { name: 'ForexLive' }, category: 'forex', impact: 'low', tags: ['GBP/USD','PIB','UK'] }
    ];

    const DEMO_EVENTS = [
        { date: future(1), title: 'Decisión de Tasas – Fed',    desc: 'Anuncio del FOMC', impact: 3 },
        { date: future(2), title: 'NFP – Nóminas No Agrícolas', desc: 'Empleo EE.UU.',    impact: 3 },
        { date: future(3), title: 'IPC – Inflación Zona Euro',  desc: 'Datos CPI Europa', impact: 2 },
        { date: future(5), title: 'PIB – Crecimiento UK',       desc: 'PIB preliminar',   impact: 2 }
    ];

    // ================================================
    // ESTADO
    // ================================================
    const state = { all: [], filtered: [], category: 'all', shown: 0, timer: null, isLive: false };

    // ================================================
    // UTILIDADES
    // ================================================
    function relTime (iso) {
        const ms = Date.now() - new Date(iso).getTime();
        const m = Math.floor(ms / 60000);
        if (m < 1)  return 'Ahora';
        if (m < 60) return 'Hace ' + m + ' min';
        const h = Math.floor(m / 60);
        if (h < 24) return 'Hace ' + h + 'h';
        const d = Math.floor(h / 24);
        return d === 1 ? 'Ayer' : 'Hace ' + d + ' días';
    }

    function classify (title, desc) {
        var t = (title + ' ' + (desc || '')).toLowerCase();
        for (var cat in CFG.CATEGORIES) {
            if (CFG.CATEGORIES[cat].some(function(k){ return t.indexOf(k) !== -1; })) return cat;
        }
        return 'economy';
    }

    function impactOf (title, desc) {
        var t = (title + ' ' + (desc || '')).toLowerCase();
        var hi = ['fed','federal reserve','ecb','tasa','rate','guerra','war','crisis','crash','recesión','recession','nonfarm','nfp','cpi'];
        var md = ['bitcoin','ethereum','oro','gold','oil','petróleo','earnings','pmi','gdp'];
        if (hi.some(function(k){ return t.indexOf(k) !== -1; })) return 'high';
        if (md.some(function(k){ return t.indexOf(k) !== -1; })) return 'medium';
        return 'low';
    }

    function tagsOf (title, desc) {
        var t = (title + ' ' + (desc || '')).toLowerCase();
        var map = {
            'Fed':['fed','federal reserve'], 'Forex':['forex','eur/usd','gbp/usd','usd/jpy'],
            'Crypto':['bitcoin','btc','ethereum','eth','crypto'], 'Oro':['gold','oro','xau'],
            'Petróleo':['oil','petróleo','wti','brent'], 'Tasas':['rate','tasa','interest'],
            'Wall St':['nasdaq','dow','s&p','wall street']
        };
        var out = [];
        for (var tag in map) {
            if (map[tag].some(function(k){ return t.indexOf(k) !== -1; })) out.push(tag);
        }
        return out.slice(0, 3);
    }

    function enrichArticle (a) {
        return {
            title:       a.title,
            description: a.description || '',
            url:         a.url || '#',
            urlToImage:  a.urlToImage || null,
            publishedAt: a.publishedAt,
            source:      a.source || { name: 'Desconocido' },
            category:    a.category || classify(a.title, a.description),
            impact:      a.impact   || impactOf(a.title, a.description),
            tags:        a.tags     || tagsOf(a.title, a.description)
        };
    }

    var catIcon    = { forex:'fa-exchange-alt', crypto:'fab fa-bitcoin', stocks:'fa-chart-line', commodities:'fa-gem', economy:'fa-landmark' };
    var catName    = { forex:'Forex', crypto:'Crypto', stocks:'Acciones', commodities:'Commodities', economy:'Economía' };
    var impactName = { high:'Alto', medium:'Medio', low:'Bajo' };

    // ================================================
    // BACKEND
    // ================================================
    async function fetchNews () {
        try {
            var res = await fetch(CFG.BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: 'trading OR forex OR "stock market" OR cryptocurrency OR commodities OR "Federal Reserve"'
                })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            var data = await res.json();
            if (data.success && data.articles && data.articles.length > 0) {
                console.log('[News] \u2713 ' + data.articles.length + ' noticias en vivo (key #' + (data.key_used || '?') + ')');
                state.isLive = true;
                return data.articles
                    .filter(function(a){ return a.title && a.title !== '[Removed]'; })
                    .map(enrichArticle);
            }
            throw new Error(data.message || 'Sin artículos');
        } catch (e) {
            console.warn('[News] Backend no disponible:', e.message, '\u2192 datos demo');
            state.isLive = false;
            return DEMO_NEWS;
        }
    }

    // ================================================
    // RENDER
    // ================================================
    function cardHTML (n, featured) {
        var recent  = (Date.now() - new Date(n.publishedAt).getTime()) < 3600000;
        var icon    = catIcon[n.category] || 'fa-newspaper';
        var hasImg  = n.urlToImage && n.urlToImage.indexOf('http') === 0;

        var imgInner = hasImg
            ? '<img src="' + n.urlToImage + '" alt="" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=fn-card__img-fallback><i class=fas&#x20;' + icon + '></i></div>\'">'
            : '<div class="fn-card__img-fallback"><i class="fas ' + icon + '"></i></div>';

        var tagsHtml = '';
        for (var i = 0; i < n.tags.length; i++) {
            tagsHtml += '<span class="fn-card__tag">' + n.tags[i] + '</span>';
        }

        return '<article class="fn-card ' + (featured ? 'fn-card--featured' : '') + '" data-cat="' + n.category + '">'
            + '<div class="fn-card__img">'
            +   imgInner
            +   '<div class="fn-card__badges">'
            +     '<span class="fn-badge fn-badge--' + n.category + '">' + (catName[n.category] || 'General') + '</span>'
            +     '<span class="fn-badge fn-badge--' + n.impact + '"><i class="fas fa-bolt"></i> ' + impactName[n.impact] + '</span>'
            +   '</div>'
            + '</div>'
            + '<div class="fn-card__body">'
            +   '<div class="fn-card__meta">'
            +     '<span><i class="fas fa-building"></i> ' + n.source.name + '</span>'
            +     '<span class="' + (recent ? 'fn-card__time--recent' : '') + '"><i class="fas fa-clock"></i> ' + relTime(n.publishedAt) + '</span>'
            +   '</div>'
            +   '<h3 class="fn-card__headline">' + n.title + '</h3>'
            +   '<p class="fn-card__excerpt">' + n.description + '</p>'
            +   '<div class="fn-card__foot">'
            +     '<div class="fn-card__tags">' + tagsHtml + '</div>'
            +     '<a href="' + n.url + '" target="_blank" rel="noopener noreferrer" class="fn-card__link">Leer más <i class="fas fa-arrow-right"></i></a>'
            +   '</div>'
            + '</div>'
            + '</article>';
    }

    function render () {
        var feed = document.getElementById('fnFeed');
        if (!feed) return;
        var items = state.filtered.slice(0, state.shown);
        if (!items.length) {
            feed.innerHTML = '<div class="fin-news__empty"><i class="fas fa-inbox"></i><p>No hay noticias para esta categoría</p></div>';
            return;
        }
        var firstHigh = -1;
        for (var i = 0; i < items.length; i++) {
            if (items[i].impact === 'high') { firstHigh = i; break; }
        }
        var html = '';
        for (var j = 0; j < items.length; j++) {
            html += cardHTML(items[j], j === 0 && firstHigh === 0);
        }
        feed.innerHTML = html;
    }

    function renderEvents () {
        var el = document.getElementById('fnEvents');
        if (!el) return;
        var html = '';
        for (var i = 0; i < DEMO_EVENTS.length; i++) {
            var ev = DEMO_EVENTS[i];
            var d = ev.date;
            var dots = '';
            for (var x = 0; x < 3; x++) {
                dots += '<span class="fn-event__dot ' + (x < ev.impact ? 'on' : '') + '"></span>';
            }
            html += '<div class="fn-event">'
                + '<div class="fn-event__date">'
                +   '<span class="fn-event__day">' + d.getDate() + '</span>'
                +   '<span class="fn-event__month">' + d.toLocaleString('es-ES',{month:'short'}) + '</span>'
                +   '<span class="fn-event__hour">' + d.toLocaleString('es-ES',{hour:'2-digit',minute:'2-digit'}) + '</span>'
                + '</div>'
                + '<div class="fn-event__info">'
                +   '<h4>' + ev.title + '</h4>'
                +   '<p>' + ev.desc + '</p>'
                +   '<div class="fn-event__dots">' + dots + '</div>'
                + '</div>'
                + '</div>';
        }
        el.innerHTML = html;
    }

    function updateClock () {
        var el = document.getElementById('fnLastUpdate');
        if (el) el.textContent = new Date().toLocaleString('es-ES', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    }

    function updateMore () {
        var btn = document.getElementById('fnLoadMore');
        if (!btn) return;
        btn.style.display = state.shown < state.filtered.length ? 'inline-flex' : 'none';
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-plus-circle"></i> Cargar más noticias';
    }

    // ================================================
    // FILTRAR
    // ================================================
    function applyFilter (cat) {
        state.category = cat;
        state.filtered = cat === 'all'
            ? state.all.slice()
            : state.all.filter(function(n){ return n.category === cat; });
        var w = { high: 3, medium: 2, low: 1 };
        state.filtered.sort(function(a, b) {
            var dt = new Date(b.publishedAt) - new Date(a.publishedAt);
            return dt || (w[b.impact] - w[a.impact]);
        });
        state.shown = CFG.INITIAL_SHOW;
        render();
        updateMore();
    }

    // ================================================
    // BIND EVENTS (después de inyectar el HTML)
    // ================================================
    function bindEvents () {
        var filters = document.querySelectorAll('.fin-news__filter');
        filters.forEach(function(btn) {
            btn.addEventListener('click', function() {
                filters.forEach(function(b){ b.classList.remove('active'); });
                btn.classList.add('active');
                applyFilter(btn.dataset.cat);
            });
        });
        var more = document.getElementById('fnLoadMore');
        if (more) {
            more.addEventListener('click', function() {
                more.disabled = true;
                more.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando\u2026';
                setTimeout(function() {
                    state.shown += CFG.LOAD_MORE;
                    render();
                    updateMore();
                }, 400);
            });
        }
    }

    // ================================================
    // CARGAR NOTICIAS
    // ================================================
    async function loadNews () {
        var feed = document.getElementById('fnFeed');
        if (!feed) { console.warn('[News] #fnFeed no encontrado'); return; }

        feed.innerHTML = '<div class="fin-news__loader"><div class="fin-news__spinner"></div><p>Cargando noticias financieras\u2026</p></div>';

        try {
            var news = await fetchNews();
            state.all = news;
            applyFilter('all');
            renderEvents();
            updateClock();
            console.log('[News] \u2713 Listo \u2014 ' + (state.isLive ? 'EN VIVO' : 'DEMO') + ' \u2014 ' + news.length + ' noticias');

            // Auto-actualización
            state.timer = setInterval(async function() {
                console.log('[News] Actualizando\u2026');
                var fresh = await fetchNews();
                state.all = fresh;
                applyFilter(state.category);
                updateClock();
            }, CFG.UPDATE_MS);

        } catch (err) {
            console.error('[News] Error fatal:', err);
            feed.innerHTML = '<div class="fin-news__empty"><i class="fas fa-exclamation-triangle" style="color:#ef4444"></i><p>Error al cargar. Recarga la página.</p></div>';
        }
    }

    // ================================================
    // PASO 1: CARGAR HTML → PASO 2: INIT
    // ================================================
    async function bootstrap () {
        var root = document.getElementById(CFG.ROOT_ID);
        if (!root) {
            console.error('[News] No se encontró <div id="' + CFG.ROOT_ID + '">. Agrega este div en tu index.html donde quieras la sección de noticias.');
            return;
        }

        console.log('[News] Cargando estructura HTML desde ' + CFG.HTML_FILE + '\u2026');

        try {
            var res = await fetch(CFG.HTML_FILE);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            var html = await res.text();

            // Inyectar el HTML en el placeholder
            root.innerHTML = html;
            console.log('[News] \u2713 HTML inyectado correctamente');

            // Ahora que el DOM de noticias existe, enlazar eventos y cargar datos
            bindEvents();
            await loadNews();

        } catch (e) {
            console.error('[News] No se pudo cargar ' + CFG.HTML_FILE + ':', e.message);
            root.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#64748b;">'
                + '<i class="fas fa-exclamation-triangle" style="font-size:2rem;margin-bottom:12px;color:#ef4444;display:block;"></i>'
                + '<p>No se pudo cargar la sección de noticias.</p>'
                + '<p style="font-size:.85rem;">Verifica que el archivo <code>news-section.html</code> esté en la misma carpeta que index.html</p>'
                + '</div>';
        }
    }

    // Arrancar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }

    // API pública
    window.FinNews = {
        refresh: loadNews,
        filter:  applyFilter,
        isLive:  function() { return state.isLive; }
    };

})();
