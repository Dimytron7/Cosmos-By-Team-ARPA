(function () {
    var GLOSARIO = {
        'gravedad': 'Fuerza con la que los cuerpos con masa se atraen entre sí.',
        'órbita': 'Trayectoria curva de un cuerpo alrededor de otro por la gravedad.',
        'órbitas': 'Trayectorias curvas de los cuerpos alrededor de otros por la gravedad.',
        'masa': 'Cantidad de materia de un objeto.',
        'trayectoria': 'Camino que sigue un objeto al moverse.',
        'trayectorias': 'Caminos que siguen los objetos al moverse.',
        'alcance': 'Distancia horizontal que recorre un objeto lanzado.',
        'oscilación': 'Movimiento de ida y vuelta que se repite, como el de un péndulo.',
        'fricción': 'Fuerza de rozamiento que frena el movimiento y disipa energía.',
        'pendiente': 'Qué tan inclinada está una recta; cuánto sube por cada paso a la derecha.',
        'ordenada al origen': 'Punto donde la recta corta el eje vertical (cuando x = 0).',
        'azar': 'Lo que ocurre sin poder predecirse con certeza en un caso individual.',
        'distribución de probabilidad': 'Forma en que se reparten las probabilidades entre los resultados posibles.',
        'átomos': 'Partículas diminutas que forman toda la materia.',
        'coeficientes': 'Números delante de cada sustancia que indican cuántas unidades hay.',
        'pH': 'Escala de 0 a 14 que mide qué tan ácida o básica es una sustancia.',
        'ácido': 'Sustancia con pH menor que 7.',
        'básico': 'Sustancia con pH mayor que 7.',
        'ADN': 'Molécula que guarda la información genética de la célula.',
        'proteínas': 'Moléculas que cumplen funciones en la célula, fabricadas a partir del ADN.',
        'transcripción': 'Paso en que el ADN se copia a una molécula de ARN mensajero.',
        'traducción': 'Paso en que el ARN se usa para armar una proteína.',
        'impulso nervioso': 'Señal eléctrica que viaja por la neurona.',
        'iones': 'Átomos con carga eléctrica, como el sodio (Na⁺) y el potasio (K⁺).'
    };
    function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

    function glosario() {
        var listas = document.querySelectorAll('.learn-box li');
        if (!listas.length) return;
        var usados = {};
        var terminos = Object.keys(GLOSARIO).sort(function (a, b) { return b.length - a.length; });
        var re = new RegExp('(^|[^\\wáéíóúüñÁÉÍÓÚÑ])(' + terminos.map(esc).join('|') + ')(?![\\wáéíóúüñ])', 'g');
        listas.forEach(function (li) {
            li.innerHTML = li.innerHTML.replace(re, function (m, pre, t) {
                var k = t.toLowerCase() === t || t === 'pH' || t === 'ADN' ? t : t.toLowerCase();
                if (!GLOSARIO[k] || usados[k]) return m;
                usados[k] = true;
                return pre + '<span class="termino" tabindex="0" data-def="' + GLOSARIO[k] + '">' + t + '</span>';
            });
        });
    }

    function pantallaCompleta() {
        var cont = document.querySelector('.responsive-iframe-wrapper');
        if (!cont) return;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn-pantalla';
        b.textContent = '⛶ Pantalla completa';
        b.addEventListener('click', function () {
            var f = cont.requestFullscreen || cont.webkitRequestFullscreen;
            if (f) f.call(cont);
            else alert('Tu navegador no permite pantalla completa aquí.');
        });
        var fila = document.querySelector('.sim-acciones');
        if (fila) fila.appendChild(b); else cont.insertAdjacentElement('afterend', b);
    }

    document.addEventListener('DOMContentLoaded', function () { glosario(); pantallaCompleta(); });
})();

