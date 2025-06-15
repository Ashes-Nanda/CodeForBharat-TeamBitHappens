import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
	children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [allowed, setAllowed] = useState(false);

	useEffect(() => {
		(async () => {
			const { data: { session } } = await supabase.auth.getSession();
			if (!session) {
				navigate('/auth');
				return;
			}
			// Check for profile
			const { data: profile } = await supabase
				.from('profiles')
				.select('id')
				.eq('id', session.user.id)
				.single();
			if (!profile) {
				navigate('/onboarding');
				return;
			}
			setAllowed(true);
			setLoading(false);
		})();
	}, [navigate]);

	if (loading) return null;
	if (!allowed) return null;
	return <>{children}</>;
};
