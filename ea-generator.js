/**
 * GENERADOR DE EXPERT ADVISORS (EA) — Frontend
 * Joel Pasapera · Trading Algorítmico
 *
 * Auto-inyecta ea-generator.html en <div id="ea-generator-root">
 * y gestiona la comunicación con el backend.
 *
 * EN index.html SOLO necesitas:
 *   <head>  → <link rel="stylesheet" href="ea-generator.css">
 *   <body>  → <div id="ea-generator-root"></div>
 *   <body>  → <script src="ea-generator.js"></script>
 */

;(function () {
    'use strict';

    // ================================================
    // CONFIGURACIÓN
    // ================================================
    const CFG = {
        HTML_FILE:   'ea-generator.html',
        ROOT_ID:     'ea-generator-root',
        BACKEND_URL: 'https://joelpasapera.pythonanywhere.com/api/ea-generate'
    };

    // ================================================
    // ESTADO
    // ================================================
    let isGenerating = false;
    let lastGeneratedCode = '';
    let lastFilename = 'GeneratedEA.mq5';

    // ================================================
    // UTILIDADES
    // ================================================

    /**
     * Resaltado de sintaxis básico para MQL5.
     * Transforma texto plano en HTML con clases de color.
     */
    function highlightMQL5(code) {
        // Escapar HTML
        let html = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Comentarios de línea
        html = html.replace(/(\/\/.*)/g, '<span class="hl-comment">$1</span>');
        // Comentarios de bloque
        html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="hl-comment">$1</span>');
        // Strings
        html = html.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="hl-string">$1</span>');
        // Pre-procesador
        html = html.replace(/(#include|#property|#define)\b/g, '<span class="hl-preproc">$1</span>');
        // Keywords
        const keywords = ['input','void','int','double','string','bool','datetime','long','ulong','float','char','short','ushort','uint','color','enum','struct','class','const','static','extern','return','if','else','for','while','do','switch','case','break','continue','default','true','false','NULL','INIT_SUCCEEDED','INIT_FAILED','ORDER_TYPE_BUY','ORDER_TYPE_SELL','PERIOD_CURRENT','MODE_SMA','MODE_EMA','PRICE_CLOSE','PRICE_OPEN','PRICE_HIGH','PRICE_LOW','SYMBOL_TRADE_STOPS_LEVEL','POSITION_TYPE_BUY','POSITION_TYPE_SELL'];
        keywords.forEach(kw => {
            const re = new RegExp('\\b(' + kw + ')\\b', 'g');
            html = html.replace(re, '<span class="hl-keyword">$1</span>');
        });
        // Types
        const types = ['CTrade','MqlTick','MqlRates','MqlTradeRequest','MqlTradeResult','ENUM_TIMEFRAMES','ENUM_MA_METHOD','ENUM_APPLIED_PRICE','ENUM_ORDER_TYPE'];
        types.forEach(t => {
            const re = new RegExp('\\b(' + t + ')\\b', 'g');
            html = html.replace(re, '<span class="hl-type">$1</span>');
        });
        // Functions
        const funcs = ['OnInit','OnDeinit','OnTick','OnTimer','iMA','iRSI','iMACD','iATR','iBands','iStochastic','CopyBuffer','CopyRates','SymbolInfoTick','SymbolInfoDouble','SymbolInfoInteger','NormalizeDouble','OrderSend','PositionSelect','PositionGetInteger','PositionGetDouble','PositionsTotal','OrdersTotal','Print','Alert','Comment','StringFormat','MathAbs','MathMax','MathMin','TimeCurrent','TimeLocal','Symbol','Period','Point','Digits','AccountInfoDouble','AccountInfoInteger'];
        funcs.forEach(fn => {
            const re = new RegExp('\\b(' + fn + ')\\b', 'g');
            html = html.replace(re, '<span class="hl-function">$1</span>');
        });
        // Numbers
        html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="hl-number">$1</span>');

        return html;
    }

    /**
     * Extraer solo el bloque de código de la respuesta de la IA.
     * A veces la IA envuelve en ```mql5 ... ```
     */
    function extractCode(raw) {
        if (!raw) return '';
        // Remover bloques markdown
        let code = raw.replace(/```(?:mql5|mq5|cpp|c\+\+)?\s*\n?/gi, '');
        code = code.replace(/```\s*$/gm, '');
        return code.trim();
    }

    /**
     * Generar nombre de archivo desde el prompt del usuario.
     */
    function generateFilename(prompt) {
        const words = prompt.trim().split(/\s+/).slice(0, 4);
        let name = words.map(w => w.replace(/[^a-zA-Z0-9]/g, '')).filter(Boolean).join('_');
        if (!name) name = 'GeneratedEA';
        return name + '.mq5';
    }

    /**
     * Contar líneas de código.
     */
    function countLines(code) {
        return code ? code.split('\n').length : 0;
    }

    // ================================================
    // DESCARGAR ARCHIVO
    // ================================================
    function downloadFile(code, filename) {
        const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    // ================================================
    // COPIAR AL PORTAPAPELES
    // ================================================
    async function copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            return true;
        } catch (e) {
            console.error('[EA] Error al copiar:', e);
            return false;
        }
    }

    // ================================================
    // RENDER ESTADOS
    // ================================================
    function showEmpty(codeArea) {
        codeArea.innerHTML = `
            <div class="ea-gen__empty-state">
                <div class="ea-gen__empty-icon"><i class="fas fa-robot"></i></div>
                <div class="ea-gen__empty-title">Tu código aparecerá aquí</div>
                <div class="ea-gen__empty-desc">
                    Describe el bot que necesitas en el panel izquierdo 
                    y presiona "Generar Expert Advisor"
                </div>
            </div>`;
    }

    function showLoading(codeArea) {
        codeArea.innerHTML = `
            <div class="ea-gen__loading">
                <div class="ea-gen__spinner"></div>
                <div class="ea-gen__loading-text">Generando Expert Advisor…</div>
                <div class="ea-gen__loading-sub">La IA está escribiendo tu código MQL5</div>
            </div>`;
    }

    function showError(codeArea, message) {
        codeArea.innerHTML = `
            <div class="ea-gen__empty-state">
                <div class="ea-gen__empty-icon" style="color:#ef4444;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="ea-gen__empty-title" style="color:#f87171;">Error al generar</div>
                <div class="ea-gen__empty-desc">${message}</div>
            </div>`;
    }

    function showCode(codeArea, code) {
        const highlighted = highlightMQL5(code);
        codeArea.innerHTML = `<pre class="ea-gen__code-pre">${highlighted}</pre>`;
    }

    // ================================================
    // GENERAR EA (LLAMADA AL BACKEND)
    // ================================================
    async function generateEA(prompt) {
        if (isGenerating) return;
        isGenerating = true;

        const codeArea   = document.getElementById('eaCodeArea');
        const actions    = document.getElementById('eaActions');
        const submitBtn  = document.getElementById('eaSubmitBtn');
        const statusDot  = document.getElementById('eaStatusDot');
        const statusText = document.getElementById('eaStatusText');
        const lineCount  = document.getElementById('eaLineCount');
        const filenameEl = document.getElementById('eaFilename');

        // UI → Loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando…';
        actions.style.display = 'none';
        statusDot.className = 'ea-gen__status-dot active';
        statusText.textContent = 'Generando código MQL5…';
        showLoading(codeArea);

        try {
            console.log('[EA] Enviando solicitud al backend…');

            const response = await fetch(CFG.BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ': ' + response.statusText);
            }

            const data = await response.json();
            console.log('[EA] Respuesta recibida:', data.success);

            if (data.success && data.code) {
                const code = extractCode(data.code);
                lastGeneratedCode = code;
                lastFilename = generateFilename(prompt);

                // Mostrar código
                showCode(codeArea, code);

                // Actualizar UI
                actions.style.display = 'flex';
                filenameEl.querySelector('span').textContent = lastFilename;
                statusDot.className = 'ea-gen__status-dot active';
                statusText.textContent = 'Código generado correctamente';
                lineCount.textContent = countLines(code) + ' líneas · MQL5';

                console.log('[EA] ✓ Código generado: ' + countLines(code) + ' líneas');
            } else {
                throw new Error(data.message || 'No se pudo generar el código');
            }

        } catch (error) {
            console.error('[EA] Error:', error);
            showError(codeArea, error.message || 'Error de conexión. Intenta de nuevo.');
            statusDot.className = 'ea-gen__status-dot';
            statusText.textContent = 'Error en la generación';
        } finally {
            isGenerating = false;
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-cogs"></i> Generar Expert Advisor';
        }
    }

    // ================================================
    // BIND EVENTS
    // ================================================
    function bindEvents() {
        // Botón generar
        const submitBtn = document.getElementById('eaSubmitBtn');
        const textarea  = document.getElementById('eaPromptInput');

        if (submitBtn && textarea) {
            submitBtn.addEventListener('click', () => {
                const prompt = textarea.value.trim();
                if (!prompt) {
                    textarea.focus();
                    textarea.style.borderColor = 'rgba(239,68,68,.5)';
                    textarea.style.boxShadow = '0 0 0 3px rgba(239,68,68,.1)';
                    setTimeout(() => {
                        textarea.style.borderColor = '';
                        textarea.style.boxShadow = '';
                    }, 1500);
                    return;
                }
                generateEA(prompt);
            });

            // Enter + Ctrl para enviar
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    submitBtn.click();
                }
            });
        }

        // Sugerencias rápidas
        const suggestions = document.querySelectorAll('.ea-gen__suggestion');
        suggestions.forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-prompt');
                if (textarea && prompt) {
                    textarea.value = prompt;
                    textarea.focus();
                    // Opcionalmente generar automáticamente
                    generateEA(prompt);
                }
            });
        });

        // Copiar
        const copyBtn = document.getElementById('eaCopyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                if (!lastGeneratedCode) return;
                const ok = await copyToClipboard(lastGeneratedCode);
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = ok
                    ? '<i class="fas fa-check"></i> Copiado'
                    : '<i class="fas fa-times"></i> Error';
                setTimeout(() => { copyBtn.innerHTML = originalHTML; }, 2000);
            });
        }

        // Descargar
        const downloadBtn = document.getElementById('eaDownloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (!lastGeneratedCode) return;
                downloadFile(lastGeneratedCode, lastFilename);
                const originalHTML = downloadBtn.innerHTML;
                downloadBtn.innerHTML = '<i class="fas fa-check"></i> Descargado';
                setTimeout(() => { downloadBtn.innerHTML = originalHTML; }, 2000);
            });
        }

        console.log('[EA] ✓ Eventos enlazados');
    }

    // ================================================
    // BOOTSTRAP: CARGAR HTML → INIT
    // ================================================
    async function bootstrap() {
        const root = document.getElementById(CFG.ROOT_ID);
        if (!root) {
            console.error('[EA] No se encontró <div id="' + CFG.ROOT_ID + '">');
            return;
        }

        console.log('[EA] Cargando estructura HTML…');

        try {
            const res = await fetch(CFG.HTML_FILE);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const html = await res.text();

            root.innerHTML = html;
            console.log('[EA] ✓ HTML inyectado');

            bindEvents();
            console.log('[EA] ✓ Generador de Expert Advisors listo');

        } catch (e) {
            console.error('[EA] No se pudo cargar ' + CFG.HTML_FILE + ':', e.message);
            root.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#64748b;">'
                + '<i class="fas fa-exclamation-triangle" style="font-size:2rem;margin-bottom:12px;color:#ef4444;display:block;"></i>'
                + '<p>No se pudo cargar el generador de Expert Advisors.</p>'
                + '<p style="font-size:.85rem;">Verifica que <code>ea-generator.html</code> esté en la misma carpeta.</p>'
                + '</div>';
        }
    }

    // Arrancar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }

    // API pública
    window.EAGenerator = {
        generate: generateEA,
        getLastCode: function () { return lastGeneratedCode; },
        download: function () { if (lastGeneratedCode) downloadFile(lastGeneratedCode, lastFilename); }
    };

})();
