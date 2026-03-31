/**
 * GENERADOR DE PINE SCRIPT v6 — Frontend
 * Joel Pasapera · Trading Algorítmico
 */

;(function () {
    'use strict';

    const CFG = {
        HTML_FILE:   'pine-generator.html',
        ROOT_ID:     'pine-generator-root',
        BACKEND_URL: 'https://joelpasapera.pythonanywhere.com/api/pine-generate'
    };

    let isGenerating = false;
    let lastCode = '';
    let lastFilename = 'script.pine';
    let scriptType = 'strategy'; // strategy | indicator

    // ================================================
    // PINE SCRIPT TOKENIZER
    // ================================================

    const KEYWORDS = new Set([
        'if','else','for','while','switch','var','varip','import','export',
        'method','type','enum','not','and','or','true','false','na',
        'strategy','indicator','library'
    ]);

    const BUILTINS = new Set([
        'open','high','low','close','volume','time','time_close','bar_index',
        'last_bar_index','timenow','na','ohlc4','hlc3','hlcc4','hl2',
        'syminfo.mintick','syminfo.ticker','syminfo.tickerid','syminfo.currency',
        'syminfo.basecurrency','syminfo.pointvalue','syminfo.type','syminfo.timezone',
        'barstate.isfirst','barstate.islast','barstate.ishistory','barstate.isrealtime',
        'barstate.isconfirmed','barstate.isnew','barstate.islastconfirmedhistory',
        'session.ismarket','session.ispremarket','session.ispostmarket',
        'strategy.long','strategy.short','strategy.position_size',
        'strategy.equity','strategy.netprofit','strategy.openprofit',
        'strategy.closedtrades','strategy.opentrades','strategy.wintrades',
        'strategy.losstrades','strategy.initial_capital','strategy.cash',
        'strategy.percent_of_equity','strategy.fixed',
        'strategy.commission.percent','strategy.commission.cash_per_contract',
        'strategy.direction.all','strategy.direction.long','strategy.direction.short',
        'strategy.oca.cancel','strategy.oca.none','strategy.oca.reduce',
        'dayofweek','dayofmonth','month','year','hour','minute','second',
        'timeframe.period','timeframe.multiplier','timeframe.isdaily',
        'timeframe.isintraday','timeframe.isweekly','timeframe.ismonthly'
    ]);

    const FUNCTIONS = new Set([
        'ta.sma','ta.ema','ta.rsi','ta.macd','ta.atr','ta.bb','ta.bbw','ta.cci',
        'ta.stoch','ta.rma','ta.wma','ta.vwma','ta.hma','ta.alma','ta.linreg',
        'ta.supertrend','ta.sar','ta.mfi','ta.dmi','ta.mom','ta.roc','ta.tsi',
        'ta.cmo','ta.cog','ta.wpr','ta.kc','ta.kcw','ta.tr','ta.vwap',
        'ta.crossover','ta.crossunder','ta.cross','ta.change','ta.cum',
        'ta.highest','ta.lowest','ta.highestbars','ta.lowestbars',
        'ta.rising','ta.falling','ta.barssince','ta.valuewhen',
        'ta.stdev','ta.dev','ta.variance','ta.correlation','ta.median',
        'ta.percentrank','ta.percentile_nearest_rank','ta.pivothigh','ta.pivotlow',
        'math.abs','math.max','math.min','math.round','math.ceil','math.floor',
        'math.sqrt','math.pow','math.log','math.log10','math.avg','math.sum',
        'math.sign','math.random','math.round_to_mintick','math.pi',
        'str.tostring','str.tonumber','str.format','str.contains','str.length',
        'str.replace_all','str.upper','str.lower','str.split','str.substring',
        'strategy.entry','strategy.exit','strategy.close','strategy.close_all',
        'strategy.cancel','strategy.cancel_all','strategy.order',
        'strategy.risk.allow_entry_in','strategy.risk.max_drawdown',
        'strategy.risk.max_position_size','strategy.risk.max_intraday_loss',
        'strategy.opentrades.entry_price','strategy.opentrades.size',
        'strategy.closedtrades.entry_price','strategy.closedtrades.exit_price',
        'strategy.closedtrades.profit','strategy.closedtrades.profit_percent',
        'strategy.default_entry_qty','strategy.convert_to_account',
        'request.security','request.security_lower_tf',
        'input','input.bool','input.int','input.float','input.string',
        'input.color','input.source','input.timeframe','input.symbol',
        'input.session','input.price','input.text_area','input.enum',
        'plot','plotshape','plotchar','plotarrow','plotcandle','plotbar',
        'bgcolor','barcolor','fill','hline',
        'alert','alertcondition',
        'label.new','label.set_text','label.set_color','label.delete',
        'line.new','line.set_xy1','line.set_xy2','line.delete',
        'box.new','box.delete','table.new','table.cell',
        'color.new','color.rgb','color.from_gradient',
        'array.new_float','array.new_int','array.push','array.pop',
        'array.get','array.set','array.size','array.avg','array.sum',
        'array.max','array.min','array.sort','array.from',
        'nz','fixnan','na','timestamp','timeframe.change',
        'time','time_close','year','month','dayofmonth','dayofweek',
        'hour','minute','second','weekofyear'
    ]);

    const CONSTANTS = new Set([
        'color.red','color.green','color.blue','color.white','color.black',
        'color.yellow','color.orange','color.purple','color.lime','color.aqua',
        'color.fuchsia','color.gray','color.silver','color.maroon','color.navy',
        'color.olive','color.teal',
        'shape.triangleup','shape.triangledown','shape.arrowup','shape.arrowdown',
        'shape.circle','shape.cross','shape.xcross','shape.diamond','shape.flag',
        'shape.square','shape.labelup','shape.labeldown',
        'plot.style_line','plot.style_stepline','plot.style_histogram',
        'plot.style_columns','plot.style_circles','plot.style_cross',
        'plot.style_area','plot.style_areabr',
        'label.style_label_up','label.style_label_down','label.style_label_left',
        'label.style_label_right','label.style_none','label.style_circle',
        'line.style_solid','line.style_dashed','line.style_dotted',
        'extend.none','extend.left','extend.right','extend.both',
        'location.abovebar','location.belowbar','location.top','location.bottom',
        'location.absolute',
        'size.auto','size.tiny','size.small','size.normal','size.large','size.huge',
        'xloc.bar_index','xloc.bar_time',
        'yloc.price','yloc.abovebar','yloc.belowbar',
        'position.top_left','position.top_center','position.top_right',
        'position.middle_left','position.middle_center','position.middle_right',
        'position.bottom_left','position.bottom_center','position.bottom_right',
        'display.all','display.none','display.pane','display.price_scale',
        'format.price','format.volume','format.percent','format.inherit',
        'scale.left','scale.right','scale.none',
        'font.family_default','font.family_monospace',
        'session.regular','session.extended',
        'currency.USD','currency.EUR','currency.GBP','currency.JPY',
        'alert.freq_all','alert.freq_once_per_bar','alert.freq_once_per_bar_close',
        'hline.style_solid','hline.style_dashed','hline.style_dotted',
        'text.align_left','text.align_center','text.align_right',
        'order.ascending','order.descending',
        'barmerge.gaps_off','barmerge.gaps_on',
        'barmerge.lookahead_off','barmerge.lookahead_on'
    ]);

    function tokenize(code) {
        const tokens = []; let i = 0; const len = code.length;
        while (i < len) {
            // Block comment
            if (code[i]==='/'&&code[i+1]==='*') {
                let e=code.indexOf('*/',i+2); if(e===-1)e=len-2;
                tokens.push({type:'comment',text:code.slice(i,e+2)}); i=e+2; continue;
            }
            // Line comment
            if (code[i]==='/'&&code[i+1]==='/') {
                let e=code.indexOf('\n',i); if(e===-1)e=len;
                tokens.push({type:'comment',text:code.slice(i,e)}); i=e; continue;
            }
            // Annotation //@version, //@strategy_alert_message etc
            if (code[i]==='/'&&code[i+1]==='/'&&code[i+2]==='@') {
                let e=code.indexOf('\n',i); if(e===-1)e=len;
                tokens.push({type:'annotation',text:code.slice(i,e)}); i=e; continue;
            }
            // String double
            if (code[i]==='"') {
                let j=i+1; while(j<len&&code[j]!=='"'){if(code[j]==='\\')j++;j++;}
                tokens.push({type:'string',text:code.slice(i,j+1)}); i=j+1; continue;
            }
            // String single
            if (code[i]==="'") {
                let j=i+1; while(j<len&&code[j]!=="'"){if(code[j]==='\\')j++;j++;}
                tokens.push({type:'string',text:code.slice(i,j+1)}); i=j+1; continue;
            }
            // Identifier (possibly dotted like ta.sma, strategy.entry)
            if (/[a-zA-Z_]/.test(code[i])) {
                let e=i+1;
                while(e<len&&/[a-zA-Z0-9_.]/.test(code[e])) e++;
                const word=code.slice(i,e);
                let t='plain';
                if(KEYWORDS.has(word)) t='keyword';
                else if(FUNCTIONS.has(word)) t='function';
                else if(BUILTINS.has(word)) t='builtin';
                else if(CONSTANTS.has(word)) t='const';
                else if(word==='int'||word==='float'||word==='bool'||word==='string'||word==='color'||word==='label'||word==='line'||word==='box'||word==='table'||word==='array'||word==='matrix'||word==='map') t='type';
                tokens.push({type:t,text:word}); i=e; continue;
            }
            // Number
            if (/[0-9]/.test(code[i])||(code[i]==='.'&&i+1<len&&/[0-9]/.test(code[i+1]))) {
                let e=i; while(e<len&&/[0-9]/.test(code[e]))e++;
                if(e<len&&code[e]==='.'){e++;while(e<len&&/[0-9]/.test(code[e]))e++;}
                tokens.push({type:'number',text:code.slice(i,e)}); i=e; continue;
            }
            // Symbols
            if (/[{}()\[\];,=+\-*/<>!&|^~%?:]/.test(code[i])) {
                tokens.push({type:'symbol',text:code[i]}); i++; continue;
            }
            // Whitespace / other
            let e=i+1;
            while(e<len&&!/[a-zA-Z_0-9"'/#{}()\[\];,=+\-*<>!&|^~%?:]/.test(code[e])&&code[e]!=='.') e++;
            tokens.push({type:'plain',text:code.slice(i,e)}); i=e;
        }
        return tokens;
    }

    function tokensToHTML(tokens) {
        let c='';
        for(const t of tokens) {
            const e=t.text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            c += t.type==='plain' ? e : '<span class="tok-'+t.type+'">'+e+'</span>';
        }
        return c.split('\n').map(l=>'<span class="code-line">'+(l||' ')+'</span>').join('\n');
    }

    function highlightPine(code) { return tokensToHTML(tokenize(code)); }

    // ================================================
    // UTILS
    // ================================================

    function extractCode(raw) {
        if(!raw) return '';
        let c = raw.replace(/```(?:pine|pinescript|javascript)?\s*\n?/gi,'');
        c = c.replace(/```\s*$/gm,'');
        return c.trim();
    }

    function sanitizeFilename(name) {
        let clean = name.replace(/[^a-zA-Z0-9_\-]/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,'');
        if(!clean) clean = 'PineScript';
        if(!clean.endsWith('.pine')) clean += '.pine';
        return clean;
    }

    function countLines(c) { return c ? c.split('\n').length : 0; }

    function downloadFile(code, filename) {
        const blob = new Blob([code],{type:'text/plain;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href=url; a.download=filename;
        document.body.appendChild(a); a.click();
        setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},100);
    }

    async function copyToClipboard(text) {
        try {
            if(navigator.clipboard&&window.isSecureContext) await navigator.clipboard.writeText(text);
            else { const ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;left:-9999px';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta); }
            return true;
        } catch(e) { return false; }
    }

    // ================================================
    // RENDER
    // ================================================

    function showLoading(area) {
        area.innerHTML='<div class="pine-gen__loading"><div class="pine-gen__spinner"></div><div class="pine-gen__loading-text">Generando Pine Script…</div><div class="pine-gen__loading-sub">La IA está escribiendo tu código</div></div>';
    }

    function showError(area, msg) {
        area.innerHTML='<div class="pine-gen__empty-state"><div class="pine-gen__empty-icon" style="color:#ef4444"><i class="fas fa-exclamation-triangle"></i></div><div class="pine-gen__empty-title" style="color:#f87171">Error</div><div class="pine-gen__empty-desc">'+msg+'</div></div>';
    }

    function showCode(area, code) {
        area.innerHTML='<pre class="pine-gen__code-pre">'+highlightPine(code)+'</pre>';
        area.scrollTop=0;
    }

    // ================================================
    // GENERATE
    // ================================================

    async function generate(prompt, name, type) {
        if(isGenerating) return;
        isGenerating = true;

        const codeArea=document.getElementById('pineCodeArea');
        const actions=document.getElementById('pineActions');
        const submitBtn=document.getElementById('pineSubmitBtn');
        const statusDot=document.getElementById('pineStatusDot');
        const statusText=document.getElementById('pineStatusText');
        const lineCount=document.getElementById('pineLineCount');
        const filenameEl=document.getElementById('pineFilename');

        lastFilename = name ? sanitizeFilename(name) : sanitizeFilename(prompt.split(/\s+/).slice(0,3).join('_'));

        submitBtn.disabled=true;
        submitBtn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Generando…';
        actions.style.display='none';
        statusDot.className='pine-gen__status-dot active';
        statusText.textContent='Generando código Pine Script…';
        filenameEl.querySelector('span').textContent=lastFilename;
        showLoading(codeArea);

        let fullPrompt = 'Tipo de script: '+type+'. ';
        if(name) fullPrompt += 'Nombre: "'+name+'". ';
        fullPrompt += prompt;

        try {
            const response = await fetch(CFG.BACKEND_URL, {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({ prompt:fullPrompt, script_type:type, timestamp:new Date().toISOString() })
            });
            if(!response.ok) throw new Error('HTTP '+response.status);
            const data = await response.json();

            if(data.success && data.code) {
                const code = extractCode(data.code);
                lastCode = code;
                showCode(codeArea, code);
                actions.style.display='flex';
                statusDot.className='pine-gen__status-dot active';
                statusText.textContent='Código generado correctamente';
                lineCount.textContent=countLines(code)+' líneas · Pine Script v6';
            } else {
                throw new Error(data.message||'No se pudo generar el código');
            }
        } catch(error) {
            showError(codeArea, error.message||'Error de conexión.');
            statusDot.className='pine-gen__status-dot';
            statusText.textContent='Error en la generación';
        } finally {
            isGenerating=false;
            submitBtn.disabled=false;
            submitBtn.innerHTML='<i class="fas fa-code"></i> Generar Pine Script';
        }
    }

    // ================================================
    // BIND
    // ================================================

    function bindEvents() {
        const submitBtn=document.getElementById('pineSubmitBtn');
        const textarea=document.getElementById('pinePromptInput');
        const nameInput=document.getElementById('pineNameInput');
        const charCount=document.getElementById('pineCharCount');
        const typeStrategy=document.getElementById('pineTypeStrategy');
        const typeIndicator=document.getElementById('pineTypeIndicator');

        // Type selector
        [typeStrategy,typeIndicator].forEach(btn=>{
            if(!btn) return;
            btn.addEventListener('click',()=>{
                typeStrategy.classList.remove('active');
                typeIndicator.classList.remove('active');
                btn.classList.add('active');
                scriptType=btn.dataset.type;
            });
        });

        // Char counter
        if(textarea&&charCount) textarea.addEventListener('input',()=>{ charCount.textContent=textarea.value.length+' / 5000'; });

        // Submit
        if(submitBtn&&textarea) {
            submitBtn.addEventListener('click',()=>{
                const prompt=textarea.value.trim();
                if(!prompt) { textarea.focus(); textarea.style.borderColor='rgba(239,68,68,.5)'; setTimeout(()=>{textarea.style.borderColor='';},1500); return; }
                generate(prompt, nameInput?nameInput.value.trim():'', scriptType);
            });
            textarea.addEventListener('keydown',(e)=>{
                if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();submitBtn.click();}
            });
        }

        // Suggestions
        document.querySelectorAll('.pine-gen__suggestion').forEach(btn=>{
            btn.addEventListener('click',()=>{
                const prompt=btn.getAttribute('data-prompt');
                const name=btn.getAttribute('data-name');
                const type=btn.getAttribute('data-type');
                if(textarea&&prompt){ textarea.value=prompt; if(charCount) charCount.textContent=prompt.length+' / 5000'; }
                if(nameInput&&name) nameInput.value=name;
                if(type) {
                    scriptType=type;
                    document.getElementById('pineTypeStrategy').classList.toggle('active',type==='strategy');
                    document.getElementById('pineTypeIndicator').classList.toggle('active',type==='indicator');
                }
                if(prompt) generate(prompt, name||'', type||'strategy');
            });
        });

        // Copy
        const copyBtn=document.getElementById('pineCopyBtn');
        if(copyBtn) copyBtn.addEventListener('click',async()=>{
            if(!lastCode)return;
            const ok=await copyToClipboard(lastCode);
            const orig=copyBtn.innerHTML;
            copyBtn.innerHTML=ok?'<i class="fas fa-check"></i> Copiado!':'<i class="fas fa-times"></i> Error';
            setTimeout(()=>{copyBtn.innerHTML=orig;},2000);
        });

        // Download
        const dlBtn=document.getElementById('pineDownloadBtn');
        if(dlBtn) dlBtn.addEventListener('click',()=>{
            if(!lastCode)return;
            downloadFile(lastCode,lastFilename);
            const orig=dlBtn.innerHTML;
            dlBtn.innerHTML='<i class="fas fa-check"></i> Descargado!';
            setTimeout(()=>{dlBtn.innerHTML=orig;},2000);
        });
    }

    // ================================================
    // BOOTSTRAP
    // ================================================

    async function bootstrap() {
        const root=document.getElementById(CFG.ROOT_ID);
        if(!root){console.error('[Pine] No #'+CFG.ROOT_ID);return;}
        try {
            const res=await fetch(CFG.HTML_FILE);
            if(!res.ok)throw new Error('HTTP '+res.status);
            root.innerHTML=await res.text();
            bindEvents();
            console.log('[Pine] ✓ Generador Pine Script listo');
        } catch(e) {
            root.innerHTML='<div style="text-align:center;padding:60px;color:#64748b;"><p>No se pudo cargar el generador Pine Script.</p></div>';
        }
    }

    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bootstrap);
    else bootstrap();

    window.PineGenerator = { generate, getLastCode:()=>lastCode, download:()=>{if(lastCode)downloadFile(lastCode,lastFilename);} };
})();
