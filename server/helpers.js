/**
 * 
 * @param {string} input 
 * @param {boolean} trim 
 * @param {number} maxLength 
 * @returns string
 */
exports.goodifyUserInput = (input, trim, maxLength) => {
  let output = input
  if(trim) output = output.trim()
  if(maxLength) output = output.slice(0, maxLength)

  return output
}