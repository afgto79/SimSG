type Props = {
  title: string
  value: string
  color?: 'green' | 'orange' | 'red' | 'default'
}

export function KpiTile({ title, value, color = 'default' }: Props) {
  const colorClasses =
    color === 'green' ? 'ring-1 ring-brand-green/30'
    : color === 'orange' ? 'ring-1 ring-amber-300/50'
    : color === 'red' ? 'ring-1 ring-brand-red/40'
    : ''

  return (
    <div className={`kpi-card p-4 ${colorClasses}`}>
      <div className="kpi-title">{title}</div>
      <div className="kpi-number">{value}</div>
    </div>
  )
}
