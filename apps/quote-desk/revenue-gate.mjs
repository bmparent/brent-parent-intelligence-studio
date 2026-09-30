import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export const gate=Object.freeze({schema:'eidos_recurring_revenue_gate_v1',weeks:8,minimumIndependentCustomers:10,minimumRenewingCustomers:5,expenseCoverageRatio:1.25,maximumWeeklyUpkeepMinutes:60});
export function economics(price=19,cardRate=0.029,billingRate=0.007,fixedFee=0.30){
  if(![price,cardRate,billingRate,fixedFee].every(Number.isFinite)||price<=0||cardRate<0||billingRate<0||cardRate+billingRate>=1||fixedFee<0)throw Error('Invalid economic assumptions.');
  return {price,netAfterEstimatedProviderFees:price*(1-cardRate-billingRate)-fixedFee,excluded:['tax','hosting','email','refunds','disputes','support labor','currency conversion','non-domestic payment method differences']};
}
export function assess(evidence){
  const failures=[];const rows=evidence?.weeklyEvidence;
  if(evidence?.environment!=='live')failures.push('LIVE provider evidence is required.');
  if(evidence?.sourceReceiptsReviewed!==true)failures.push('Provider and bank receipts have not been independently reviewed.');
  if(!Number.isInteger(evidence?.independentPayingCustomers)||evidence.independentPayingCustomers<gate.minimumIndependentCustomers)failures.push('At least 10 independent paying customers are required.');
  if(!Number.isInteger(evidence?.customersWithSuccessfulRenewal)||evidence.customersWithSuccessfulRenewal<gate.minimumRenewingCustomers)failures.push('At least 5 distinct customers must have a successful renewal.');
  if(!Array.isArray(rows)||rows.length!==gate.weeks)failures.push('Eight consecutive closed calendar weeks of actual cash evidence are required.');
  if(Array.isArray(rows)&&rows.length===gate.weeks){
    let previous=null;
    for(const week of rows){
      const date=/^\d{4}-\d{2}-\d{2}$/.test(week.weekStart||'')?new Date(week.weekStart+'T00:00:00Z'):new Date(NaN);
      if(!Number.isFinite(date.getTime())||date.getUTCDay()!==1||(previous!==null&&date.getTime()-previous!==7*86400000))failures.push('Week starts must be consecutive Mondays.');
      previous=date.getTime();
      if(week.closed!==true||week.financeCoverageComplete!==true||week.bankReconciled!==true||!week.providerReceiptRefs?.length||!week.bankReceiptRefs?.length)failures.push(`${week.weekStart}: closed, complete, reconciled source evidence is missing.`);
      if(typeof week.settledNetReceipts!=='number'||!Number.isFinite(week.settledNetReceipts)||typeof week.actualOperatingExpenses!=='number'||!Number.isFinite(week.actualOperatingExpenses)||week.actualOperatingExpenses<0)failures.push(`${week.weekStart}: actual expenses and settled net receipts are required.`);
      else if(week.settledNetReceipts<week.actualOperatingExpenses*gate.expenseCoverageRatio||week.settledNetReceipts<=0)failures.push(`${week.weekStart}: settled cash does not cover expenses plus the 25% reserve.`);
      if(typeof week.upkeepMinutes!=='number'||!Number.isFinite(week.upkeepMinutes)||week.upkeepMinutes<0||week.upkeepMinutes>gate.maximumWeeklyUpkeepMinutes)failures.push(`${week.weekStart}: measured upkeep must be at most 60 minutes.`);
    }
  }
  return {schema:gate.schema,structuredEvidencePassed:failures.length===0,failures,limits:'This checks a supplied ledger. A pass does not independently authenticate its receipts or promise future income. Receipts must be read, attributed to this product and reconciled before declaring the revenue goal met.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const path=process.argv[2];if(!path)throw Error('Pass a private normalized revenue evidence JSON file.');console.log(JSON.stringify(assess(JSON.parse(await readFile(path,'utf8'))),null,2));}
