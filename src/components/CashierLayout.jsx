import CashierSidebar from './cashierDashboard/CashierSidebar.jsx';

const CashierLayout = ({ children, activeSection, setActiveSection }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <CashierSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default CashierLayout;