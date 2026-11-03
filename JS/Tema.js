(function () {
    var TEMAS = ['sea', 'blush', 'sunshine', 'mocha', 'nebula'];
    
    var MAPA_CSS = {
        sea: 'azul',
        blush: 'rosa',
        sunshine: 'naranja',
        mocha: 'cafe',
        nebula: 'morado'
    };

    var DURACION = 10000;
    var CLAVE = 'cosmos_modo_manual';
    var CLAVE_TEMA = 'cosmos_tema_manual';
    var PALETAS = {
        sea: ['#6CB6FF', '#0B2A5B', 'Sea · amanecer'],
        blush: ['#FF6B88', '#B8102F', 'Blush · mañana'],
        sunshine: ['#FBB931', '#EA6113', 'Sunshine · atardecer'],
        mocha: ['#C9A27A', '#6B3F1F', 'Mocha · ocaso'],
        nebula: ['#D934F7', '#5A0B73', 'Nebula · noche']
    };

    function temaManual() {
        try {
            var m = sessionStorage.getItem(CLAVE_TEMA);
            return TEMAS.indexOf(m) >= 0 ? m : null;
        } catch (e) { return null; }
    }
    var raiz = document.documentElement;

    if (!document.querySelector('meta[name="color-scheme"]')) {
        const meta = document.createElement('meta');
        meta.name = 'color-scheme';
        meta.content = 'light dark';
        document.head.appendChild(meta);
    }

    var t0;
    try {
        t0 = parseInt(sessionStorage.getItem('cosmos_tema_t0'), 10);
        if (!t0) { t0 = Date.now(); sessionStorage.setItem('cosmos_tema_t0', t0); }
    } catch (e) { t0 = Date.now(); }

    function actual() { return temaManual() || TEMAS[Math.floor((Date.now() - t0) / DURACION) % TEMAS.length]; }

    function aplicarTemaEnHtml(idTema) {
        var nombreCss = MAPA_CSS[idTema] || idTema;
        if (raiz.getAttribute('data-tema') !== nombreCss) {
            raiz.setAttribute('data-tema', nombreCss);
        }
    }

    var consulta = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    function modoGuardado() {
        try {
            var m = localStorage.getItem(CLAVE);
            return (m === 'oscuro' || m === 'claro') ? m : null;
        } catch (e) { return null; }
    }

    function aplicarModo() {
        var modo = modoGuardado() || (consulta && consulta.matches ? 'oscuro' : 'claro');
        if (raiz.getAttribute('data-modo') !== modo) raiz.setAttribute('data-modo', modo);
    }

    window.alternarModoOscuro = function () {
        var nuevo = raiz.getAttribute('data-modo') === 'oscuro' ? 'claro' : 'oscuro';
        try { localStorage.setItem(CLAVE, nuevo); } catch (e) {}
        raiz.setAttribute('data-modo', nuevo);
    };

    window.montarSelectorTemas = function (cont) {
        if (!cont) return;
        cont.classList.add('selector-temas');
        cont.innerHTML = '';
        var botones = {};
        TEMAS.forEach(function (id) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'punto';
            b.title = PALETAS[id][2];
            b.setAttribute('aria-label', PALETAS[id][2]);
            b.style.background = 'linear-gradient(135deg,' + PALETAS[id][0] + ',' + PALETAS[id][1] + ')';
            b.addEventListener('click', function () {
                try { sessionStorage.setItem(CLAVE_TEMA, id); } catch (e) {}
                aplicarTemaEnHtml(id);
                marcar();
            });
            cont.appendChild(b);
            botones[id] = b;
        });
        var auto = document.createElement('button');
        auto.type = 'button';
        auto.className = 'auto';
        auto.textContent = 'AUTO';
        auto.title = 'Los colores cambian solos';
        auto.addEventListener('click', function () {
            try { sessionStorage.removeItem(CLAVE_TEMA); } catch (e) {}
            aplicarTemaEnHtml(actual());
            marcar();
        });
        cont.appendChild(auto);
        
        function marcar() {
            var m = temaManual();
            auto.setAttribute('aria-pressed', m ? 'false' : 'true');
            var temaActualHtml = raiz.getAttribute('data-tema');
            TEMAS.forEach(function (id) {
                var coincide = (id === m) || (MAPA_CSS[id] === temaActualHtml);
                botones[id].classList.toggle('on', coincide);
            });
        }
        new MutationObserver(marcar).observe(raiz, { attributes: true, attributeFilter: ['data-tema'] });
        marcar();
    };

    function iniciarMenuDinamico() {
        if (/\/experimentos\//.test(location.pathname)) return;
        var nav = document.querySelector('.navbar');
        if (!nav) return;
        document.body.classList.add('nav-dinamico');
        var ultimo = window.scrollY;
        window.addEventListener('scroll', function () {
            var y = window.scrollY;
            if (y < 40) { nav.classList.remove('oculto', 'blur'); }
            else if (y > ultimo + 4) { if (!nav.contains(document.activeElement)) nav.classList.add('oculto'); }
            else if (y < ultimo - 4) { nav.classList.remove('oculto'); nav.classList.add('blur'); }
            ultimo = y;
        }, { passive: true });
    }

    raiz.classList.add('sin-t');
    aplicarTemaEnHtml(actual());
    aplicarModo();
    
    function seguirSistema() {
        try { localStorage.removeItem(CLAVE); } catch (e) {}
        aplicarModo();
    }

    if (consulta) {
        if (consulta.addEventListener) consulta.addEventListener('change', seguirSistema);
        else if (consulta.addListener) consulta.addListener(seguirSistema);
    }

    window.addEventListener('DOMContentLoaded', function () {
        iniciarMenuDinamico();
        var sel = document.getElementById('temas');
        if (sel) window.montarSelectorTemas(sel);
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { raiz.classList.remove('sin-t'); });
        });
        var c = document.getElementById('globalPageViews');
        if (c && c.textContent.trim() === '0') {
            try { c.textContent = localStorage.getItem('cosmos_global_views') || '0'; } catch (e) {}
        }
    });

    var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducir) {
        setInterval(function () {
            if (!temaManual()) {
                aplicarTemaEnHtml(actual());
            }
        }, 1000);
    }
})();
// Hecho por Dimytron7 con ayuda de Claude y Gemini. Derechos reservados Team ARPA y asociados.
