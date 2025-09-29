const fr = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const frPct = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 })

export function frCurrency(n: number) {
  return fr.format(Math.round(n))
}

export function frPercent(ratio: number) {
  return frPct.format(ratio)
}
