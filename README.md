# COSMOS · Minimuseo escolar interactivo

Sitio web educativo que reúne simulaciones científicas de [PhET](https://phet.colorado.edu) en español: física, química, biología, matemáticas y tierra y espacio. Se explora, se cambian variables y se aprende experimentando, sin cuentas ni costo.

**Sitio en línea:** https://dimytron7.github.io/Cosmos-By-Team-ARPA/

## Autoría y créditos

- **Autor, diseño y dirección creativa:** Dimytron7. Ideó COSMOS y definió el flujo pedagógico, los textos, la identidad visual y el estilo.
- **Desarrollo técnico asistido por IA:** Claude (Anthropic) y Gemini (Google) ayudaron a traducir el diseño y las ideas a código. Los cambios hechos con Claude quedan registrados en el historial de commits con la línea `Co-Authored-By`.
- **Institución:** desarrollado para la Corporación Tecnológica Industrial de Colombia (TEINCO).
- **Simulaciones:** [PhET Interactive Simulations](https://phet.colorado.edu), Universidad de Colorado Boulder, bajo licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Cada simulación se incrusta desde el servidor oficial de PhET y conserva su logo y su atribución.
- **Derechos:** reservados a Team ARPA y asociados. Este repositorio no incluye una licencia de uso abierto. La licencia de PhET aplica solo a sus simulaciones, no al código de este sitio.

## Tecnologías

HTML, CSS y JavaScript sin frameworks ni paso de compilación. Todo se ejecuta en el navegador. Servicios externos: PhET (simulaciones), Web3Forms (formulario de contacto) y Abacus (contador global de visitas).

## Estructura

```
index.html            Redirige a Cosmos.html (necesario para GitHub Pages)
Cosmos.html           Inicio: carrusel, simulaciones destacadas, buscador, últimas interacciones
Catalogo.html         Catálogo con buscador y filtro por área
Acerca-De.html        Misión y visión, selector de temas, cómo usarlo y métricas
Contacto.html         Formulario de contacto
experimentos/         Una página por simulación (10)
CSS/styles.css        Estilos de todo el sitio y de los 5 temas
CSS/style2.css        Estilos propios de las páginas de simulación
JS/Registro.js        Lista de simulaciones que forman el catálogo
JS/Tema.js            Temas de color, modo claro/oscuro y menú que se esconde
JS/Metricas.js        Contadores de visitas (local y global)
JS/Extras.js          Glosario flotante y botón de pantalla completa
img/                  Logo, favicon e imagen para compartir el enlace
```

## Cómo se arma el catálogo

Cada simulación es un archivo en `experimentos/` que declara sus datos en etiquetas `<meta>`: `experiment-id`, `experiment-title`, `experiment-area`, `experiment-class-bg`, `experiment-image`, `experiment-hero-img`, `experiment-description`, `experiment-link` y `experiment-wiki`. `JS/Registro.js` lista esos archivos, y el Inicio y el Catálogo los leen con `fetch()` para generar las tarjetas, el carrusel, el buscador y los filtros.

**Para agregar una simulación:**
1. Copia un archivo de `experimentos/` con otro nombre.
2. Cambia las etiquetas `<meta>`, la dirección del `iframe` de PhET y la lista de «Qué aprenderás».
3. Agrega la ruta del archivo en `registryFiles` de `JS/Registro.js`.

## Temas de color

Hay cinco temas, cada uno con modo claro y oscuro: `sea`, `blush`, `sunshine`, `mocha` y `nebula`. Por defecto rotan solos cada 10 segundos, como fases del día, y la persona puede fijar uno con el selector de la página «Acerca de». Los nombres internos del CSS son `azul`, `rosa`, `naranja`, `cafe` y `morado`; `JS/Tema.js` traduce entre ambos.

## Datos que se guardan en el navegador

No hay cuentas ni base de datos propia. Todo se guarda en el navegador de cada persona.

| Clave | Dónde | Para qué |
|---|---|---|
| `cosmos_historial` | localStorage | Últimas simulaciones abiertas (máximo 5) |
| `cosmos_global_views` | localStorage | Visitas de este navegador |
| `cosmos_sesion_activa` | sessionStorage | Evita contar la visita local más de una vez por sesión |
| `cosmos_global_contado` | sessionStorage | Evita contar la visita global más de una vez por sesión |
| `cosmos_global_cache` | localStorage | Último valor del contador global, por si no hay conexión |
| `cosmos_modo_manual` | localStorage | Modo claro u oscuro elegido |
| `cosmos_tema_manual` | sessionStorage | Tema de color elegido |

## Contadores y métricas

- **Interacciones:** cada vez que se pulsa «Abrir simulación» o «Aprender», se guarda la simulación en `cosmos_historial`. Si ya estaba, se mueve al principio, y la lista conserva solo las 5 más recientes. El número de «Interacciones» es el tamaño de esa lista, es decir, simulaciones distintas recientes, no clics totales.
- **Visitas en este navegador:** suma 1 al abrir COSMOS en una sesión nueva.
- **Me gusta:** cada simulación tiene un corazón. El total es compartido, con dos contadores de Abacus por simulación (`like-ID` y `unlike-ID`; el número es la resta). El navegador guarda en `cosmos_likes` qué simulaciones ya marcaste y en `cosmos_likes_cache` el último total.
- **Visitas globales:** contador en línea compartido por todas las personas, a través de [Abacus](https://v2.jasoncameron.dev/abacus). Suma 1 por sesión desde las páginas principales. Si el servicio no responde, se muestra el último valor guardado.

El botón «Restablecer estadísticas locales» borra el historial y las visitas locales, pero no el contador global.

## Formulario de contacto

Usa [Web3Forms](https://web3forms.com) con envío por `fetch`. La clave de acceso del formulario es pública por diseño y no revela el correo de destino. Si el envío falla por red, el formulario usa el envío normal como respaldo.

## Ejecutar en local

El Inicio y el Catálogo leen las simulaciones con `fetch()`, que los navegadores bloquean al abrir los archivos con doble clic. Usa un servidor local, por ejemplo la extensión Live Server de VS Code, o:

```
python3 -m http.server 8080
```

y abre `http://localhost:8080/`.

## Publicación

El sitio se publica con GitHub Pages desde la rama `main`, carpeta raíz.
