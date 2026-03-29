import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text,
} from '@react-email/components'
import type { NewBookingAlertEmailData } from '../types'
import { emailStyles as s } from '../styles'

export function NewBookingAlertEmail({
  patientName, patientPhone, patientEmail,
  serviceName, date, time, patientNotes,
}: NewBookingAlertEmailData) {
  return (
    <Html lang="lt">
      <Head />
      <Preview>Nauja vizito užklausa: {patientName} — {date} {time}</Preview>
      <Body style={s.body}>
        <Container style={s.container}>
          <Heading style={s.headingMd}>Baltic Foot — nauja užklausa</Heading>
          <Hr style={s.hr} />
          <Section>
            <Text style={s.text}>Gauta nauja vizito užklausa. Peržiūrėkite ir patvirtinkite admin panelėje.</Text>
            <Section style={s.detailBoxPlain}>
              <Text style={s.label}>PACIENTAS</Text>
              <Text style={s.detailRow}><strong>Vardas:</strong> {patientName}</Text>
              <Text style={s.detailRow}><strong>Tel.:</strong> {patientPhone}</Text>
              <Text style={s.detailRow}><strong>El. paštas:</strong> {patientEmail}</Text>
              <Hr style={s.hrInner} />
              <Text style={s.label}>VIZITAS</Text>
              <Text style={s.detailRow}><strong>Paslauga:</strong> {serviceName}</Text>
              <Text style={s.detailRow}><strong>Data:</strong> {date}</Text>
              <Text style={s.detailRow}><strong>Laikas:</strong> {time}</Text>
              {patientNotes && (
                <>
                  <Hr style={s.hrInner} />
                  <Text style={s.label}>PASTABOS</Text>
                  <Text style={s.detailRow}>{patientNotes}</Text>
                </>
              )}
            </Section>
          </Section>
          <Hr style={s.hr} />
          <Text style={s.footer}>Baltic Foot administracija</Text>
        </Container>
      </Body>
    </Html>
  )
}
