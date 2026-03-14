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
  if (!user) return 'Unknown';

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

  const [updateReferralById, { isLoading: isUpdating }] =
    useUpdateReferralByIdMutation();

  /*
  ----------------------------------
  Users Map
  ----------------------------------
  */
  const usersByClerkId = useMemo(() => {
    const map = new Map();

    users.forEach((entry) => {
      if (entry.clerkUserId) {
        map.set(entry.clerkUserId, entry);
      }
    });

    return map;
  }, [users]);

  /*
  ----------------------------------
  Appointment Map
  ----------------------------------
  */
  const appointmentsByReferralId = useMemo(() => {
    const map = new Map();

    appointments.forEach((appointment) => {
      if (appointment.referralId) {
        map.set(String(appointment.referralId), appointment);
      }
    });

    return map;
  }, [appointments]);

  /*
  ----------------------------------
  Dashboard Summary
  ----------------------------------
  */
  const summary = useMemo(() => {
    let pending = 0;
    let assignedToMe = 0;
    let confirmedForMe = 0;

    referrals.forEach((referral) => {
      const canAction =
        referral.referralStatus === 'pending' &&
        (!referral.practitionerClerkUserId ||
          referral.practitionerClerkUserId === user?.id);

      // Pending referrals
      if (referral.referralStatus === 'pending') {
        pending++;
      }

      // Assigned to you (same logic as table action column)
      if (canAction) {
        assignedToMe++;
      }

      // Confirmed referrals (ALL accepted ones)
      if (referral.referralStatus === 'accepted') {
        confirmedForMe++;
      }
    });

    return { pending, assignedToMe, confirmedForMe };
  }, [referrals, user?.id]);

  /*
  ----------------------------------
  Search Filter
  ----------------------------------
  */
  const filteredReferrals = useMemo(() => {
    const query = search.toLowerCase();

    return referrals.filter((referral) => {
      const appointment = appointmentsByReferralId.get(String(referral._id));

      return (
        referral._id?.toLowerCase().includes(query) ||
        referral.patientClerkUserId?.toLowerCase().includes(query) ||
        referral.serviceType?.toLowerCase().includes(query) ||
        referral.referralStatus?.toLowerCase().includes(query) ||
        appointment?.status?.toLowerCase().includes(query)
      );
    });
  }, [referrals, appointmentsByReferralId, search]);

  /*
  ----------------------------------
  Accept / Reject Handler
  ----------------------------------
  */
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

  /*
  ----------------------------------
  Loading / Error
  ----------------------------------
  */
  if (isLoading) {
    return <p className="p-8 text-sm text-slate-600">Loading referrals...</p>;
  }

  if (isError) {
    return (
      <p className="p-8 text-sm text-red-600">
        {error?.data?.message || error?.message || 'Unable to load referrals.'}
      </p>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Referral intake
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Accepting a referral confirms its appointment.
        </p>
      </div>

      {/* Dashboard Cards */}

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

      {/* Search */}

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by referral, patient, service"
        className="w-full md:w-96 rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />

      {/* Table */}

      <Card>

        <CardHeader>
          <CardTitle>Referral queue</CardTitle>
          <CardDescription>
            You can act on referrals assigned to you.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">

          <div className="overflow-x-auto border-t border-slate-200">

            <table className="min-w-full divide-y divide-slate-200 text-sm">

              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">Referral</th>
                  <th className="px-4 py-3 text-left">Patient</th>
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-left">Referral status</th>
                  <th className="px-4 py-3 text-left">Appointment</th>
                  <th className="px-4 py-3 text-left">Assigned by</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">

                {filteredReferrals.map((referral) => {

                  const appointment =
                    appointmentsByReferralId.get(String(referral._id));

                  const assignedBy =
                    usersByClerkId.get(referral.assignedbyClerkUserId);

                  const canAction =
                    referral.referralStatus === 'pending' &&
                    (!referral.practitionerClerkUserId ||
                      referral.practitionerClerkUserId === user?.id);

                  return (
                    <tr key={referral._id}>

                      <td className="px-4 py-4">{referral._id}</td>

                      <td className="px-4 py-4">
                        {referral.patientClerkUserId}
                      </td>

                      <td className="px-4 py-4">
                        {referral.serviceType || '-'}
                      </td>

                      <td className="px-4 py-4">
                        <Badge className={getBadgeClass(referral.referralStatus)}>
                          {referral.referralStatus}
                        </Badge>
                      </td>

                      <td className="px-4 py-4">
                        <Badge className={getBadgeClass(appointment?.status)}>
                          {appointment?.status || 'pending'}
                        </Badge>
                      </td>

                      <td className="px-4 py-4">
                        {assignedBy
                          ? getDisplayName(assignedBy)
                          : 'Self-claim'}
                      </td>

                      <td className="px-4 py-4">

                        {canAction ? (

                          <div className="flex gap-2">

                            <Button
                              size="sm"
                              disabled={isUpdating}
                              onClick={() =>
                                handleDecision(referral._id, 'accepted')
                              }
                            >
                              {actioningId === referral._id
                                ? 'Working...'
                                : 'Accept'}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isUpdating}
                              onClick={() =>
                                handleDecision(referral._id, 'rejected')
                              }
                            >
                              Reject
                            </Button>

                          </div>

                        ) : (

                          <span className="text-xs text-slate-500">
                            {referral.practitionerClerkUserId &&
                            referral.practitionerClerkUserId !== user?.id
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