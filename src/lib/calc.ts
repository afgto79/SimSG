// Core financial calculations for SimSG v1

export type TrancheKey = 'low' | 'mid' | 'high'

export type Tranche = {
  rentPerM2PerMonth: number // TTC
  sharePercent: number // 0..100
  occupancyPercent: number // 50..100
}

export type ValidatedInputs = {
  surfaceM2: number // fixed 450
  worksCostPerM2: number // X

  mainLoanRate: number // t1 (e.g. 0.035)
  mainLoanYears: number // 7..12

  pruAmount: number // Z (>=0)
  pruRate?: number // optional if Z>0
  pruYears?: number // optional if Z>0

  ciicPercent: number // 0..30 (v1 default 0)

  landlordBaseRentPerM2PerMonth: number // TTC base, after slider
  landlordAdjustPct: number // -0.15..+0.15 (applied to base 12 to produce current? here kept for UI; not used if base already set)
  landlordFranchiseMonths: number // 0..24
  landlordSurfaceM2: number // surface assujettie au loyer propriétaire (550 m2)

  tenants: Record<TrancheKey, Tranche>

  chargesNonRecupPerM2PerYear: number // €/m2/an

  indexationPercent: number // applied to tenants (kept for future years)

  practitionersMax: number // 18
  surfacePerPractitioner: number // 25
}

export type ComputeResult = {
  kpis: {
    investmentGross: number
    investmentNet: number
    totalAnnuities: number
    totalTenantRents: number
    landlordPaid: number
    charges: number
    cashFlow: number
    breakEvenOccupancy: number // 0..1
    requiredPractitioners: number
    avgRentPerM2PerMonth: number
    rentToDebtRatio: number // totalTenantRents / totalAnnuities
    architectFeesTotal: number
    architectFeesOnWorks: number
    architectFeesOnLandlordAnnual: number
    totalResources: number
    totalCharges: number
    totalWorks: number
  }
  warnings: string[]
  errors: string[]
}

export const SURFACE_DEFAULT = 450

export const defaultInputs: ValidatedInputs = {
  surfaceM2: SURFACE_DEFAULT,
  worksCostPerM2: 1500,

  mainLoanRate: 0.035,
  mainLoanYears: 7,

  pruAmount: 0,
  pruRate: 0.02,
  pruYears: 15,

  ciicPercent: 0,

  landlordBaseRentPerM2PerMonth: 12,
  landlordAdjustPct: 0,
  landlordFranchiseMonths: 6,
  landlordSurfaceM2: 550,

  tenants: {
    low: { rentPerM2PerMonth: 40, sharePercent: 40, occupancyPercent: 80 },
    mid: { rentPerM2PerMonth: 50, sharePercent: 40, occupancyPercent: 80 },
    high: { rentPerM2PerMonth: 60, sharePercent: 20, occupancyPercent: 80 },
  },

  chargesNonRecupPerM2PerYear: 0,

  indexationPercent: 0.02,

  practitionersMax: 18,
  surfacePerPractitioner: 25,
}

export function pmtAnnual(principal: number, rate: number, years: number): number {
  if (principal <= 0) return 0
  if (years <= 0) return principal // degenerate, avoid div-by-zero
  if (rate === 0) return principal / years
  const r = rate
  return (r * principal) / (1 - Math.pow(1 + r, -years))
}

function sumTrancheShares(inputs: ValidatedInputs): number {
  const t = inputs.tenants
  return t.low.sharePercent + t.mid.sharePercent + t.high.sharePercent
}

function tenantRentAtOccupancy(inputs: ValidatedInputs, occupancyOverride?: number): number {
  const S = inputs.surfaceM2
  const ts = inputs.tenants
  const occLow = occupancyOverride ?? (ts.low.occupancyPercent / 100)
  const occMid = occupancyOverride ?? (ts.mid.occupancyPercent / 100)
  const occHigh = occupancyOverride ?? (ts.high.occupancyPercent / 100)
  const low = ts.low.rentPerM2PerMonth * (S * ts.low.sharePercent / 100) * 12 * occLow
  const mid = ts.mid.rentPerM2PerMonth * (S * ts.mid.sharePercent / 100) * 12 * occMid
  const high = ts.high.rentPerM2PerMonth * (S * ts.high.sharePercent / 100) * 12 * occHigh
  return low + mid + high
}

