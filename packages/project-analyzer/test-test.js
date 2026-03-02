const total_loc_base = 10000;
const comp_base = 6;
for (let i = 1; i <= 50; i++) {
  const loc = total_loc_base + i * 4000;
  const comp = comp_base - i * 0.08;
  const ccount = 40 + i;
  const cpays = 60;
  
  if (i === 1) console.log(`Start: loc: ${loc}, comp: ${comp}`);
  if (i === 50) console.log(`End: loc: ${loc}, comp: ${comp}`);
  
  // Empty Shell triggers if loc > 1000 && comp < 1.0. 
  // Wait, does comp get < 1.0?
  // End comp: 6 - 50 * 0.08 = 6 - 4.0 = 2.0.
  // So comp never goes below 1.0. It reaches 2.0, but total_loc reaches 210,000.
  
  // So there is a massive amount of code with very low complexity, but not < 1.0. 
  // We need to scale the required complexity threshold up as LOC gets massive!
  let threshold = 1.0;
  
}
