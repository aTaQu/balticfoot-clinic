import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text,
} from '@react-email/components'
import type { BookingCancelledAlertEmailData } from '../types'

export function BookingCancelledAlertEmail({
  patientName, serviceName, date, time,
}: BookingCancelledAlertEmailData) {
  return (
    <Html lang="lt">
      <Head />
      <Preview>Vizitas atšauktas: {patientName} — {date} {time}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Baltic Foot — vizitas atšauktas</Heading>
          <Hr style={hr} />
          <Section>
            <Text style={text}>
              Vizitas buvo atšauktas. Laikas yra laisvas kitiems pacientams.
            </Text>
            <Section style={detailsBox}>
              <Text style={detailRow}><strong>Pacientas:</strong> {patientName}</Text>
              <Text style={detailRow}><strong>Paslauga:</strong> {serviceName}</Text>
              <Text style={detailRow}><strong>Data:</strong> {date}</Text>
              <Text style={detailRow}><strong>Laikas:</strong> {time}</Text>
            </Section>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>Baltic Foot administracija</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = { backgroundColor: '#f5f0eb', fontFamily: 'Georgia, serif' }
const container = { maxWidth: '560px', margin: '0 auto', backgroundColor: '#ffffff', padding: '40px', borderRadius: '4px' }
const heading = { fontSize: '20px', color: '#5c3d2e', letterSpacing: '0.05em', marginBottom: '4px' }
const hr = { borderColor: '#d4c4b0', margin: '20px 0' }
const text = { fontSize: '15px', lineHeight: '1.6', color: '#3a2e24', margin: '12px 0' }
const detailsBox = { backgroundColor: '#fdf5f5', borderLeft: '3px solid #c0392b', padding: '16px 20px', margin: '16px 0', borderRadius: '2px' }
const detailRow = { fontSize: '14px', color: '#3a2e24', margin: '6px 0' }
const footer = { fontSize: '12px', color: '#999', textAlign: 'center' as const }
