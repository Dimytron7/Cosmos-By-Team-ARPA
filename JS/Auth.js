// Hecho por Dimytron7 con ayuda de Claude y Gemini. Derechos reservados Team ARPA y asociados.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: 'AIzaSyDPMVy_MFKhDCvHPDuimyfMMrp9nTNSiW4',
    authDomain: 'cosmos-team-arpa.firebaseapp.com',
    projectId: 'cosmos-team-arpa',
    storageBucket: 'cosmos-team-arpa.firebasestorage.app',
    messagingSenderId: '615383418038',
    appId: '1:615383418038:web:386a0c92b19f6a2009d217'
};

export const auth = getAuth(initializeApp(firebaseConfig));
auth.languageCode = 'es';

const grupo = document.getElementById('navGrupo');
const boton = document.createElement('button');
boton.type = 'button';
boton.innerHTML = '<svg class="ico-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c1-4 4-6 8-6s7 2 8 6"></path></svg><span>Entrar</span>';
boton.addEventListener('click', () => {
    const actual = location.pathname.split('/').pop() || 'Cosmos.html';
    location.href = 'Login.html?volver=' + encodeURIComponent(actual);
});
if (grupo) grupo.appendChild(boton);

onAuthStateChanged(auth, (u) => {
    window.CosmosAuth = { usuario: u, auth };
    boton.querySelector('span').textContent = u ? (u.displayName || (u.email || '').split('@')[0] || 'Mi cuenta').split(' ')[0] : 'Entrar';
    document.dispatchEvent(new CustomEvent('cosmos-auth', { detail: { usuario: u } }));
});
