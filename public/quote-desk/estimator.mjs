// Planning model. Defaults are editable assumptions, never a machine guarantee.
export const defaults = Object.freeze({
  quantity: 48, stitches: 8500, heads: 6, rpm: 850, efficiency: 0.85,
  colorChanges: 3, colorChangeSeconds: 5, breakSecondsPerThousand: 15,
  setupSeconds: 245, hoopSeconds: 40, removeSeconds: 15, finishSeconds: 32,
  operators: 1, buffer: 0.33, laborHourly: 22, machineHourly: 8,
  overheadHourly: 5, blankUnit: 7, materialsUnit: 0.35, digitizing: 30,
  shipping: 12, spoilage: 0.03, margin: 0.45
});
const limits = {
  quantity:[1,100000,true],stitches:[1,1000000,true],heads:[1,100,true],rpm:[1,2000],
  efficiency:[0.05,1],colorChanges:[0,1000,true],colorChangeSeconds:[0,600],
  breakSecondsPerThousand:[0,600],setupSeconds:[0,86400],hoopSeconds:[0,3600],
  removeSeconds:[0,3600],finishSeconds:[0,3600],operators:[1,100,true],buffer:[0,3],
  laborHourly:[0,10000],machineHourly:[0,10000],overheadHourly:[0,10000],
  blankUnit:[0,10000],materialsUnit:[0,10000],digitizing:[0,100000],
  shipping:[0,100000],spoilage:[0,0.5],margin:[0,0.9]
};
export function normalize(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Enter a valid job.');
  const output={};
  for (const [key,[min,max,integer]] of Object.entries(limits)) {
    const value=input[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value<min || value>max || (integer&&!Number.isInteger(value)))
      throw Error(`${key} must be ${integer?'a whole number':'a number'} between ${min} and ${max}.`);
    output[key]=value;
  }
  return output;
}
export function estimate(raw) {
  const p=normalize(raw);
  const cycles=Math.ceil(p.quantity/p.heads);
  const cycleSeconds=p.stitches/p.rpm*60/p.efficiency+p.colorChanges*p.colorChangeSeconds+p.stitches/1000*p.breakSecondsPerThousand;
  const handlingSeconds=p.quantity*(p.hoopSeconds+p.removeSeconds+p.finishSeconds);
  const machineSeconds=cycles*cycleSeconds;
  // Conservative: setup, stitching and handling are sequential. Operators share handling only.
  const elapsedSeconds=(p.setupSeconds+machineSeconds+handlingSeconds/p.operators)*(1+p.buffer);
  const laborSeconds=p.setupSeconds+machineSeconds+handlingSeconds;
  const labor= laborSeconds/3600*p.laborHourly;
  const machine=machineSeconds/3600*p.machineHourly;
  const overhead=elapsedSeconds/3600*p.overheadHourly;
  const goods=p.quantity*(p.blankUnit+p.materialsUnit)*(1+p.spoilage);
  const totalCost=goods+labor+machine+overhead+p.digitizing+p.shipping;
  const suggestedTotal=Math.ceil(totalCost/(1-p.margin)*100)/100;
  const unitPrice=Math.ceil(suggestedTotal/p.quantity*100)/100;
  const roundedQuote=Number((unitPrice*p.quantity).toFixed(2));
  return {cycles,cycleSeconds,machineSeconds,handlingSeconds,elapsedSeconds,laborSeconds,
    costs:{goods,labor,machine,overhead,digitizing:p.digitizing,shipping:p.shipping},
    totalCost,suggestedTotal:roundedQuote,unitPrice,grossProfit:roundedQuote-totalCost,
    margin:roundedQuote>0?(roundedQuote-totalCost)/roundedQuote:0,
    assumptions:['Sequential setup, stitching and handling; no overlap credit.',
      'One operator attends each stitch cycle; extra operators share handling only.',
      'Spoilage allowance applies to blanks and materials; actual rerun time is excluded.',
      'Taxes, payment fees and seller income taxes are excluded. Validate settings against timed jobs.']};
}
export function capacity(jobs,hoursPerDay=8) {
  if (!Array.isArray(jobs)||jobs.length>500||!Number.isFinite(hoursPerDay)||hoursPerDay<=0||hoursPerDay>24) throw Error('Enter a valid production day.');
  const seconds=jobs.reduce((s,j)=>s+estimate(j).elapsedSeconds,0);
  return {seconds,days:seconds/(hoursPerDay*3600)};
}
