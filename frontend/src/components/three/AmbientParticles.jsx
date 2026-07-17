import { Sparkles } from '@react-three/drei'

export default function AmbientParticles({ lowPower = false }) {
  return (
    <Sparkles
      count={lowPower ? 60 : 140}
      scale={[16, 11, 9]}
      size={lowPower ? 1 : 1.6}
      speed={0.25}
      opacity={0.45}
      color="#34D399"
      noise={1}
    />
  )
}
