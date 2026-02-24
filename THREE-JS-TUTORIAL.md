# Three.js — Tutorial Completo para Web

Guía práctica para usar Three.js en cualquier landing page o sitio web.
Cubre desde cómo incluirlo hasta cómo posicionar, iluminar y animar objetos 3D.

---

## Índice

1. [Cómo incluir Three.js](#1-cómo-incluir-threejs)
2. [La estructura mínima](#2-la-estructura-mínima)
3. [El canvas y el renderer](#3-el-canvas-y-el-renderer)
4. [Geometrías — qué formas hay](#4-geometrías--qué-formas-hay)
5. [Materiales — cómo se ve la superficie](#5-materiales--cómo-se-ve-la-superficie)
6. [Luces — cuándo y cuáles usar](#6-luces--cuándo-y-cuáles-usar)
7. [Posicionar, rotar y escalar](#7-posicionar-rotar-y-escalar)
8. [El loop de animación](#8-el-loop-de-animación)
9. [Partículas](#9-partículas)
10. [Parallax con el mouse](#10-parallax-con-el-mouse)
11. [Responsive — adaptar al resize](#11-responsive--adaptar-al-resize)
12. [Problemas frecuentes y soluciones](#12-problemas-frecuentes-y-soluciones)
13. [Plantilla lista para copiar](#13-plantilla-lista-para-copiar)

---

## 1. Cómo incluir Three.js

### Opción A — CDN (recomendada para demos y landings)

Pegá este script **antes** de tu propio JS. No requiere instalación.

```html
<!-- Siempre al final del <body>, antes de tu script -->
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script src="js/main.js"></script>
```

Esto expone el objeto global `THREE`. Todo lo que uses empieza con `THREE.algo`.

> **Versiones estables recomendadas:** `0.155`, `0.160`, `0.163`
> Evitá usar `latest` — puede romper tu código si cambian la API.

### Opción B — NPM (para proyectos con Vite, Webpack, etc.)

```bash
npm install three
```

```js
import * as THREE from 'three';
```

### Opción C — Import map (moderno, sin bundler)

```html
<script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
    }
  }
</script>
<script type="module">
  import * as THREE from 'three';
</script>
```

---

## 2. La estructura mínima

Toda escena Three.js necesita exactamente **3 cosas**:

```
SCENE   → el mundo donde viven los objetos
CAMERA  → el punto de vista desde donde se mira
RENDERER → el que convierte la escena en píxeles en el canvas
```

```js
const scene    = new THREE.Scene();

const camera   = new THREE.PerspectiveCamera(
  75,                         // field of view en grados (60–90 es normal)
  window.innerWidth / window.innerHeight, // aspect ratio
  0.1,                        // near: objetos más cerca de esto no se ven
  1000                        // far: objetos más lejos de esto no se ven
);
camera.position.z = 5;        // alejar la cámara del origen

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // agrega el canvas al DOM
```

### El campo de visión (FOV)

```
FOV bajo (30–45°)  → efecto telefoto, objetos parecen más planos y cercanos
FOV normal (60–75°) → perspectiva natural
FOV alto (90–110°)  → efecto gran angular, distorsión en los bordes
```

---

## 3. El canvas y el renderer

### Usar un canvas existente en el HTML (recomendado)

En lugar de que Three.js cree el canvas, vos lo definís en el HTML y
lo controlás con CSS. Así es más fácil posicionarlo.

```html
<!-- HTML -->
<section id="hero">
  <canvas id="mi-canvas"></canvas>
  <div class="contenido">Texto encima del 3D</div>
</section>
```

```css
/* CSS */
#hero { position: relative; height: 100vh; }

#mi-canvas {
  position: absolute;
  inset: 0;          /* top:0; right:0; bottom:0; left:0 */
  width: 100%;
  height: 100%;
}

.contenido {
  position: relative;
  z-index: 10;       /* encima del canvas */
}
```

```js
// JS — pasás el canvas al renderer
const canvas   = document.getElementById('mi-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,            // le pasás el elemento existente
  antialias: true,
  alpha: true        // fondo transparente → se ve el CSS detrás
});
renderer.setClearColor(0x000000, 0); // color, alpha=0 = transparente
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // máximo 2x para retina
renderer.setSize(window.innerWidth, window.innerHeight);
```

> **Regla clave:** `alpha: true` + `setClearColor(color, 0)` = el canvas es
> transparente y se ve lo que haya detrás en el CSS.

---

## 4. Geometrías — qué formas hay

Una geometría define la **forma** del objeto (vértices y caras).
Se combina con un Material para crear un Mesh.

```js
const mesh = new THREE.Mesh(geometria, material);
scene.add(mesh);
```

### Catálogo de geometrías más usadas

```js
// CAJA / CUBO
new THREE.BoxGeometry(
  width,   // ancho
  height,  // alto
  depth,   // profundidad
  // opcionales: subdivisiones en cada eje (más suave pero más pesado)
  widthSegments, heightSegments, depthSegments
)
// Ejemplo:
new THREE.BoxGeometry(1, 1, 1)      // cubo de 1x1x1
new THREE.BoxGeometry(2, 0.5, 1)    // caja achatada


// ESFERA
new THREE.SphereGeometry(
  radius,        // radio
  widthSegments, // segmentos horizontales (mínimo 8, recomendado 32+)
  heightSegments // segmentos verticales
)
// Ejemplo:
new THREE.SphereGeometry(1, 32, 32)   // esfera suave
new THREE.SphereGeometry(1, 8, 8)     // esfera facetada (low-poly)


// TORUS (rosquilla / donut)
new THREE.TorusGeometry(
  radius,        // radio del centro del tubo al centro del torus
  tube,          // radio del tubo (grosor)
  radialSegments,// segmentos del tubo (suavidad del tubo)
  tubularSegments// segmentos del anillo (suavidad del anillo)
)
// Ejemplo:
new THREE.TorusGeometry(1, 0.4, 16, 100)  // donut estándar
new THREE.TorusGeometry(2, 0.1, 8, 80)   // anillo fino


// TORUS KNOT (nudo tórico — forma orgánica compleja)
new THREE.TorusKnotGeometry(
  radius, tube, tubularSegments, radialSegments,
  p, q   // p y q cambian la forma del nudo (probá 2,3 / 3,4 / 2,5)
)
// Ejemplo:
new THREE.TorusKnotGeometry(1, 0.3, 128, 16, 2, 3)


// CILINDRO
new THREE.CylinderGeometry(
  radiusTop,    // radio arriba
  radiusBottom, // radio abajo (distinto = cono)
  height,
  radialSegments
)
// Ejemplo:
new THREE.CylinderGeometry(1, 1, 2, 32)   // cilindro
new THREE.CylinderGeometry(0, 1, 2, 32)   // cono


// PLANO
new THREE.PlaneGeometry(width, height, widthSegments, heightSegments)
// Ejemplo:
new THREE.PlaneGeometry(5, 5)             // plano 5x5


// ICOSAEDRO (pelota de fútbol geométrica)
new THREE.IcosahedronGeometry(radius, detail)
// detail=0 → low-poly, detail=3 → casi esfera
new THREE.IcosahedronGeometry(1, 0)       // low-poly
new THREE.IcosahedronGeometry(1, 2)       // más suave


// OCTAEDRO
new THREE.OctahedronGeometry(radius, detail)
new THREE.OctahedronGeometry(1, 0)        // diamante low-poly


// CONO
new THREE.ConeGeometry(radius, height, radialSegments)
new THREE.ConeGeometry(1, 2, 8)


// TETRAEDRO
new THREE.TetrahedronGeometry(radius, detail)
new THREE.TetrahedronGeometry(1, 0)       // pirámide triangular


// TUBO (siguiendo un camino personalizado)
const path  = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-2, 0, 0),
  new THREE.Vector3(0,  2, 0),
  new THREE.Vector3( 2, 0, 0),
]);
new THREE.TubeGeometry(path, 20, 0.2, 8, false)
```

### Cómo elegir la geometría

```
¿Querés algo orgánico / fluido?     → TorusKnot, Torus, Sphere
¿Algo arquitectónico / limpio?      → Box, Cylinder, Plane
¿Algo low-poly / geométrico?        → Icosahedron(0), Octahedron, Tetrahedron
¿Algo decorativo / anillo?          → Torus con tube fino
¿Algo personalizado / libre?        → Tube con CatmullRomCurve3
```

---

## 5. Materiales — cómo se ve la superficie

El material define el **aspecto visual** del objeto.

### Los materiales más importantes

```js
// MeshStandardMaterial — el más versátil, requiere luces
// Simula física real (PBR). Usalo por defecto.
new THREE.MeshStandardMaterial({
  color:       0xc9a96e, // color en hex (o 'gold', '#c9a96e')
  metalness:   0.7,      // 0 = plástico, 1 = metal puro
  roughness:   0.2,      // 0 = espejo pulido, 1 = superficie opaca
  transparent: false,    // si querés controlar la opacidad
  opacity:     1.0,      // 0 = invisible, 1 = sólido (transparent debe ser true)
  wireframe:   false,    // true = solo muestra los bordes
  side: THREE.FrontSide  // THREE.FrontSide / BackSide / DoubleSide
})


// MeshPhysicalMaterial — igual que Standard pero con más opciones
// Usalo para vidrio, agua, cristal
new THREE.MeshPhysicalMaterial({
  color:        0xffffff,
  metalness:    0,
  roughness:    0,
  transmission: 1,       // transparencia tipo vidrio (0-1)
  thickness:    0.5,     // grosor del vidrio
  ior:          1.5,     // índice de refracción (vidrio=1.5, agua=1.33)
})


// MeshBasicMaterial — sin luces, siempre visible igual
// Usalo para elementos de UI 3D o cuando no querés iluminación
new THREE.MeshBasicMaterial({
  color:       0xff0000,
  wireframe:   false,
  transparent: true,
  opacity:     0.5,
})


// MeshNormalMaterial — colores por dirección de normal (arcoíris)
// Sin configuración, útil para debug o efectos visuales
new THREE.MeshNormalMaterial()


// MeshDepthMaterial — sombras según distancia a la cámara
new THREE.MeshDepthMaterial()


// PointsMaterial — para partículas
new THREE.PointsMaterial({
  color:   0xc9a96e,
  size:    0.05,         // tamaño de cada punto
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending, // suma colores (brilla más)
  depthWrite: false,     // evita artefactos visuales con transparencia
  sizeAttenuation: true, // puntos más lejanos se ven más chicos
})


// LineBasicMaterial — para líneas
new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.5,
})
```

### Guía rápida para elegir metalness y roughness

```
metalness: 0  + roughness: 0   → plástico brillante (tipo espejo)
metalness: 0  + roughness: 1   → plástico mate (arcilla, madera)
metalness: 1  + roughness: 0   → metal pulido (cromo, espejo metálico)
metalness: 1  + roughness: 0.3 → metal cepillado (aluminio, acero)
metalness: 0.7+ roughness: 0.2 → oro, bronce
metalness: 0.5+ roughness: 0.5 → metal oxidado / pintado
```

---

## 6. Luces — cuándo y cuáles usar

> `MeshBasicMaterial` no necesita luces.
> `MeshStandardMaterial` y `MeshPhysicalMaterial` **sí las necesitan**.
> Sin luz, los objetos aparecen completamente negros.

```js
// AMBIENT LIGHT — ilumina todo parejo, sin sombras
// Usala siempre como base para que nada quede totalmente negro
const ambient = new THREE.AmbientLight(
  0xffffff, // color
  0.3       // intensidad (0 = apagada, 1+ = muy brillante)
);
scene.add(ambient);


// POINT LIGHT — como una lamparita, irradia en todas direcciones
// Perfecta para efectos de color dramáticos
const point = new THREE.PointLight(
  0xc9a96e, // color
  4,        // intensidad
  20        // distancia de alcance (0 = infinita)
);
point.position.set(5, 5, 5); // posición en el mundo
scene.add(point);


// DIRECTIONAL LIGHT — como el sol, rayos paralelos
// Usala para iluminación principal realista
const dir = new THREE.DirectionalLight(0xffffff, 1);
dir.position.set(10, 10, 5); // dirección (apunta desde esta posición al origen)
scene.add(dir);


// SPOT LIGHT — como un foco, cono de luz
const spot = new THREE.SpotLight(
  0xffffff, // color
  2,        // intensidad
  30,       // distancia
  Math.PI / 6, // ángulo del cono (PI/6 = 30 grados)
  0.3       // penumbra (suavidad del borde del cono, 0-1)
);
spot.position.set(0, 10, 0);
scene.add(spot);


// HEMISPHERE LIGHT — cielo + suelo, muy natural para exteriores
const hemi = new THREE.HemisphereLight(
  0x87ceeb, // color del cielo (azul)
  0x8b7355, // color del suelo (marrón)
  0.6       // intensidad
);
scene.add(hemi);
```

### Receta de iluminación para escenas oscuras elegantes

```js
// La combinación que usamos en este proyecto:
scene.add(new THREE.AmbientLight(0xffffff, 0.25));      // base suave

const goldPt = new THREE.PointLight(0xc9a96e, 6, 40);   // luz dorada principal
goldPt.position.set(6, 4, 6);
scene.add(goldPt);

const purplePt = new THREE.PointLight(0x7b2fbe, 4, 30); // contraluz dramático
purplePt.position.set(-6, -3, 4);
scene.add(purplePt);

const rimPt = new THREE.PointLight(0xfff0d0, 2, 20);    // rim light suave
rimPt.position.set(0, 10, -4);
scene.add(rimPt);
```

### Animar las luces para dinamismo (en el loop)

```js
const clock = new THREE.Clock();
function loop() {
  const t = clock.getElapsedTime();
  goldPt.position.x = Math.sin(t * 0.4) * 8;   // orbita horizontal
  goldPt.position.y = Math.cos(t * 0.35) * 6;  // orbita vertical
}
```

---

## 7. Posicionar, rotar y escalar

Todo objeto 3D (Mesh, Light, Camera) tiene estas tres propiedades:

```js
// POSICIÓN — en unidades del mundo (vos decidís la escala)
mesh.position.x = 2;
mesh.position.y = -1;
mesh.position.z = 0;
mesh.position.set(2, -1, 0); // equivalente, más corto


// ROTACIÓN — en radianes (no grados)
// Conversión: grados * (Math.PI / 180) = radianes
mesh.rotation.x = Math.PI / 4;   // 45 grados en X
mesh.rotation.y = Math.PI;        // 180 grados en Y
mesh.rotation.z = 0;
mesh.rotation.set(Math.PI/4, Math.PI, 0); // los tres a la vez


// Rotaciones comunes:
// Math.PI / 6   = 30°
// Math.PI / 4   = 45°
// Math.PI / 3   = 60°
// Math.PI / 2   = 90°
// Math.PI       = 180°
// Math.PI * 2   = 360° (vuelta completa)


// ESCALA — multiplicador del tamaño original
mesh.scale.x = 2;    // doble de ancho
mesh.scale.y = 0.5;  // mitad de alto
mesh.scale.z = 1;    // profundidad normal
mesh.scale.set(2, 0.5, 1);        // los tres a la vez
mesh.scale.setScalar(1.5);        // escala uniforme (mismo valor en xyz)


// TRUCO: empezar invisible para animar entrada
mesh.scale.set(0, 0, 0); // invisible
// luego con GSAP:
gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: 'elastic.out(1, 0.5)' });
```

### El sistema de coordenadas

```
        Y (arriba)
        |
        |
        +-------- X (derecha)
       /
      /
     Z (hacia vos)
```

```
position.y positivo → sube
position.y negativo → baja
position.x positivo → derecha
position.x negativo → izquierda
position.z positivo → acerca a cámara
position.z negativo → aleja de cámara
```

### Cómo saber a qué distancia poner los objetos

Regla práctica: si tu cámara está en `z = 5` y el objeto en `z = 0`,
el objeto está a 5 unidades. Para que ocupe aprox. el alto de la pantalla
con FOV 60°, el tamaño del objeto debe ser ~2 × tan(30°) × distancia ≈ 5.8 unidades.

Para no hacer las cuentas: probá con estos valores de referencia:

```
Cámara z=5, objeto en z=0:
  Un objeto de radio 1 ocupa ~22% del alto de pantalla
  Un objeto de radio 2 ocupa ~44%
  Un objeto de radio 4 ocupa ~88%
```

---

## 8. El loop de animación

`requestAnimationFrame` llama a tu función ~60 veces por segundo (sincronizado con el monitor).

```js
function animate() {
  requestAnimationFrame(animate); // se autoreprograma
  renderer.render(scene, camera); // dibuja
}
animate(); // arranque inicial
```

### Usar el reloj para animaciones consistentes

Sin el reloj, la animación va más rápida en monitores de 120Hz.
Con el reloj, la velocidad es siempre la misma:

```js
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime(); // segundos desde que arrancó

  // Rotación constante:
  mesh.rotation.y = t * 0.5;        // una vuelta cada ~12 segundos

  // Flotación (arriba y abajo):
  mesh.position.y = Math.sin(t * 0.8) * 0.5;

  // Pulsación (scale):
  const s = 1 + Math.sin(t * 2) * 0.1;
  mesh.scale.setScalar(s);

  // Orbitar un objeto alrededor de otro:
  mesh.position.x = Math.cos(t * 0.5) * 3; // radio 3
  mesh.position.z = Math.sin(t * 0.5) * 3;

  renderer.render(scene, camera);
}
```

### Fórmulas matemáticas útiles para animación

```js
// Sin / Cos: oscilan entre -1 y 1 suavemente
Math.sin(t)            // ciclo de 2π segundos (~6.28s)
Math.sin(t * 2)        // el doble de rápido
Math.sin(t) * 0.5      // amplitud reducida (entre -0.5 y 0.5)
1 + Math.sin(t) * 0.3  // oscila entre 0.7 y 1.3 (nunca negativo)

// Lerp — interpolación suave (ideal para seguir el mouse)
current += (target - current) * 0.05;  // 0.05 = muy suave, 0.3 = ágil

// Mapear un rango a otro
function map(val, inMin, inMax, outMin, outMax) {
  return (val - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
}
// Ejemplo: mouse 0→800px mapeado a -1→1
const normalized = map(mouseX, 0, window.innerWidth, -1, 1);
```

---

## 9. Partículas

Las partículas son puntos flotantes en 3D. Se crean con `BufferGeometry` + `Points`.

```js
const count = 500; // cantidad de partículas

// Crear las posiciones (3 valores por partícula: x, y, z)
const positions = new Float32Array(count * 3);

for (let i = 0; i < count; i++) {
  positions[i * 3    ] = (Math.random() - 0.5) * 20; // x: -10 a 10
  positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // y: -10 a 10
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // z: -5 a 5
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3) // 3 = stride (xyz)
);

const material = new THREE.PointsMaterial({
  color:           0xc9a96e,
  size:            0.06,
  transparent:     true,
  opacity:         0.6,
  blending:        THREE.AdditiveBlending, // se suman los colores (efecto brillo)
  depthWrite:      false,   // importante: evita artefactos con alpha
  sizeAttenuation: true,    // partículas lejanas se ven más pequeñas
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// En el loop — rotar el conjunto lentamente
particles.rotation.y = clock.getElapsedTime() * 0.02;
particles.rotation.x = clock.getElapsedTime() * 0.01;
```

---

## 10. Parallax con el mouse

Mueve la **cámara** (no los objetos) para crear profundidad con el mouse.

```js
// Guardar posición del mouse normalizada (-1 a 1)
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;

document.addEventListener('mousemove', e => {
  targetX = (e.clientX / window.innerWidth  - 0.5) * 2; // -1 a 1
  targetY = (e.clientY / window.innerHeight - 0.5) * 2; // -1 a 1
});

// En el loop — mover cámara con inercia
function animate() {
  requestAnimationFrame(animate);

  // Lerp: sigue al target suavemente
  currentX += (targetX - currentX) * 0.05; // 0.05 = suave
  currentY += (targetY - currentY) * 0.05;

  // Mover la cámara
  camera.position.x = currentX * 2;   // multiplicador = intensidad
  camera.position.y = -currentY * 1.5;
  camera.lookAt(0, 0, 0); // siempre mira al centro de la escena

  renderer.render(scene, camera);
}
```

> Si en vez de la cámara querés mover un objeto específico:
> ```js
> mesh.rotation.y = currentX * 0.5;
> mesh.rotation.x = -currentY * 0.3;
> ```

---

## 11. Responsive — adaptar al resize

```js
window.addEventListener('resize', () => {
  // Actualizar aspect ratio de la cámara
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix(); // obligatorio después de cambiar la cámara

  // Actualizar tamaño del renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
```

### Canvas de tamaño fijo (no fullscreen)

Si el canvas no ocupa toda la pantalla, usás el tamaño del contenedor:

```js
const container = document.getElementById('mi-contenedor');

function resize() {
  const W = container.clientWidth;
  const H = container.clientHeight;
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  renderer.setSize(W, H);
}

window.addEventListener('resize', resize);
resize(); // llamar una vez al inicio
```

---

## 12. Problemas frecuentes y soluciones

### El canvas está en blanco / todo negro

**Causa 1:** Faltan luces con `MeshStandardMaterial`
```js
// Solución: agregar al menos una luz ambient
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
```

**Causa 2:** El objeto está fuera del frustum (demasiado lejos o cerca)
```js
// Verificar que near/far cubren tu escena
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
// Si tus objetos están a z=500, el far=1000 los incluye. Si ponés far=100, no los ve.
```

**Causa 3:** El renderer no se llama en el loop
```js
// Asegurate de tener renderer.render(scene, camera) dentro del loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera); // ← esta línea es obligatoria
}
```

---

### El fondo es negro y no transparente

```js
// Necesitás las dos cosas:
const renderer = new THREE.WebGLRenderer({ alpha: true }); // 1
renderer.setClearColor(0x000000, 0);                       // 2 — alpha=0
```

---

### Los objetos se ven pixelados en pantallas retina

```js
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// El min(dpr, 2) limita a 2x para no explotar la GPU en pantallas 3x
```

---

### Objetos transparentes se ven mal (z-fighting, orden incorrecto)

```js
// En el material con transparencia:
material.transparent  = true;
material.depthWrite   = false;   // no escribir al depth buffer
material.blending     = THREE.AdditiveBlending; // o NormalBlending
// Si son varios objetos transparentes, el orden en que se agregan a la escena importa
```

---

### La escena no se ve en mobile / canvas muy pequeño

```js
// En mobile innerWidth/innerHeight pueden ser 0 en DOMContentLoaded
// Inicializá Three.js dentro de window.addEventListener('load', ...) o en un setTimeout
window.addEventListener('load', () => {
  initScene();
});
```

---

### El scroll hace lag con Three.js

El loop `requestAnimationFrame` corre independiente del scroll.
El problema suele ser que ScrollTrigger no está sincronizado.

```js
// Conectar Lenis con GSAP para que ScrollTrigger sepa cuándo scrollear:
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

---

### El objeto aparece pero no en el lugar esperado

Recordá que el origen `(0,0,0)` es el centro. La cámara mira hacia `-Z` por defecto.

```js
// Herramienta de debug: ver los ejes
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
// Rojo = X, Verde = Y, Azul = Z
// Quitalo cuando ya no lo necesitás
```

---

### `"position" is read-only` (y cualquier propiedad de Object3D)

**Causa:** `position`, `rotation`, `scale` y `quaternion` en Three.js son **getters**
que devuelven un objeto interno (`Vector3`, `Euler`, etc.). No se pueden reemplazar
directamente. El error aparece cuando se usa `Object.assign` o asignación directa
para intentar setear esas propiedades.

```js
// ❌ MAL — Object.assign intenta reemplazar la propiedad position
// Esto tira: TypeError: "position" is read-only
const mesh = new THREE.Mesh(geo, mat);
Object.assign(mesh, { position: new THREE.Vector3(0, 2, 0) });

// ❌ TAMBIÉN MAL — misma razón
mesh.position = new THREE.Vector3(0, 2, 0);
```

```js
// ✅ BIEN — modificar el Vector3 que ya existe adentro del mesh
mesh.position.set(0, 2, 0);

// ✅ TAMBIÉN BIEN — asignar eje por eje
mesh.position.x = 0;
mesh.position.y = 2;
mesh.position.z = 0;

// ✅ BIEN — copiar desde otro Vector3
mesh.position.copy(otroVector3);
```

Lo mismo aplica para `rotation` y `scale`:

```js
// ❌ MAL
Object.assign(mesh, { rotation: new THREE.Euler(0, Math.PI, 0) });
Object.assign(mesh, { scale:    new THREE.Vector3(2, 2, 2) });

// ✅ BIEN
mesh.rotation.set(0, Math.PI, 0);
mesh.scale.set(2, 2, 2);
mesh.scale.setScalar(2); // escala uniforme
```

**Patrón helper recomendado** cuando creás muchos objetos en una sola línea:

```js
// Helper que crea el mesh, setea posición y lo devuelve listo
const mk = (geo, mat, x = 0, y = 0, z = 0) => {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  return mesh;
};

// Uso — limpio y sin errores
group.add(mk(new THREE.CylinderGeometry(1, 1, 2, 32), material, 0,  0, 0));
group.add(mk(new THREE.CylinderGeometry(1, 1, 2, 32), material, 0,  3, 0));
group.add(mk(new THREE.CylinderGeometry(1, 1, 2, 32), material, 0, -3, 0));
```

---

### Performance: la página se pone lenta

```js
// 1. Limitar el pixel ratio
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

// 2. Usar menos segmentos en geometrías que no se acercan
new THREE.SphereGeometry(1, 16, 16)  // en vez de 64, 64

// 3. Reusar materiales y geometrías
const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const geo = new THREE.SphereGeometry(1, 32, 32);
// Crear 100 meshes con el mismo material/geo (no crear 100 materiales)
for (let i = 0; i < 100; i++) {
  scene.add(new THREE.Mesh(geo, mat)); // OK — reusan la misma geo y mat
}

// 4. Limpiar al destruir la escena (SPA, componentes que se desmontan)
renderer.dispose();
geometry.dispose();
material.dispose();
```

---

## 13. Plantilla lista para copiar

HTML y JS mínimos para una escena 3D de fondo en un hero.

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mi Escena 3D</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #08050f; color: white; font-family: sans-serif; }

    #hero {
      position: relative;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #hero-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .hero-content {
      position: relative;
      z-index: 10;
      text-align: center;
    }
    h1 { font-size: 4rem; }
  </style>
</head>
<body>

  <section id="hero">
    <canvas id="hero-canvas"></canvas>
    <div class="hero-content">
      <h1>Mi Landing</h1>
      <p>Texto encima del 3D</p>
    </div>
  </section>

  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
  <script>
  (() => {
    // ── SETUP ──────────────────────────────────────────
    const canvas   = document.getElementById('hero-canvas');
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);

    // ── LUCES ──────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const light1 = new THREE.PointLight(0xc9a96e, 5, 30);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x7b2fbe, 3, 20);
    light2.position.set(-5, -3, 3);
    scene.add(light2);

    // ── OBJETO ─────────────────────────────────────────
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(2, 0.6, 32, 200),
      new THREE.MeshStandardMaterial({ color: 0xc9a96e, metalness: 0.8, roughness: 0.2 })
    );
    scene.add(mesh);

    // ── PARTÍCULAS ─────────────────────────────────────
    const N   = 200;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i*3  ] = (Math.random() - 0.5) * 20;
      pos[i*3+1] = (Math.random() - 0.5) * 20;
      pos[i*3+2] = (Math.random() - 0.5) * 10 - 5;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xc9a96e, size: 0.07, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })));

    // ── MOUSE PARALLAX ─────────────────────────────────
    let tx = 0, ty = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', e => {
      tx = (e.clientX / innerWidth  - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
    });

    // ── RESIZE ─────────────────────────────────────────
    window.addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });

    // ── LOOP ───────────────────────────────────────────
    const clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      const t = clock.getElapsedTime();

      // parallax suave
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      camera.position.x = cx * 1.5;
      camera.position.y = -cy * 1.0;
      camera.lookAt(0, 0, 0);

      // animación del objeto
      mesh.rotation.y = t * 0.3;
      mesh.rotation.x = Math.PI / 4 + t * 0.08;
      mesh.position.y = Math.sin(t * 0.5) * 0.4;

      // luces orbitando
      light1.position.x = Math.sin(t * 0.4) * 7;
      light1.position.y = Math.cos(t * 0.3) * 5;

      renderer.render(scene, camera);
    })();
  })();
  </script>
</body>
</html>
```

---

## Cheatsheet rápida

```
CREAR OBJETO:   Mesh = new THREE.Mesh(Geometry, Material)
AGREGAR:        scene.add(mesh)
POSICIÓN:       mesh.position.set(x, y, z)
ROTACIÓN:       mesh.rotation.set(x, y, z)  ← en radianes
ESCALA:         mesh.scale.setScalar(n)       ← uniforme
TIEMPO:         clock.getElapsedTime()        ← segundos
OSCILAR:        Math.sin(t * velocidad) * amplitud
ORBITAR:        x = Math.cos(t) * radio  /  z = Math.sin(t) * radio
LERP:           current += (target - current) * factor
TRANSPARENTE:   { transparent: true, opacity: 0.5 }
FONDO TRANSP:   WebGLRenderer({ alpha: true }) + setClearColor(0,0,0,0)
RETINA:         setPixelRatio(Math.min(devicePixelRatio, 2))
DEBUG EJES:     scene.add(new THREE.AxesHelper(5))
```
