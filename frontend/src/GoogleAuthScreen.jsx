import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogosContainer from './LogosContainer';
import './styles.css';

// Using a public user icon for the "Use Another Account" section
const USER_ICON_URL = "https://fonts.gstatic.com/s/i/materialicons/person/v15/24px.svg";

const GoogleAuthScreen = () => {
    const navigate = useNavigate();

    // Replaces the inline JS selectAccount function
    const selectAccount = (email) => {
        console.log('Selected account:', email);
        alert('Simulating sign-in with ' + email + '. This would typically lead to a dashboard.');
    };

    // Replaces the useAnotherAccount function
    const useAnotherAccount = () => {
        console.log('Redirecting to sign-in screen.');
        navigate('/signin'); // 🔑 Use navigate to /signin (login-screen-3)
    };
    
    return (
        <div className="google-auth-container">
            {/* 🔑 Card content - START */}
            <div className="google-card">
                <div className="google-header">
                    <span>Sign in with Google</span>
                </div>

                <div className="card-content">
                    <h2>Choose an account</h2>
                    {/* FIX: Replaced <a> tag with <span> if it's only for styling the name */}
                    <p className="to-continue">to continue to <span className="app-name">AGHAMazing Quest CMS</span></p>
                </div>

                <ul className="account-list">
                    {/* Account 1 */}
                    <li className="account-item" onClick={() => selectAccount('account1@gmail.com')}>
                        <div className="avatar-circle">A</div>
                        <div className="account-details">
                            <div className="account-name-text">Account One</div>
                            <div className="account-email">account1@gmail.com</div>
                        </div>
                    </li>

                    {/* Account 2 */}
                    <li className="account-item" onClick={() => selectAccount('account2@gmail.com')}>
                        <div className="avatar-circle" style={{ backgroundColor: '#2e7d32' }}>B</div>
                        <div className="account-details">
                            <div className="account-name-text">Another Account</div>
                            <div className="account-email">account2@gmail.com</div>
                        </div>
                    </li>

                    {/* Use Another Account */}
                    <li className="account-item use-another-account" onClick={useAnotherAccount}>
                        <div className="icon-circle">
                            <img 
                                src={USER_ICON_URL} 
                                alt="Use another account" 
                                className="user-icon"
                            />
                        </div>
                        <div className="account-details">
                            <div className="account-name-text">Use another account</div>
                        </div>
                    </li>
                </ul>
                
                {/* Privacy Notice and Terms links are okay with href="#" if they are just placeholders */}
            <p className="terms-policy">
                By clicking continue, you agree to our
                <a href="/terms-of-service"> **Terms of Service** </a> and
                <a href="/privacy-policy"> **Privacy Policy** </a>
                </p>
            </div>
            {/* 🔑 Card content - END */}
            
            <LogosContainer /> 

            {/* Footer (Help, Privacy, Terms) */}
        </div>
    );
};
export default GoogleAuthScreen;