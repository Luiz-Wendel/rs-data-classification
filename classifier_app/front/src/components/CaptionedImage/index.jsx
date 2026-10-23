import React from 'react';

import classificationRequest from '../../classify/api';

import './App.css'

function CaptionedImage({ source, method }) {
  const [category, setCategory] = React.useState(null)

  React.useEffect(() => {
    const getCaption = async () => {
      setCategory(null)

      const category = await classificationRequest(source, method)

      setCategory(category)
    }

    getCaption()
  }, [source, method]);

  return (
    <div className="image-container">
      {
        (source || category) && (
          <h2 className="caption">
            {category ? `It's a ${category}` : 'Classifying...'}
          </h2>
        )
      }
      <img className="image" src={source}></img>
    </div>
  )
}

export { CaptionedImage }
