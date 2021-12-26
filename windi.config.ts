import { defineConfig } from 'windicss/helpers'
import colors from 'windicss/colors'
import typography from 'windicss/plugin/typography'

export default defineConfig({
  darkMode: 'class',
  // https://windicss.org/posts/v30.html#attributify-mode
  attributify: true,

  plugins: [
    typography(),
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'inherit',
            a: {
              'color': 'inherit',
              'opacity': 0.75,
              'fontWeight': '500',
              'textDecoration': 'underline',
              '&:hover': {
                opacity: 1,
                color: colors.teal[600],
              },
            },
            b: { color: 'inherit' },
            strong: { color: 'inherit' },
            em: { color: 'inherit' },
            h1: { color: 'inherit' },
            h2: { color: 'inherit' },
            h3: { color: 'inherit' },
            h4: { color: 'inherit' },
            code: { color: 'inherit' },
          },
        },
      },
      colors: {
        dark: '#121212',
      },
      height: {
        xs: '20rem',
        sm: '24rem',
        md: '28rem',
        lg: '32rem',
        xl: '36rem',
      },
      minHeight: {
        xs: '20rem',
        sm: '24rem',
        md: '28rem',
        lg: '32rem',
        xl: '36rem',
      },
      fontSize: {
        '2xs': '0.5rem',
        '3xs': '0.35rem',
      },
      gridTemplateRows: {
        16: 'repeat(16, minmax(0, 1fr))',
      },
    },
  },
})
