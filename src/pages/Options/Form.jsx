import React, { useState } from 'react';

function Form(props) {
  const [input, setInput] = useState('');

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    props.onSubmit({
      key: new Date().getTime(),
      text: input,
    });
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <input
        placeholder="Enter your RSS-feeds here!"
        value={input}
        onChange={handleChange}
        name="text"
      />
      <button className="submit" onClick={handleSubmit}>
        Submit
      </button>
    </form>
  );
}

export default Form;
