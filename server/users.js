const users = {}

exports.getUser = (userId) => {
  if(userId in users) {
    return users[userId]
  }
  return null
}

exports.setUser = (userId, data) => {
  if(data) {
    users[userId] = data
    return users[userId]
  }
  else {
    delete users[userId]
    return null
  }
}