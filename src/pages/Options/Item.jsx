import React, { useState, useEffect } from 'react';
import Form from './Form';

const Item = ({ urls, removeUrl }) => {
  //THIS MUST GET DATA FROM STORAGE
  return urls.map((url, key) => (
    <div key={key}>
      <div key={url.id}>{url.text}</div>
      <div>
        <button onClick={() => removeUrl(url.id)}> - </button>
      </div>
    </div>
  ));
};

export default Item;

/*

{items.map((item, key) => {
        return (
          <div key={key}>
            <h1>{item.newUrls[0].text}</h1>
          </div>
        );
      })}

*/
