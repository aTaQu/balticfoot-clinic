import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import styles from './PrivatumoPage.module.css'
import { SITE_URL } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Privatumo politika — Baltic Foot',
  alternates: { canonical: `${SITE_URL}/privatumo-politika/` },
}

export default async function PrivatumoPage() {
  const payload = await getPayload({ config: configPromise })
  const settings = await payload.findGlobal({ slug: 'clinic-settings' })
  const openDays = (settings.openDays ?? []) as string[]

  return (
    <>
      <Navigation />
      <main>
        <div className="container">
          <div className={styles.content}>
              <h1>Privatumo politika</h1>
              <p className={styles.updated}>Paskutinį kartą atnaujinta: 2026 m. kovo 30 d.</p>

              <h2>1. Duomenų valdytojas</h2>
              <p>
                Baltic Foot podologijos kabinetai, veikiantys adresu {settings.address}.<br />
                Kontaktinis el. paštas: <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </p>

              <h2>2. Kokie asmens duomenys renkami</h2>
              <p>Registruodamiesi vizitui renkame šiuos duomenis:</p>
              <ul>
                <li>Vardas ir pavardė</li>
                <li>Telefono numeris</li>
                <li>El. pašto adresas</li>
                <li>Pastabos apie vizitą (jei pateikiamos)</li>
              </ul>

              <h2>3. Duomenų tvarkymo tikslas</h2>
              <p>
                Jūsų asmens duomenys tvarkomi išimtinai vizitų valdymo tikslais: vizito
                patvirtinimui, priminimams siųsti bei susisiekti dėl su vizitu susijusių
                klausimų.
              </p>

              <h2>4. Duomenų saugojimo terminas</h2>
              <p>
                Asmens duomenys saugomi 2 (dvejus) metus nuo vizito datos, po to ištrinami.
              </p>

              <h2>5. Jūsų teisės</h2>
              <p>Turite teisę:</p>
              <ul>
                <li>
                  <strong>Susipažinti</strong> — gauti informaciją apie jūsų turimus duomenis.
                </li>
                <li>
                  <strong>Ištaisyti</strong> — prašyti ištaisyti netikslius duomenis.
                </li>
                <li>
                  <strong>Ištrinti</strong> — prašyti ištrinti jūsų asmens duomenis
                  (&bdquo;teisė būti pamirštam&ldquo;).
                </li>
              </ul>
              <p>
                Norėdami pasinaudoti šiomis teisėmis, susisiekite el. paštu:{' '}
                <a href={`mailto:${settings.email}`}>{settings.email}</a>.
              </p>

              <h2>6. Duomenų perdavimas trečiosioms šalims</h2>
              <p>
                Jūsų duomenys nėra parduodami, nuomojami ar perduodami trečiosioms šalims
                rinkodaros tikslais. Duomenys gali būti perduodami tik tuomet, jei to
                reikalauja teisės aktai.
              </p>

              <h2>7. Slapukai</h2>
              <p>
                Ši svetainė nenaudoja rinkodaros ar sekimo slapukų. Galimi tik techniniai
                slapukai, reikalingi svetainės veikimui.
              </p>

              <h2>8. Kontaktai ir skundai</h2>
              <p>
                Klausimais dėl asmens duomenų tvarkymo kreipkitės el. paštu{' '}
                <a href={`mailto:${settings.email}`}>{settings.email}</a>. Jei manote, kad
                jūsų teisės pažeistos, turite teisę pateikti skundą Valstybinei duomenų
                apsaugos inspekcijai (
                <a
                  href="https://vdai.lrv.lt"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  vdai.lrv.lt
                </a>
                ).
              </p>
            </div>
        </div>
      </main>
      <Footer
        phone={settings.phone}
        email={settings.email}
        address={settings.address}
        workingHoursStart={settings.workingHoursStart}
        workingHoursEnd={settings.workingHoursEnd}
        openDays={openDays}
      />
    </>
  )
}
