import axios from 'axios';

interface EmergencyMessage {
	name: string;
	phone: string;
	situation: string;
}

const API_BASE_URL = "YOUR_API_KEY";

export const sendEmergencyNotification = async (data: EmergencyMessage): Promise<boolean> => {
	try {
		const response = await axios.post(`${API_BASE_URL}/api/emergency`, data);
		return response.data.success;
	} catch (error) {
		console.error('Failed to send emergency notification:', error);
		return false;
	}
};

