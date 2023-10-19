const Sidebar = () => {
  return (
    <div className="h-screen bg-prussianBlue text-white px-4 py-10">
      <svg viewBox="0 0 200 260" speed={0} width={200} height={260} className="fill-ebb text-white">
        <rect x="48" y="8" rx="3" ry="3" width="88" height="6" />
        <rect x="48" y="26" rx="3" ry="3" width="52" height="6" />
        <rect x="0" y="56" rx="3" ry="3" width="410" height="6" />
        <rect x="0" y="72" rx="3" ry="3" width="380" height="6" />
        <rect x="0" y="88" rx="3" ry="3" width="380" height="6" />
        <rect x="0" y="104" rx="3" ry="3" width="178" height="6" />
        <circle cx="20" cy="20" r="20" />
      </svg>
    </div>
  );
};

export { Sidebar };
