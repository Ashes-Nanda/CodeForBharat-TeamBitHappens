// Crisis keywords to detect emergency situations
const crisisKeywords = [
  "wanna die",
  "I have suidical thoughts",
  "to suicide",
  "suicidal",
  "can't do this anymore",
  "kill myself",
  "want to die",
  "end it all",
  "no reason to live",
  "I'm done"
];

// Check if a message contains crisis keywords
export const isCrisisMessage = (text: string): boolean => {
  return crisisKeywords.some((kw) => text.toLowerCase().includes(kw.toLowerCase()));
};

// Get user's current location
export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Please enable location permissions to use this feature.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

// Send crisis alert via API
export const sendCrisisAlert = async (username: string, coords: { lat: number; lng: number }): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Sending crisis alert with coordinates:', coords);
    
    const response = await fetch('https://zenith-crisis.onrender.com/api/crisis-alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username,
        latitude: coords.lat,
        longitude: coords.lng,
      }),
    });

    // Log the response status and headers for debugging
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid response type:', contentType);
      throw new Error('Server returned non-JSON response');
    }

    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send crisis alert');
    }

    console.log("✅ Crisis alert sent successfully:", data);
    return {
      success: true,
      message: 'Your Friend needs help reach out to them asap. Location: https://maps.google.com/?q=' + coords.lat + ',' + coords.lng
    };
  } catch (err) {
    console.error("❌ Failed to send crisis alert:", err);
    // Log the full error object for debugging
    if (err instanceof Error) {
      console.error("Error details:", {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
    }
    return {
      success: false,
      message: 'Your Friend needs help reach out to them asap'
    };
  }
};

// Handle crisis situation
export const handleCrisisSituation = async (username: string): Promise<{ success: boolean; message: string }> => {
  try {
    const coords = await getCurrentLocation();
    return await sendCrisisAlert(username, coords);
  } catch (error) {
    console.error("❌ Crisis handling failed:", error);
    // Even if location fails, still try to send alert with default coordinates
    try {
      return await sendCrisisAlert(username, { lat: 21.082225, lng: 80.006333 });
    } catch (fallbackError) {
      console.error("❌ Fallback crisis alert failed:", fallbackError);
      return {
        success: false,
        message: 'Your Friend needs help reach out to them asap'
      };
    }
  }
}; 