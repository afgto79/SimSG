import { useCallback } from 'react'
import type { ValidatedInputs } from '../lib/calc'
import { defaultInputs as defaults } from '../lib/calc'

export const defaultInputs = defaults

type Props = {
  value: ValidatedInputs
  onChange: (v: ValidatedInputs) => void
}

export function InputsForm({ value, onChange }: Props) {
  const update = useCallback(<K extends keyof ValidatedInputs>(key: K, v: ValidatedInputs[K]) => {
    onChange({ ...value, [key]: v })
  }, [onChange, value])

  const updateTenant = (k: 'low'|'mid'|'high', field: 'rentPerM2PerMonth'|'sharePercent'|'occupancyPercent', v: number) => {
    onChange({ ...value, tenants: { ...value.tenants, [k]: { ...value.tenants[k], [field]: v } } })
  }

  return (
    <form className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
        <h2 className="md:col-span-2 text-sm font-semibold">Paramètres généraux</h2>
        <LabeledNumber label="Surface utile (m²)" value={value.surfaceM2} min={1} step={1} disabled />
        <LabeledNumber label="Coût travaux (€/m²)" value={value.worksCostPerM2} min={700} max={1500} step={10}
          onChange={(n)=>update('worksCostPerM2', n)} />

        <LabeledNumber label="Taux prêt principal (%)" value={Number((value.mainLoanRate*100).toFixed(2))} min={3} max={6} step={0.01}
          onChange={(n)=>{
            const rounded = Math.round(n * 100) / 100; // 2 décimales max côté pourcentage
            update('mainLoanRate', rounded / 100)
          }} />
        <LabeledNumber label="Durée prêt principal (années)" value={value.mainLoanYears} min={7} max={12} step={1}
          onChange={(n)=>update('mainLoanYears', n)} />

        <LabeledNumber label="PRU montant (€)" value={value.pruAmount} min={0} step={1000}
          onChange={(n)=>update('pruAmount', n)} />
        <div className="text-xs text-gray-500">Lorsque PRU = 0, taux et durée PRU ignorés (v1)</div>

        <LabeledNumber label="CIIC (%)" value={value.ciicPercent*100} min={0} max={30} step={0.5}
          onChange={(n)=>update('ciicPercent', n/100)} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
        <h2 className="md:col-span-2 text-sm font-semibold">Loyer propriétaire (TTC)</h2>
        <LabeledNumber label="Loyer base (€/m²/mois)" value={value.landlordBaseRentPerM2PerMonth} min={0} step={0.1}
          onChange={(n)=>update('landlordBaseRentPerM2PerMonth', n)} />
        <LabeledNumber label="Franchise (mois)" value={value.landlordFranchiseMonths} min={0} max={24} step={1}
          onChange={(n)=>update('landlordFranchiseMonths', n)} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border">
        <h2 className="md:col-span-3 text-sm font-semibold">Tranches locataires (TTC)</h2>
        {(['low','mid','high'] as const).map(k => (
          <div key={k} className="space-y-2">
            <div className="text-xs uppercase text-gray-500">{k.toUpperCase()}</div>
            <LabeledNumber label="Loyer (€/m²/mois)" value={value.tenants[k].rentPerM2PerMonth} min={0} step={0.5}
              onChange={(n)=>updateTenant(k, 'rentPerM2PerMonth', n)} />
            <LabeledNumber label="Répartition (%)" value={value.tenants[k].sharePercent} min={0} max={100} step={1}
              onChange={(n)=>updateTenant(k, 'sharePercent', n)} />
            <LabeledNumber label="Occupation (%)" value={value.tenants[k].occupancyPercent} min={50} max={100} step={1}
              onChange={(n)=>updateTenant(k, 'occupancyPercent', n)} />
          </div>
        ))}
        <div className="md:col-span-3 text-xs text-gray-500">La somme des répartitions Low/Mid/High doit être 100 % (tolérance ±0,1 %).</div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border">
        <h2 className="md:col-span-3 text-sm font-semibold">Charges & Indexation</h2>
        <LabeledNumber label="Charges non récupérables (€/m²/an)" value={value.chargesNonRecupPerM2PerYear} min={0} step={1}
          onChange={(n)=>update('chargesNonRecupPerM2PerYear', n)} />
        <LabeledNumber label="Indexation loyers locataires (%)" value={value.indexationPercent*100} min={0} step={0.1}
          onChange={(n)=>update('indexationPercent', n/100)} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
        <h2 className="md:col-span-2 text-sm font-semibold">Paramètres auxiliaires</h2>
        <LabeledNumber label="Praticiens max" value={value.practitionersMax} min={1} step={1}
          onChange={(n)=>update('practitionersMax', n)} />
        <LabeledNumber label="Surface par praticien (m²)" value={value.surfacePerPractitioner} min={1} step={1}
          onChange={(n)=>update('surfacePerPractitioner', n)} />
      </section>
    </form>
  )
}

function LabeledNumber({ label, value, onChange, min, max, step, disabled }: { label: string, value: number, onChange?: (n: number)=>void, min?: number, max?: number, step?: number, disabled?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-700">{label}</span>
      <input type="number" className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" value={value}
        min={min} max={max} step={step} disabled={disabled}
        onChange={e => onChange?.(Number(e.target.value))} />
    </label>
  )
}
