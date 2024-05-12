const loginForm = document.getElementById('login-form')

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const form = new FormData(e.target)

  const data = {
    user: form.get('user'),
    password: form.get('password'),
  }

  const response = await window.login.login(data)
  console.log({ response })
  if (response === null) {
    alert('Usuário ou senha incorretos!')
  }
})
