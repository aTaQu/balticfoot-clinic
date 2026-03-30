import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text,
} from '@react-email/components'
import type { ContactEnquiryAlertEmailData } from '../types'
import { emailStyles as s } from '../styles'

export function ContactEnquiryAlertEmail({
  senderName, phone, email, message,
}: ContactEnquiryAlertEmailData) {
  return (
    <Html lang="lt">
      <Head />
      <Preview>Nauja žinutė iš kontaktų formos: {senderName}</Preview>
      <Body style={s.body}>
        <Container style={s.container}>
          <Heading style={s.headingMd}>Baltic Foot — kontaktų forma</Heading>
          <Hr style={s.hr} />
          <Section>
            <Text style={s.text}>Gauta nauja žinutė per kontaktų formą.</Text>
            <Section style={s.detailBoxPlain}>
              <Text style={s.label}>SIUNTĖJAS</Text>
              <Text style={s.detailRow}><strong>Vardas:</strong> {senderName}</Text>
              {phone && <Text style={s.detailRow}><strong>Tel.:</strong> {phone}</Text>}
              {email && <Text style={s.detailRow}><strong>El. paštas:</strong> {email}</Text>}
              <Hr style={s.hrInner} />
              <Text style={s.label}>ŽINUTĖ</Text>
              <Text style={s.detailRow}>{message}</Text>
            </Section>
          </Section>
          <Hr style={s.hr} />
          <Text style={s.footer}>Baltic Foot administracija</Text>
        </Container>
      </Body>
    </Html>
  )
}
