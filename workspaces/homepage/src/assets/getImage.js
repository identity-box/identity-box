const getImage = (data, name) => {
  return data.allFile.edges.filter(
    f => f.node.name === name
  )[0].node.publicURL
}

export { getImage }
