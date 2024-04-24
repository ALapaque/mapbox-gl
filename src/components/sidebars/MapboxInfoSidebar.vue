<template>
  <div
      id="mapbox-info-sidebar__container"
      class='bg-gray-faint round color-gray round shadow-darken10'>
    <div class='current-position__container'>
      <h4>MapView position:</h4>
      <span>
        Longitude: {{ mapView.lng.toFixed(4) }} |
        Latitude: {{ mapView.lat.toFixed(4) }} |
        Zoom: {{ mapView.zoom.toFixed(2) }} |
        <template v-if="mapView.bearing">
          Bearing: {{ mapView.bearing.toFixed(2) }} |
        </template>
        <template v-if="mapView.pitch">
          Pitch: {{ mapView.pitch.toFixed(2) }} |
        </template>
      </span>
      <button @click="handleOnReset">
        Reset
      </button>
    </div>
    <div class='marker-position__container'>
      <h4>Marker position:</h4>
      <span>
        Longitude: {{ marker.lng.toFixed(4) }} |
        Latitude: {{ marker.lat.toFixed(4) }} |
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import useMapboxState from '@/stores/mapbox'
import { storeToRefs } from 'pinia'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const mapboxState = useMapboxState()
    const { mapView, marker } = storeToRefs(mapboxState)

    const handleOnReset = () => {
      mapboxState.$reset()
    }

    return {
      mapView,
      marker,
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