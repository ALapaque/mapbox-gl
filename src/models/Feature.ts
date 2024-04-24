import type { Geometry } from '@/models/Geometry'
import type { Properties } from '@/models/Properties'

export type Feature = {
  properties: Properties;
  geometry: Geometry;
  type: string;
}