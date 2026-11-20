// Hecho por Dimytron7 con ayuda de Claude y Gemini. Derechos reservados Team ARPA y asociados.
import { auth } from './Auth.js';
import {
    onAuthStateChanged, signInWithPopup, GoogleAuthProvider,
    signInWithEmailAndPassword, createUserWithEmailAndPassword,
    sendPasswordResetEmail, updateProfile, signOut
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const ERRORES = {
    'auth/invalid-email': 'El correo no es válido.',
    'auth/missing-email': 'Escribe tu correo.',
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
    'auth/network-request-failed': 'Sin conexión. Revisa tu internet.'
};

const $ = (id) => document.getElementById(id);
const volver = new URLSearchParams(location.search).get('volver');
const destino = /^[\w-]+\.html$/.test(volver || '') && volver !== 'Login.html' ? volver : 'Cosmos.html';
let modo = 'entrar';
let entrando = false;

function mensaje(texto, tipo) {
    $('lgMsg').textContent = texto || '';
    $('lgMsg').className = 'lg-msg' + (tipo ? ' ' + tipo : '');
}

function ponerModo(m) {
    modo = m;
    const crear = m === 'crear';
    document.querySelectorAll('.lg-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.modo === m));
    $('lgCampoNombre').hidden = !crear;
    $('lgEnviar').textContent = crear ? 'Crear cuenta' : 'Entrar';
    $('lgTitulo').textContent = crear ? 'Crea tu cuenta' : 'Entra a COSMOS';
    $('lgClave').autocomplete = crear ? 'new-password' : 'current-password';
    $('lgOlvide').hidden = crear;
    mensaje('');
}

async function ejecutar(boton, tarea) {
    boton.disabled = true;
    mensaje('');
    entrando = true;
    try { await tarea(); } catch (e) { entrando = false; mensaje(ERRORES[e && e.code] || 'No se pudo completar. Inténtalo de nuevo.', 'err'); }
    boton.disabled = false;
}

document.querySelectorAll('.lg-tabs button').forEach((b) => b.addEventListener('click', () => ponerModo(b.dataset.modo)));

$('lgGoogle').addEventListener('click', (e) =>
    ejecutar(e.currentTarget, () => signInWithPopup(auth, new GoogleAuthProvider())));

$('lgForm').addEventListener('submit', (e) => {
    e.preventDefault();
    ejecutar($('lgEnviar'), async () => {
        const correo = $('lgCorreo').value.trim();
        const clave = $('lgClave').value;
        if (modo === 'entrar') { await signInWithEmailAndPassword(auth, correo, clave); return; }
        const cred = await createUserWithEmailAndPassword(auth, correo, clave);
        const nombre = $('lgNombre').value.trim();
        if (nombre) await updateProfile(cred.user, { displayName: nombre });
    });
});

$('lgOlvide').addEventListener('click', (e) =>
    ejecutar(e.currentTarget, async () => {
        const correo = $('lgCorreo').value.trim();
        if (!correo) { entrando = false; mensaje('Escribe tu correo arriba y vuelve a pulsar.', 'err'); return; }
        await sendPasswordResetEmail(auth, correo);
        entrando = false;
        mensaje('Te enviamos un correo para cambiar la contraseña.', 'ok');
    }));

$('lgSalir').addEventListener('click', (e) => ejecutar(e.currentTarget, async () => { await signOut(auth); entrando = false; }));
$('lgIr').href = destino;

onAuthStateChanged(auth, (u) => {
    if (u && entrando) { location.replace(destino); return; }
    $('lgForm').hidden = !!u;
    $('lgPerfil').hidden = !u;
    $('lgTitulo').textContent = u ? 'Tu cuenta' : (modo === 'crear' ? 'Crea tu cuenta' : 'Entra a COSMOS');
    $('lgSub').textContent = u ? 'Sesión iniciada.' : 'Guarda tu progreso y tus favoritos.';
    if (u) {
        const nombre = u.displayName || (u.email || '').split('@')[0];
        $('lgNombrePerfil').textContent = nombre;
        $('lgMail').textContent = u.email || '';
        const foto = $('lgFoto');
        if (u.photoURL) { foto.src = u.photoURL; foto.hidden = false; } else { foto.hidden = true; }
    }
});

ponerModo('entrar');
