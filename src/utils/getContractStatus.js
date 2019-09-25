export default function(startTime, timeLimit) {
    const currentTime = Math.round(Date.now() / 1000);
    try {
        if (startTime > currentTime) {
            return "upcoming";
        } else if (startTime < currentTime && timeLimit > currentTime) {
            return "current";
        } else {
            return "past";
        }
    } catch {
        return "error";
    }
}
