export default (error) => {
  if (!process.env.DEBUGGING) return
  console.error(error)
}
