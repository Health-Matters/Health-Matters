export const ManagerTestProfile = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manager Profile</h1>
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <p>
          <strong>Name:</strong> Jane Doe
        </p>
        <p>
          <strong>Email:</strong> jane.doe@healthmatters.com
        </p>
        <p>
          <strong>Role:</strong> Manager
        </p>
        {/* TODO: Replace static values above with real data from store/API */}
      </div>
    </div>
  );
};