export const styles = {
    app: { fontFamily: 'sans-serif', color: '#333' },
    navbar: { display: 'flex', justifyContent: 'space-between', padding: '15px 30px', background: '#fff', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 100 },
    navTools: { display: 'flex', alignItems: 'center', gap: '20px' },
    search: { padding: '8px 15px', borderRadius: '20px', border: '1px solid #ddd', width: '250px' },
    sidebar: { position: 'fixed', top: 0, bottom: 0, width: '280px', background: '#fff', boxShadow: '2px 0 10px rgba(0,0,0,0.1)', zIndex: 200, transition: '0.3s ease', padding: '20px' },
    menuItem: { padding: '15px', cursor: 'pointer', borderBottom: '1px solid #f9f9f9', fontSize: '16px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px', padding: '30px' },
    card: { background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' },
    primaryBtn: { background: '#007AFF', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: 'bold' },
    addBtn: { width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: '#007AFF', color: '#fff', cursor: 'pointer' },
    panel: { padding: '30px', maxWidth: '1000px', margin: '0 auto' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    authCard: { maxWidth: '400px', margin: '100px auto', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd' }
};