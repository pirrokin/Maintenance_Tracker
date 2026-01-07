import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
    onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const [fading, setFading] = useState(false);

    useEffect(() => {
        // Duration matched to CSS animation (6s) + buffer
        const timer = setTimeout(() => {
            setFading(true);
            setTimeout(onFinish, 1500);
        }, 6500);

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className={`splash-container ${fading ? 'fade-out' : ''}`}>
            <div className="ambient-light"></div>
            <div className="noise-overlay"></div>
            <h1 className="splash-title">Maintenance Tracker</h1>
        </div>
    );
};

export default SplashScreen;
