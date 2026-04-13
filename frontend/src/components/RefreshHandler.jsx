import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

function RefreshHandler({ setIsAuthenticated, setAuthLoading }) {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('jwtToken')) {
            setIsAuthenticated(true);
            if (
                location.pathname === '/' ||
                location.pathname === '/login' ||
                location.pathname === '/signup'
                // ✅ '/recipes' removed — no longer force-redirected to /home
            ) {
                navigate('/home', { replace: true });
            }
        }
        setAuthLoading(false); // ✅ always mark auth check as done regardless of token
    }, [location, navigate, setIsAuthenticated, setAuthLoading]);

    return null;
}

export default RefreshHandler;