import React from 'react'
import { getImage } from 'src/assets'
import { TextBox, Img } from 'src/components/ui-blocks'

const BoxContent1 = ({ data }) => (
  <>
    <TextBox>
      Most of the data today belong to just a handful of companies.
      Personal documents, photographs, videos, things that we put online in general,
      contain lots of sensitive information.
      Information that we would rather prefer to stay private.
      Very often the same companies that provide more or less
      "complimentary" storage space for our disposal, also help
      us managing our whole digital existence. The combination of
      the data and the identity information is a powerful combination
      which empowers well-established business models where
      the user's data or the user itself become a product.
      Allowing sensitive data to be kept by well-known service providers
      makes it easier than ever for illegal institutions, but also the state,
      to gain insights into the data that they have no rights to access.
    </TextBox>
    <Img src={getImage(data, 'CloudStorage')} />
  </>
)

export { BoxContent1 }
