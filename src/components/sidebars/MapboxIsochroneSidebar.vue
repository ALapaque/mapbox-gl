<template>
  <div
      id="isochrone-sidebar__container"
      class="bg-gray-faint round shadow-darken10">
    <form id="params">
      <h4 class="txt-m txt-bold mb6 color-gray">Isochrone settings</h4>
      <br />
      <h4 class="txt-m txt-bold mb6 color-gray">Choose a travel mode:</h4>
      <div class="mb12 mr12 toggle-group align-center">
        <label class="toggle-container">
          <input
              v-model='settings.mode'
              :checked="settings.mode === 'walking'"
              name="profile"
              type="radio"
              value="walking" />
          <div class="toggle toggle--active-null toggle--null">Walking</div>
        </label>
        <label class="toggle-container">
          <input
              v-model='settings.mode'
              :checked="settings.mode === 'cycling'"
              name="profile"
              type="radio"
              value="cycling" />
          <div class="toggle toggle--active-null toggle--null">Cycling</div>
        </label>
        <label class="toggle-container">
          <input
              v-model='settings.mode'
              :checked="settings.mode === 'driving'"
              name="profile"
              type="radio"
              value="driving" />
          <div class="toggle toggle--active-null toggle--null">Driving</div>
        </label>
      </div>
      <h4 class="txt-m txt-bold mb6 color-gray">Choose a maximum distance:</h4>
      <div class="mb12 mr12 toggle-group align-center">
        <label class="toggle-container">
          <input
              v-model='settings.distance'
              :checked="settings.distance === 1000"
              name="duration"
              type="radio"
              value="1000" />
          <div class="toggle toggle--active-null toggle--null">1 km</div>
        </label>
        <label class="toggle-container">
          <input
              v-model='settings.distance'
              :checked="settings.distance === 5000"
              name="duration"
              type="radio"
              value="5000" />
          <div class="toggle toggle--active-null toggle--null">5 km</div>
        </label>
        <label class="toggle-container">
          <input
              v-model='settings.distance'
              :checked="settings.distance === 10000"
              name="duration"
              type="radio"
              value="10000" />
          <div class="toggle toggle--active-null toggle--null">10 km</div>
        </label>
      </div>
    </form>
  </div>
</template>

<script lang='ts'>
import useIsochroneState from '@/stores/isochrone'
import { storeToRefs } from 'pinia'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const isochroneState = useIsochroneState()
    const { settings } = storeToRefs(isochroneState)

    return {
      settings
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