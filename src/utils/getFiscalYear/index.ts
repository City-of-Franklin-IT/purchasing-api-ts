export default () => {
  const today = new Date()
  const year = today.getFullYear()

  if(today.getMonth() < 6) {
    return year.toString().slice(2, 4)
  } else return (year + 1).toString().slice(2, 4) 
}