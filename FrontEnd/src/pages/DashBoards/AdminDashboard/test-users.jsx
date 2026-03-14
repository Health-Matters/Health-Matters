import { useMemo, useState } from "react";
import {
  useAssignUserManagerMutation,
  useCreateUserMutation,
  useDeactivateUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
} from "@/store/api";
import { toast } from "sonner";

/*
 Team F - Admin role console access, user listing/filtering, user creation, and user detail editing workflows (TMF-001, TMF-002, TMF-003, TMF-004) . Done by Mirco, Danuja, Isuru, Upeka, and Idusha
*/

const ROLE_OPTIONS = ["admin", "manager", "practitioner", "employee"];

const emptyCreateForm = {
  firstName: "",
  lastName: "",
  email: "",
  role: "employee",
  phone: "",
  department: "",
};

export const TestUsers = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const usersQueryParams = useMemo(
    () => ({
      ...(roleFilter !== "all" ? { role: roleFilter } : {}),
    }),
    [roleFilter]
  );

  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUsersQuery(usersQueryParams);

  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: savingEdit }] = useUpdateUserMutation();
  const [updateUserRole, { isLoading: savingRole }] = useUpdateUserRoleMutation();
  const [deactivateUser, { isLoading: deactivating }] = useDeactivateUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [assignUserManager, { isLoading: assigningManager }] = useAssignUserManagerMutation();

  const managers = useMemo(
    () => users.filter((u) => u.role === "manager" && u.isActive),
    [users]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        `${user.firstName ?? ""} ${user.lastName ?? ""} ${user.email ?? ""} ${user.department ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? Boolean(user.isActive)
          : !user.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const getName = (user) => {
    const full = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    return full || user.userName || "Unknown";
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createForm.firstName || !createForm.lastName || !createForm.email || !createForm.role) {
      toast.error("Please complete first name, last name, email, and role.");
      return;
    }

    try {
      await createUser(createForm).unwrap();
      toast.success("User account created.");
      setCreateForm(emptyCreateForm);
      setShowCreate(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message ?? "Failed to create user.");
    }
  };

  const startEditing = (user) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      role: user.role ?? "employee",
      phone: user.phone ?? "",
      department: user.department ?? "",
      managerClerkUserId: user.managerClerkUserId ?? "",
      isActive: Boolean(user.isActive),
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser?._id || !editForm) return;

    try {
      await updateUser({ userId: editingUser._id, body: editForm }).unwrap();
      toast.success("User details updated.");
      setEditingUser(null);
      setEditForm(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message ?? "Failed to update user.");
    }
  };

  const handleQuickRoleChange = async (user, nextRole) => {
    if (!user?._id || !nextRole || user.role === nextRole) {
      return;
    }

    const confirmed = window.confirm(
      `Change role for ${getName(user)} from ${user.role} to ${nextRole}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await updateUserRole({ userId: user._id, role: nextRole }).unwrap();
      toast.success(`Role changed to ${nextRole}.`);
    } catch (err) {
      toast.error(err?.data?.message ?? "Failed to update role.");
    }
  };

  const handleDeactivate = async (user) => {
    if (!window.confirm(`Deactivate ${getName(user)}? This revokes access immediately.`)) {
      return;
    }

    try {
      await deactivateUser(user._id).unwrap();
      toast.success("User deactivated.");
    } catch (err) {
      toast.error(err?.data?.message ?? "Failed to deactivate user.");
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${getName(user)}? This permanently removes the account.`)) {
      return;
    }

    try {
      await deleteUser(user._id).unwrap();
      toast.success("User deleted.");
    } catch (err) {
      toast.error(err?.data?.message ?? "Failed to delete user.");
    }
  };

  const handleAssignManager = async (userId, managerClerkUserId) => {
    if (!managerClerkUserId) return;
    try {
      await assignUserManager({ userId, managerClerkUserId }).unwrap();
      toast.success("Manager assigned.");
    } catch (err) {
      toast.error(err?.data?.message ?? "Failed to assign manager.");
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-blue-100/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Role Management Console</h1>
          <p className="mt-1 text-sm text-slate-600">Create, edit, assign roles, and control account access.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="rounded-lg border border-blue-700 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showCreate ? "Close" : "Create User"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreateUser} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
          <input
            type="text"
            value={createForm.firstName}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, firstName: e.target.value }))}
            placeholder="First name"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={createForm.lastName}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, lastName: e.target.value }))}
            placeholder="Last name"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="email"
            value={createForm.email}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Email"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={createForm.role}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, role: e.target.value }))}
            className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <input
            type="text"
            value={createForm.department}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, department: e.target.value }))}
            placeholder="Department"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={createForm.phone}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="Phone"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg border border-blue-700 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Save User"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, department"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
        >
          <option value="all">All roles</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Manager</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-6 text-slate-500">Loading users...</td></tr>
              ) : isError ? (
                <tr><td colSpan={6} className="px-4 py-6 text-red-600">{error?.data?.message ?? "Failed to load users."}</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-slate-500">No users found.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{getName(user)}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleQuickRoleChange(user, e.target.value)}
                        disabled={savingRole}
                        className="rounded-md border border-blue-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm"
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.managerClerkUserId ?? ""}
                        onChange={(e) => handleAssignManager(user._id, e.target.value)}
                        disabled={assigningManager || user.role !== "employee"}
                        className="rounded-md border border-blue-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm"
                      >
                        <option value="">Unassigned</option>
                        {managers.map((manager) => (
                          <option key={manager.clerkUserId} value={manager.clerkUserId}>
                            {getName(manager)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(user)}
                          className="rounded-md border border-blue-700 bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeactivate(user)}
                          disabled={deactivating || !user.isActive}
                          className="rounded-md border border-blue-700 bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          Deactivate
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          disabled={deleting}
                          className="rounded-md border border-red-700 bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={handleSaveEdit} className="w-full max-w-2xl space-y-4 rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Edit User</h2>
              <button type="button" onClick={() => { setEditingUser(null); setEditForm(null); }} className="text-sm text-slate-500 hover:text-slate-700">Close</button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={editForm.firstName} onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))} placeholder="First name" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input value={editForm.lastName} onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))} placeholder="Last name" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input value={editForm.email} onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <select value={editForm.role} onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))} className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm">
                {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
              <input value={editForm.department} onChange={(e) => setEditForm((prev) => ({ ...prev, department: e.target.value }))} placeholder="Department" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input value={editForm.phone} onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setEditingUser(null); setEditForm(null); }} className="rounded-md border border-blue-700 bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Cancel</button>
              <button type="submit" disabled={savingEdit} className="rounded-md border border-blue-700 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
