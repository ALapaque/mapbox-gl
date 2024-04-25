<template>
  <div id="layout">
    <MapboxGL
        v-if='isPositionInitialized'
        v-model='mapViewPosition'
        :markerPosition='markerPosition'
        :isochroneValues='isochroneData'
        :drawing-plugin='plugins.drawShapes'
        :isochronePlugin='plugins.isochrone'
        @map:loaded='handleOnMapLoaded' />
    <div v-else class='access-position__container'>
      <h1>Please answer the popup about accessing your positions</h1>
    </div>
    <SidebarsContainer v-if='isPositionInitialized' />
  </div>
</template>

<script lang="ts">
import MapboxGL from '@/components/MapboxGL.vue'
import SidebarsContainer from '@/components/sidebars/SidebarsContainer.vue'
import useIsochroneState from '@/stores/isochrone'
import useMapboxState from '@/stores/mapbox'
import { storeToRefs } from 'pinia'
import { defineComponent, onMounted, watch } from 'vue'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

export default defineComponent({
  components: {
    SidebarsContainer,
    MapboxGL
  },
  setup() {
    const mapboxState = useMapboxState()
    const {
      marker: markerPosition,
      mapView: mapViewPosition,
      base: basePosition,
      plugins,
      initialized
    } = storeToRefs(mapboxState)
    const isochroneState = useIsochroneState()
    const { data: isochroneData, settings } = storeToRefs(isochroneState)

    const fetchIsochroneValues = async() => {
      if (!plugins.value.isochrone) {
        return
      }

      await isochroneState.getIsochroneValue()
    }

    watch([ markerPosition, settings, plugins ], async() => {
      await fetchIsochroneValues()
    }, { deep: true })

    const handleOnMapLoaded = async() => {
      await fetchIsochroneValues()
    }

    onMounted(() => {
      const handleOnSuccess = (position: GeolocationPosition) => {
        const { longitude, latitude } = position.coords

        mapViewPosition.value.lng = longitude
        mapViewPosition.value.lat = latitude
        markerPosition.value.lng = longitude
        markerPosition.value.lat = latitude
        initialized.value = true
      }
      const handleOnRejected = () => {
        const { lng, lat } = basePosition.value
        mapViewPosition.value.lng = lng
        mapViewPosition.value.lat = lat
        markerPosition.value.lng = lng
        markerPosition.value.lat = lat
        initialized.value = true
      }

      navigator.geolocation.getCurrentPosition(handleOnSuccess, handleOnRejected, { timeout: 5000 })
    })

    return {
      mapViewPosition,
      markerPosition,
      plugins,
      isochroneData,
      isPositionInitialized: initialized,
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

div.access-position__container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

div.access-position__container > h1 {
  text-align: center;
}
</style>