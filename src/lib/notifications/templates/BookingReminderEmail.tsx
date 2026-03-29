import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text, Link,
} from '@react-email/components'
import type { BookingEmailData } from '../types'
import { emailStyles as s } from '../styles'

export function BookingReminderEmail({ patientName, serviceName, date, time, clinicPhone }: BookingEmailData) {
  return (
    <Html lang="lt">
      <Head />
      <Preview>Primename apie rytojaus vizitą — Baltic Foot</Preview>
      <Body style={s.body}>
        <Container style={s.container}>
          <Heading style={s.heading}>Baltic Foot</Heading>
          <Hr style={s.hr} />
          <Section>
            <Text style={s.text}>Sveiki, {patientName},</Text>
            <Text style={s.text}>
              primename, kad <strong>rytoj</strong> jūsų laukia vizitas Baltic Foot
              podologijos klinikoje.
            </Text>
            <Section style={s.detailBoxNeutral}>
              <Text style={s.detailRow}><strong>Paslauga:</strong> {serviceName}</Text>
              <Text style={s.detailRow}><strong>Data:</strong> {date}</Text>
              <Text style={s.detailRow}><strong>Laikas:</strong> {time}</Text>
            </Section>
            <Text style={s.text}>
              Jei negalite atvykti, praneškite iš anksto:{' '}
              <Link href={`tel:${clinicPhone}`} style={s.link}>{clinicPhone}</Link>
            </Text>
          </Section>
          <Hr style={s.hr} />
          <Text style={s.footer}>Baltic Foot podologijos klinika · Šiauliai</Text>
        </Container>
      </Body>
    </Html>
  )
}
