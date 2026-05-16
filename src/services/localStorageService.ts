/*
  Local Storage / SQLite Service for ParkMate

  This file represents the local data layer for saving recent parking choices
  and favourite parking areas. Expo SQLite is installed for persistent storage
  in the final mobile version.

  For the current prototype, the app demonstrates favourites using app state.
  This service explains where SQLite logic would be separated from UI screens.
*/

export type LocalFavourite = {
  id: string;
  name: string;
  zone: string;
};

export function explainSQLiteUse() {
  return 'SQLite is used to store favourite parking areas locally so they can remain available even when the app is restarted.';
}

export function createFavouriteRecord(id: string, name: string, zone: string): LocalFavourite {
  return {
    id,
    name,
    zone,
  };
}
