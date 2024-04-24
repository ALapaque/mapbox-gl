import useMapboxState from '@/stores/mapbox'
import { defineStore } from 'pinia'

export type IsochroneState = {
  loading: boolean,
  settings: {
    mode: 'walking' | 'cycling' | 'driving',
    duration: number
  },
  values: any[],
  api: {
    baseUrl: string,
    accessToken: string
  }
}

const defaultState = (): IsochroneState => ({
  loading: false,
  settings: {
    mode: 'driving',
    duration: 10
  },
  values: [],
  api: {
    baseUrl: 'https://api.mapbox.com/isochrone/v1/mapbox/',
    accessToken: import.meta.env.VITE_MAPBOX_PUBLIC_ACCESS_TOKEN
  }
})

const id: string = 'isochrone-state'

const useIsochroneState = defineStore(id, {
  state: defaultState,
  actions: {
    async getIsochroneValue(): Promise<any[] | undefined> {
      const mapboxState = useMapboxState()

      this.loading = true

      try {
        const query = await fetch(
          `${this.api.baseUrl}${this.settings.mode}/${mapboxState.current.lng},${mapboxState.current.lat}?contours_minutes=${this.settings.duration}&polygons=true&access_token=${this.api.accessToken}`,
          { method: 'GET' }
        )
        const data = await query.json()

        if (!data) {
          this.values = []

          return []
        }

        this.values = data

        return data
      } catch (_) {

      } finally {
        this.loading = false
      }
    }
  }
})

export default useIsochroneState
