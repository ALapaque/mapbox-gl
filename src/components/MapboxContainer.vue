<template>
  <div id="layout">
    <div id="sidebar">
      Longitude: {{ location.lng.toFixed(4) }} | Latitude: {{ location.lat.toFixed(4) }} | Zoom: {{ location.zoom.toFixed(2) }} |
      <template v-if="location.bearing">
        Bearing: {{ location.bearing.toFixed(2) }} |
      </template>
      <template v-if="location.pitch">
        Pitch: {{ location.pitch.toFixed(2) }} |
      </template>
      <button @click="resetLocation">
        Reset
      </button>
    </div>
    <MapboxGL v-model="location" @update:modelValue='handleOnChange'/>
  </div>
</template>

<script lang="ts">
import MapboxGL from '@/components/MapboxGL.vue'
import { defineComponent, ref } from 'vue';
import 'mapbox-gl/dist/mapbox-gl.css';

export default defineComponent({
  components: {
    MapboxGL,
  },
  setup() {
    const location = ref({
      lng: -71.224518,
      lat: 42.213995,
      bearing: 0,
      pitch: 0,
      zoom: 9
    })

    const resetLocation = () => {
      location.value = { lng: -71.224518, lat: 42.213995, zoom: 9, pitch: 0, bearing: 0 }
    }

    const handleOnChange = (value: any) => {
      console.log('handleOnChange :: ', value)
    }

    return {
      location,
      resetLocation,
      handleOnChange
    }
  }
});
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