import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text, Link,
} from '@react-email/components'
import type { BookingRejectedEmailData } from '../types'

export function BookingRejectedEmail({ patientName, serviceName, date, time, clinicPhone, rejectionReason }: BookingRejectedEmailData) {
  return (
    <Html lang="lt">
      <Head />
      <Preview>Deja, negalime patvirtinti jūsų vizito — Baltic Foot</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Baltic Foot</Heading>
          <Hr style={hr} />
          <Section>
            <Text style={text}>Sveiki, {patientName},</Text>
            <Text style={text}>
              apgailestaujame, tačiau negalime patvirtinti jūsų vizito užklausos.
            </Text>
            <Section style={detailsBox}>
              <Text style={detailRow}><strong>Paslauga:</strong> {serviceName}</Text>
              <Text style={detailRow}><strong>Data:</strong> {date}</Text>
              <Text style={detailRow}><strong>Laikas:</strong> {time}</Text>
              <Hr style={{ borderColor: '#e8c8c8', margin: '10px 0' }} />
              <Text style={detailRow}><strong>Priežastis:</strong> {rejectionReason}</Text>
            </Section>
            <Text style={text}>
              Norėdami užsiregistruoti kitu laiku, skambinkite:{' '}
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
const detailsBox = { backgroundColor: '#fdf5f5', borderLeft: '3px solid #c0392b', padding: '16px 20px', margin: '20px 0', borderRadius: '2px' }
const detailRow = { fontSize: '14px', color: '#3a2e24', margin: '6px 0' }
const link = { color: '#b07d56' }
const footer = { fontSize: '12px', color: '#999', textAlign: 'center' as const }
