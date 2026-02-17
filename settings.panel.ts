import { html, useState } from 'preact';
import { SettingEntryModel, SettingsModel, SettingsDescription, isSettingItemModel, isSettingCategoryModel } from "./settings.model";
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
    const [saved, setSaved] = useState<boolean>(true);
    const [unchanged, setUnchanged] = useState<boolean>(true);

    const handleChange = (property: string, value: string) => {
        const propertyChain = property.split(".");
        setSettings( (current: SettingsModel) => {

            var newSettings = current;
            if (propertyChain.length > 1) {
                // Categories.
                console.warn("Updating category not yet supported");
                return current;
            } else {
                // Items.
                if (!Object.is(value,current.items[property].value)) {
                    // The value has changed.
                    const propertyEntry = current.items[propertyChain[0]];
                    newSettings = {...current, items: {...current.items, [propertyChain[0]]: {...propertyEntry, value}}};
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

    return html`<div>
    <div class="header">${props.title ?? "Settings"}</div>
    <div class="main">${
        settings.entries.map( (entry: SettingEntryModel) => {
            if ("entries" in entry) {
                // Category entry.
                return html`<${SettingsCategory} model="${entry}" onchange="${handleChange}" />`;
            } else {
                // Item entry.
                return html`<${SettingsItem} model="${entry}" onchange="${handleChange}" />`;
            }
        })
    }</div>
    <div calss="footer">
        <button type="submit" onclick="${handleSave}" disabled="${saved}" value="save">Save</button>
        <button type="default" onclick="${handleDefault}" disabled="${unchanged}" value="revert">Revert</button>
        <button type="cancel" onclick="${handleCancel}" >Close</button>
    </div>
    </div>`;
}