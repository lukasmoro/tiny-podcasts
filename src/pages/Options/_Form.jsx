import React, { useState, useEffect, useRef } from 'react';

function Form(props) {
  const [input, setInput] = useState(props.edit ? props.edit.value : '');

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  });

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    props.onSubmit({
      id: new Date().getTime(),
      text: input,
    });
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      {props.edit ? (
        <>
          <input
            placeholder="Update your item"
            value={input}
            onChange={handleChange}
            name="text"
            ref={inputRef}
            className="todo-input edit"
          />
          <button onClick={handleSubmit} className="todo-button edit">
            Update
          </button>
        </>
      ) : (
        <>
          <input
            placeholder="Enter your feeds here!"
            value={input}
            onChange={handleChange}
            name="text"
            ref={inputRef}
          />
          <button onClick={handleSubmit}>Submit</button>
        </>
      )}
    </form>
  );
}

export default Form;
