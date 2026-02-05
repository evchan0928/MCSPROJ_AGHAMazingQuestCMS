import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpWithEmail } from './api/django-api'; // Import the signup function
import LogosContainer from './LogosContainer'; // Contains the four horizontal logos
import './styles.css';

// Simple email validation function
const isValidEmail = (email) => {
    // Basic regex for email format validation (name@domain.tld)
    return /\S+@\S+\.\S+/.test(email);
};

const SignupScreen = () => {
    const navigate = useNavigate();
    // State for the email input and error message
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Add password state
    const [firstName, setFirstName] = useState(''); // Add firstName state
    const [lastName, setLastName] = useState(''); // Add lastName state
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Loading state

    const handleSignInClick = () => {
        navigate('/signin');
    };

    const onGoogleSignup = () => {
        console.log('Google Signup Attempted, navigating to /google-auth');
        navigate('/google-auth');
    };

    // Validation logic and API call
    const onDostSignup = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setError(''); // Clear previous errors
        setLoading(true); // Set loading state

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address to sign up.');
            setLoading(false);
            console.log('Signup failed: Invalid email format.');
            return; // Stop the function if validation fails
        }
        
        if (!password || password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        try {
            // Call the backend API to register the user
            const userData = {
                email,
                first_name: firstName,
                last_name: lastName
            };
            
            await signUpWithEmail(email, password, userData);
            console.log('DOST Signup successful. Redirecting to /dashboard');
            navigate('/dashboard'); // Redirects to the Dashboard on successful registration
        } catch (err) {
            console.error('Signup error:', err);
            setError(err.message || 'An error occurred during signup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signin-main-container">
            <div className="signin-card">
                <h1 className="signin-title">Create Your Account</h1>
                <h2 className="welcome-back-subtitle">Sign up for AGHAMazing Quest</h2>
                
                <form onSubmit={onDostSignup} className="signin-form">
                    {/* Display Error Message */}
                    {error && <p className="error-message signin-error">{error}</p>}
                    
                    <div className="form-group">
                        <label htmlFor="firstName" className="sr-only">First Name</label>
                        <input 
                            id="firstName"
                            type="text" 
                            placeholder="First Name" 
                            className="signin-input"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)} 
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="lastName" className="sr-only">Last Name</label>
                        <input 
                            id="lastName"
                            type="text" 
                            placeholder="Last Name" 
                            className="signin-input"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)} 
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input 
                            id="email"
                            type="email" 
                            placeholder="Enter your email" 
                            className="signin-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input 
                            id="password"
                            type="password" 
                            placeholder="Password (min 6 chars)" 
                            className="signin-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                        />
                    </div>
                    
                    <button type="submit" className="signin-continue-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up with DOST or APC Account'}
                    </button>
                </form>

                <div className="divider">or continue with</div>

                <button className="login3-google-btn-alt" onClick={onGoogleSignup}>
                    <img
                        src="https://github.com/Marianne-101/pictures/blob/main/google-icon.png?raw=true"
                        alt="Google Icon"
                        className="google-icon"
                    />
                    Sign up with Google
                </button>

                <div className="signin-terms-policy">
                    By clicking continue, you agree to our
                    <a href="/terms-of-service"> Terms of Service </a>
                    and
                    <a href="/privacy-policy"> Privacy Policy</a>
                </div>

                <div className="signup-forgot-links">
                    Already have an account?
                    <a href="/signin" onClick={(e) => { e.preventDefault(); handleSignInClick(); }}>Sign In</a>
                </div>
            </div>
            
            <div className="signin-logo-footer">
                <LogosContainer />
                <p>© 2023 DOST-STII. All rights reserved.</p>
            </div>
        </div>
    );
};

export default SignupScreen;