import React from 'react';

// components
import { CaptionedImage } from './components/CaptionedImage/index.jsx';

import './App.css'

function App() {
  const [textInput, setTextInput] = React.useState(null)
  const [imageSource, setImageSource] = React.useState(null)
  const [method, setMethod] = React.useState(null)
  const [selectedMethod, setSelectedMethod] = React.useState(null)

  async function classify() {
    setImageSource(textInput)
    setMethod(selectedMethod)
  }

  return (
    <div className="app">
      <h1 className="title">Cat or Dog?</h1>
      <div className="input-container">
        <input className="input" onChange={({ target }) => setTextInput(target.value)}></input>
        <select className="select" onChange={({ target }) => setSelectedMethod(target.value)}>
          <option value="knn">KNN</option>
          <option value="llm">LLM</option>
        </select>
        <button className="button" onClick={classify}>Classify!</button>
      </div>
      {
        imageSource && (
          <CaptionedImage source={imageSource} method={method} />
        )
      }
    </div>
  )
}

export default App
