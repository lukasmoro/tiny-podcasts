import React, { useState } from 'react';
import Form from './_Form';

const Item = ({ todos, completeTodo, removeTodo }) => {
  const [edit, setEdit] = useState({
    id: null,
    value: '',
  });

  //THIS MUST GET DATA FROM STORAGE
  return todos.map((todo, index) => (
    <div key={index}>
      <div key={todo.id}>{todo.text}</div>
      <div>
        <button onClick={() => removeTodo(todo.id)}> - </button>
      </div>
    </div>
  ));
};

export default Item;
