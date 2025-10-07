import React, { useState} from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material';

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [ confirmPassword, setConfirmPassword] = useState("");
    const [isChecked, setIsChecked] = useState(false)
    const checkHandler = () => {
        setIsChecked(!isChecked)
    }

    const handleSignup = (e) => {
        e.preventDefault();
        console.log("Signup email:", email, "password:", password);
    };


return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
        <h1>Signup</h1>
        <form onSubmit={handleSignup}>
            <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) =>  setEmail(e.target.value)}
                required
                
                />
            
            <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) =>  setPassword(e.target.value)}
                required
                />
            
            <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) =>  setConfirmPassword(e.target.value)}
                required
                />

            
            <input
                type="checkbox"
                name="Teacher"    
                checked={isChecked}
                onChange={checkHandler}

            />
            <label htmlFor="checkbox">Are you a Teacher?</label>
            
             
            <button type="submit">Signup</button>
        </form>
    </Box>
);
}
export default Signup;