export function computeAll(inputs: ValidatedInputs): ComputeResult {
  const warnings: string[] = []
  const errors: string[] = []

  // Validations
  const shareSum = sumTrancheShares(inputs)
  if (Math.abs(shareSum - 100) > 0.1) {
    errors.push('La somme des pourcentages Low/Mid/High doit être égale à 100 %.')
  }
  const occOutOfRange: string[] = []
  for (const k of ['low','mid','high'] as TrancheKey[]) {
    const occ = inputs.tenants[k].occupancyPercent
    if (occ < 50 || occ > 100) occOutOfRange.push(k)
  }
  if (occOutOfRange.length) warnings.push(`Occupation hors bornes 50–100 % pour: ${occOutOfRange.join(', ')}`)

  // Calculs de base
  const S = inputs.surfaceM2
  const travaux = S * inputs.worksCostPerM2

  const landlordAnnualBase = inputs.landlordBaseRentPerM2PerMonth * inputs.landlordSurfaceM2 * 12 // facial, sans franchise, surface 550 m²
  const honorairesTravaux = 0.08 * travaux
  const honorairesLoyerAnnuel = 0.08 * landlordAnnualBase
  const honoraires = honorairesTravaux + honorairesLoyerAnnuel
  const investmentGross = travaux + honoraires

  const baseCIIC = travaux // v1: base = travaux
  const ciic = baseCIIC * inputs.ciicPercent

  const investmentNetRaw = investmentGross - ciic - inputs.pruAmount
  const investmentNet = Math.max(0, investmentNetRaw)
  if (investmentNetRaw < 0) warnings.push('PRU + CIIC > investissement: Inv_net borné à 0 €.')

  const annuityMain = pmtAnnual(investmentNet, inputs.mainLoanRate, inputs.mainLoanYears)
  const annuityPRU = inputs.pruAmount > 0 ? pmtAnnual(inputs.pruAmount, inputs.pruRate ?? 0, inputs.pruYears ?? inputs.mainLoanYears) : 0
  const totalAnnuities = annuityMain + annuityPRU

  const tenantRents = tenantRentAtOccupancy(inputs)

  const landlordPaid = landlordAnnualBase * ((12 - clamp(inputs.landlordFranchiseMonths, 0, 24)) / 12)

  const charges = inputs.chargesNonRecupPerM2PerYear * S

  const cashFlow = tenantRents - landlordPaid - charges - totalAnnuities
  const totalResources = tenantRents
  const totalCharges = landlordPaid + charges + totalAnnuities

  const rentsAt100 = tenantRentAtOccupancy(inputs, 1)
  const breakEvenOccupancy = rentsAt100 > 0 ? (landlordPaid + charges + totalAnnuities) / rentsAt100 : 1
  if (breakEvenOccupancy > 1) warnings.push('Seuil d’occupation > 100 %: modèle non rentable avec les hypothèses actuelles.')

  const requiredPractitioners = Math.ceil(breakEvenOccupancy * S / inputs.surfacePerPractitioner)
  if (requiredPractitioners > inputs.practitionersMax) warnings.push('Nombre de praticiens nécessaires au-dessus de la capacité maximale.')

  const avgRentPerM2PerMonth = (tenantRents) / (S * 12)

  const rentToDebtRatio = totalAnnuities > 0 ? (tenantRents / totalAnnuities) : Infinity

  return {
    kpis: {
      investmentGross,
      investmentNet,
      totalAnnuities,
      totalTenantRents: tenantRents,
      landlordPaid,
      charges,
      cashFlow,
      breakEvenOccupancy,
      requiredPractitioners,
      avgRentPerM2PerMonth,
      rentToDebtRatio,
      architectFeesTotal: honoraires,
      architectFeesOnWorks: honorairesTravaux,
      architectFeesOnLandlordAnnual: honorairesLoyerAnnuel,
      totalResources,
      totalCharges,
      totalWorks: travaux,
    },
    warnings,
    errors,
  }
}

export function kpiColors(cashFlow: number, totalTenantRents: number): 'green' | 'orange' | 'red' {
  if (cashFlow > 0) return 'green'
  const threshold = 0.05 * totalTenantRents
  if (Math.abs(cashFlow) < threshold) return 'orange'
  return 'red'
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
