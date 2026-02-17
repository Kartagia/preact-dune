/**
 * Settings module contaim settings related components, functions, and models.
 * 
 * @module settings
 */
 
 export type {SettingItemModel, SettingCategoryModel, FieldType} from "./settings.model.ts";
 export {isSettingItemModel, isSettingCategoryModel, isFieldType, FieldTypes} from "./settings.model.ts";
 
 export default {
  isSettingCategoryModel,
  isSettingItemModel,
  isFieldType,
  FieldTypes
 }