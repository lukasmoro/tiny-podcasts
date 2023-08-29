import React, { useEffect } from 'react';

const Item = ({ items, removeUrl }) => {

  return (
    <div>
      {items?.map((item, key) => {
        return (
          <div className="items" key={key}>
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
