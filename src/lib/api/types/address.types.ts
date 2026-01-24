export interface UserAddress {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  street: string;
  city?: string;
  cityId?: string;
  state?: string;
  stateId?: string;
  phoneNumber: string;
  buildingNumber: string;
  floorNumber: string;
  apartmentNumber: string;
  notes: string;
}

