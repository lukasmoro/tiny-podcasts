import React, { useState, useEffect } from 'react';
import Form from './Form';

const Item = ({ items, removeUrl }) => {
  return (
    <div className="App">
      {items?.map((item, key) => {
        return (
          <div key={key}>
            <p key={item.key}>{item.text}</p>
            <button className="remove" onClick={() => removeUrl(item.key)}>
              Remove
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Item;
