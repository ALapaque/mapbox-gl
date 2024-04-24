import type { IsochroneData } from '@/models/isochrone/IsochroneData'
import useMapboxState from '@/stores/mapbox'
// @ts-ignore
import { defineStore } from 'pinia'

export type IsochroneState = {
  loading: boolean,
  settings: {
    mode: 'walking' | 'cycling' | 'driving',
    distance: number
  },
  data: IsochroneData | undefined,
  api: {
    baseUrl: string,
    accessToken: string
  }
}

const defaultState = (): IsochroneState => ({
  loading: false,
  settings: {
    mode: 'walking',
    distance: 1000
  },
  data: undefined,
  api: {
    baseUrl: 'https://api.mapbox.com/isochrone/v1/mapbox/',
    accessToken: import.meta.env.VITE_MAPBOX_PUBLIC_ACCESS_TOKEN
  }
})

const id: string = 'isochrone-state'

const useIsochroneState = defineStore(id, {
  state: defaultState,
  actions: {
    async getIsochroneValue(): Promise<any> {
      const mapboxState = useMapboxState()

      this.loading = true

      try {
        const query = await fetch(
          `${this.api.baseUrl}${this.settings.mode}/${mapboxState.marker.lng},${mapboxState.marker.lat}?contours_meters=${this.settings.distance}&polygons=true&access_token=${this.api.accessToken}`,
          { method: 'GET' }
        )
        const data: IsochroneData = await query.json()

        if (!data) {
          this.data = undefined

          return
        }

        this.data = data
        return data
      } catch (_) {

      } finally {
        this.loading = false
      }
    }
  }
})

export default useIsochroneState
