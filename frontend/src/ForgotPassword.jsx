// src/ForgotPassword.jsx
import React, { useState } from 'react'; 
import LogosContainer from './LogosContainer'; // 🔑 CORRECT: Imports the centralized component
// ❌ REMOVED: import { useNavigate } from 'react-router-dom'; (Avoids ESlint error)

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // ❌ REMOVED: const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // --- FOR DEMO: Simulate API call ---
        setTimeout(() => {
            alert(`Password reset link sent to ${email}.`);
            setIsLoading(false);
            setEmail('');
        }, 1500);
        // ------------------------------------
    };

    return (
        <div className="signin-main-container">
            <h1 className="forgot-password-main-title">Reset Password</h1> 

            <div className="signin-card">
                <h2 className="welcome-back-subtitle">Forgot Password</h2>
                <p className="enter-email-text">
                    Enter your email and we'll send you a link to reset your password
                </p>

                <form onSubmit={handleSubmit} className="login3-form-container">
                    <input
                        type="email"
                        className="signin-input"
                        placeholder="Email / Username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        aria-label="Email or Username"
                    />

                    <button
                        type="submit"
                        className="signin-continue-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Reset Password'}
                    </button>
                </form>

                <p className="signin-terms-policy">
                    By clicking continue, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                </p>
            </div>
            
            {/* 🔑 USAGE: Uses the centralized LogosContainer */}
            <LogosContainer />
        </div>
    );
}

export default ForgotPassword;