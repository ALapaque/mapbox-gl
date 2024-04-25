<template>
  <div
      id="mapbox-info-sidebar__container"
      class='bg-gray-faint round color-gray round shadow-darken10'>
    <div class='current-position__container'>
      <h4 class="txt-m txt-bold mb6 color-gray">MapView position:</h4>
      <span>
        Longitude: {{ mapView.lng.toFixed(4) }} |
        Latitude: {{ mapView.lat.toFixed(4) }} |
        <template v-if='mapView?.zoom'>
          Zoom: {{ mapView?.zoom?.toFixed(2) }} |
        </template>
        <template v-if="mapView?.bearing">
          Bearing: {{ mapView?.bearing?.toFixed(2) }} |
        </template>
        <template v-if="mapView?.pitch">
          Pitch: {{ mapView?.pitch?.toFixed(2) }} |
        </template>
      </span>
    </div>
    <div class='marker-position__container'>
      <h4 class="txt-m txt-bold mb6 color-gray">Marker position:</h4>
      <span>
        Longitude: {{ marker.lng.toFixed(4) }} |
        Latitude: {{ marker.lat.toFixed(4) }}
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

    return {
      mapView,
      marker
    }
  }
})
</script>

<style scoped>
div#mapbox-info-sidebar__container {
  width: 100%;
  padding: .5rem 1rem;
}
</style>