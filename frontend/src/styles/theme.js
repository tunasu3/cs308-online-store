export const styles = {
  app: {
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#f5f5f7",
    minHeight: "100vh",
    color: "#1d1d1f"
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 5%",
    height: "70px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid #d2d2d7",
    position: "sticky",
    top: 0,
    zIndex: 1000
  },
  sidebar: {
    position: "fixed",
    top: 0,
    height: "100vh",
    width: "280px",
    backgroundColor: "#ffffff",
    boxShadow: "10px 0 30px rgba(0,0,0,0.1)",
    zIndex: 2000,
    transition: "left 0.3s ease",
    padding: "30px 20px",
    display: "flex",
    flexDirection: "column"
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 1500,
    backdropFilter: "blur(4px)"
  },
  menuItem: {
    padding: "15px",
    fontSize: "17px",
    fontWeight: "500",
    cursor: "pointer",
    borderRadius: "12px",
    transition: "all 0.2s",
    marginBottom: "8px",
    color: "#1d1d1f",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  navTools: {
    display: "flex",
    alignItems: "center",
    gap: "20px"
  },
  search: {
    padding: "10px 15px",
    borderRadius: "10px",
    border: "1px solid #d2d2d7",
    backgroundColor: "#f5f5f7",
    width: "200px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "25px",
    padding: "30px 5%"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    transition: "transform 0.2s"
  },
  primaryBtn: {
    backgroundColor: "#0071e3",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%"
  }
};