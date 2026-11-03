window.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('cosmos_sesion_activa')) {
        let vistasCosmos = parseInt(localStorage.getItem('cosmos_global_views')) || 0;
        vistasCosmos++;
        localStorage.setItem('cosmos_global_views', vistasCosmos);
        sessionStorage.setItem('cosmos_sesion_activa', 'true');
    }

    const contadorSpan = document.getElementById('globalPageViews');
    if (contadorSpan) {
        contadorSpan.innerText = localStorage.getItem('cosmos_global_views') || '1';
    }
});
// Hecho por Dimytron7 con ayuda de Claude y Gemini. Derechos reservados Team ARPA y asociados.
