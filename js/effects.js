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

  function update(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const cube = particles[i];
      cube.userData.life -= dt * 1.2;
      cube.userData.velocity.y -= 4 * dt;
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

  return { poof, update };
}
