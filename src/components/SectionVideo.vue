<script setup lang="ts">
import { useVideoStore } from '@/stores/video'

const videoStore = useVideoStore()
</script>

<template>
  <Transition name="video-fade" mode="out-in">
    <VideoList v-if="videoStore.currentView === 'list'" key="list" />
    <VideoDetail v-else key="detail" />
  </Transition>
</template>

<style scoped>
.video-fade-enter-active,
.video-fade-leave-active {
  transition: opacity 0.2s ease;
}
.video-fade-enter-from,
.video-fade-leave-to {
  opacity: 0;
}
</style>
