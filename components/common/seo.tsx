import { Univerisity } from '@/enums'
import { NextSeo, NextSeoProps } from 'next-seo'

type SeoProps = Omit<NextSeoProps, 'titleTemplate' | 'defaultTitle'>

export function Seo(props: SeoProps) {
  const name = 'Course Timetable Generator'
  const universities = Object.values(Univerisity).join(', ')
  const universityShortNames = Object.keys(Univerisity)
    .map((name) => `${name} timetable`)
    .join(', ')

  return (
    <NextSeo
      titleTemplate={`%s | ${name}`}
      defaultTitle={name}
      {...props}
      description={`${props.description} Supported universities: ${universities}...`}
      additionalMetaTags={[
        {
          property: 'author',
          content: 'TP-O',
        },
        {
          property: 'keywords',
          content: universityShortNames,
        },
      ]}
    />
  )
}
