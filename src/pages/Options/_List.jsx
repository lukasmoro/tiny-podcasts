import React, { useState, useEffect } from 'react';
import Form from './_Form';
import Item from './_Item';

function List() {
  const [todos, setTodos] = useState([]);

  //THIS MUST IMPLEMENT REGEX ✅
  //THIS MUST THROW ERROR MESSAGE FOR WRONG FORMAT
  const addTodo = (todo) => {
    if (
      !/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/.test(
        todo.text
      )
    ) {
      return;
    }
    //THIS MUST ADD TO STORAGE API ✅
    const newTodos = [todo, ...todos];
    setTodos(newTodos);
    chrome.storage.local.set({ newTodos }, () => {
      console.log(newTodos);
    });
  };

  //IS THIS CHANGING STATE? YES...
  //THIS MUST REMOVE FROM STORAGE API
  const removeTodo = (id) => {
    const removedArr = [...todos].filter((todo) => todo.id !== id);
    setTodos(removedArr);
    chrome.storage.local.set({ removeTodo }, () => {
      console.log(removedArr);
    });
  };

  return (
    <>
      <Form onSubmit={addTodo} />
      <Item todos={todos} removeTodo={removeTodo} />
    </>
  );
}

export default List;
