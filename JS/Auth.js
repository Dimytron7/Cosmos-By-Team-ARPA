// Hecho por Dimytron7 con ayuda de Claude y Gemini. Derechos reservados Team ARPA y asociados.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
    getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider,
    signInWithEmailAndPassword, createUserWithEmailAndPassword,
    sendPasswordResetEmail, signOut
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: 'AIzaSyDPMVy_MFKhDCvHPDuimyfMMrp9nTNSiW4',
    authDomain: 'cosmos-team-arpa.firebaseapp.com',
    projectId: 'cosmos-team-arpa',
    storageBucket: 'cosmos-team-arpa.firebasestorage.app',
    messagingSenderId: '615383418038',
    appId: '1:615383418038:web:386a0c92b19f6a2009d217'
};

const auth = getAuth(initializeApp(firebaseConfig));
auth.languageCode = 'es';

const ERRORES = {
    'auth/invalid-email': 'El correo no es válido.',
    'auth/missing-password': 'Escribe tu contraseña.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/email-already-in-use': 'Ese correo ya tiene una cuenta. Prueba a entrar.',
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
    'auth/user-not-found': 'Correo o contraseña incorrectos.',
    'auth/wrong-password': 'Correo o contraseña incorrectos.',
    'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
    'auth/popup-blocked': 'Tu navegador bloqueó la ventana de Google. Permítela e inténtalo de nuevo.',
    'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
    'auth/cancelled-popup-request': 'Cerraste la ventana de Google antes de terminar.',
    'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase.',
    'auth/operation-not-allowed': 'Este método de acceso aún no está activado en Firebase.',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'La clave de Firebase no es válida.',
    'auth/network-request-failed': 'Sin conexión. Revisa tu internet.'
};

const CSS = `
.auth-fondo{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.45);display:none;align-items:center;justify-content:center;padding:16px}
.auth-fondo.abierto{display:flex}
.auth-caja{width:100%;max-width:380px;background:var(--card-light);color:var(--text-dark);border:1px solid var(--border-light);border-radius:24px;padding:24px;box-shadow:0 6px 24px rgba(0,0,0,.18);position:relative;max-height:90vh;overflow:auto}
.auth-caja h2{margin:0 0 4px;font-size:22px}
.auth-caja p{margin:0 0 14px;font-size:14px;opacity:.8}
.auth-x{position:absolute;top:10px;right:12px;background:none;border:0;font-size:22px;cursor:pointer;color:inherit;padding:4px 8px}
.auth-tabs{display:flex;gap:6px;margin-bottom:14px}
.auth-tabs button{flex:1;padding:8px;border-radius:999px;border:1px solid var(--border-light);background:transparent;color:inherit;font:inherit;font-size:14px;cursor:pointer}
.auth-tabs button.on{background:var(--text-dark);color:var(--card-light);border-color:var(--text-dark)}
.auth-caja input{width:100%;box-sizing:border-box;padding:11px 14px;margin-bottom:10px;border-radius:14px;border:1px solid var(--border-light);background:var(--card-bg);color:inherit;font:inherit;font-size:15px}
.auth-btn{width:100%;padding:11px;border-radius:999px;border:1px solid var(--text-dark);background:var(--text-dark);color:var(--card-light);font:inherit;font-weight:600;font-size:15px;cursor:pointer}
.auth-btn.sec{background:transparent;color:inherit;margin-bottom:12px}
.auth-btn:disabled{opacity:.6;cursor:wait}
.auth-o{text-align:center;font-size:12px;opacity:.6;margin:2px 0 10px}
.auth-link{background:none;border:0;color:inherit;text-decoration:underline;font:inherit;font-size:13px;cursor:pointer;padding:4px 0;opacity:.85}
.auth-msg{font-size:13px;min-height:18px;margin:2px 0 8px}
.auth-msg.err{color:#c0392b}
.auth-msg.ok{color:#1e8449}
.auth-perfil{text-align:center}
.auth-perfil .auth-av{width:64px;height:64px;border-radius:50%;object-fit:cover;margin:0 auto 10px;display:block;background:var(--card-bg)}
`;

const estilo = document.createElement('style');
estilo.textContent = CSS;
document.head.appendChild(estilo);

