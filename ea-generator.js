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

    const CFG = {
        HTML_FILE:   'ea-generator.html',
        ROOT_ID:     'ea-generator-root',
        BACKEND_URL: 'https://joelpasapera.pythonanywhere.com/api/ea-generate'
    };

    let isGenerating = false;
    let lastGeneratedCode = '';
    let lastFilename = 'GeneratedEA.mq5';

    // ================================================
    // TOKENIZER — resaltado seguro sin regex anidados
    // ================================================

    // Conjuntos de palabras para clasificar tokens
    const KEYWORDS = new Set([
        'input','void','int','double','string','bool','datetime','long','ulong',
        'float','char','short','ushort','uint','color','enum','struct','class',
        'const','static','extern','return','if','else','for','while','do',
        'switch','case','break','continue','default','true','false','NULL',
        'new','delete','virtual','override','private','protected','public',
        'INIT_SUCCEEDED','INIT_FAILED','INIT_PARAMETERS_INCORRECT',
        'ORDER_TYPE_BUY','ORDER_TYPE_SELL','ORDER_TYPE_BUY_LIMIT',
        'ORDER_TYPE_SELL_LIMIT','ORDER_TYPE_BUY_STOP','ORDER_TYPE_SELL_STOP',
        'PERIOD_CURRENT','PERIOD_M1','PERIOD_M5','PERIOD_M15','PERIOD_M30',
        'PERIOD_H1','PERIOD_H4','PERIOD_D1','PERIOD_W1','PERIOD_MN1',
        'MODE_SMA','MODE_EMA','MODE_SMMA','MODE_LWMA',
        'PRICE_CLOSE','PRICE_OPEN','PRICE_HIGH','PRICE_LOW','PRICE_MEDIAN',
        'SYMBOL_TRADE_STOPS_LEVEL','SYMBOL_TRADE_FREEZE_LEVEL',
        'POSITION_TYPE_BUY','POSITION_TYPE_SELL',
        'INVALID_HANDLE','WRONG_VALUE','EMPTY_VALUE',
        'ACCOUNT_MARGIN_MODE','ACCOUNT_MARGIN_LEVEL','ACCOUNT_FREE_MARGIN',
        'clrNONE','clrRed','clrGreen','clrBlue'
    ]);

    const TYPES = new Set([
        'CTrade','MqlTick','MqlRates','MqlTradeRequest','MqlTradeResult',
        'MqlDateTime','ENUM_TIMEFRAMES','ENUM_MA_METHOD','ENUM_APPLIED_PRICE',
        'ENUM_ORDER_TYPE','ENUM_POSITION_TYPE','ENUM_SYMBOL_INFO_DOUBLE',
        'ENUM_SYMBOL_INFO_INTEGER','ENUM_ACCOUNT_INFO_DOUBLE',
        'ENUM_INIT_RETCODE','ENUM_ORDER_TYPE_FILLING'
    ]);

    const FUNCTIONS = new Set([
        'OnInit','OnDeinit','OnTick','OnTimer','OnCalculate','OnChartEvent',
        'iMA','iRSI','iMACD','iATR','iBands','iStochastic','iCCI','iADX',
        'iCustom','iVolumes','iOBV',
        'CopyBuffer','CopyRates','CopyClose','CopyOpen','CopyHigh','CopyLow',
        'SymbolInfoTick','SymbolInfoDouble','SymbolInfoInteger','SymbolInfoString',
        'NormalizeDouble','OrderSend','OrderModify','OrderDelete',
        'PositionSelect','PositionSelectByTicket','PositionGetInteger',
        'PositionGetDouble','PositionGetString','PositionsTotal',
        'OrdersTotal','HistoryOrderSelect','HistoryDealSelect',
        'Print','Alert','Comment','PrintFormat','StringFormat',
        'MathAbs','MathMax','MathMin','MathPow','MathSqrt','MathRound',
        'MathFloor','MathCeil','MathRand',
        'TimeCurrent','TimeLocal','TimeToString','StringToTime',
        'Symbol','Period','Point','Digits','_Symbol','_Period','_Point','_Digits',
        'AccountInfoDouble','AccountInfoInteger','AccountInfoString',
        'ArraySetAsSeries','ArrayResize','ArraySize','ArrayInitialize',
        'StringLen','StringSubstr','StringFind','StringReplace',
        'ObjectCreate','ObjectDelete','ObjectSetInteger','ObjectSetDouble',
        'ChartRedraw','Sleep','ExpertRemove',
        'Buy','Sell','PositionOpen','PositionClose','PositionModify',
        'BuyLimit','SellLimit','BuyStop','SellStop',
        'SetExpertMagicNumber','SetDeviationInPoints',
        'ResultRetcode','ResultDeal'
    ]);

    /**
     * Tokeniza código MQL5 en un array de { type, text }.
     * Tipos: comment, string, preproc, keyword, type, function, number, symbol, plain
     */
    function tokenize(code) {
        const tokens = [];
        let i = 0;
        const len = code.length;

        while (i < len) {
            // -- Comentario de bloque --
            if (code[i] === '/' && code[i + 1] === '*') {
                let end = code.indexOf('*/', i + 2);
                if (end === -1) end = len - 2;
                tokens.push({ type: 'comment', text: code.slice(i, end + 2) });
                i = end + 2;
                continue;
            }

            // -- Comentario de línea --
            if (code[i] === '/' && code[i + 1] === '/') {
                let end = code.indexOf('\n', i);
                if (end === -1) end = len;
                tokens.push({ type: 'comment', text: code.slice(i, end) });
                i = end;
                continue;
            }

            // -- String con comillas dobles --
            if (code[i] === '"') {
                let j = i + 1;
                while (j < len && code[j] !== '"') {
                    if (code[j] === '\\') j++; // saltar escape
                    j++;
                }
                tokens.push({ type: 'string', text: code.slice(i, j + 1) });
                i = j + 1;
                continue;
            }

            // -- String con comillas simples --
            if (code[i] === "'") {
                let j = i + 1;
                while (j < len && code[j] !== "'") {
                    if (code[j] === '\\') j++;
                    j++;
                }
                tokens.push({ type: 'string', text: code.slice(i, j + 1) });
                i = j + 1;
                continue;
            }

            // -- Preprocesador --
            if (code[i] === '#') {
                let end = i + 1;
                while (end < len && /[a-zA-Z_]/.test(code[end])) end++;
                tokens.push({ type: 'preproc', text: code.slice(i, end) });
                i = end;
                continue;
            }

            // -- Identificador o palabra clave --
            if (/[a-zA-Z_]/.test(code[i])) {
                let end = i + 1;
                while (end < len && /[a-zA-Z0-9_]/.test(code[end])) end++;
                const word = code.slice(i, end);

                let type = 'plain';
                if (KEYWORDS.has(word))  type = 'keyword';
                else if (TYPES.has(word))     type = 'type';
                else if (FUNCTIONS.has(word)) type = 'function';

                tokens.push({ type, text: word });
                i = end;
                continue;
            }

            // -- Número --
            if (/[0-9]/.test(code[i]) || (code[i] === '.' && i + 1 < len && /[0-9]/.test(code[i + 1]))) {
                let end = i;
                // parte entera
                while (end < len && /[0-9]/.test(code[end])) end++;
                // punto decimal
                if (end < len && code[end] === '.') {
                    end++;
                    while (end < len && /[0-9]/.test(code[end])) end++;
                }
                tokens.push({ type: 'number', text: code.slice(i, end) });
                i = end;
                continue;
            }

            // -- Operadores y símbolos --
            if (/[{}()\[\];,=+\-*/<>!&|^~%?:]/.test(code[i])) {
                tokens.push({ type: 'symbol', text: code[i] });
                i++;
                continue;
            }

            // -- Espacio en blanco y otros (preservar tal cual) --
            let end = i + 1;
            while (end < len &&
                   !/[a-zA-Z_0-9"'#/{}()\[\];,=+\-*<>!&|^~%?:]/.test(code[end]) &&
                   code[end] !== '.') {
                end++;
            }
            tokens.push({ type: 'plain', text: code.slice(i, end) });
            i = end;
        }

        return tokens;
    }

    /**
     * Convierte tokens a HTML con clases CSS.
     * Agrega números de línea por línea.
     */
    function tokensToHTML(tokens) {
        // Primero construir el texto coloreado completo
        let colored = '';
        for (const tok of tokens) {
            const escaped = tok.text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            if (tok.type === 'plain') {
                colored += escaped;
            } else {
                colored += '<span class="tok-' + tok.type + '">' + escaped + '</span>';
            }
        }

        // Dividir en líneas y envolver cada una para números de línea
        const lines = colored.split('\n');
        return lines.map(line => '<span class="code-line">' + (line || ' ') + '</span>').join('\n');
    }

    /**
     * Pipeline completo: código fuente → HTML con highlighting y line numbers.
     */
    function highlightMQL5(code) {
        const tokens = tokenize(code);
        return tokensToHTML(tokens);
    }

    // ================================================
    // UTILIDADES
    // ================================================

    /** Extraer código limpio de respuesta de IA */
    function extractCode(raw) {
        if (!raw) return '';
        let code = raw.replace(/```(?:mql5|mq5|cpp|c\+\+)?\s*\n?/gi, '');
        code = code.replace(/```\s*$/gm, '');
        return code.trim();
    }

    /** Sanitizar nombre de archivo */
    function sanitizeFilename(name) {
        let clean = name.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
        if (!clean) clean = 'GeneratedEA';
        if (!clean.endsWith('.mq5')) clean += '.mq5';
        return clean;
    }

    function countLines(code) {
        return code ? code.split('\n').length : 0;
    }

    // ================================================
    // DESCARGAR / COPIAR
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

    async function copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.cssText = 'position:fixed;left:-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            return true;
        } catch (e) {
            console.error('[EA] Copy error:', e);
            return false;
        }
    }

    // ================================================
    // RENDER ESTADOS
    // ================================================

    function showEmpty(area) {
        area.innerHTML =
            '<div class="ea-gen__empty-state">' +
                '<div class="ea-gen__empty-icon"><i class="fas fa-robot"></i></div>' +
                '<div class="ea-gen__empty-title">Tu código aparecerá aquí</div>' +
                '<div class="ea-gen__empty-desc">Describe el bot que necesitas y presiona "Generar Expert Advisor"</div>' +
            '</div>';
    }

    function showLoading(area) {
        area.innerHTML =
            '<div class="ea-gen__loading">' +
                '<div class="ea-gen__spinner"></div>' +
                '<div class="ea-gen__loading-text">Generando Expert Advisor…</div>' +
                '<div class="ea-gen__loading-sub">La IA está escribiendo tu código MQL5</div>' +
            '</div>';
    }

    function showError(area, msg) {
        area.innerHTML =
            '<div class="ea-gen__empty-state">' +
                '<div class="ea-gen__empty-icon" style="color:#ef4444"><i class="fas fa-exclamation-triangle"></i></div>' +
                '<div class="ea-gen__empty-title" style="color:#f87171">Error al generar</div>' +
                '<div class="ea-gen__empty-desc">' + msg + '</div>' +
            '</div>';
    }

    function showCode(area, code) {
        const html = highlightMQL5(code);
        area.innerHTML = '<pre class="ea-gen__code-pre">' + html + '</pre>';
        // Scroll al inicio
        area.scrollTop = 0;
    }

    // ================================================
    // GENERAR EA
    // ================================================

    async function generateEA(prompt, eaName) {
        if (isGenerating) return;
        isGenerating = true;

        const codeArea   = document.getElementById('eaCodeArea');
        const actions    = document.getElementById('eaActions');
        const submitBtn  = document.getElementById('eaSubmitBtn');
        const statusDot  = document.getElementById('eaStatusDot');
        const statusText = document.getElementById('eaStatusText');
        const lineCount  = document.getElementById('eaLineCount');
        const filenameEl = document.getElementById('eaFilename');

        // Determinar nombre del archivo
        lastFilename = eaName ? sanitizeFilename(eaName) : sanitizeFilename(prompt.split(/\s+/).slice(0, 3).join('_'));

        // UI → Loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando…';
        actions.style.display = 'none';
        statusDot.className = 'ea-gen__status-dot active';
        statusText.textContent = 'Generando código MQL5…';
        filenameEl.querySelector('span').textContent = lastFilename;
        showLoading(codeArea);

        // Agregar nombre al prompt si se proporcionó
        let fullPrompt = prompt;
        if (eaName) {
            fullPrompt = 'Nombre del EA: "' + eaName + '". ' + prompt;
        }

        try {
            console.log('[EA] Enviando solicitud…');

            const response = await fetch(CFG.BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error('HTTP ' + response.status);

            const data = await response.json();

            if (data.success && data.code) {
                const code = extractCode(data.code);
                lastGeneratedCode = code;

                showCode(codeArea, code);
                actions.style.display = 'flex';
                statusDot.className = 'ea-gen__status-dot active';
                statusText.textContent = 'Código generado correctamente';
                lineCount.textContent = countLines(code) + ' líneas · MQL5';

                console.log('[EA] ✓ ' + countLines(code) + ' líneas generadas');
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
        const submitBtn = document.getElementById('eaSubmitBtn');
        const textarea  = document.getElementById('eaPromptInput');
        const nameInput = document.getElementById('eaNameInput');
        const charCount = document.getElementById('eaCharCount');

        // Contador de caracteres
        if (textarea && charCount) {
            textarea.addEventListener('input', () => {
                charCount.textContent = textarea.value.length + ' / 5000';
            });
        }

        // Generar
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
                const eaName = nameInput ? nameInput.value.trim() : '';
                generateEA(prompt, eaName);
            });

            // Ctrl+Enter
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    submitBtn.click();
                }
            });
        }

        // Sugerencias rápidas
        document.querySelectorAll('.ea-gen__suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-prompt');
                const name = btn.getAttribute('data-name');
                if (textarea && prompt) {
                    textarea.value = prompt;
                    if (charCount) charCount.textContent = prompt.length + ' / 5000';
                }
                if (nameInput && name) {
                    nameInput.value = name;
                }
                // Auto-generar
                if (prompt) generateEA(prompt, name || '');
            });
        });

        // Copiar
        const copyBtn = document.getElementById('eaCopyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                if (!lastGeneratedCode) return;
                const ok = await copyToClipboard(lastGeneratedCode);
                const orig = copyBtn.innerHTML;
                copyBtn.innerHTML = ok
                    ? '<i class="fas fa-check"></i> Copiado!'
                    : '<i class="fas fa-times"></i> Error';
                setTimeout(() => { copyBtn.innerHTML = orig; }, 2000);
            });
        }

        // Descargar
        const downloadBtn = document.getElementById('eaDownloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (!lastGeneratedCode) return;
                downloadFile(lastGeneratedCode, lastFilename);
                const orig = downloadBtn.innerHTML;
                downloadBtn.innerHTML = '<i class="fas fa-check"></i> Descargado!';
                setTimeout(() => { downloadBtn.innerHTML = orig; }, 2000);
            });
        }

        console.log('[EA] ✓ Eventos enlazados');
    }

    // ================================================
    // BOOTSTRAP
    // ================================================

    async function bootstrap() {
        const root = document.getElementById(CFG.ROOT_ID);
        if (!root) {
            console.error('[EA] No se encontró #' + CFG.ROOT_ID);
            return;
        }

        try {
            const res = await fetch(CFG.HTML_FILE);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            root.innerHTML = await res.text();
            console.log('[EA] ✓ HTML inyectado');
            bindEvents();
            console.log('[EA] ✓ Generador listo');
        } catch (e) {
            console.error('[EA] Error cargando HTML:', e.message);
            root.innerHTML =
                '<div style="text-align:center;padding:60px 20px;color:#64748b;">' +
                    '<i class="fas fa-exclamation-triangle" style="font-size:2rem;margin-bottom:12px;color:#ef4444;display:block;"></i>' +
                    '<p>No se pudo cargar el generador de Expert Advisors.</p>' +
                '</div>';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }

    window.EAGenerator = {
        generate: generateEA,
        getLastCode: function () { return lastGeneratedCode; },
        download: function () { if (lastGeneratedCode) downloadFile(lastGeneratedCode, lastFilename); }
    };

})();
