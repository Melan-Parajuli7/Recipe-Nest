import React from 'react'

const Navbar = () => {
  return (
    <>
    <div className='navbar'>
        <nav>
            <ul>
                <li><a href='/home'>All</a></li>
                <li><a href='/breakfast'>Breakfast</a></li>
                <li><a href='/lunch'>Lunch</a></li>
                <li><a href='/dinner'>Dinner</a></li>
                <li><a href='/dessert'>Dessert</a></li>
            </ul>
        </nav>
    </div>
      
    </>
  )
}

export default Navbar
