export default function(timestamp) {
    const options = {
        day: "2-digit",
        year: "numeric",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    };

    return new Date(timestamp * 1000).toLocaleDateString("da", options);
}
