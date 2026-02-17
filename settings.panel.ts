import { html, useState } from 'preact';
import { SettingEntryModel, SettingsModel, SettingsDescription, isSettingItemModel, isSettingCategoryModel, SettingItemModel, nameToLabel } from "./settings.model";
import { SettingsCategory } from './settings.category';
import SettingsItem from './settings.item';
import { SettingsController } from './settings.control';


/**
 * The settings panel.
 * 
 * @template T The type of the settings data. 
 */
export interface SettingsPanelProps<T> {
    /**
     * The model of the settings.
     */
    model: SettingsModel;

    /**
     * The title of the settings panel.
     */
    title?: string;

    /**
     * The controller of the settings updates.
     */
    controller?: SettingsController<T>;

    /**
     * Property change event handler.
     * @param property The changed property.
     * @param value The new property name. An undefined value indicates property value is unset.
     */
    onchange?: (property: string, value?: string) => void;
    /**
     *  The close event handler.
     */
    onclose?: () => void;
    /**
     * The save event handler.
     * @param settings The saved settings.
     */
    onsave?: (settings: SettingsModel) => void;
}

/**
 * Create entries with values taken from the controller.
 * @param settings The settings model.
 * @param controller The optional session controller used to determine the value of the model entries.
 * @returns The list of setting entry models for the settings with controller values for all entries controller
 * recognizes. 
 */
export function createEntries<T>(settings: SettingsModel, controller?: SettingsController<T>): SettingEntryModel[] {
    if (controller) {
        // Adding the values of the settings to the entries. 
        return (settings.entries ?? []).map(
            (entry: SettingEntryModel) => {
                if (isSettingCategoryModel(entry)) {
                    return controller.setCategoryValue(entry, entry.prefix);
                } else if (isSettingItemModel(entry)) {
                    return controller.setItemValue(entry, entry.name);
                } else {
                    return entry;
                }
            }
        )
    } else {
        return settings.entries ?? [];
    }
}

/**
 * Create a settings panel. 
 * @param props The properties of the settings panel.
 */
export function SettingsPanel<T>(props: SettingsPanelProps<T>) {
    const [settings, setSettings] = useState<SettingsModel>(props.model);
    const [currentSettings, setCurrentSettings] = useState<SettingsModel>(settings);
    const [entries, setEntries] = useState<Array<SettingEntryModel>>(createEntries(currentSettings, props.controller));
    const [saved, setSaved] = useState<boolean>(true);
    const [unchanged, setUnchanged] = useState<boolean>(true);

    const handleChange = (property: string, value?: string) => {
        const propertyChain = property.split(".");
        setSettings((current: SettingsModel) => {
            var newSettings = current;
            if (props.controller) {
                // Performing controller change. 
                
            } else if (propertyChain.length > 1) {
                // Categories.
                console.warn("Updating category not yet supported");
                return current;
            } else {
                // Items update without controller.
                const propertyName = propertyChain[0];
                const propertyEntry = current.items?.find((entry: SettingEntryModel) => ("name" in entry && entry.name === propertyName));
                if (propertyEntry === undefined || !Object.is(value, propertyEntry?.value)) {
                    // The value has changed.
                    if (value === undefined) {
                        // Removing the entry.
                        if (propertyEntry)
                            newSettings = { ...current, entries: current.entries.filter(entry => !("name" in entry && entry.name === propertyName)) }
                    } else {
                        // Replacing the entry. 
                        if (propertyEntry) {
                            // Updating existing.
                            newSettings = {
                                ...current, entries: current.entries.map(entry => ("name" in entry && entry.name === propertyName) ? {
                                    ...entry,
                                    value
                                } : entry)
                            };
                        } else {
                            // Adding new entry.
                            newSettings = {
                                ...current, 
                                entries: [...current.entries, {name: propertyName, label: nameToLabel(propertyName), value}]
                            };
                        }
                    }
                }
            }
            if (Object.is(newSettings, current)) {
                // The settings has not been changed.
                return current;
            }
            setSaved(true);
            setUnchanged(true);
            return newSettings;
        });
    };

    const handleSave = (event: MouseEvent) => {
        if (!saved) {
            setCurrentSettings(settings);
            props.onsave?.(settings);
        } else {
            /** TODO: Log error message */
            console.warn("Save event without unsaved content");
        }
    }

    const handleDefault = (event: MouseEvent) => {
        setSettings(props.model);
        setCurrentSettings(props.model);
        setUnchanged(true);
        setSaved(true);
    }

    const handleCancel = (evnet: MouseEvent) => {
        // Cancel the changes. 
        setCurrentSettings(settings);
        setSaved(true);
        props.onclose?.();
    }

    return html`<div class="settings">
    <div class="header">${props.title ?? "Settings"}</div>
    <div class="main">${settings.entries.map((entry: SettingEntryModel) => {
        if ("entries" in entry) {
            // Category entry.
            return html`<${SettingsCategory} model="${entry}" onchange="${handleChange}" />`;
        } else {
            // Item entry.
            return html`<${SettingsItem} model="${entry}" onchange="${handleChange}" />`;
        }
    })
        }</div>
    <div class="footer">
        <button type="submit" onclick="${handleSave}" disabled="${saved}" value="save">Save</button>
        <button type="default" onclick="${handleDefault}" disabled="${unchanged}" value="revert">Revert</button>
        <button type="cancel" onclick="${handleCancel}" >Close</button>
    </div>
    </div>`;
}