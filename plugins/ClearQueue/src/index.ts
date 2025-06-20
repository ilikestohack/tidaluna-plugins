import { redux } from "@luna/lib";
import { LunaUnload, Tracer } from "@luna/core";

export const { trace, errSignal } = Tracer("[ClearQueue]");

trace.msg.log(`Loaded!`);

// Functions in unloads are called when plugin is unloaded.
// Used to clean up resources, even listener dispose etc should be added here
export const unloads = new Set<LunaUnload>();

let shifting = false;

// Log to console whenever changing page
redux.intercept("playQueue/CLEAR_QUEUE", unloads, (payload) => {
	if (shifting) return false;

	const playQueue = redux.store.getState().playQueue;
	const playQueueElementsCopy = [...playQueue.elements];
	const removedItems = playQueueElementsCopy.splice(playQueue.currentIndex + 1);

	// console.log(payload, playQueue, playQueueElementsCopy, removedItems);

	for (const song of removedItems) {
		redux.actions["playQueue/REMOVE_ELEMENT"]({ uid: song.uid });
	}
	return true;
});

function setShift(e: KeyboardEvent) {
	if (!e.shiftKey) {
		shifting = false;
	} else shifting = true;
}

window.addEventListener("keydown", setShift);
window.addEventListener("keyup", setShift);

unloads.add(() => {
	window.removeEventListener("keydown", setShift);
	window.removeEventListener("keyup", setShift);
});
