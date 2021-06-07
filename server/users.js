const users = {}

exports.getUser = (userId) => {
  if(userId in users) {
    return users[userId]
  }
  return null
}

exports.getUsers = () => {
  let usersArray = []

  for (let loopUserId of Object.keys(users)) usersArray.push(users[loopUserId])
  return usersArray
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