(function () {
    var GLOBAL = {
        base: 'https://abacus.jasoncameron.dev',
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
        var url = GLOBAL.base + '/' + (accion === 'up' ? 'hit' : 'get') + '/' + GLOBAL.namespace + '/' + GLOBAL.nombre;
        var ctl = window.AbortController ? new AbortController() : null;
        var t = ctl ? setTimeout(function () { ctl.abort(); }, GLOBAL.tiempoMax) : null;
        return fetch(url, { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
            .then(function (r) {
                if (r.status === 404 && accion !== 'up') return { value: 0 };
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


    var LS_LIKES = 'cosmos_likes', LS_CACHE = 'cosmos_likes_cache';
    var CORAZON = 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z';
    var vistos = {};

    function leer(k, def) { try { return JSON.parse(localStorage.getItem(k)) || def; } catch (e) { return def; } }
    function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    function apiLike(accion, clave) {
        return fetch(GLOBAL.base + '/' + accion + '/' + GLOBAL.namespace + '/' + clave)
            .then(function (r) { return r.status === 404 ? { value: 0 } : r.ok ? r.json() : null; })
            .catch(function () { return null; });
    }
    function totalLikes(id) {
        if (!vistos[id]) {
            vistos[id] = Promise.all([apiLike('get', 'like-' + id), apiLike('get', 'unlike-' + id)]).then(function (r) {
                if (!r[0] || !r[1]) return null;
                var n = Math.max(0, r[0].value - r[1].value), c = leer(LS_CACHE, {});
                c[id] = n; guardar(LS_CACHE, c);
                return n;
            });
        }
        return vistos[id];
    }

    window.pintarMeGusta = function () {
        var c = leer(LS_CACHE, {});
        document.querySelectorAll('[data-mg]:not([data-listo])').forEach(function (el) {
            var id = el.getAttribute('data-mg'), num = el.querySelector('b');
            el.setAttribute('data-listo', '');
            num.textContent = formato(c[id] || 0);
            totalLikes(id).then(function (n) { if (n !== null) num.textContent = formato(n); });
        });
    };

    window.MeGusta = function (caja, id) {
        var cache = leer(LS_CACHE, {}), liked = leer(LS_LIKES, []).indexOf(id) > -1, n = cache[id] || 0, ocupado = false;
        caja.innerHTML = '<button type="button" class="mg"><span class="mg-pill"><svg class="mg-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="' + CORAZON + '"/></svg><span class="mg-n"></span></span></button>';
        var b = caja.firstChild, pill = b.firstChild, ico = pill.firstChild, num = pill.lastChild;

        function pintar() {
            b.setAttribute('aria-pressed', liked);
            b.setAttribute('aria-label', 'Me gusta, ' + n);
            num.innerHTML = '<span>' + formato(n) + '</span>';
        }
        function recordar() {
            var c = leer(LS_CACHE, {}), l = leer(LS_LIKES, []).filter(function (x) { return x !== id; });
            c[id] = n; guardar(LS_CACHE, c);
            if (liked) l.push(id);
            guardar(LS_LIKES, l);
        }
        pintar();
        totalLikes(id).then(function (t) { if (t !== null && !ocupado) { n = t; pintar(); } });

        b.addEventListener('click', function () {
            if (ocupado) return;
            var antes = n, D = 560;
            liked = !liked;
            n = Math.max(0, n + (liked ? 1 : -1));
            recordar();
            apiLike('hit', (liked ? 'like-' : 'unlike-') + id);
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return pintar();

            ocupado = true;
            ico.animate([{ transform: 'scale(1)', easing: 'ease-in' }, { transform: 'scale(.3)', offset: .4, easing: 'cubic-bezier(.34,1.56,.64,1)' }, { transform: 'scale(1)' }], D);
            pill.animate([{ transform: 'scale(1)' }, { transform: 'scale(.97)', offset: .4 }, { transform: 'scale(1)' }], D);
            setTimeout(function () {
                b.setAttribute('aria-pressed', liked);
                var sube = n > antes, a = formato(antes), c = formato(n);
                num.innerHTML = '<span class="mg-r"><span>' + (sube ? a : c) + '</span><span>' + (sube ? c : a) + '</span></span>';
                num.firstChild.animate(sube ? [{ transform: 'translateY(0)' }, { transform: 'translateY(-1em)' }] : [{ transform: 'translateY(-1em)' }, { transform: 'translateY(0)' }],
                    { duration: 350, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' });
                setTimeout(pintar, 350);
            }, D * .4);
            setTimeout(function () { ocupado = false; }, D);
        });
    };

    function iniciarMeGusta() {
        var caja = document.getElementById('megusta'), meta = document.querySelector('meta[name="experiment-id"]');
        if (caja && meta) window.MeGusta(caja, meta.content);
        if (esPaginaPrincipal()) {
            window.pintarMeGusta();
            new MutationObserver(window.pintarMeGusta).observe(document.body, { childList: true, subtree: true });
        }
    }

    window.addEventListener('DOMContentLoaded', function () {
        try { if (esPaginaPrincipal()) contarLocal(); } catch (e) {}
        iniciarMeGusta();
        if (document.getElementById('globalViewsTotal') || esPaginaPrincipal()) contarGlobal();
    });
})();

// Hecho por Dimytron7 con ayuda de Claude y Gemini. Derechos reservados Team ARPA y asociados.
