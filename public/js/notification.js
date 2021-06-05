const notificationContainer = document.querySelector("#notification-container")
const notificationDismissAllButton = document.querySelector("#notification-dismiss-all-button")


const notifyUser = (message) => {
  const notificationId = `notification-${Date.now()}_${Math.round(Math.random() * 1000)}`

  const notificationDiv = document.createElement("div")
  notificationDiv.classList.add(["notification"])
  notificationDiv.id = notificationId

  const notificationText = document.createElement("p")
  notificationText.classList.add(["notification-content"])
  notificationText.textContent = message

  const notificationDismissButton = document.createElement("button")
  notificationDismissButton.classList.add(["notification-dismiss-button"])
  notificationDismissButton.textContent = "Dismiss"
  notificationDismissButton.onclick = e => {
    document.getElementById(notificationId).remove()
  }

  notificationDiv.appendChild(notificationText)
  notificationDiv.appendChild(notificationDismissButton)

  notificationContainer.appendChild(notificationDiv)

  notificationDismissAllButton.style.display = null
}

notificationDismissAllButton.addEventListener("click", () => {
  notificationContainer.innerHTML = ""
  notificationDismissAllButton.style.display = "none"
})