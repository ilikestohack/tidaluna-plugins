import React from "react";

import { trace } from ".";
import { ReactiveStore } from "@luna/core";
import { LunaSettings, LunaSwitchSetting } from "@luna/ui";

export const settings = await ReactiveStore.getPluginStorage("@char/clearqueue", {
	cpq: true,
	mrm: true,
});

export const Settings = () => {

    // CPQ - Clear Partial Queue
	const [cpqChecked, cpqSetChecked] = React.useState(settings.cpq);
	const cpqOnChange = React.useCallback((_: React.ChangeEvent<HTMLInputElement>, checked?: boolean) => {
		trace.msg.log(`Clear Partial Queue is now ${checked ? "on" : "off"}`);
        settings.cpq = checked ?? false
		cpqSetChecked(settings.cpq);
	}, []);

    // MRM - MultiRemove
	const [mrmChecked, mrmSetChecked] = React.useState(settings.mrm);
	const mrmOnChange = React.useCallback((_: React.ChangeEvent<HTMLInputElement>, checked?: boolean) => {
		trace.msg.log(`MultiRemove is now ${checked ? "on" : "off"}`);
        settings.mrm = checked ?? false
		mrmSetChecked(settings.mrm);
	}, []);

	return (
		<LunaSettings>
			<LunaSwitchSetting title="Clear Partial Queue" checked={cpqChecked} desc="Only clear songs after the currently playing one from queue." onChange={cpqOnChange} />
			<LunaSwitchSetting title="MultiRemove" checked={mrmChecked} desc="Ability to hold shift and click two remove buttons in the queue to remove songs in between. (Includes clicked songs)" onChange={mrmOnChange} />
		</LunaSettings>
	);
};