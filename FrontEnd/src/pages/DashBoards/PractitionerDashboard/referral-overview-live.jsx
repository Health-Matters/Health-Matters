import { useMemo, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useGetAppointmentsQuery,
  useGetReferralsQuery,
  useGetUsersQuery,
  useUpdateReferralByIdMutation,
} from '@/store/api';

const getDisplayName = (user) => {
  if (!user) {
    return 'Unknown';
  }

  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return name || user.userName || user.email || user.clerkUserId;
};

const getBadgeClass = (status) => {
  switch (status) {
    case 'confirmed':
    case 'accepted':
      return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100';
    case 'assigned':
      return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
    case 'rejected':
      return 'bg-red-100 text-red-700 hover:bg-red-100';
    default:
      return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
  }
};

export const PractitionerReferralOverview = () => {
  const { user } = useUser();
  const [search, setSearch] = useState('');
  const [actioningId, setActioningId] = useState(null);

  const {
    data: referrals = [],
    isLoading,
    isError,
    error,
  } = useGetReferralsQuery();
  const { data: appointments = [] } = useGetAppointmentsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [updateReferralById, { isLoading: isUpdating }] = useUpdateReferralByIdMutation();

  const usersByClerkId = useMemo(() => {
    const map = new Map();
    users.forEach((entry) => {
      if (entry.clerkUserId) {
        map.set(entry.clerkUserId, entry);
      }
    });
    return map;
  }, [users]);

  const appointmentsByReferralId = useMemo(() => {
    const map = new Map();
    appointments.forEach((appointment) => {
      if (appointment.referralId) {
        map.set(String(appointment.referralId), appointment);
      }
    });
    return map;
  }, [appointments]);

  const filteredReferrals = referrals.filter((referral) => {
    const appointment = appointmentsByReferralId.get(referral._id);
    const query = search.toLowerCase();
    return (
      referral._id?.toLowerCase().includes(query) ||
      referral.patientClerkUserId?.toLowerCase().includes(query) ||
      referral.serviceType?.toLowerCase().includes(query) ||
      appointment?.status?.toLowerCase().includes(query)
    );
  });

  const summary = {
    pending: appointments.filter((appointment) => appointment.status === 'pending').length,
    assignedToMe: appointments.filter(
      (appointment) => appointment.status === 'assigned' && appointment.practitionerClerkUserId === user?.id
    ).length,
    confirmedForMe: appointments.filter(
      (appointment) => appointment.status === 'confirmed' && appointment.practitionerClerkUserId === user?.id
    ).length,
  };

  const handleDecision = async (referralId, status) => {
    setActioningId(referralId);
    try {
      await updateReferralById({
        referralId,
        body: { referralStatus: status },
      }).unwrap();
    } catch (requestError) {
      console.error('Failed to update referral', requestError);
      alert(requestError?.data?.message || 'Unable to update referral.');
    } finally {
      setActioningId(null);
    }
  };

  if (isLoading) {
    return <p className="p-8 text-sm text-slate-600">Loading referrals...</p>;
  }

  if (isError) {
    return <p className="p-8 text-sm text-red-600">{error?.data?.message || error?.message || 'Unable to load referrals.'}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Referral intake</h1>
        <p className="mt-2 text-sm text-slate-600">
          All referrals are visible here. Accepting one confirms its appointment immediately, while admin assignments wait in the appointments tab until you confirm them.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Pending referrals</CardDescription>
            <CardTitle>{summary.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Assigned to you</CardDescription>
            <CardTitle>{summary.assignedToMe}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Confirmed with you</CardDescription>
            <CardTitle>{summary.confirmedForMe}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by referral, patient, service, or appointment status"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm md:w-96"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Referral queue</CardTitle>
          <CardDescription>
            You can act on referrals that are still open or already assigned to your Clerk account.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto border-t border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Referral</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Patient</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Service</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Referral status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Appointment</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Assigned by</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredReferrals.map((referral) => {
                  const appointment = appointmentsByReferralId.get(referral._id);
                  const assignedBy = usersByClerkId.get(referral.assignedbyClerkUserId);
                  const canAction =
                    referral.referralStatus === 'pending' &&
                    (!referral.practitionerClerkUserId || referral.practitionerClerkUserId === user?.id);

                  return (
                    <tr key={referral._id}>
                      <td className="px-4 py-4 text-slate-700">{referral._id}</td>
                      <td className="px-4 py-4 text-slate-700">{referral.patientClerkUserId}</td>
                      <td className="px-4 py-4 text-slate-700">{referral.serviceType || '-'}</td>
                      <td className="px-4 py-4">
                        <Badge className={getBadgeClass(referral.referralStatus)}>{referral.referralStatus}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={getBadgeClass(appointment?.status)}>{appointment?.status || 'pending'}</Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{assignedBy ? getDisplayName(assignedBy) : 'Self-claim'}</td>
                      <td className="px-4 py-4">
                        {canAction ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={isUpdating}
                              onClick={() => handleDecision(referral._id, 'accepted')}
                            >
                              {actioningId === referral._id ? 'Working...' : 'Accept'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isUpdating}
                              onClick={() => handleDecision(referral._id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">
                            {referral.practitionerClerkUserId && referral.practitionerClerkUserId !== user?.id
                              ? 'Assigned to another practitioner'
                              : 'No action required'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};