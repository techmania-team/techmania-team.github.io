export const getLevelColor = (level) => {
  const cls = []
  if (level <= 5) {
    cls.push({ 'text-yellow-8': true })
  } else if (level <= 10) {
    cls.push({ 'text-blue': true })
  } else {
    cls.push({ 'text-red-6': true })
  }
  return cls
}

export const getLevelFilter = (level) => {
  const cls = []
  if (level <= 5) {
    cls.push({ 'filter-nm': true })
  } else if (level <= 10) {
    cls.push({ 'filter-hd': true })
  } else {
    cls.push({ 'filter-mx': true })
  }
  return cls
}
