import { IndexLink, Link } from 'react-router'
import DuckImage from '../assets/Duck.jpg'
import React from 'react'
import './HomeView.scss'

export const HomeView = () => (
  <div>
    <h4>Welcome!</h4>
    <IndexLink to='/' activeClassName='route--active'>
    Home
    </IndexLink>
    {' · '}
    <Link to='/counter' activeClassName='route--active'>
    Counter
    </Link>
    {' · '}
    <Link to='/viewer' activeClassName='route--active'>
    Viewer
    </Link>
    <img
      alt='This is a duck, because Redux!'
      className='duck'
      src={DuckImage} />
  </div>
)

export default HomeView
