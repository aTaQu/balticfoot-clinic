import type { CSSProperties } from 'react'

export const emailStyles = {
  body:      { backgroundColor: '#f5f0eb', fontFamily: 'Georgia, serif' } as CSSProperties,
  container: { maxWidth: '560px', margin: '0 auto', backgroundColor: '#ffffff', padding: '40px', borderRadius: '4px' } as CSSProperties,
  heading:   { fontSize: '22px', color: '#5c3d2e', letterSpacing: '0.05em', marginBottom: '4px' } as CSSProperties,
  headingMd: { fontSize: '20px', color: '#5c3d2e', letterSpacing: '0.05em', marginBottom: '4px' } as CSSProperties,
  hr:        { borderColor: '#d4c4b0', margin: '20px 0' } as CSSProperties,
  hrInner:   { borderColor: '#d4c4b0', margin: '10px 0' } as CSSProperties,
  text:      { fontSize: '15px', lineHeight: '1.6', color: '#3a2e24', margin: '12px 0' } as CSSProperties,
  detailRow: { fontSize: '14px', color: '#3a2e24', margin: '6px 0' } as CSSProperties,
  link:      { color: '#b07d56' } as CSSProperties,
  footer:    { fontSize: '12px', color: '#999', textAlign: 'center' as const } as CSSProperties,
  label:     { fontSize: '11px', color: '#999', letterSpacing: '0.1em', margin: '0 0 6px 0' } as CSSProperties,

  // Detail box variants — accent colour signals booking status at a glance
  detailBoxNeutral: { backgroundColor: '#f9f5f0', borderLeft: '3px solid #b07d56', padding: '16px 20px', margin: '20px 0', borderRadius: '2px' } as CSSProperties,
  detailBoxGreen:   { backgroundColor: '#f0f7f0', borderLeft: '3px solid #4a8c5c', padding: '16px 20px', margin: '20px 0', borderRadius: '2px' } as CSSProperties,
  detailBoxRed:     { backgroundColor: '#fdf5f5', borderLeft: '3px solid #c0392b', padding: '16px 20px', margin: '20px 0', borderRadius: '2px' } as CSSProperties,
  detailBoxPlain:   { backgroundColor: '#f9f5f0', padding: '16px 20px', margin: '16px 0', borderRadius: '2px' } as CSSProperties,
}
