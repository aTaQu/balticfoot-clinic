import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text, Link,
} from '@react-email/components'
import type { BookingRejectedEmailData } from '../types'
import { emailStyles as s } from '../styles'

export function BookingRejectedEmail({ patientName, serviceName, date, time, clinicPhone, rejectionReason }: BookingRejectedEmailData) {
  return (
    <Html lang="lt">
      <Head />
      <Preview>Deja, negalime patvirtinti jūsų vizito — Baltic Foot</Preview>
      <Body style={s.body}>
        <Container style={s.container}>
          <Heading style={s.heading}>Baltic Foot</Heading>
          <Hr style={s.hr} />
          <Section>
            <Text style={s.text}>Sveiki, {patientName},</Text>
            <Text style={s.text}>
              apgailestaujame, tačiau negalime patvirtinti jūsų vizito užklausos.
            </Text>
            <Section style={s.detailBoxRed}>
              <Text style={s.detailRow}><strong>Paslauga:</strong> {serviceName}</Text>
              <Text style={s.detailRow}><strong>Data:</strong> {date}</Text>
              <Text style={s.detailRow}><strong>Laikas:</strong> {time}</Text>
              <Hr style={s.hrInner} />
              <Text style={s.detailRow}><strong>Priežastis:</strong> {rejectionReason}</Text>
            </Section>
            <Text style={s.text}>
              Norėdami užsiregistruoti kitu laiku, skambinkite:{' '}
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
