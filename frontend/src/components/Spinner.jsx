export default function Spinner() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      padding: "2rem"
    }}>
      <div style={{
        width: "2rem",
        height: "2rem",
        border: "3px solid #e5e7eb",
        borderTop: "3px solid #6366f1",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite"
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
