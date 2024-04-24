import { defineStore } from 'pinia'

export type MapboxPosition = {
  lng: number,
  lat: number,
  bearing: number,
  pitch: number,
  zoom: number
}

export type MapboxState = {
  base: MapboxPosition,
  marker: MapboxPosition,
  mapView: MapboxPosition,
}

const defaultPosition: MapboxPosition = {
  lng: 4.586389684507004,
  lat: 50.730783284021605,
  bearing: 0,
  pitch: 0,
  zoom: 15
}

const defaultState = (): MapboxState => ({
  base: defaultPosition,
  marker: defaultPosition,
  mapView: defaultPosition
})

const id: string = 'mapbox-state'

const useMapboxState = defineStore<typeof id, MapboxState>(id, {
  state: defaultState
})

export default useMapboxState
