import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text, Link,
} from '@react-email/components'
import type { BookingEmailData } from '../types'

export function BookingConfirmedEmail({ patientName, serviceName, date, time, clinicPhone }: BookingEmailData) {
  return (
    <Html lang="lt">
      <Head />
      <Preview>Vizitas patvirtintas — Baltic Foot</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Baltic Foot</Heading>
          <Hr style={hr} />
          <Section>
            <Text style={text}>Sveiki, {patientName},</Text>
            <Text style={text}>
              jūsų vizitas <strong>patvirtintas</strong>. Laukiame jūsų!
            </Text>
            <Section style={detailsBox}>
              <Text style={detailRow}><strong>Paslauga:</strong> {serviceName}</Text>
              <Text style={detailRow}><strong>Data:</strong> {date}</Text>
              <Text style={detailRow}><strong>Laikas:</strong> {time}</Text>
            </Section>
            <Text style={text}>
              Jei reikia atšaukti ar keisti vizitą, skambinkite:{' '}
              <Link href={`tel:${clinicPhone}`} style={link}>{clinicPhone}</Link>
            </Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>Baltic Foot podologijos klinika · Šiauliai</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = { backgroundColor: '#f5f0eb', fontFamily: 'Georgia, serif' }
const container = { maxWidth: '560px', margin: '0 auto', backgroundColor: '#ffffff', padding: '40px', borderRadius: '4px' }
const heading = { fontSize: '22px', color: '#5c3d2e', letterSpacing: '0.05em', marginBottom: '4px' }
const hr = { borderColor: '#d4c4b0', margin: '20px 0' }
const text = { fontSize: '15px', lineHeight: '1.6', color: '#3a2e24', margin: '12px 0' }
const detailsBox = { backgroundColor: '#f0f7f0', borderLeft: '3px solid #4a8c5c', padding: '16px 20px', margin: '20px 0', borderRadius: '2px' }
const detailRow = { fontSize: '14px', color: '#3a2e24', margin: '6px 0' }
const link = { color: '#b07d56' }
const footer = { fontSize: '12px', color: '#999', textAlign: 'center' as const }
