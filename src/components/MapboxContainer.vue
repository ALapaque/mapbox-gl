<template>
  <div id="layout">
    <MapboxGL
        v-model='mapViewPosition'
        :markerPosition='markerPosition'
        :isochroneValues='isochroneData'
        :drawing-plugin='plugins.drawShapes'
        :isochronePlugin='plugins.isochrone'
        @map:loaded='handleOnMapLoaded' />
    <SidebarsContainer />
  </div>
</template>

<script lang="ts">
import MapboxGL from '@/components/MapboxGL.vue'
import SidebarsContainer from '@/components/sidebars/SidebarsContainer.vue'
import useIsochroneState from '@/stores/isochrone'
import useMapboxState from '@/stores/mapbox'
import { storeToRefs } from 'pinia'
import { defineComponent, watch } from 'vue'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

export default defineComponent({
  components: {
    SidebarsContainer,
    MapboxGL
  },
  setup() {
    const mapboxState = useMapboxState()
    const { marker: markerPosition, mapView: mapViewPosition, plugins } = storeToRefs(mapboxState)
    const isochroneState = useIsochroneState()
    const { data: isochroneData, settings } = storeToRefs(isochroneState)

    watch([ markerPosition, settings, plugins ], async() => {
      console.log('MapboxContainer > watcher > [ markerPosition, settings, plugins ] ')
      if (!plugins.value.isochrone) {
        return
      }

      await isochroneState.getIsochroneValue()
    }, { deep: true })

    const handleOnMapLoaded = async() => {
      if (!plugins.value.isochrone) {
        return
      }

      await isochroneState.getIsochroneValue()
    }

    return {
      mapViewPosition,
      markerPosition,
      plugins,
      isochroneData,
      handleOnMapLoaded
    }
  }
})
</script>

<style>
#layout {
  flex: 1;
  display: flex;
}
</style>