import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text,
} from '@react-email/components'
import type { BookingCancelledAlertEmailData } from '../types'
import { emailStyles as s } from '../styles'

export function BookingCancelledAlertEmail({
  patientName, serviceName, date, time,
}: BookingCancelledAlertEmailData) {
  return (
    <Html lang="lt">
      <Head />
      <Preview>Vizitas atšauktas: {patientName} — {date} {time}</Preview>
      <Body style={s.body}>
        <Container style={s.container}>
          <Heading style={s.headingMd}>Baltic Foot — vizitas atšauktas</Heading>
          <Hr style={s.hr} />
          <Section>
            <Text style={s.text}>
              Vizitas buvo atšauktas. Laikas yra laisvas kitiems pacientams.
            </Text>
            <Section style={s.detailBoxRed}>
              <Text style={s.detailRow}><strong>Pacientas:</strong> {patientName}</Text>
              <Text style={s.detailRow}><strong>Paslauga:</strong> {serviceName}</Text>
              <Text style={s.detailRow}><strong>Data:</strong> {date}</Text>
              <Text style={s.detailRow}><strong>Laikas:</strong> {time}</Text>
            </Section>
          </Section>
          <Hr style={s.hr} />
          <Text style={s.footer}>Baltic Foot administracija</Text>
        </Container>
      </Body>
    </Html>
  )
}
