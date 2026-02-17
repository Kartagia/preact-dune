import { SettingCategoryModel, SettingItemModel } from "./settings.model";

/**
 * The controller of settings.
 */
export interface SettingsController<T> {
    _new?: (newContent: T) => T;
    /**
     * The keys of the default content.
     */
    keys: Array<keyof T>;
    /**
     * THe default content.
     */
    content: T;
    /**
     * Update the value at property path, and return the new content.
     * @param propPath The property path.
     * @param value The new value as string.
     * @param current The current settings. Default to the current content.
     * @returns The new content, if the update is valid. Returns the current content, if the
     * value update was invalid.
     */
    update(propPath: string[], value?: string | undefined, current?: T): T;

    /**
     * Update the setting item model by assigning the stringification of the given property value as the
     * value of the source model, and returning the created new instance.
     * @param source The source setting item model.
     * @param property The property,whose value is assigned to the setting item mode.
     * @returns If the controller has value for the property, a new setting item model with value replaced with the value of the
     * setting property. Otherwise the original source is returned.
     */
    setItemValue(source: SettingItemModel, property: string): SettingItemModel;

    /**
     * Update the setting category model by assigning the stringification of the given property value as the
     * value of the source model, and returning the created new instance.
     * @param source The source setting category model.
     * @param property The property, whose value is assigned to the setting item mode.
     * @returns If the controller has value for the property, a new setting category model with value replaced with the value of the
     * setting property. Otherwise the original source is returned.
     */
    setCategoryValue(source: SettingCategoryModel, property: string): SettingCategoryModel;
    
}
