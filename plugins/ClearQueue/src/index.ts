import { redux } from "@luna/lib";
import { LunaUnload, Tracer } from "@luna/core";

export const { trace, errSignal } = Tracer("[ClearQueue]");

trace.msg.log(`Loaded!`);

// Functions in unloads are called when plugin is unloaded.
// Used to clean up resources, even listener dispose etc should be added here
export const unloads = new Set<LunaUnload>();
import { Settings, settings } from "./Settings";
export { Settings };

let shifting = false;
let firstUIDForSelect: string | false = false;

// Log to console whenever changing page
redux.intercept("playQueue/CLEAR_QUEUE", unloads, (payload) => {
	if (shifting || !settings.cpq) return false;

	const playQueue = redux.store.getState().playQueue;
	const playQueueElementsCopy = [...playQueue.elements];
	const removedItems = playQueueElementsCopy.splice(playQueue.currentIndex + 1);

	// console.log(payload, playQueue, playQueueElementsCopy, removedItems);

	for (const song of removedItems) {
		redux.actions["playQueue/REMOVE_ELEMENT"]({ uid: song.uid });
	}

	trace.msg.log(`Removed ${removedItems.length} items from the queue!`);

	return true;
});

// Note that the remove element does not appear to occur when using the above remove element call.
redux.intercept("playQueue/REMOVE_ELEMENT", unloads, (payload) => {
	if (!shifting || !settings.mrm) return false;

	const uid = payload.uid;

	if (firstUIDForSelect) {
		const playQueue = redux.store.getState().playQueue;
		const playQueueElementsCopy = [...playQueue.elements];

		const first = playQueueElementsCopy.findIndex((e) => e.uid === firstUIDForSelect);
		const last = playQueueElementsCopy.findIndex((e) => e.uid === uid);

		const removeElements = playQueueElementsCopy.slice(first, last + 1);

		console.log("AAA", removeElements);

		if (removeElements.length < 0) {
			firstUIDForSelect = false;
			return false;
		}

		for (const song of removeElements) {
			redux.actions["playQueue/REMOVE_ELEMENT"]({ uid: song.uid });
		}

		trace.msg.log(`Removed ${removeElements.length} items from the queue!`);

		firstUIDForSelect = false;
	} else {
		firstUIDForSelect = uid;
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
