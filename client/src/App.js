import './App.css';

import React from 'react';

import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Admin from './pages/Admin';
import User from './pages/User/User';


function App() {
  return (
    <div className="App">

    <Routes>
      <Route path='/user' element={<Home />}/>
      <Route path='/admin' element={<Admin />}/>
      <Route path='/f/:id' element={<User />}/>
    </Routes>
    </div>
  );
}

export default App;
