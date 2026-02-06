import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, Sparkles, Stars, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import './App.css'

const crewPalette = {
  hello: {
    primary: '#ffb6d9',
    accent: '#ff4fa4',
    detail: '#2c1232',
  },
  cinnamoroll: {
    primary: '#d8f2ff',
    accent: '#8fd8ff',
    detail: '#4d6fa8',
  },
  kuromi: {
    primary: '#402452',
    accent: '#ff9ad5',
    detail: '#f7eefc',
  },
}

function HeartSwarm({ count = 90 }) {
  const mesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const heartShape = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0.35)
    shape.bezierCurveTo(0, 0.35, -0.35, 0.35, -0.35, 0)
    shape.bezierCurveTo(-0.35, -0.35, 0, -0.45, 0, -0.7)
    shape.bezierCurveTo(0, -0.45, 0.35, -0.35, 0.35, 0)
    shape.bezierCurveTo(0.35, 0.35, 0, 0.35, 0, 0.35)
    return shape
  }, [])

  const heartGeometry = useMemo(
    () =>
      new THREE.ExtrudeGeometry(heartShape, {
        depth: 0.08,
        bevelEnabled: false,
      }),
    [heartShape],
  )

  const colors = ['#ff77b3', '#ffc2e9', '#ffe0f1', '#ffa3d1']
  const seeds = useMemo(
    () =>
      new Array(count).fill(0).map(() => ({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          Math.random() * 4 - 1,
          (Math.random() - 0.5) * 10,
        ),
        speed: 0.35 + Math.random() * 0.65,
        scale: 0.35 + Math.random() * 0.45,
        color: colors[Math.floor(Math.random() * colors.length)],
        sway: 0.25 + Math.random() * 0.55,
      })),
    [count],
  )

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const t = clock.getElapsedTime()
    seeds.forEach((seed, i) => {
      const y = seed.position.y + Math.sin(t * seed.speed + i) * 0.01 + seed.speed * 0.01
      const x = seed.position.x + Math.sin(t * 0.6 + i) * seed.sway * 0.01
      const z = seed.position.z + Math.cos(t * 0.45 + i) * seed.sway * 0.01

      if (y > 3.8) {
        seed.position.y = -2
      } else {
        seed.position.y = y
      }
      seed.position.x = x
      seed.position.z = z

      dummy.position.copy(seed.position)
      dummy.rotation.set(
        Math.sin(t * 1.2 + i) * 0.6,
        Math.cos(t * 0.8 + i) * 0.6,
        Math.sin(t * 0.9 + i) * 0.6,
      )
      const s = seed.scale + Math.sin(t * 1.5 + i) * 0.05
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  useEffect(() => {
    if (!mesh.current) return
    const color = new THREE.Color()
    seeds.forEach((seed, i) => {
      color.set(seed.color)
      mesh.current.setColorAt(i, color)
    })
    if (mesh.current.instanceColor) {
      mesh.current.instanceColor.needsUpdate = true
    }
  }, [seeds])

  return (
    <instancedMesh ref={mesh} args={[heartGeometry, undefined, count]}>
      <meshStandardMaterial
        transparent
        opacity={0.9}
        roughness={0.3}
        emissive="#ff6fa5"
        emissiveIntensity={0.5}
        color="#ff9bc9"
      />
    </instancedMesh>
  )
}

function Character({ type, position = [0, 0, 0], phase = 0 }) {
  const palette = crewPalette[type]
  const group = useRef()
  const isCinna = type === 'cinnamoroll'

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase
    if (group.current) {
      group.current.position.y = Math.sin(t * 2) * 0.25
      group.current.rotation.y = Math.sin(t * 1.2) * 0.5
      group.current.rotation.z = Math.sin(t * 2.4) * 0.08
    }
  })

  return (
    <group ref={group} position={position}>
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.55, 0.8, 10, 20]} />
        <meshStandardMaterial color={palette.primary} roughness={0.3} />
      </mesh>

      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.6, 48, 32]} />
        <meshStandardMaterial color={palette.primary} roughness={0.2} />
      </mesh>

      {!isCinna && (
        <>
          <mesh position={[-0.38, 1.6, 0]} rotation={[0, 0, 0.3]}>
            <coneGeometry args={[0.26, 0.28, 12]} />
            <meshStandardMaterial color={palette.accent} roughness={0.2} />
          </mesh>
          <mesh position={[0.38, 1.6, 0]} rotation={[0, 0, -0.3]}>
            <coneGeometry args={[0.26, 0.28, 12]} />
            <meshStandardMaterial color={palette.accent} roughness={0.2} />
          </mesh>
        </>
      )}

      {isCinna && (
        <>
          <mesh position={[-0.95, 1.05, 0]} rotation={[0, 0, 0.3]}>
            <capsuleGeometry args={[0.45, 0.1, 8, 16]} />
            <meshStandardMaterial color={palette.primary} roughness={0.2} />
          </mesh>
          <mesh position={[0.95, 1.05, 0]} rotation={[0, 0, -0.3]}>
            <capsuleGeometry args={[0.45, 0.1, 8, 16]} />
            <meshStandardMaterial color={palette.primary} roughness={0.2} />
          </mesh>
        </>
      )}

      <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.1, 12, 36]} />
        <meshStandardMaterial
          color={palette.accent}
          roughness={0.1}
          emissive={palette.accent}
          emissiveIntensity={0.35}
        />
      </mesh>

      <mesh position={[0, 1.1, 0.6]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.42, 0.08, 16, 42]} />
        <meshStandardMaterial color={palette.accent} roughness={0.1} />
      </mesh>

      <mesh position={[0, 0.6, 0.48]} rotation={[0, 0, 0]}>
        <capsuleGeometry args={[0.12, 0.5, 8, 16]} />
        <meshStandardMaterial color={palette.detail} roughness={0.1} />
      </mesh>

      <mesh position={[0, 1.05, 0.63]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={palette.detail} />
      </mesh>

      <mesh position={[-0.18, 1.15, 0.62]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={palette.detail} />
      </mesh>
      <mesh position={[0.18, 1.15, 0.62]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={palette.detail} />
      </mesh>

      <mesh position={[0, 1.42, -0.1]} rotation={[0, 0, 0]}>
        <RoundedBox args={[isCinna ? 0.9 : 0.6, 0.25, 0.25]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color={palette.accent} roughness={0.15} />
        </RoundedBox>
      </mesh>

      {!isCinna && (
        <mesh position={[0.2, 1.35, 0.48]} rotation={[0, 0, 0.8]}>
          <torusKnotGeometry args={[0.16, 0.06, 64, 12, 2, 3]} />
          <meshStandardMaterial
            color={palette.accent}
            roughness={0.15}
            emissive={palette.accent}
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
    </group>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
      <cylinderGeometry args={[10, 10, 0.1, 48]} />
      <meshStandardMaterial color="#ffe6f4" roughness={0.8} />
    </mesh>
  )
}

function Scene() {
  return (
    <Canvas className="scene" camera={{ position: [0, 2.5, 6], fov: 48 }} shadows>
      <color attach="background" args={['#ffeef8']} />
      <ambientLight intensity={1.1} color="#ffd2f2" />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.5}
        color="#fff2f8"
        castShadow
      />
      <pointLight position={[-4, 3, -2]} intensity={0.8} color="#c2b9ff" />

      <Sparkles count={120} speed={0.8} size={3} opacity={0.5} color="#fff3ff" />
      <Stars radius={40} depth={30} count={5000} factor={4} saturation={0} fade />
      <HeartSwarm count={105} />
      <Ground />

      <Float speed={3} floatIntensity={2} rotationIntensity={0.6}>
        <group>
          <Character type="hello" position={[-2.2, 0, 0]} phase={0} />
          <Character type="cinnamoroll" position={[0, 0, 0]} phase={1.3} />
          <Character type="kuromi" position={[2.2, 0, 0]} phase={2.6} />
        </group>
      </Float>

      <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.9} />
    </Canvas>
  )
}

function App() {
  const [answer, setAnswer] = useState(null)
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 })
  const [showHearts, setShowHearts] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const heartTimer = useRef()
  const modalTimer = useRef()
  const hearts = useMemo(
    () =>
      new Array(40).fill(0).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2.8 + Math.random() * 2,
        size: 18 + Math.random() * 26,
        color: ['#ff4fa4', '#ff8fcd', '#ffc2e9', '#ffd8f5'][i % 4],
      })),
    [],
  )

  const moveNoButton = () => {
    const range = 180
    setNoOffset({
      x: (Math.random() - 0.5) * range,
      y: (Math.random() - 0.5) * range,
    })
  }

  const handleYes = () => {
    setAnswer('yes')
    setShowHearts(true)
    setShowModal(true)
    if (heartTimer.current) clearTimeout(heartTimer.current)
    if (modalTimer.current) clearTimeout(modalTimer.current)
    heartTimer.current = setTimeout(() => setShowHearts(false), 5000)
    modalTimer.current = setTimeout(() => setShowModal(false), 10000)
  }

  useEffect(() => {
    moveNoButton()
    return () => {
      if (heartTimer.current) clearTimeout(heartTimer.current)
      if (modalTimer.current) clearTimeout(modalTimer.current)
    }
  }, [])

  return (
    <div className="page">
      {showHearts && (
        <div className="heart-overlay">
          {hearts.map((heart) => (
            <span
              key={heart.id}
              className="heart"
              style={{
                left: `${heart.left}%`,
                animationDelay: `${heart.delay}s`,
                animationDuration: `${heart.duration}s`,
                fontSize: `${heart.size}px`,
                color: heart.color,
              }}
            >
              ❤
            </span>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <video
              className="modal-video"
              src="/hurray_final.mp4"
              autoPlay
              loop
              
              playsInline
              controls={false}
            />
          </div>
        </div>
      )}
      <div className="glow pink" />
      <div className="glow blue" />
      <div className="ui">
        <p className="tag">The Hello Kitty squad asks:</p>
        <h1>
          Will you be my <span>Valentine</span>?
        </h1>
        <p className="sub">
          Kurumi, Cinnamoroll, and Hello Kitty are already dancing. Say yes and unleash extra
          sparkles!
        </p>
        <div className="buttons">
          <button className="yes" onClick={handleYes}>
            Yes, let&apos;s sparkle 💖
          </button>
          <button
            className="no"
            onMouseEnter={moveNoButton}
            onClick={moveNoButton}
            style={{ transform: `translate(${noOffset.x}px, ${noOffset.y}px)` }}
          >
            No (nice try)
          </button>
        </div>
        {answer === 'yes' && <div className="celebrate">YAY! Prepare for max cuteness overload ✨</div>}
      </div>

      <div className="canvas-wrap">
        <div className="video-frame">
          <video
            className="hero-video"
            src="/main.mp4"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
          />
          
        </div>
      </div>
    </div>
  )
}

export default App
