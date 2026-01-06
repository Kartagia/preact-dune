import {SkillModel, createSkill} from "./skill.model";
import {randomUUID} from 'crypto';

export interface TraitModel {
  
  uuid: UUID;
  
  name: string;
  
  level: number;
  
  temporary: boolean;
  
  intanglible: boolean;
  
  toString(): string;
  
  valueOf(): number;
}

export interface TraitArgs {
  name: string;
  level?:number;
  temporary?: boolean;
  intanglible?: boolean;
}

export function createTrait(args: TraitArgs): TraitModel {
  const result : TraitModel = {
    name: args.name,
    level: args.level ?? 1,
    intanglible: args.intanglible ?? false,
    temporary: args.temporary ?? false,
    toString() {
      return `${this.name}${
        this.level == 1 ? "" : "("+this.level+")"
      }`;
    },
    valueOf() {
      return this.level;
    },
  };
  return result;
}

export interface AssetArgs extends TraitArgs {
  quality?: number;
}

export interface AssetModel extends TraitModel {
  
  quality: number;
}

export function createAsset(args: AssetArgs) {
  const parent = createTrait(arga);
  const result = {
    quality: args.quality ?? 0,
    toString() {
      return `${this.name}(Q${this.quality})${
        this.level == 1 ?"":"("+this.level+")"
      }`;
    },
  };
  Object.setPrototypeOf(result, patent);
  return result;
}

export interface CharacterModel {
  name: string;
  
  traits: TraitModel[];
  
  assets: AssetModel[];
  
  /**
   * The skills of the character.
   */
  skills: SkillModel[];
}

/**
 * The default skills.
 * 
 * @returns The default skills.
 */
export function defaultSkills(): SkillModel[] {
  const result: SkillModel[] = ["Battle", "Communicate", "Discipline", "Move", "Understand"].map(name => createSkill({name} as Partial<SkillModel>));
  return result;
};

interface CharacterInit extends Partial<CharacterModel> {
  
}

/**
 * Create character
 *
 */
export function createCharacter(arg: CharacterInit): CharacterModel {
  const uuid = arg.uuid ?? randomUUID();
  const result : CharacterModel = {
    uuid,
    name: arg.name ?? uuid,
    skills: [...(arg.skills || defaultSkills())],
  };
  return result;
}

