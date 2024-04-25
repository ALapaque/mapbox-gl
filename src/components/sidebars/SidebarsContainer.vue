<template>
  <div id='sidebars__container'>
    <MapboxPluginsSidebar />
    <MapboxInfoSidebar />
    <template v-if='plugins.isochrone'>
      <MapboxIsochroneSidebar />
    </template>
  </div>
</template>

<script lang="ts">
import MapboxInfoSidebar from '@/components/sidebars/MapboxInfoSidebar.vue'
import MapboxIsochroneSidebar from '@/components/sidebars/MapboxIsochroneSidebar.vue'
import MapboxPluginsSidebar from '@/components/sidebars/MapboxPluginsSidebar.vue'
import useMapboxState from '@/stores/mapbox'
import { storeToRefs } from 'pinia'
import { defineComponent } from 'vue'

export default defineComponent({
  components: { MapboxPluginsSidebar, MapboxInfoSidebar, MapboxIsochroneSidebar },
  setup() {
    const mapboxState = useMapboxState()
    const { plugins } = storeToRefs(mapboxState)

    return {
      plugins
    }
  }
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