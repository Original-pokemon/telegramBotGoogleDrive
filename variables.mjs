const options = {
  reties: 5,
  minTimeout: 1000,
  maxTimeOut: 5000,
  factor: 2,
  onRetry: (err) => console.log(`Error: ${err.message}. Retrying...`)
}

export { options }