const fondo = document.createElement('div');
fondo.className = 'auth-fondo';
fondo.innerHTML = `
<div class="auth-caja" role="dialog" aria-modal="true" aria-labelledby="auth-titulo">
  <button class="auth-x" type="button" aria-label="Cerrar">×</button>
  <div id="auth-form">
    <h2 id="auth-titulo">Entrar a COSMOS</h2>
    <p>Guarda tu progreso y tus favoritos.</p>
    <button class="auth-btn sec" type="button" id="auth-google">Continuar con Google</button>
    <div class="auth-o">o con tu correo</div>
    <div class="auth-tabs">
      <button type="button" data-modo="entrar" class="on">Entrar</button>
      <button type="button" data-modo="crear">Crear cuenta</button>
    </div>
    <input type="email" id="auth-correo" placeholder="Correo" autocomplete="email">
    <input type="password" id="auth-clave" placeholder="Contraseña" autocomplete="current-password">
    <div class="auth-msg" id="auth-msg" role="status"></div>
    <button class="auth-btn" type="button" id="auth-enviar">Entrar</button>
    <button class="auth-link" type="button" id="auth-olvide">Olvidé mi contraseña</button>
  </div>
  <div id="auth-perfil" class="auth-perfil" style="display:none">
    <img class="auth-av" id="auth-foto" alt="" hidden>
    <h2 id="auth-nombre"></h2>
    <p id="auth-mail"></p>
    <button class="auth-btn" type="button" id="auth-salir">Cerrar sesión</button>
  </div>
</div>`;
document.body.appendChild(fondo);

const $ = (id) => fondo.querySelector('#' + id);
let modo = 'entrar';

function mensaje(texto, tipo) {
    const m = $('auth-msg');
    m.textContent = texto || '';
    m.className = 'auth-msg' + (tipo ? ' ' + tipo : '');
}
function textoError(e) {
    return ERRORES[e && e.code] || 'No se pudo completar. Inténtalo de nuevo.';
}
function abrir() { fondo.classList.add('abierto'); }
function cerrar() { fondo.classList.remove('abierto'); mensaje(''); }

function ponerModo(m) {
    modo = m;
    fondo.querySelectorAll('.auth-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.modo === m));
    $('auth-enviar').textContent = m === 'entrar' ? 'Entrar' : 'Crear cuenta';
    $('auth-clave').autocomplete = m === 'entrar' ? 'current-password' : 'new-password';
    $('auth-olvide').style.display = m === 'entrar' ? '' : 'none';
    mensaje('');
}

async function ejecutar(boton, tarea) {
    boton.disabled = true;
    mensaje('');
    try { await tarea(); } catch (e) { mensaje(textoError(e), 'err'); }
    boton.disabled = false;
}

fondo.querySelector('.auth-x').addEventListener('click', cerrar);
fondo.addEventListener('click', (e) => { if (e.target === fondo) cerrar(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
fondo.querySelectorAll('.auth-tabs button').forEach((b) => b.addEventListener('click', () => ponerModo(b.dataset.modo)));

$('auth-google').addEventListener('click', (e) =>
    ejecutar(e.currentTarget, () => signInWithPopup(auth, new GoogleAuthProvider())));

$('auth-enviar').addEventListener('click', (e) =>
    ejecutar(e.currentTarget, () => {
        const correo = $('auth-correo').value.trim();
        const clave = $('auth-clave').value;
        return modo === 'entrar'
            ? signInWithEmailAndPassword(auth, correo, clave)
            : createUserWithEmailAndPassword(auth, correo, clave);
    }));

$('auth-olvide').addEventListener('click', (e) =>
    ejecutar(e.currentTarget, async () => {
        const correo = $('auth-correo').value.trim();
        if (!correo) { mensaje('Escribe tu correo arriba y vuelve a pulsar.', 'err'); return; }
        await sendPasswordResetEmail(auth, correo);
        mensaje('Te enviamos un correo para cambiar la contraseña.', 'ok');
    }));

$('auth-salir').addEventListener('click', (e) => ejecutar(e.currentTarget, () => signOut(auth)));

const nav = document.querySelector('.nav-links');
const boton = document.createElement('button');
boton.type = 'button';
boton.textContent = '👤 Entrar';
boton.addEventListener('click', abrir);
if (nav) nav.appendChild(boton);

function nombreCorto(u) {
    return (u.displayName || (u.email || '').split('@')[0] || 'Mi cuenta').split(' ')[0];
}

onAuthStateChanged(auth, (u) => {
    window.CosmosAuth = { usuario: u, auth };
    if (u) {
        boton.textContent = '👤 ' + nombreCorto(u);
        $('auth-form').style.display = 'none';
        $('auth-perfil').style.display = '';
        $('auth-nombre').textContent = u.displayName || nombreCorto(u);
        $('auth-mail').textContent = u.email || '';
        const foto = $('auth-foto');
        if (u.photoURL) { foto.src = u.photoURL; foto.hidden = false; } else { foto.hidden = true; }
        cerrar();
    } else {
        boton.textContent = '👤 Entrar';
        $('auth-form').style.display = '';
        $('auth-perfil').style.display = 'none';
        $('auth-clave').value = '';
    }
    document.dispatchEvent(new CustomEvent('cosmos-auth', { detail: { usuario: u } }));
});

ponerModo('entrar');
