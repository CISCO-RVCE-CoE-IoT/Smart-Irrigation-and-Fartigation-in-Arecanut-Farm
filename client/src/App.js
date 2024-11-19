import './App.css';

import React from 'react';

import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Admin from './pages/Admin';
import User from './pages/User/User';
import LoginSignup from './pages/LoginSignup';


function App() {
  return (
    <div className="App">

    <Routes>
      <Route path='/user' element={<Home />}/>
      <Route path='/admin' element={<Admin />}/>
      <Route path='/farmer/:id' element={<User />}/>
      <Route path='/login' element={<LoginSignup/>}/>
    </Routes>
    </div>
  );
}

export default App;
