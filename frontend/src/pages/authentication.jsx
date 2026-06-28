import * as React from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Box,
  Typography,
  ThemeProvider,
  createTheme,
  Snackbar,
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { AuthContext } from "../contexts/AuthContext";

const defaultTheme = createTheme();

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        await handleLogin(username, password);
      } else {
        const result = await handleRegister(name, username, password);

        setUsername("");
        setPassword("");
        setName("");
        setMessage(result);
        setOpen(true);
        setError("");
        setFormState(0);
      }
    } catch (err) {
      console.log(err);
      setError(err?.response?.data?.message || "Error occurred");
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />

      {/* MAIN CONTAINER */}
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          width: "100%",
        }}
      >
        {/* LEFT SIDE IMAGE */}
        <Box
          sx={{
            width: "65%",
            backgroundImage:
              'url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* RIGHT SIDE FORM */}
        <Box
          sx={{
            width: "35%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            px: 4,
            transform: "translateY(-100px)", 
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>

          <Typography variant="h5" fontWeight="bold">
            {formState === 0 ? "Sign In" : "Sign Up"}
          </Typography>

          {/* TOGGLE BUTTONS */}
          <Box sx={{ display: "flex", gap: 2, my: 2 }}>
            <Button
              variant={formState === 0 ? "contained" : "outlined"}
              onClick={() => setFormState(0)}
            >
              Sign In
            </Button>

            <Button
              variant={formState === 1 ? "contained" : "outlined"}
              onClick={() => setFormState(1)}
            >
              Sign Up
            </Button>
          </Box>

          {/* FORM */}
          <Box sx={{ width: "100%" }}>
            {formState === 1 && (
              <TextField
                fullWidth
                margin="normal"
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            <TextField
              fullWidth
              margin="normal"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Typography color="error">{error}</Typography>

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleAuth}
            >
              {formState === 0 ? "Login" : "Register"}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* SNACKBAR */}
      <Snackbar open={open} autoHideDuration={4000} message={message} />
    </ThemeProvider>
  );
}
