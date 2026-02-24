(() => {
  'use strict';

  /* ────────────────────────────────────────────────────
     GSAP PLUGIN REGISTRATION
  ──────────────────────────────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  /* ────────────────────────────────────────────────────
     CUSTOM CURSOR
  ──────────────────────────────────────────────────── */
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function trackRing() {
    rx += (mx - rx) * .11;
    ry += (my - ry) * .11;
    dot.style.cssText  = `left:${mx}px;top:${my}px`;
    ring.style.cssText = `left:${rx}px;top:${ry}px`;
    requestAnimationFrame(trackRing);
  })();

  document.querySelectorAll('a,button,.p-card,.t-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  /* ────────────────────────────────────────────────────
     LOADING SCREEN
  ──────────────────────────────────────────────────── */
  const loader     = document.getElementById('loader');
  const loaderBar  = document.getElementById('loaderBar');
  const loaderLogo = document.getElementById('loaderLogo');

  gsap.to(loaderLogo, { opacity: 1, y: 0, duration: .8, ease: 'power2.out', delay: .15 });

  let pct = 0;
  const iv = setInterval(() => {
    pct = Math.min(100, pct + Math.random() * 14 + 4);
    loaderBar.style.width = pct + '%';
    if (pct >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        gsap.to(loader, {
          opacity: 0, duration: .55, ease: 'power2.inOut',
          onComplete: () => { loader.style.display = 'none'; startPage(); }
        });
      }, 350);
    }
  }, 70);

  /* ────────────────────────────────────────────────────
     LENIS SMOOTH SCROLL
  ──────────────────────────────────────────────────── */
  const lenis = new Lenis({
    duration: 1.25,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ────────────────────────────────────────────────────
     NAV
  ──────────────────────────────────────────────────── */
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose= document.getElementById('mobileClose');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
  hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
  mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
  document.querySelectorAll('.mm-link').forEach(l =>
    l.addEventListener('click', () => mobileMenu.classList.remove('open'))
  );

  /* ────────────────────────────────────────────────────
     THREE.JS — HERO
  ──────────────────────────────────────────────────── */
  function initHeroScene() {
    const canvas   = document.getElementById('hero-canvas');
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 200);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x000000, 0);

    /* Lights — warm pastry palette */
    scene.add(new THREE.AmbientLight(0xfff5e0, .3));

    const warmPt = new THREE.PointLight(0xffdab9, 6, 40); // peach light
    warmPt.position.set(6, 5, 6);
    scene.add(warmPt);

    const accentPt = new THREE.PointLight(0xc9506e, 3, 30); // rose accent
    accentPt.position.set(-6, -3, 4);
    scene.add(accentPt);

    const rimPt = new THREE.PointLight(0xfff0d0, 2, 20); // cream rim
    rimPt.position.set(0, 10, -4);
    scene.add(rimPt);

    /* Material shorthand */
    const m = (color, metal = .1, rough = .55) =>
      new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough });

    /* helper: crea mesh, setea posición y devuelve el mesh */
    const mk = (geo, mat, x = 0, y = 0, z = 0) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      return mesh;
    };

    /* ── TORTA DE CAPAS (centrepiece, lado derecho) ── */
    const cakeGroup = new THREE.Group();

    // plato dorado
    cakeGroup.add(mk(new THREE.CylinderGeometry(1.45, 1.45, .07, 64), m(0xc9a96e, .6, .3), 0, -1.02, 0));

    // capa 1 — bizcocho chocolate
    cakeGroup.add(mk(new THREE.CylinderGeometry(1.18, 1.22, .48, 64), m(0x3b1a05),          0, -.6,   0));
    // crema 1
    cakeGroup.add(mk(new THREE.CylinderGeometry(1.25, 1.25, .1,  64), m(0xfdf0e0, 0, .85),  0, -.3,   0));

    // capa 2 — bizcocho vainilla  (pegada a crema 1, que termina en y=-0.25)
    cakeGroup.add(mk(new THREE.CylinderGeometry(.98, 1.02, .48,  64), m(0xc8a06b),           0, -.01,  0));
    // crema 2                     (pegada a capa 2, que termina en y=+0.23)
    cakeGroup.add(mk(new THREE.CylinderGeometry(1.05, 1.05, .1,  64), m(0xfdf0e0, 0, .85),  0,  .28,  0));

    // capa 3 — bizcocho chocolate oscuro  (pegada a crema 2, que termina en y=+0.33)
    cakeGroup.add(mk(new THREE.CylinderGeometry(.8, .84, .42,    64), m(0x2a0f02),           0,  .54,  0));

    // ganache drip  (capa 3 termina en y=0.75)
    const drip = new THREE.Mesh(
      new THREE.TorusGeometry(.82, .07, 8, 64),
      m(0x1a0800, .15, .45)
    );
    drip.position.set(0, .76, 0);
    cakeGroup.add(drip);

    // swirl de crema chantilly encima
    const chantilly = new THREE.Mesh(
      new THREE.TorusKnotGeometry(.28, .09, 80, 12, 2, 3),
      m(0xfff8f2, 0, .9)
    );
    chantilly.scale.set(.9, 1.3, .9);
    chantilly.position.set(0, 1.08, 0);
    cakeGroup.add(chantilly);

    // bolitas doradas decorativas en el top
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(.048, 16, 16),
        m(0xc9a96e, .9, .1)
      );
      ball.position.set(Math.cos(angle) * .56, .80, Math.sin(angle) * .56);
      cakeGroup.add(ball);
    }

    cakeGroup.position.set(2.5, .2, 0);
    cakeGroup.scale.set(0, 0, 0);
    scene.add(cakeGroup);

    /* ── MACARON (lado izquierdo-arriba) — cúpulas hemisféricas ── */
    const macaronGroup = new THREE.Group();
    const shellMat = m(0xc9506e, .04, .62);

    // concha superior: hemisferio aplanado (scale.y baja) → forma real de macaron
    const topDome = new THREE.Mesh(
      new THREE.SphereGeometry(.72, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2),
      shellMat
    );
    topDome.scale.y = .44;
    topDome.position.y = .09;
    macaronGroup.add(topDome);

    // crema (delgada: sólo la franja visible entre conchas)
    macaronGroup.add(mk(
      new THREE.CylinderGeometry(.74, .74, .10, 64),
      m(0xfcc8d0, 0, .9), 0, 0, 0
    ));

    // concha inferior: igual pero volteada
    const botDome = new THREE.Mesh(
      new THREE.SphereGeometry(.72, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2),
      shellMat
    );
    botDome.scale.y = .44;
    botDome.rotation.x = Math.PI;
    botDome.position.y = -.09;
    macaronGroup.add(botDome);

    macaronGroup.rotation.set(Math.PI / 3, 0, Math.PI / 7);
    macaronGroup.position.set(-3.4, 1.5, -.5);
    macaronGroup.scale.set(0, 0, 0);
    scene.add(macaronGroup);

    /* ── DONUT (parte inferior) ── */
    const donutGroup = new THREE.Group();

    // masa del donut
    donutGroup.add(
      new THREE.Mesh(
        new THREE.TorusGeometry(1.0, .42, 32, 128),
        m(0xc07830)   // caramelo tostado
      )
    );
    // glasé curvo: sigue la superficie frontal del torus
    // z(r) = √(tubeR² − (r − ringR)²)  → cúpula que cae a cero en los bordes
    const glazeMat = new THREE.MeshStandardMaterial({
      color: 0xf9bfcc, metalness: .2, roughness: .06,
      emissive: 0xf9bfcc, emissiveIntensity: .08,
      side: THREE.DoubleSide,
    });
    const glazeGeo = (() => {
      const rSeg = 128, radSeg = 32;
      const ringR = 1.0, tubeR = 0.42;
      const inner = ringR - tubeR, outer = ringR + tubeR;
      const pos = [], uvs = [], idx = [];
      for (let i = 0; i <= rSeg; i++) {
        const th = (i / rSeg) * Math.PI * 2;
        const cT = Math.cos(th), sT = Math.sin(th);
        for (let j = 0; j <= radSeg; j++) {
          const r  = inner + (outer - inner) * (j / radSeg);
          const dR = r - ringR;
          const z  = Math.sqrt(Math.max(0, tubeR * tubeR - dR * dR));
          pos.push(r * cT, r * sT, z);
          uvs.push(i / rSeg, j / radSeg);
        }
      }
      for (let i = 0; i < rSeg; i++) {
        for (let j = 0; j < radSeg; j++) {
          const a = i * (radSeg + 1) + j, b = (i + 1) * (radSeg + 1) + j;
          idx.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2));
      g.setIndex(idx);
      g.computeVertexNormals();
      return g;
    })();
    const glazeMesh = new THREE.Mesh(glazeGeo, glazeMat);
    glazeMesh.position.z = .05;
    donutGroup.add(glazeMesh);

    // sprinkles: delante del glasé (z > .44), rotación en plano XY para que se vean
    const sprinkleColors = [0xff6b9d, 0xffd166, 0x06d6a0, 0x118ab2, 0xef476f];
    for (let i = 0; i < 12; i++) {
      const angle  = (i / 12) * Math.PI * 2 + Math.random() * .4;
      const radius = .65 + Math.random() * .65;
      const sp = new THREE.Mesh(
        new THREE.CylinderGeometry(.028, .028, .14, 8),
        m(sprinkleColors[i % sprinkleColors.length], 0, .8)
      );
      sp.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, .50);
      // rotation.z = orientación aleatoria en el plano XY (chispa acostada sobre el glasé)
      sp.rotation.set(0, 0, Math.random() * Math.PI * 2);
      donutGroup.add(sp);
    }

    // sin rotación X — TorusGeometry ya mira hacia +Z (la cámara) por defecto
    donutGroup.rotation.set(0, 0, Math.PI / 9);
    donutGroup.position.set(-1.4, -3.0, .8);
    donutGroup.scale.set(0, 0, 0);
    scene.add(donutGroup);

    /* ── SWIRL CHANTILLY decorativo (arriba, fondo) ── */
    // TorusKnot p=3,q=4 parece una roseta de manga pastelera
    const creamSwirl = new THREE.Mesh(
      new THREE.TorusKnotGeometry(.9, .22, 140, 16, 3, 4),
      m(0xfff5ee, 0, .88)
    );
    creamSwirl.position.set(.8, 3.3, -2.2);
    creamSwirl.scale.set(0, 0, 0);
    scene.add(creamSwirl);

    /* ── TRUFA DE CHOCOLATE (pequeña, lado izquierdo) ── */
    const truffleGroup = new THREE.Group();

    // núcleo — marrón cacao más cálido y claro para que se distinga del fondo
    truffleGroup.add(
      new THREE.Mesh(new THREE.SphereGeometry(.65, 32, 32), m(0x7a3a10, .08, .88))
    );

    // bolitas de cacao en la superficie → textura rústica de trufa
    for (let i = 0; i < 24; i++) {
      const phi   = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r  = .65;
      const br = .018 + Math.random() * .024;
      const bump = new THREE.Mesh(
        new THREE.SphereGeometry(br, 7, 7),
        m(0x4a1f06, .04, .96)
      );
      bump.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
      truffleGroup.add(bump);
    }

    // destellos dorados (nibs de cacao / hoja de oro)
    for (let i = 0; i < 5; i++) {
      const phi   = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = .665;
      const gold = new THREE.Mesh(
        new THREE.SphereGeometry(.015, 6, 6),
        m(0xc9a96e, .85, .15)
      );
      gold.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
      truffleGroup.add(gold);
    }

    truffleGroup.position.set(-3.4, -1.0, .6);
    truffleGroup.scale.set(0, 0, 0);
    scene.add(truffleGroup);

    /* ── PARTÍCULAS — polvo de azúcar glass ── */
    const N = 260;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i*3  ] = (Math.random() - .5) * 22;
      pos[i*3+1] = (Math.random() - .5) * 22;
      pos[i*3+2] = (Math.random() - .5) * 12 - 5;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particles = new THREE.Points(particlesGeo, new THREE.PointsMaterial({
      color: 0xfdf0e0, size: .06, transparent: true, opacity: .5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(particles);

    /* GSAP entrada elástica */
    gsap.to([cakeGroup, macaronGroup, donutGroup, truffleGroup].map(g => g.scale), {
      x: 1, y: 1, z: 1,
      duration: 1.8, ease: 'elastic.out(1, .45)',
      stagger: .2, delay: 1.2,
    });
    gsap.to(creamSwirl.scale, {
      x: 1, y: 1, z: 1,
      duration: 1.8, ease: 'elastic.out(1, .45)', delay: 1.65,
    });

    /* Mouse parallax */
    let tx = 0, ty = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', e => {
      tx = (e.clientX / innerWidth  - .5) * 2;
      ty = (e.clientY / innerHeight - .5) * 2;
    });

    /* Resize */
    window.addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });

    /* Animation loop */
    const clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      const t = clock.getElapsedTime();

      cx += (tx - cx) * .04;
      cy += (ty - cy) * .04;

      // Torta — gira despacio, flota
      cakeGroup.rotation.y = t * .18;
      cakeGroup.position.y = .2 + Math.sin(t * .4) * .28;

      // Macaron — flota y bambolea suavemente
      macaronGroup.rotation.y = -t * .22;
      macaronGroup.rotation.z = Math.PI / 7 + Math.sin(t * .28) * .06;
      macaronGroup.position.y = 1.5 + Math.cos(t * .44) * .38;

      // Donut — gira en Y, bamboleo en X ±17° para siempre verse como dona
      donutGroup.rotation.y = t * .32;
      donutGroup.rotation.x = Math.sin(t * .4) * .3;
      donutGroup.position.y = -3.0 + Math.sin(t * .48) * .42;

      // Swirl chantilly — rotación lenta y orgánica
      creamSwirl.rotation.x = t * .18;
      creamSwirl.rotation.y = t * .26;
      creamSwirl.position.y = 3.3 + Math.sin(t * .33) * .28;

      // Trufa — flota y gira
      truffleGroup.position.y = -1.0 + Math.cos(t * .52) * .32;
      truffleGroup.rotation.y = t * .38;

      // Partículas (azúcar glass cayendo lento)
      particles.rotation.y = t * .01;
      particles.rotation.x = t * .006;

      // Luces orbitando
      warmPt.position.x  =  Math.sin(t * .38) * 8;
      warmPt.position.y  =  Math.cos(t * .32) * 6;
      accentPt.position.x = -Math.sin(t * .26) * 7;
      accentPt.position.y =  Math.cos(t * .48) * 5;

      // Parallax cámara
      camera.position.x = cx * 1.6;
      camera.position.y = -cy * 1.1;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    })();
  }

  /* ────────────────────────────────────────────────────
     THREE.JS — ABOUT CARD
  ──────────────────────────────────────────────────── */
  function initAboutScene() {
    const canvas = document.getElementById('about-canvas');
    if (!canvas) return;
    const wrap = canvas.parentElement;
    const W = wrap.clientWidth, H = wrap.clientHeight;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(50, W / H, .1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    scene.add(new THREE.AmbientLight(0xfff5e0, .4));
    const pt1 = new THREE.PointLight(0xffdab9, 5, 20); // peach
    pt1.position.set(3, 3, 3);
    scene.add(pt1);
    const pt2 = new THREE.PointLight(0xc9506e, 3, 15); // rose
    pt2.position.set(-3, -2, 2);
    scene.add(pt2);

    const sm = (color, metal = .1, rough = .55) =>
      new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough });

    /* helper local igual que en hero */
    const mkm = (geo, mat, x = 0, y = 0, z = 0) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      return mesh;
    };

    /* ── MACARON CENTRAL girando — cúpulas hemisféricas ── */
    const mac = new THREE.Group();

    const macTopDome = new THREE.Mesh(
      new THREE.SphereGeometry(.9, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2),
      sm(0xe8607e, .04, .6)
    );
    macTopDome.scale.y = .44;
    macTopDome.position.y = .11;
    mac.add(macTopDome);

    mac.add(mkm(
      new THREE.CylinderGeometry(.92, .92, .13, 64),
      sm(0xfcb8c8, 0, .9), 0, 0, 0
    ));

    const macBotDome = new THREE.Mesh(
      new THREE.SphereGeometry(.9, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2),
      sm(0xe8607e, .04, .6)
    );
    macBotDome.scale.y = .44;
    macBotDome.rotation.x = Math.PI;
    macBotDome.position.y = -.11;
    mac.add(macBotDome);

    scene.add(mac);

    /* ── MACARONS pequeños orbitando (distintos colores) — hemisféricos ── */
    const macColors = [0x6ec9a9, 0xc9a96e, 0x9b59b6, 0x3498db];
    const orbs = macColors.map((color, i) => {
      const g = new THREE.Group();

      const ot = new THREE.Mesh(
        new THREE.SphereGeometry(.28, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        sm(color, .04, .6)
      );
      ot.scale.y = .44;
      ot.position.y = .04;
      g.add(ot);

      g.add(mkm(new THREE.CylinderGeometry(.29, .29, .06, 32), sm(0xfcc8d0, 0, .9), 0, 0, 0));

      const ob = new THREE.Mesh(
        new THREE.SphereGeometry(.28, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        sm(color, .04, .6)
      );
      ob.scale.y = .44;
      ob.rotation.x = Math.PI;
      ob.position.y = -.04;
      g.add(ob);

      scene.add(g);
      return {
        group: g,
        radius: 1.9 + i * .2,
        speed:  .35 + i * .12,
        phase:  (i / macColors.length) * Math.PI * 2,
        tilt:   .3 + i * .15,
      };
    });

    /* ── BOLITAS de trufa orbitando en plano diferente ── */
    const truffles = [0x2d1200, 0xc9a96e, 0xfdf0e0].map((color, i) => {
      const t = new THREE.Mesh(
        new THREE.SphereGeometry(.14 + i * .04, 24, 24),
        sm(color, color === 0xc9a96e ? .7 : .2, .3)
      );
      scene.add(t);
      return {
        mesh: t,
        radius: 1.5 + i * .3,
        speed:  .55 + i * .18,
        phase:  i * 2.1,
      };
    });

    const clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      const t = clock.getElapsedTime();

      // Macaron central — gira sobre sí mismo con bamboleo
      mac.rotation.y = t * .4;
      mac.rotation.z = Math.sin(t * .3) * .12;

      // Macarons orbitando
      orbs.forEach(o => {
        o.group.position.x = Math.cos(t * o.speed + o.phase) * o.radius;
        o.group.position.y = Math.sin(t * o.speed + o.phase) * .6;
        o.group.position.z = Math.sin(t * o.speed + o.phase) * o.radius * .5;
        o.group.rotation.y = t * .5;
        o.group.rotation.z = o.tilt;
      });

      // Trufas orbitando en plano diferente
      truffles.forEach(tr => {
        tr.mesh.position.x =  Math.cos(t * tr.speed + tr.phase) * tr.radius;
        tr.mesh.position.y = -Math.sin(t * tr.speed * .7 + tr.phase) * 1.2;
        tr.mesh.position.z =  Math.sin(t * tr.speed + tr.phase) * tr.radius * .6;
      });

      // Luz caliente orbitando
      pt1.position.x = Math.sin(t * .5) * 4;
      pt1.position.y = Math.cos(t * .4) * 3;

      renderer.render(scene, camera);
    })();
  }

  /* ────────────────────────────────────────────────────
     PAGE ANIMATIONS (called after loader hides)
  ──────────────────────────────────────────────────── */
  function startPage() {
    initHeroScene();
    initAboutScene();

    /* Hero text entrance */
    gsap.to('.hero-eyebrow', { opacity: 1, y: 0, duration: .8, ease: 'power2.out', delay: .2 });
    gsap.to('.hero-title .line span', { y: 0, duration: 1.05, ease: 'power3.out', stagger: .14, delay: .4 });
    gsap.to('.hero-sub',   { opacity: 1, y: 0, duration: .8, ease: 'power2.out', delay: .85 });
    gsap.to('.hero-btns',  { opacity: 1, y: 0, duration: .8, ease: 'power2.out', delay: 1.05 });
    gsap.to('#heroScroll', { opacity: 1, duration: 1,        ease: 'power2.out', delay: 1.6  });

    /* Scroll-reveal for all .will-fade elements */
    document.querySelectorAll('.will-fade').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 45 },
        {
          opacity: 1, y: 0,
          duration: .85, ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });

    /* Stat counters */
    document.querySelectorAll('.stat-num').forEach(el => {
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      ScrollTrigger.create({
        trigger: el, start: 'top 82%', once: true,
        onEnter: () => gsap.to({ v: 0 }, {
          v: target, duration: 2.2, ease: 'power2.out',
          onUpdate() { el.textContent = Math.round(this.targets()[0].v).toLocaleString('es-AR') + suffix; }
        })
      });
    });

    /* Parallax quote bg */
    gsap.to('#pqBg', {
      y: -70, ease: 'none',
      scrollTrigger: {
        trigger: '.pq-section',
        start: 'top bottom', end: 'bottom top',
        scrub: true,
      }
    });

    /* Product cards stagger */
    gsap.fromTo('.p-card',
      { opacity: 0, y: 55 },
      {
        opacity: 1, y: 0, duration: .75, ease: 'power2.out', stagger: .1,
        scrollTrigger: { trigger: '.products-grid', start: 'top 82%' }
      }
    );

    /* Process steps stagger */
    gsap.fromTo('.step',
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: .7, ease: 'power2.out', stagger: .14,
        scrollTrigger: { trigger: '.steps', start: 'top 82%' }
      }
    );

    /* Testimonial cards stagger */
    gsap.fromTo('.t-card',
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: .75, ease: 'power2.out', stagger: .12,
        scrollTrigger: { trigger: '.tgrid', start: 'top 82%' }
      }
    );

    /* About image subtle parallax */
    gsap.to('.about-img-inner', {
      y: -40, ease: 'none',
      scrollTrigger: {
        trigger: '#about',
        start: 'top bottom', end: 'bottom top',
        scrub: true,
      }
    });
  }

})();
