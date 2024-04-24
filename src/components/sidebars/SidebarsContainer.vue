<template>
  <div id='sidebars__container'>
    <MapboxInfoSidebar />
    <MapboxIsochroneSidebar />
  </div>
</template>

<script lang="ts">
import MapboxInfoSidebar from '@/components/sidebars/MapboxInfoSidebar.vue'
import MapboxIsochroneSidebar from '@/components/sidebars/MapboxIsochroneSidebar.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  components: { MapboxInfoSidebar, MapboxIsochroneSidebar }
})
</script>

<style scoped>
div#sidebars__container {
  position: absolute;
  top: 0;
  left: 0;
  width: 500px;
  max-width: 35vw;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

@media screen and (max-width: 820px) {
  div#sidebars__container {
    max-width: 100vw;
    max-height: 25dvh;
    width: 100vw;
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>