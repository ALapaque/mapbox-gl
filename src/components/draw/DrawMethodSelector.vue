<template>
  <select>
    <option
        v-for='(mode, index) in items'
        :key='index'>
      A
    </option>
  </select>
</template>

<script lang="ts">
import MapboxGLDraw from '@mapbox/mapbox-gl-draw'
import { Map } from 'mapbox-gl'
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
    }
  },
  setup(props) {
    const value: Ref<(MapboxDraw.DrawMode & {}) | string> = ref<(MapboxDraw.DrawMode & {}) | string>('')
    const items = computed(() => {
      const modes = props.mapDrawer.modes
      console.log('computed options :: ', modes)
      if (!modes) {
        return []
      }

      return Object.keys(modes).forEach((mode) => ({
        label: mode,
        value: mode
      }))
    })

    onMounted(() => {
      console.log('DrawMethodSelector >> ', props)

      props.map.on('draw.modechange', (event) => {
        console.log('modechange', event.mode)
        value.value = event.mode
      })
    })

    const handleOnChange = (value: string) => {
      props.mapDrawer.changeMode(value)
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
select {
  position: absolute;
  z-index: 1;
  top: .5rem;
  right: .5rem;
}
</style>