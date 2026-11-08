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
// Hecho por Dimytron7 con ayuda de Claude y Gemini. Derechos reservados Team ARPA y asociados.
