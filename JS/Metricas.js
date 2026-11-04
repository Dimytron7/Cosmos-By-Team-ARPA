(function () {
    var GLOBAL = {
        base: 'https://api.counterapi.dev/v1',
        namespace: 'cosmos-team-arpa-dimytron7',
        nombre: 'visitas-globales',
        contarCadaPagina: false,
        tiempoMax: 7000
    };
    var PAGINAS_PRINCIPALES = ['cosmos.html', 'catalogo.html', 'acerca-de.html', 'contacto.html'];

    function esPaginaPrincipal() {
        if (/\/experimentos\//i.test(location.pathname)) return false;
        var archivo = location.pathname.split('/').pop().toLowerCase();
        return PAGINAS_PRINCIPALES.indexOf(archivo) >= 0;
    }

    function formato(n) {
        try { return Number(n).toLocaleString('es-CO'); } catch (e) { return String(n); }
    }

    function pedir(accion) {
        var url = GLOBAL.base + '/' + GLOBAL.namespace + '/' + GLOBAL.nombre + '/' + (accion === 'up' ? 'up' : '');
        var ctl = window.AbortController ? new AbortController() : null;
        var t = ctl ? setTimeout(function () { ctl.abort(); }, GLOBAL.tiempoMax) : null;
        return fetch(url, { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (d) {
                var n = parseInt(d.count !== undefined ? d.count : d.value, 10);
                if (isNaN(n)) throw new Error('Respuesta inesperada');
                return n;
            })
            .then(function (n) { clearTimeout(t); return n; }, function (e) { clearTimeout(t); throw e; });
    }

    function pintarGlobal(estado, valor) {
        var num = document.getElementById('globalViewsTotal');
        var est = document.getElementById('globalViewsEstado');
        if (num) num.textContent = valor === null ? (estado === 'cargando' ? '…' : '—') : formato(valor);
        if (est) {
            est.textContent = estado === 'ok' ? 'En línea'
                : estado === 'cargando' ? 'Conectando…'
                : (valor !== null ? 'Sin conexión (último valor guardado)' : 'Sin conexión');
        }
    }

    function contarGlobal() {
        var cache = null;
        try { var c = parseInt(localStorage.getItem('cosmos_global_cache'), 10); if (!isNaN(c)) cache = c; } catch (e) {}
        pintarGlobal('cargando', cache);

        var yaContada = false;
        try { yaContada = !!sessionStorage.getItem('cosmos_global_contado'); } catch (e) {}
        var sumar = esPaginaPrincipal() && (GLOBAL.contarCadaPagina || !yaContada);

        pedir(sumar ? 'up' : 'get')
            .then(function (n) {
                if (sumar) { try { sessionStorage.setItem('cosmos_global_contado', '1'); } catch (e) {} }
                try { localStorage.setItem('cosmos_global_cache', String(n)); } catch (e) {}
                pintarGlobal('ok', n);
            })
            .catch(function () {
                pintarGlobal('error', cache);
            });
    }

    function contarLocal() {
        if (!sessionStorage.getItem('cosmos_sesion_activa')) {
            var v = parseInt(localStorage.getItem('cosmos_global_views')) || 0;
            v++;
            localStorage.setItem('cosmos_global_views', v);
            sessionStorage.setItem('cosmos_sesion_activa', 'true');
        }
        var span = document.getElementById('globalPageViews');
        if (span) span.innerText = localStorage.getItem('cosmos_global_views') || '1';
    }

    window.addEventListener('DOMContentLoaded', function () {
        try { contarLocal(); } catch (e) {}
        if (document.getElementById('globalViewsTotal') || esPaginaPrincipal()) contarGlobal();
    });
})();
