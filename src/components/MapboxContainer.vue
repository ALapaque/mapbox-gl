<template>
  <div id="layout">
    <MapboxGL
        v-model="currentPosition"
        :markerPosition='marker'
        :isochroneValues='isochroneData'
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

export default defineComponent({
  components: {
    SidebarsContainer,
    MapboxGL
  },
  setup() {
    const mapboxState = useMapboxState()
    const { marker, mapView: currentPosition } = storeToRefs(mapboxState)
    const isochroneState = useIsochroneState()
    const { data: isochroneData } = storeToRefs(isochroneState)

    watch(marker, async() => {
      await isochroneState.getIsochroneValue()
    }, { deep: true })

    const handleOnMapLoaded = async() => {
      await isochroneState.getIsochroneValue()
    }

    return {
      marker,
      currentPosition,
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

#sidebar {
  background-color: rgb(35 55 75 / 90%);
  color: #fff;
  padding: 6px 12px;
  font-family: monospace;
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  margin: 12px;
  border-radius: 4px;
}
</style>