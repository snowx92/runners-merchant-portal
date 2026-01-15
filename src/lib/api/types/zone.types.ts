export interface City {
  id: string;
  name: string;
}

export interface Zone {
  id: string;
  name: string;
  cities: City[];
}

export interface ZonesResponse {
  status: number;
  message: string;
  data: Zone[];
}
