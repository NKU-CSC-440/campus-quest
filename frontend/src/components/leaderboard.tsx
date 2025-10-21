import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';



const Leaderboard: React.FC = () => {


const [users, setUsers] = useState<Array<{ id: number; name: string; completions: number }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/v1/leaderboard')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch leaderboard');
                return res.json();
            })
            .then((data) => {
                setUsers(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

return (
    <div>
        <h2>Leaderboard</h2>
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Completions</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user, index) => (
               <tr key={user.id}> 
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.completions}</td>
               </tr>
                ))}
            </tbody>
        </table>
    </div>
);
};
export default Leaderboard;