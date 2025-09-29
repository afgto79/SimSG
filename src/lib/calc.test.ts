import { describe, it, expect } from 'vitest'
import { computeAll, defaultInputs, pmtAnnual } from './calc'

describe('pmtAnnual', () => {
  it('handles zero rate', () => {
    expect(pmtAnnual(1000, 0, 5)).toBeCloseTo(200)
  })
  it('computes a positive annuity with rate', () => {
    const ann = pmtAnnual(100000, 0.035, 7)
    expect(ann).toBeGreaterThan(0)
  })
})

describe('computeAll basic', () => {
  it('produces KPIs without errors for defaults', () => {
    const res = computeAll(defaultInputs)
    expect(res.errors.length).toBe(0)
    expect(res.kpis.investmentGross).toBeGreaterThan(0)
    expect(res.kpis.investmentNet).toBeGreaterThanOrEqual(0)
    expect(res.kpis.totalTenantRents).toBeGreaterThan(0)
  })

  it('clips investment net at zero when CIIC + PRU exceed investment', () => {
    const inputs = { ...defaultInputs, pruAmount: 1_000_000 }
    const res = computeAll(inputs)
    expect(res.kpis.investmentNet).toBe(0)
    expect(res.warnings.some(w => w.includes('Inv_net borné'))).toBe(true)
  })

  it('validates share sum equals 100%', () => {
    const inputs = { ...defaultInputs, tenants: { ...defaultInputs.tenants, high: { ...defaultInputs.tenants.high, sharePercent: 10 } } }
    const res = computeAll(inputs)
    expect(res.errors.length).toBeGreaterThan(0)
  })

  it('computes break-even occupancy between 0 and >1 possible', () => {
    const res = computeAll(defaultInputs)
    expect(res.kpis.breakEvenOccupancy).toBeGreaterThanOrEqual(0)
  })
})
