import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Target,
  Users,
  Share2,
  Plus,
  History,
  X,
  ChevronRight,
  Trash2,
  Calendar,
  MoreVertical,
  Pencil,
  UserMinus,
  Trophy,
  Wallet,
  AlertTriangle,
  Edit2
} from 'lucide-react';

import api from '../services/api';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showPayModal, setShowPayModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [sharedReportPreview, setSharedReportPreview] = useState('');

  const [showManageMenu, setShowManageMenu] = useState(null);

  const [selectedMember, setSelectedMember] = useState(null);

  const [paymentAmount, setPaymentAmount] = useState('');

  const [editingPayment, setEditingPayment] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  const [editingMember, setEditingMember] = useState(null);
  const [newMemberName, setNewMemberName] = useState('');

  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const fetchEventDetails = async () => {
    try {
      const res = await api.get(`/events/${id}`);

      setEvent(res.data);
    } catch (err) {
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const totalCollected =
    event?.members?.reduce(
      (sum, m) => sum + (Number(m.amount_paid) || 0),
      0
    ) || 0;

  const perMemberTarget =
    event?.members?.length > 0
      ? event.target_amount / event.members.length
      : 0;

  const progressPercentage =
    event?.target_amount > 0
      ? Math.min(
          (totalCollected / event.target_amount) * 100,
          100
        )
      : 0;

  const averageContribution =
    event?.members?.length > 0
      ? totalCollected / event.members.length
      : 0;

  const remainingBalance =
    event?.target_amount > 0
      ? Math.max(event.target_amount - totalCollected, 0)
      : 0;

  const topContributor =
    event?.members?.reduce((top, member) => {
      return member.amount_paid > (top?.amount_paid || 0)
        ? member
        : top;
    }, null);

  const validatePayment = (amount) => {
    if (!amount || isNaN(amount)) {
      alert('Please enter a valid numeric amount.');
      return false;
    }

    if (Number(amount) <= 0) {
      alert('Negative or zero amounts are not allowed.');
      return false;
    }

    if (
      event.type === 'fixed' &&
      selectedMember.amount_paid + Number(amount) >
        perMemberTarget
    ) {
      return window.confirm(
        `This exceeds ${selectedMember.name}'s expected share of ₱${perMemberTarget.toLocaleString()}.\n\nContinue anyway?`
      );
    }

    return true;
  };

  const handleAddContribution = async (e) => {
    e.preventDefault();

    if (!validatePayment(paymentAmount)) return;

    try {
      await api.put(
        `/events/${id}/member/${selectedMember._id}/pay`,
        {
          amount: Number(paymentAmount),
          log: `${selectedMember.name} added ₱${Number(
            paymentAmount
          ).toLocaleString()} contribution`
        }
      );

      await fetchEventDetails();

      setShowPayModal(false);

      setPaymentAmount('');

      showToast('Payment successfully recorded');
    } catch (err) {
      alert('Update failed');
    }
  };

  const deletePaymentRecord = async (mId, pId) => {
    if (!window.confirm('Delete this transaction record?'))
      return;

    try {
      await api.delete(
        `/events/${id}/member/${mId}/payment/${pId}`
      );

      await fetchEventDetails();

      showToast('Entry deleted');
    } catch (err) {
      alert('Delete failed');
    }
  };

  const updatePaymentRecord = async () => {
    if (!editAmount || isNaN(editAmount)) {
      alert('Enter valid amount.');
      return;
    }

    try {
      await api.put(
        `/events/${id}/member/${selectedMember._id}/payment/${editingPayment._id}`,
        {
          amount: Number(editAmount)
        }
      );

      await fetchEventDetails();

      setEditingPayment(null);

      setEditAmount('');

      showToast('Event details updated');
    } catch (err) {
      alert('Update failed');
    }
  };

  const updateMemberName = async () => {
    if (!newMemberName.trim()) {
      alert('Member name is required.');
      return;
    }

    try {
      await api.put(
        `/events/${id}/member/${editingMember._id}`,
        {
          name: newMemberName
        }
      );

      await fetchEventDetails();

      setEditingMember(null);

      setNewMemberName('');

      showToast('Event details updated');
    } catch (err) {
      alert('Update failed');
    }
  };

  const removeMember = async (memberId) => {
    if (
      !window.confirm(
        'Are you sure you want to remove this member?'
      )
    )
      return;

    try {
      await api.delete(
        `/events/${id}/member/${memberId}`
      );

      await fetchEventDetails();

      showToast('Member removed successfully');
    } catch (err) {
      alert('Failed to remove member');
    }
  };

 const shareTransparencyReport = async () => {
  let report = `📊 EXPENSEPAL TRANSPARENCY LOG\n\n`;

  report += `📌 ${event.title.toUpperCase()}\n`;
  report += `💰 Total Collected: ₱${totalCollected.toLocaleString()}\n`;
  report += `📈 Progress: ${progressPercentage.toFixed(0)}%\n\n`;

  event.members.forEach((m) => {
    report += `• ${m.name}: ₱${m.amount_paid.toLocaleString()}\n`;
  });

  try {
    await navigator.clipboard.writeText(report);

    setSharedReportPreview(report);

    setShowLogModal(true);

    showToast('Transparency report copied to clipboard');
  } catch (err) {
    alert('Failed to copy transparency report');
  }
};

  const getStatusBadge = (member) => {
    if (member.amount_paid <= 0) {
      return (
        <span className="px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10 text-[9px] font-black uppercase tracking-widest">
          No Payment
        </span>
      );
    }

    if (
      event.type === 'fixed' &&
      member.amount_paid >= perMemberTarget
    ) {
      return (
        <span className="px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 text-[9px] font-black uppercase tracking-widest">
          Fully Paid
        </span>
      );
    }

    return (
      <span className="px-3 py-1 rounded-full bg-orange-400/10 text-orange-300 border border-orange-400/20 text-[9px] font-black uppercase tracking-widest">
        Partial
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-20 text-center text-cyan-400 font-black animate-pulse uppercase tracking-[0.3em]">
        Syncing Transparency Logs...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#001B3D] min-h-screen text-left relative">
      {/* TOAST */}
      {toast && (
        <div className="fixed top-6 right-6 z-[300] animate-in slide-in-from-right duration-300">
          <div className="bg-cyan-400 text-[#001B3D] px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)] font-black uppercase tracking-widest text-[10px]">
            {toast.message}
          </div>
        </div>
      )}

      {/* TOP NAV */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-bold uppercase text-[10px] tracking-[0.2em]"
        >
          <ArrowLeft size={16} />
          Back to Group Events
        </button>

        <button
         onClick={shareTransparencyReport}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-lg"
        >
          <Share2 size={16} />
         Share Transparency Report
        </button>
      </div>

      {/* HERO */}
      <div className="bg-[#05192e]/60 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">
          {event.title}
        </h1>

        <p className="text-cyan-400 font-black uppercase text-xs tracking-widest mb-6">
          {event.type === 'fixed'
            ? 'Fixed Bill Splitting'
            : 'Flexible Goal Tracking'}
        </p>

        {/* PROGRESS */}
        <div className="bg-[#001B3D]/50 p-6 rounded-2xl border border-white/5">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">
            Total Collection Progress
          </p>

          <div className="flex justify-between items-end mb-2">
            <span className="text-3xl font-black text-white">
              ₱{totalCollected.toLocaleString()} / ₱
              {event.target_amount.toLocaleString()}
            </span>

            <span className="text-cyan-400 font-black italic">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>

          <div className="h-3 bg-[#02101f] rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-1000 shadow-[0_0_15px_#22d3ee]"
              style={{
                width: `${progressPercentage}%`
              }}
            />
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={16} className="text-cyan-400" />

                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                  Average Contribution
                </p>
              </div>

              <h3 className="text-xl font-black text-white">
                ₱{averageContribution.toLocaleString()}
              </h3>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle
                  size={16}
                  className="text-orange-300"
                />

                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                  Remaining Balance
                </p>
              </div>

              <h3 className="text-xl font-black text-white">
                ₱{remainingBalance.toLocaleString()}
              </h3>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={16} className="text-cyan-400" />

                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                  Top Contributor
                </p>
              </div>

              <h3 className="text-xl font-black text-white truncate">
                {topContributor?.name || 'N/A'}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* MEMBERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {event.members.map((member) => (
          <div
            key={member._id}
            className="p-6 rounded-[2.5rem] border transition-all group relative bg-[#05192e]/40 border-white/5 hover:border-cyan-400/20"
          >
            {/* MANAGE */}
            <div className="absolute top-5 right-5">
              <button
                onClick={() =>
                  setShowManageMenu(
                    showManageMenu === member._id
                      ? null
                      : member._id
                  )
                }
                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-cyan-400"
              >
                <MoreVertical size={16} />
              </button>

              {showManageMenu === member._id && (
                <div className="absolute right-0 mt-2 w-44 bg-[#001B3D] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                  <button
                    onClick={() => {
                      setEditingMember(member);
                      setNewMemberName(member.name);
                      setShowManageMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 text-white text-[10px] font-black uppercase tracking-widest"
                  >
                    <Pencil size={14} />
                    Edit Member
                  </button>

                  <button
                    onClick={() => removeMember(member._id)}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest"
                  >
                    <UserMinus size={14} />
                    Remove Member
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={
                  member.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`
                }
                className="h-14 w-14 rounded-2xl border border-white/10"
                alt=""
              />

              <div className="flex-1">
                <h3 className="font-black text-white uppercase text-lg leading-none">
                  {member.name}
                </h3>

                <p className="text-cyan-400 font-black text-[10px] uppercase mt-1">
                  Paid: ₱
                  {member.amount_paid.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mb-5">
              {getStatusBadge(member)}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedMember(member);
                  setShowPayModal(true);
                }}
                className="flex-1 py-3 bg-white/5 hover:bg-cyan-400/20 text-white font-black text-[9px] uppercase rounded-xl transition-all"
              >
                Add Pay
              </button>

              <button
                onClick={() => {
                  setSelectedMember(member);
                  setShowHistoryModal(true);
                }}
                className="flex-1 py-3 bg-white/5 hover:bg-indigo-400/20 text-white font-black text-[9px] uppercase rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <History size={12} />
                History
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-[#001B3D] border border-white/10 w-full max-w-3xl rounded-[3rem] p-10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                  {selectedMember?.name}'s Records
                </h2>

                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">
                  Full transaction history log
                </p>
              </div>

              <button
                onClick={() =>
                  setShowHistoryModal(false)
                }
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {selectedMember?.payments?.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-white/5">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-4 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                        Date
                      </th>

                      <th className="text-left p-4 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                        Amount
                      </th>

                      <th className="text-right p-4 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedMember.payments.map((p) => (
                      <tr
                        key={p._id}
                        className="border-t border-white/5"
                      >
                        <td className="p-4 text-white font-bold text-sm">
                          {new Date(
                            p.date
                          ).toLocaleString()}
                        </td>

                        <td className="p-4 text-cyan-400 font-black">
                          ₱{p.amount.toLocaleString()}
                        </td>

                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingPayment(p);
                                setEditAmount(
                                  p.amount
                                );
                              }}
                              className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-cyan-400"
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              onClick={() =>
                                deletePaymentRecord(
                                  selectedMember._id,
                                  p._id
                                )
                              }
                              className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-rose-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-[10px]">
                  No transactions recorded yet
                </p>
              </div>
            )}
          </div>
        </div>
      )}

     {/* TRANSPARENCY REPORT MODAL */}
    {showLogModal && (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
      <div className="bg-[#001B3D] border border-white/10 w-full max-w-2xl rounded-[3rem] p-10">
        <div className="flex justify-between items-center mb-8">
          <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
            Transparency Report
          </h2>

          <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mt-2">
            Copied & Ready To Share
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(false)}
        >
          <X size={24} className="text-gray-500" />
        </button>
      </div>

      {/* SUCCESS INFO */}
      <div className="bg-cyan-400/5 border border-cyan-400/10 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-cyan-400 flex items-center justify-center">
            <CheckCircle2
              size={22}
              className="text-[#001B3D]"
            />
          </div>

          <div>
            <h3 className="text-white font-black uppercase text-sm tracking-widest">
              Clipboard Sync Successful
            </h3>

            <p className="text-gray-400 text-sm mt-2 leading-relaxed">
              The transparency report has been copied
              successfully and can now be pasted into
              Messenger, Telegram, Discord, Gmail,
              SMS, or any messaging platform.
            </p>
          </div>
        </div>
      </div>

      {/* REPORT PREVIEW */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black uppercase tracking-widest text-xs">
            Report Preview
          </h3>

          <span className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">
            Ready To Send
          </span>
        </div>

        <div className="bg-[#02101f] border border-white/5 rounded-2xl p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
          <pre className="whitespace-pre-wrap text-sm text-white leading-7 font-medium font-mono">
            {sharedReportPreview}
          </pre>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => {
            navigator.clipboard.writeText(
              sharedReportPreview
            );

            showToast(
              'Transparency report copied again'
            );
          }}
          className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-[#001B3D] py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
        >
          Copy Again
        </button>

        <button
          onClick={() => setShowLogModal(false)}
          className="flex-1 bg-white/5 hover:bg-white/10 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      {/* EDIT MEMBER MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-[#001B3D] border border-white/10 w-full max-w-md rounded-[3rem] p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                Edit Member
              </h2>

              <button
                onClick={() =>
                  setEditingMember(null)
                }
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <input
                value={newMemberName}
                onChange={(e) =>
                  setNewMemberName(e.target.value)
                }
                className="w-full bg-[#05192e] border border-white/10 rounded-2xl px-6 py-5 text-white font-black outline-none focus:border-cyan-400"
              />

              <button
                onClick={updateMemberName}
                className="w-full bg-cyan-400 text-[#001B3D] py-5 rounded-2xl font-black uppercase text-xs tracking-widest"
              >
                Update Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PAYMENT MODAL */}
      {editingPayment && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-[#001B3D] border border-white/10 w-full max-w-md rounded-[3rem] p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                Edit Payment
              </h2>

              <button
                onClick={() =>
                  setEditingPayment(null)
                }
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <input
                type="number"
                min="1"
                value={editAmount}
                onChange={(e) =>
                  setEditAmount(e.target.value)
                }
                className="w-full bg-[#05192e] border border-white/10 rounded-2xl px-6 py-5 text-white text-3xl font-black outline-none focus:border-cyan-400"
              />

              <button
                onClick={updatePaymentRecord}
                className="w-full bg-cyan-400 text-[#001B3D] py-5 rounded-2xl font-black uppercase text-xs tracking-widest"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-[#001B3D] border border-white/10 w-full max-w-md rounded-[3rem] p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                Add Contribution
              </h2>

              <button
                onClick={() =>
                  setShowPayModal(false)
                }
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <form
              onSubmit={handleAddContribution}
              className="space-y-6"
            >
              <div className="bg-[#02101f] p-6 rounded-2xl border border-white/5 text-center">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                  Amount to Log (₱)
                </label>

                <input
                  autoFocus
                  type="number"
                  min="1"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) =>
                    setPaymentAmount(
                      e.target.value.replace(
                        /[^0-9.]/g,
                        ''
                      )
                    )
                  }
                  className="w-full bg-transparent text-white text-5xl font-black text-center outline-none placeholder:text-white/5"
                  placeholder="0.00"
                />
              </div>

              {event.type === 'fixed' && (
                <div className="bg-cyan-400/5 border border-cyan-400/10 rounded-2xl p-4">
                  <p className="text-cyan-400 font-black uppercase tracking-widest text-[10px]">
                    Expected Share
                  </p>

                  <h3 className="text-2xl text-white font-black mt-1">
                    ₱{perMemberTarget.toLocaleString()}
                  </h3>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-cyan-400 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-cyan-400/20 text-[#001B3D]"
              >
                Confirm Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;