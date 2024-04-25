<template>
  <div id="layout">
    <MapboxGL
        v-if='isPositionInitialized'
        v-model='mapViewPosition'
        ref='mapboxGLRef'
        :markerPosition='markerPosition'
        :isochroneValues='isochroneData'
        @map:loaded='handleOnMapLoaded' />
    <div v-else class='access-position__container'>
      <h1 class='txt-bold mb6 color-gray'>Please answer the popup about accessing your positions</h1>
      <p class='mb6 color-gray'>Fallback to a default position in </p>
      <span class='color-red'>{{ countdown }}</span>
    </div>
    <SidebarsContainer v-if='isPositionInitialized' />
  </div>
</template>

<script lang="ts">
import MapboxGL, { type MapboxGLType } from '@/components/MapboxGL.vue'
import SidebarsContainer from '@/components/sidebars/SidebarsContainer.vue'
import useIsochroneState from '@/stores/isochrone'
import useMapboxState from '@/stores/mapbox'
import { storeToRefs } from 'pinia'
import { defineComponent, onMounted, ref, watch } from 'vue'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

export default defineComponent({
  components: {
    SidebarsContainer,
    MapboxGL
  },
  setup() {
    const mapboxGLRef = ref<MapboxGLType>()
    const mapboxState = useMapboxState()
    const {
      marker: markerPosition,
      mapView: mapViewPosition,
      base: basePosition,
      plugins,
      initialized,
      isIsochronePluginActivated,
      isDrawingPluginActivated
    } = storeToRefs(mapboxState)
    const isochroneState = useIsochroneState()
    const { data: isochroneData, settings } = storeToRefs(isochroneState)
    const countdown = ref<number>(10)

    watch(isIsochronePluginActivated, (isActive: boolean) => {
      if (!mapboxGLRef.value) {
        return
      }

      if (isActive) {
        mapboxGLRef.value?.plugins.isochrone.enable()
      } else {
        mapboxGLRef.value?.plugins.isochrone.disable()
      }
    })

    watch(isDrawingPluginActivated, (isActive: boolean) => {
      if (!mapboxGLRef.value) {
        return
      }

      if (isActive) {
        mapboxGLRef.value?.plugins.drawing.enable()
      } else {
        mapboxGLRef.value?.plugins.drawing.disable()
      }
    })

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

      navigator.geolocation.getCurrentPosition(handleOnSuccess, handleOnRejected, { timeout: 10000 })
      const countdownInterval = setInterval(() => {
        countdown.value --

        // if countdown reaches 0 or geolocation is initialized, clear the interval
        if (countdown.value <= 0 || initialized.value) {
          clearInterval(countdownInterval)
        }
      }, 1000)
    })

    return {
      mapboxGLRef,
      mapViewPosition,
      markerPosition,
      plugins,
      isochroneData,
      countdown,
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
  padding: 1rem;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

div.access-position__container > h1 {
  text-align: center;
  font-size: 2rem;
}

div.access-position__container > p {
  text-align: center;
  font-size: 1rem;
}

div.access-position__container > span {
  text-align: center;
  font-size: 4rem;
}
</style>