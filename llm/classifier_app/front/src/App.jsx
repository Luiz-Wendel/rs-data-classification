import React from 'react';

import './App.css'

function App() {
  const [textInput, setTextInput] = React.useState(null)
  const [imageSource, setImageSource] = React.useState(null)
  const [classificationResult, setClassificationResult] = React.useState(null)

  function classify() {
    setImageSource(textInput)
    setClassificationResult('Classifying...')
  }

  return (
    <div className="app">
      <h1 className="title">Cat or Dog?</h1>
      <div className="input-container">
        <input className="input" onChange={({ target }) => setTextInput(target.value)}></input>
        <button className="button" onClick={classify}>Classify!</button>
      </div>
      {
        imageSource && (
          <div className="image-container">
            <img className="image" src={imageSource}></img>
            <span className="caption">{classificationResult}</span> 
          </div>
        )
      }
    </div>
  )
}

export default App
