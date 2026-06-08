import React from 'react'

const STATUS_INFO: Record<string, { label: string; description: string }> = {
  pending: {
    label: 'Laukiama',
    description: 'Nauja rezervacija, laukianti administratoriaus veiksmo.',
  },
  confirmed: {
    label: 'Patvirtinta',
    description: 'Pacientas gavo patvirtinimą; laikas užimtas grafike.',
  },
  rejected: {
    label: 'Atmesta',
    description: 'Atsakyta neigiamai prieš patvirtinimą.',
  },
  cancelled: {
    label: 'Atšaukta',
    description: 'Rezervacija nutraukta po patvirtinimo.',
  },
}

type Props = {
  cellData?: string | null
}

export function BookingStatusCell({ cellData }: Props) {
  const info = cellData ? STATUS_INFO[cellData] : null
  if (!info) return <span>—</span>
  return (
    <span
      title={info.description}
      style={{
        cursor: 'help',
        borderBottom: '1px dotted currentColor',
      }}
    >
      {info.label}
    </span>
  )
}
