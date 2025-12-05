
/**
 * A dune skill.
 */
export interface SkillModel {
  score: number,
  name: string,
  focus?: string[]
}

/**
 * Create a new skill.
 */
export function createSkill(prop: Partial<SkillModel>): SkillModel {
  if (!prop.name) {
    throw new SyntaxError("Invalid name");
  }
  return {
    name: prop.name,
    score: prop.score ?? 4,
    focus: [...(props.focus ?? [])]
  }
}

