// Little particle effects, like the magic "poof" when you change animals.

function createEffects(scene) {
  const particles = [];
  const geometry = new THREE.BoxGeometry(0.18, 0.18, 0.18);
  const colors = [0xffffff, 0xfff59d, 0xf8bbd0, 0xb3e5fc];

  function poof(position) {
    for (let i = 0; i < 40; i++) {
      const cube = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: colors[i % colors.length], transparent: true }));
      cube.position.set(position.x, position.y + 0.6, position.z);
      const a = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.5;
      cube.userData.velocity = new THREE.Vector3(Math.cos(a) * speed, 1 + Math.random() * 3, Math.sin(a) * speed);
      cube.userData.life = 1;
      scene.add(cube);
      particles.push(cube);
    }
  }

  // Little boxy hearts that float up from a spot.
  const heartGeometry = new THREE.BoxGeometry(0.22, 0.22, 0.08);
  function hearts(position, count = 10) {
    for (let i = 0; i < count; i++) {
      const cube = new THREE.Mesh(heartGeometry, new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff5c8a : 0xff1744, transparent: true }));
      cube.position.set(position.x + (Math.random() - 0.5) * 1.2, position.y + 1.5 + Math.random(), position.z + (Math.random() - 0.5) * 1.2);
      cube.rotation.z = Math.PI / 4;
      cube.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.4, 1 + Math.random(), (Math.random() - 0.5) * 0.4);
      cube.userData.life = 1.4;
      cube.userData.float = true;
      scene.add(cube);
      particles.push(cube);
    }
  }

  // A ball bouncing from one spot to another and back.
  const balls = [];
  function ball(from, to) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), new THREE.MeshLambertMaterial({ color: 0xffeb3b }));
    mesh.castShadow = true;
    scene.add(mesh);
    balls.push({ mesh, from: from.clone(), to: to.clone(), time: 0 });
  }

  function updateBalls(dt) {
    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];
      b.time += dt;
      const trip = 0.7;
      const leg = b.time / trip;
      const k = leg < 1 ? leg : 2 - leg; // there and back again
      b.mesh.position.lerpVectors(b.from, b.to, Math.max(0, Math.min(1, k)));
      b.mesh.position.y = 0.3 + Math.sin(Math.min(1, leg % 1) * Math.PI) * 2;
      b.mesh.rotation.x += dt * 10;
      if (b.time > trip * 2) {
        scene.remove(b.mesh);
        b.mesh.material.dispose();
        balls.splice(i, 1);
      }
    }
  }

  function update(dt) {
    updateBalls(dt);
    for (let i = particles.length - 1; i >= 0; i--) {
      const cube = particles[i];
      cube.userData.life -= dt * 1.2;
      if (!cube.userData.float) cube.userData.velocity.y -= 4 * dt; // hearts float, sparkles fall
      cube.position.addScaledVector(cube.userData.velocity, dt);
      cube.rotation.x += dt * 5;
      cube.rotation.y += dt * 4;
      cube.material.opacity = Math.max(cube.userData.life, 0);
      if (cube.userData.life <= 0) {
        scene.remove(cube);
        cube.material.dispose();
        particles.splice(i, 1);
      }
    }
  }

  return { poof, hearts, ball, update };
}
