<template>
  <div
      id="isochrone-sidebar__container"
      class="bg-gray-faint round shadow-darken10">
    <form id="params">
      <h4 class="txt-m txt-bold mb6 color-gray">Isochrone Plugin</h4>
      <div class="mb12 mr12 toggle-group align-center">
        <label class="toggle-container">
          <input
              v-model='plugins.isochrone'
              :checked="plugins.isochrone"
              :value='true'
              name="profile"
              type="radio" />
          <div class="toggle toggle--active-null toggle--null">Active</div>
        </label>
        <label class="toggle-container">
          <input
              v-model='plugins.isochrone'
              :checked="!plugins.isochrone"
              :value='false'
              name="profile"
              type="radio" />
          <div class="toggle toggle--active-null toggle--null">Inactive</div>
        </label>
      </div>
      <h4 class="txt-m txt-bold mb6 color-gray">Drawing plugin:</h4>
      <div class="mb12 mr12 toggle-group align-center">
        <label class="toggle-container">
          <input
              v-model='plugins.drawShapes'
              :checked="plugins.drawShapes"
              :value='true'
              name="duration"
              type="radio" />
          <div class="toggle toggle--active-null toggle--null">Active</div>
        </label>
        <label class="toggle-container">
          <input
              v-model='plugins.drawShapes'
              :checked="!plugins.drawShapes"
              :value='false'
              name="duration"
              type="radio" />
          <div class="toggle toggle--active-null toggle--null">Inactive</div>
        </label>
      </div>
    </form>
  </div>
</template>

<script lang='ts'>
import useMapboxState from '@/stores/mapbox'
import { storeToRefs } from 'pinia'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const mapboxState = useMapboxState()
    const { plugins } = storeToRefs(mapboxState)

    return {
      plugins
    }
  }
})
</script>

<style scoped>
div#isochrone-sidebar__container {
  width: 100%;
  padding: 1rem;
}

div.toggle-group {
  display: flex;
  flex-wrap: wrap;
}
</style>