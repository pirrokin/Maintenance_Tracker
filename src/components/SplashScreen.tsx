import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
    onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const [fading, setFading] = useState(false);

    useEffect(() => {
        // Total animation time (e.g. 4 seconds)
        const timer = setTimeout(() => {
            setFading(true);
            // Wait for fade out transition (e.g. 1s)
            setTimeout(onFinish, 1000);
        }, 4000);

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className={`splash-container ${fading ? 'fade-out' : ''}`}>
            <h1 className="splash-title">Maintenance Tracker</h1>
        </div>
    );
};

export default SplashScreen;
