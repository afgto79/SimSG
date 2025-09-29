import { useMemo, useState } from 'react'
import { InputsForm, defaultInputs } from './features/InputsForm'
import { computeAll, ValidatedInputs, kpiColors } from './lib/calc'
import { frCurrency, frPercent } from './lib/format'
import { KpiTile } from './components/KpiTile'

export default function App() {
  const [inputs, setInputs] = useState<ValidatedInputs>(defaultInputs)

  const { kpis, warnings, errors } = useMemo(() => computeAll(inputs), [inputs])

  return (
    <div>
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo">SimSG</div>
        </div>
      </header>
      <div className="container py-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Bureaux médicaux</h1>
          <p className="text-sm text-gray-600">Simulation financière – v1 (année 1, TTC)</p>
        </div>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InputsForm value={inputs} onChange={setInputs} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          {/* KPI bandeau */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiTile title="Cash flow annuel" value={frCurrency(kpis.cashFlow)} color={kpiColors(kpis.cashFlow, kpis.totalTenantRents)} />
            <KpiTile title="Remplissage minimum (praticiens)" value={kpis.requiredPractitioners.toString()} />
            <KpiTile title="Loyer moyen (€/m²/mois)" value={kpis.avgRentPerM2PerMonth.toFixed(2).replace('.', ',')} />
          </div>

          {/* Investissement */}
          <div className="section-card section-invest">
            <div className="section-header">INVESTISSEMENT</div>
            <div className="grid grid-cols-1 gap-3">
              <KpiTile title="Investissement net" value={frCurrency(kpis.investmentNet)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <KpiTile title="Total travaux" value={frCurrency(kpis.totalWorks)} />
              </div>
              <div className="kpi-subcard">
                <div className="kpi-title">Total architecte</div>
                <div className="mt-2">
                  <KpiTile title="Total architecte" value={frCurrency(kpis.architectFeesTotal)} />
                </div>
                <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-gray-600">
                  <div>Honoraires (8% des travaux): <span className="font-medium text-brand-anthracite">{frCurrency(kpis.architectFeesOnWorks)}</span></div>
                  <div>Commission (8% du loyer annuel): <span className="font-medium text-brand-anthracite">{frCurrency(kpis.architectFeesOnLandlordAnnual)}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Ressources */}
          <div className="section-card section-rc">
            <div className="section-header">RESSOURCES</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="sm:col-span-2">
                <KpiTile title="Total ressources" value={frCurrency(kpis.totalResources)} />
              </div>
            </div>
          </div>

          {/* Résultat */}
          <div className="section-card section-rc">
            <div className="section-header">CHARGES</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="sm:col-span-2">
                <KpiTile title="Total charges" value={frCurrency(kpis.totalCharges)} />
              </div>
              <KpiTile title="Loyer propriétaire payé" value={frCurrency(kpis.landlordPaid)} />
              <KpiTile title="Charges non récupérables" value={frCurrency(kpis.charges)} />
              <KpiTile title="Annuités totales" value={frCurrency(kpis.totalAnnuities)} />
              <div className="sm:col-span-2">
                <KpiTile title="Résultat (cash flow)" value={frCurrency(kpis.cashFlow)} color={kpiColors(kpis.cashFlow, kpis.totalTenantRents)} />
              </div>
            </div>
          </div>


          {errors.length > 0 && (
            <div className="p-3 rounded-md bg-red-50 text-red-800 text-sm">
              <ul className="list-disc ml-5 space-y-1">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </div>
      </section>

      <footer className="text-xs text-gray-500">
        Format FR, TTC. Arrondis: € à l’unité, % au dixième. v1 sans graphiques.
      </footer>
      </div>
    </div>
  )
}
