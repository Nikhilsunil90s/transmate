import { Emitter, Events } from "/imports/client/services/events";

export const toggleSidePanel = () => {
  Emitter.emit(Events.TOGGLE_SIDE_PANEL);
};
