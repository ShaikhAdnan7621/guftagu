export const getActivityStatus = (lastActive) => {
  if (!lastActive) return { status: 'offline', text: 'Offline' };
  
  const now = new Date();
  const lastActiveDate = new Date(lastActive);
  const diffMinutes = Math.floor((now - lastActiveDate) / (1000 * 60));
  
  // If user was active in last 5 minutes, show as online
  if (diffMinutes <= 5) {
    return { status: 'online', text: 'Online' };
  }
  
  // Show last active time
  if (diffMinutes < 60) {
    return { 
      status: 'away', 
      text: diffMinutes === 0 ? 'Just now' : `${diffMinutes}m ago` 
    };
  } else if (diffMinutes < 1440) { // Less than 24 hours
    const hours = Math.floor(diffMinutes / 60);
    return { 
      status: 'away', 
      text: `${hours}h ago` 
    };
  } else {
    const days = Math.floor(diffMinutes / 1440);
    return { 
      status: 'offline', 
      text: `${days}d ago` 
    };
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'away': return 'bg-yellow-500';
    case 'offline': return 'bg-gray-400';
    default: return 'bg-gray-400';
  }
};