import { css } from '@emotion/css'
import { Row } from 'src/components/ui-blocks'

const Copyright = () => (
  <Row>
    <p
      className={css({
        color: 'white',
        fontFamily: 'Roboto Mono, monospace',
        fontSize: '10pt',
        margin: 0
      })}
    >
      <span
        className={css({
          fontSize: '14pt'
        })}
      >
        &copy;
      </span>{' '}
      2022 Identity Box
    </p>
  </Row>
)

export { Copyright }
