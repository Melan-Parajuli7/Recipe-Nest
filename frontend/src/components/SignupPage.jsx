import React from 'react'
import { Link } from 'react-router-dom'
import { handleError, handleSuccess } from './utils'
import { useNavigate } from 'react-router-dom'

const SignupPage = () => {

  const [signInfo, setSignInfo] = React.useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "customer"
  })

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    const copySignInfo = { ...signInfo }
    copySignInfo[name] = value
    setSignInfo(copySignInfo)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { name, email, password, phone, role , address } = signInfo
    if (!name || !email || !password || !phone || !address || !role) {
      return handleError("All fields are required")
    }
    if (signInfo.password.length < 6) {
      return handleError("Password must be at least 6 characters")
    }
    try {
      const url = "http://localhost:3000/api/users/register"
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signInfo)
      })
      const data = await res.json()
      const { success, message, error } = data
      if (success) {
        handleSuccess(message)
        setTimeout(() => {}, 2000)
        navigate("/login")
      } else if (!data.success) {
        handleError(data.errors?.[0])
      } else if (error) {
        handleError(error)
      }
    } catch (err) {
      handleError(err.message)
    }
  }

  return (
    <>
      <img
        src="/images/figma.jpg"
        alt="Figma"
        style={{
          width: '100vw', height: '100vh',
          objectFit: 'cover', position: 'fixed',
          top: 0, left: 0, zIndex: -1
        }}
      />

      <div className='container signup-container' style={{ width: '460px' }}>
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit}>

          <div>
            <label htmlFor='name'>Full Name</label>
            <input
              onChange={handleChange} type="text" name="name" id="name"
              autoFocus placeholder='Enter your Name.....' value={signInfo.name}
            />
          </div>

          <div>
            <label htmlFor='email'>Email</label>
            <input
              onChange={handleChange} type="email" name="email" id="email"
              placeholder='Enter your Email.....' value={signInfo.email}
            />
          </div>

          <div>
            <label htmlFor='password'>Password</label>
            <input
              onChange={handleChange} type="password" name="password" id="password"
              placeholder='Min. 6 characters.....' value={signInfo.password}
            />
          </div>

          <div className="signup-row">
            <div>
              <label htmlFor='phone'>Phone</label>
              <input
                onChange={handleChange} type="tel" name="phone" id="phone"
                placeholder='+1 234 567 890' value={signInfo.phone}
              />
            </div>
            <div>
              <label htmlFor='role'>Role</label>
              <select onChange={handleChange} name="role" id="role" value={signInfo.role}>
                <option value="customer">Customer</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor='address'>Address</label>
            <input
              onChange={handleChange} type="text" name="address" id="address"
              placeholder='Enter your Address.....' value={signInfo.address}
            />
          </div>

          <button type="submit">Sign Up</button>

          <span className='span'>
            Already have an account?&nbsp;
            <Link to="/login">Login</Link>
          </span>

        </form>
      </div>
    </>
  )
}

export default SignupPage