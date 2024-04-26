<template>
  <div class='select-container'>
    <select
        :value='value'
        class='select select--stroke'
        @change='handleOnChange'>
      <option
          v-for='(mode, index) in items'
          :key='index'
          :value='mode.value'>
        {{ mode.label }}
      </option>
    </select>
    <div class='select-arrow'></div>
  </div>
</template>

<script lang="ts">
import MapboxGLDraw from '@mapbox/mapbox-gl-draw'
import { Map } from 'mapbox-gl'
// @ts-ignore
import * as MapboxDrawGeodesic from 'mapbox-gl-draw-geodesic'
import { computed, defineComponent, onMounted, type PropType, type Ref, ref } from 'vue'

export default defineComponent({
  props: {
    map: {
      type: Object as PropType<Map>,
      required: true
    },
    mapDrawer: {
      type: Object as PropType<MapboxGLDraw>,
      required: true
    },
    mapDrawerModes: {
      type: Object as PropType<MapboxDrawGeodesic.modes>,
      required: true
    }
  },
  setup(props) {
    const value: Ref<(MapboxDraw.DrawMode & {}) | string> = ref<(MapboxDraw.DrawMode & {}) | string>('')
    const items = computed(() => {
      const modes = props.mapDrawerModes

      console.log('computed options :: ', modes, Object.keys(modes).map((mode) => ({
        label: mode,
        value: mode
      })))

      return Object.keys(modes).map((mode) => ({
        label: mode,
        value: mode.toLowerCase()
      }))
    })

    onMounted(() => {
      console.log('DrawMethodSelector >> ', props)

      props.map.on('draw.modechange', (event) => {
        console.log('modechange', event.mode)
        value.value = event.mode
      })

      props.map.on('draw.create', (event) => {
        const geojson = event.features[0]
        console.log('create', geojson)

        if (MapboxDrawGeodesic.isCircle(geojson)) {
          const center = MapboxDrawGeodesic.getCircleCenter(geojson)
          const radius = MapboxDrawGeodesic.getCircleRadius(geojson)
          console.log('circle', 'center', center, 'radius', radius)
        }
      })
      props.map.on('draw.update', (event) => {
        const geojson = event.features[0]
        console.log('update', event.action, geojson)

        if (MapboxDrawGeodesic.isCircle(geojson)) {
          const center = MapboxDrawGeodesic.getCircleCenter(geojson)
          const radius = MapboxDrawGeodesic.getCircleRadius(geojson)
          console.log('circle', 'center', center, 'radius', radius)
        }
      })
    })

    const handleOnChange = (event: any) => {
      console.log('handleOnChange :: ', event.target.value)
      props.mapDrawer.changeMode(event.target.value)
    }

    return {
      value,
      items,
      handleOnChange
    }
  }
})
</script>

<style scoped>
div.select-container {
  background: white;
  position: absolute;
  z-index: 1;
  top: .5rem;
  right: .5rem;
}
</style>