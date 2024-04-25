import { defineStore } from 'pinia'

export type MapboxPosition = {
  lng: number,
  lat: number,
  bearing?: number,
  pitch?: number,
  zoom?: number
}

export type MapboxGLPlugins = {
  drawShapes: boolean
  isochrone: boolean
}

export type MapboxState = {
  initialized: boolean,
  base: MapboxPosition,
  marker: MapboxPosition,
  mapView: MapboxPosition,
  plugins: MapboxGLPlugins
}

const defaultPosition: MapboxPosition = {
  lng: 4.586389684507004,
  lat: 50.730783284021605,
  bearing: 0,
  pitch: 0,
  zoom: 15
}

const defaultState = (): MapboxState => {
  return {
    initialized: false,
    base: defaultPosition,
    marker: {
      lng: 0,
      lat: 0
    },
    mapView: {
      lng: 0,
      lat: 0,
      bearing: 0,
      pitch: 0,
      zoom: 15
    },
    plugins: {
      drawShapes: false,
      isochrone: false
    }
  }
}

const id: string = 'mapbox-state'

const useMapboxState = defineStore(id, {
  state: defaultState
})

export default useMapboxState
