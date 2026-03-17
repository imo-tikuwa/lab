<script setup lang="ts">
import { useTemplateRef } from 'vue'

interface SpotlightCardProps {
  spotlightColor?: string
}

const props = withDefaults(defineProps<SpotlightCardProps>(), {
  spotlightColor: 'rgba(255, 255, 255, 0.12)',
})

const cardRef = useTemplateRef<HTMLDivElement>('cardRef')
const mouseX = ref(0)
const mouseY = ref(0)
const opacity = ref(0)

function onMouseMove(e: MouseEvent): void {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  mouseX.value = e.clientX - rect.left
  mouseY.value = e.clientY - rect.top
}

function onMouseEnter(): void {
  opacity.value = 1
}

function onMouseLeave(): void {
  opacity.value = 0
}
</script>

<template>
  <div ref="cardRef" class="relative overflow-hidden" @mousemove="onMouseMove" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <div
      class="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out rounded-[inherit]"
      :style="{
        opacity,
        background: `radial-gradient(250px circle at ${mouseX}px ${mouseY}px, ${props.spotlightColor}, transparent 70%)`,
      }"
    />
    <slot />
  </div>
</template>
