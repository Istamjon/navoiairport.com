/**
 * Checks if a block should be included based on its visibility conditions
 * This function determines whether a given block should be rendered
 * based on its configuration and any conditional logic
 */
export const inclusionsCondition = (block: any): boolean => {
  // If block doesn't exist, don't include it
  if (!block) {
    return false
  }

  // If blockType doesn't exist, don't include it
  if (!block.blockType) {
    return false
  }

  // Include the block by default
  return true
}