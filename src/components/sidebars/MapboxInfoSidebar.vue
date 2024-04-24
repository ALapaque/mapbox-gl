<template>
  <div
      id="mapbox-info-sidebar__container"
      class='bg-gray-faint round color-gray round shadow-darken10'>
    Longitude: {{ current.lng.toFixed(4) }} | Latitude: {{ current.lat.toFixed(4) }} | Zoom: {{ current.zoom.toFixed(2)
    }} |
    <template v-if="current.bearing">
      Bearing: {{ current.bearing.toFixed(2) }} |
    </template>
    <template v-if="current.pitch">
      Pitch: {{ current.pitch.toFixed(2) }} |
    </template>
    <button @click="handleOnReset">
      Reset
    </button>
  </div>
</template>

<script lang="ts">
import useMapboxState from '@/stores/mapbox'
import { storeToRefs } from 'pinia'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const mapboxState = useMapboxState()
    const { current } = storeToRefs(mapboxState)

    const handleOnReset = () => {
      mapboxState.$reset()
    }

    return {
      current,
      handleOnReset
    }
  }
})
</script>

<style scoped>
div#mapbox-info-sidebar__container {
  height: max-content;
  width: max-content;
  padding: .5rem 1rem;
}
</style>