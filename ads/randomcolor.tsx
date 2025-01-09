import React from 'react';

const RandomColorAd: React.FC = () => {
  const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
  
  return (
    <div 
      style={{
        backgroundColor: randomColor,
        padding: '20px',
        borderRadius: '8px',
        margin: '20px 0',
        color: '#fff',
        textAlign: 'center'
      }}
    >
      <h3>Random Color Advertisement</h3>
      <p>Today's color: {randomColor}</p>
    </div>
  );
};

export default RandomColorAd; 