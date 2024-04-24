<template>
  <div id="layout">
    <MapboxContainer />
  </div>
</template>

<script>
import MapboxContainer from "@/components/MapboxContainer.vue";

export default {
  name: 'App',
  components: {
    MapboxContainer,
  }
};
</script>