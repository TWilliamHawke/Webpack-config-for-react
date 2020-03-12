import React from 'react';
import { render } from 'react-dom'
import './style.scss'

const App = () => {
  return (
    <div className="container">
      <h1>Hello world</h1>
      <div className="logo"></div>
    </div>

  )
}

render(<App />, document.getElementById('root'))