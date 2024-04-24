<template>
  <div
      id="isochrone-sidebar__container"
      class="bg-gray-faint round shadow-darken10">
    <form id="params">
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
      <h4 class="txt-m txt-bold mb6 color-gray">Choose a maximum duration:</h4>
      <div class="mb12 mr12 toggle-group align-center">
        <label class="toggle-container">
          <input
              v-model='settings.duration'
              :checked="settings.duration === 10"
              name="duration"
              type="radio"
              value="10" />
          <div class="toggle toggle--active-null toggle--null">10 min</div>
        </label>
        <label class="toggle-container">
          <input
              v-model='settings.duration'
              :checked="settings.duration === 20"
              name="duration"
              type="radio"
              value="20" />
          <div class="toggle toggle--active-null toggle--null">20 min</div>
        </label>
        <label class="toggle-container">
          <input
              v-model='settings.duration'
              :checked="settings.duration === 30"
              name="duration"
              type="radio"
              value="30" />
          <div class="toggle toggle--active-null toggle--null">30 min</div>
        </label>
      </div>
    </form>
  </div>
</template>

<script lang='ts'>
import useIsochroneState from '@/stores/isochrone'
import { storeToRefs } from 'pinia'
import { defineComponent, watch } from 'vue'

export default defineComponent({
  setup() {
    const isochroneState = useIsochroneState()
    const { settings } = storeToRefs(isochroneState)

    watch(settings, async() => {
      console.log('MapboxIsochroneSidebar > settings changed :: ', settings)

      await isochroneState.getIsochroneValue()
    }, { deep: true })

    return {
      settings
    }
  }
})
</script>

<style>
div#isochrone-sidebar__container {
  width: max-content;
  height: max-content;
  padding: 1rem;
}
</style>