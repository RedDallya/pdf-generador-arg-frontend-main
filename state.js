export const appState = {
  activeClientId: null,
  activeTravelId: "travel_1",
  travels: {}
};

export function setActiveClientId(id) {
  appState.activeClientId = id;
}
