// Hecho por Dimytron7 con ayuda de Claude y Gemini. Derechos reservados Team ARPA y asociados.
import { auth, app } from './Auth.js?v=55';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const FS = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
const LS = 'cosmos_progreso';
const LS_LIKES = 'cosmos_likes';

function leer(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } }
function escribir(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function hoy() {
    const f = new Date();
    return f.getFullYear() + '-' + String(f.getMonth() + 1).padStart(2, '0') + '-' + String(f.getDate()).padStart(2, '0');
}

// Guarda en este navegador la simulación abierta y el día de hoy (también sin sesión)
function registrarLocal() {
    const p = leer(LS, {});
    p.vistas = p.vistas || {};
    p.dias = p.dias || [];
    const meta = document.querySelector('meta[name="experiment-id"]');
    const id = meta && meta.content;
    if (id && !p.vistas[id]) p.vistas[id] = hoy();
    if (p.dias.indexOf(hoy()) < 0) p.dias.push(hoy());
    escribir(LS, p);
}

function datosLocales() {
    const p = leer(LS, {});
    return { vistas: p.vistas || {}, dias: p.dias || [], likes: leer(LS_LIKES, []) };
}

function unir(a, b) {
    const vistas = Object.assign({}, b.vistas || {});
    Object.keys(a.vistas).forEach((k) => { if (!vistas[k] || a.vistas[k] < vistas[k]) vistas[k] = a.vistas[k]; });
    const union = (x, y) => Array.from(new Set((x || []).concat(y || []))).sort();
    return { vistas, dias: union(a.dias, b.dias), likes: union(a.likes, b.likes) };
}

// Une lo de este navegador con lo guardado en la cuenta y deja ambos iguales
async function sincronizar(u) {
    let fs, ref, remoto = {};
    try {
        fs = await import(FS);
        ref = fs.doc(fs.getFirestore(app), 'usuarios', u.uid);
        const s = await fs.getDoc(ref);
        remoto = s.exists() ? s.data() : {};
    } catch (e) { return null; }
    const m = unir(datosLocales(), remoto);
    escribir(LS, { vistas: m.vistas, dias: m.dias });
    escribir(LS_LIKES, m.likes);
    const igual = JSON.stringify([remoto.vistas || {}, remoto.dias || [], remoto.likes || []]) === JSON.stringify([m.vistas, m.dias, m.likes]);
    if (!igual) { try { await fs.setDoc(ref, { vistas: m.vistas, dias: m.dias, likes: m.likes, actualizado: Date.now() }); } catch (e) {} }
    return m;
}

// ----- Página Progreso.html -----
const ICONOS = { 'Física': 'g-fisica', 'Química': 'g-quimica', 'Biología': 'g-biologia', 'Tierra y Espacio': 'g-tierra', 'Matemáticas y Estadística': 'g-mate' };

let simsPromesa;
function cargarSims() { return simsPromesa || (simsPromesa = leerSims()); }
async function leerSims() {
    const lista = await Promise.all(registryFiles.map((f) => fetch(f).then((r) => r.text()).then((t) => {
        const d = new DOMParser().parseFromString(t, 'text/html');
        const g = (n) => { const e = d.querySelector('meta[name="' + n + '"]'); return e ? e.content : ''; };
        return { id: g('experiment-id'), area: g('experiment-area') };
    }).catch(() => null)));
    return lista.filter((s) => s && s.id);
}

function logros(sims, areas, m) {
    const n = sims.filter((s) => m.vistas[s.id]).length;
    const total = sims.length;
    const lista = [
        { i: 'g-paso', t: 'Primer paso', d: 'Abre tu primera simulación', v: n, m: 1 },
        { i: 'g-curioso', t: 'Curioso', d: 'Explora 3 simulaciones', v: n, m: 3 },
        { i: 'g-explorador', t: 'Explorador', d: 'Explora 5 simulaciones', v: n, m: 5 },
        { i: 'g-cosmonauta', t: 'Cosmonauta', d: 'Explora las ' + total + ' simulaciones', v: n, m: total },
        { i: 'g-corazon', t: 'Con corazón', d: 'Da tu primer me gusta', v: m.likes.length, m: 1 },
        { i: 'g-fan', t: 'Fan de COSMOS', d: 'Da 5 me gusta', v: m.likes.length, m: 5 },
        { i: 'g-constante', t: 'Constante', d: 'Vuelve en 3 días distintos', v: m.dias.length, m: 3 },
        { i: 'g-bienvenida', t: 'Bienvenido a bordo', d: 'Crea tu cuenta', v: 1, m: 1 }
    ];
    areas.forEach((a) => {
        const de = sims.filter((s) => s.area === a);
        lista.push({ i: ICONOS[a] || 'g-explorador', t: 'Sala ' + a.replace(' y Estadística', ''), d: 'Explora todo en ' + a, v: de.filter((s) => m.vistas[s.id]).length, m: de.length });
    });
    return lista;
}

async function pintarPagina(u, m) {
    const estado = document.getElementById('pgEstado');
    const cont = document.getElementById('pgContenido');
    if (!estado || !cont) return;
    if (!u || !m) {
        cont.hidden = true;
        estado.hidden = false;
        document.getElementById('pgEstadoTexto').textContent = u ? 'No se pudo cargar tu progreso. Revisa tu conexión e inténtalo de nuevo.' : 'Entra a tu cuenta para ver y guardar tu progreso y tus logros.';
        document.getElementById('pgEntrar').hidden = !!u;
        return;
    }
    const sims = await cargarSims();
    const total = sims.length;
    const areas = Object.keys(ICONOS).filter((a) => sims.some((s) => s.area === a))
        .concat(Array.from(new Set(sims.map((s) => s.area))).filter((a) => a && !ICONOS[a]));
    const n = sims.filter((s) => m.vistas[s.id]).length;

    document.getElementById('anillo').style.strokeDashoffset = 326.7 * (1 - (total ? n / total : 0));
    document.getElementById('porcentaje').textContent = Math.round(total ? n / total * 100 : 0) + '%';
    const rangos = [[0, 'Visitante'], [1, 'Aprendiz'], [3, 'Curioso'], [5, 'Explorador'], [total, 'Cosmonauta']];
    const rango = rangos.filter((r) => n >= r[0]).pop();
    const sig = rangos.filter((r) => r[0] > n)[0];
    document.getElementById('rango').textContent = rango[1];
    document.getElementById('resumen').textContent = n + ' de ' + total + ' simulaciones exploradas';
    document.getElementById('siguiente').textContent = sig ? 'Te faltan ' + (sig[0] - n) + ' para «' + sig[1] + '»' : 'Has llegado al rango más alto';
    document.getElementById('barraSig').style.width = (sig ? (n - rango[0]) / (sig[0] - rango[0]) * 100 : 100) + '%';

    document.getElementById('salas').innerHTML = areas.map((a) => {
        const de = sims.filter((s) => s.area === a);
        const hechas = de.filter((s) => m.vistas[s.id]).length;
        return '<div class="pg-sala"><span class="ic"><svg class="pg-i"><use href="#' + (ICONOS[a] || 'g-explorador') + '"/></svg></span><div style="flex:1"><b>' + a + '</b><small>' + hechas + ' de ' + de.length + ' exploradas</small><div class="pg-barrita"><i style="width:' + hechas / de.length * 100 + '%"></i></div></div></div>';
    }).join('');

    const L = logros(sims, areas, m);
    document.getElementById('tituloLogros').textContent = 'Logros · ' + L.filter((l) => l.v >= l.m).length + ' de ' + L.length;
    document.getElementById('logros').innerHTML = L.map((l, k) => {
        const hecho = l.v >= l.m;
        return '<button type="button" class="pg-logro' + (hecho ? '' : ' bloqueado') + '" data-k="' + k + '" title="' + l.d + '"><span class="medalla"><svg class="pg-i"><use href="#' + l.i + '"/></svg></span><b>' + l.t + '</b>' +
            (hecho ? '<span class="estado">Conseguido</span>' : '<span class="estado">' + l.v + ' / ' + l.m + '</span><span class="pg-barrita"><i style="width:' + l.v / l.m * 100 + '%"></i></span>') + '</button>';
    }).join('');
    document.querySelectorAll('.pg-logro').forEach((el) => el.addEventListener('click', () => {
        const l = L[el.dataset.k];
        document.querySelectorAll('.pg-logro').forEach((x) => x.classList.toggle('sel', x === el));
        document.getElementById('detalle').textContent = l.t + ': ' + l.d + (l.v >= l.m ? '. ¡Conseguido!' : '. Llevas ' + l.v + ' de ' + l.m + '.');
    }));
    estado.hidden = true;
    cont.hidden = false;
}

// ----- Franja de progreso en el inicio -----
const X = '<button type="button" class="pp-x" aria-label="Cerrar"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
async function pintarFranja(u, m) {
    const f = document.getElementById('franja');
    if (!f) return;
    let cerrada = false;
    try { cerrada = sessionStorage.getItem('cosmos_franja_off') === '1'; } catch (e) {}
    if (cerrada) return;
    let html;
    if (!u || !m) {
        html = '<span class="pp-ico"><svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg></span>' +
            '<div class="pp-centro"><span class="pp-titulo">Guarda tu progreso y gana logros</span><span class="pp-inf pp-sin-t">Entra con tu cuenta y COSMOS recordará lo que exploraste.</span></div><span class="pp-cta">Entrar</span>';
    } else {
        const sims = await cargarSims();
        const total = sims.length;
        const areas = Array.from(new Set(sims.map((s) => s.area))).filter(Boolean);
        const n = sims.filter((s) => m.vistas[s.id]).length;
        const rangos = [[0, 'Visitante'], [1, 'Aprendiz'], [3, 'Curioso'], [5, 'Explorador'], [total, 'Cosmonauta']];
        const rango = rangos.filter((r) => n >= r[0]).pop();
        const sig = rangos.filter((r) => r[0] > n)[0];
        const L = logros(sims, areas, m);
        const salas = areas.filter((a) => sims.some((s) => s.area === a && m.vistas[s.id])).length;
        html = '<div class="pp-anillo-box"><div class="pp-anillo"><svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="ppGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--accent-brown)"/><stop offset="1" style="stop-color:var(--c3)"/></linearGradient></defs><circle class="fondo" cx="24" cy="24" r="20"/><circle class="valor" cx="24" cy="24" r="20" style="stroke-dashoffset:' + 125.66 * (1 - (total ? n / total : 0)) + '"/></svg></div><span class="pp-pct">' + Math.round(total ? n / total * 100 : 0) + '%</span></div>' +
            '<div class="pp-centro"><div class="pp-sup"><span class="pp-badge">' + rango[1] + '</span><span class="pp-titulo">Tu progreso en COSMOS</span></div>' +
            '<div class="pp-inf"><span>' + n + ' de ' + total + ' simulaciones exploradas</span>' + (sig ? '<span class="pp-sep">·</span><span class="pp-meta">Faltan ' + (sig[0] - n) + ' para ' + sig[1] + '</span>' : '') + '</div><div class="pp-barra"><i style="width:' + (sig ? (n - rango[0]) / (sig[0] - rango[0]) * 100 : 100) + '%"></i></div>'
            + '</div>' +
            '<div class="pp-chips"><div class="pp-chip"><span>Salas activas</span><strong>' + salas + '</strong></div><div class="pp-chip"><span>Logros</span><strong>' + L.filter((l) => l.v >= l.m).length + ' / ' + L.length + '</strong></div></div>';
    }
    f.innerHTML = html + X;
    f.hidden = false;
    f.onclick = () => { location.href = u ? 'Progreso.html' : 'Login.html?volver=Cosmos.html'; };
    f.querySelector('.pp-x').onclick = (e) => {
        e.stopPropagation();
        f.hidden = true;
        try { sessionStorage.setItem('cosmos_franja_off', '1'); } catch (er) {}
    };
}

registrarLocal();
// Si hay una sesión recordada se pinta ya con los datos de este navegador; luego se completa con la cuenta
let recordada = false;
try { recordada = Object.keys(localStorage).some((k) => k.indexOf('firebase:authUser:') === 0); } catch (e) {}
if (recordada) { pintarPagina(true, datosLocales()); pintarFranja(true, datosLocales()); }
else { pintarPagina(null, null); pintarFranja(null, null); }
onAuthStateChanged(auth, async (u) => {
    if (!u) { pintarPagina(null, null); return pintarFranja(null, null); }
    pintarPagina(u, datosLocales());
    pintarFranja(u, datosLocales());
    const m = await sincronizar(u);
    if (m) { pintarPagina(u, m); pintarFranja(u, m); }
});
