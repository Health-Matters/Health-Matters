import React, { useState } from 'react';
import { CheckCheck, Stethoscope, CalendarDays, TestTube2, UserRoundCheck, X } from 'lucide-react';

export const Notifications = () => {
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [selectedNote, setSelectedNote] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Your appointment with Dr. Silva is confirmed for 28 July at 10:30 AM', date: 'July 20, 2026 | 08:00 PM', type: 'doc', group: 'Today', unread: true, message: 'Your appointment is confirmed with Dr. Silva at the General Medical Center. Please arrive 15 minutes early with your ID.' },
    { id: 2, title: 'Reminder: You have a clinic visit scheduled tomorrow at 9:00 AM', date: 'July 20, 2026 | 05:10 PM', type: 'cal', group: 'Today', unread: true, message: 'This is a friendly reminder of your scheduled visit tomorrow.' },
    { id: 3, title: 'Your blood test results are now available', date: 'July 20, 2026 | 11:20 AM', type: 'lab', group: 'Today', unread: true, message: 'Your recent blood work results have been processed.' },
    { id: 4, title: 'Your personal details were updated successfully', date: 'July 20, 2026 | 08:16 AM', type: 'check', group: 'Today', unread: false, message: 'Your profile information has been updated.' },
    { id: 5, title: 'Your blood results are under review', date: 'July 19, 2026 | 10:15 AM', type: 'lab', group: 'Yesterday', unread: true, message: 'Dr. Silva is currently reviewing your results.' },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'doc': return <Stethoscope className="text-sky-500" size={18} />;
      case 'cal': return <CalendarDays className="text-orange-400" size={18} />;
      case 'lab': return <TestTube2 className="text-purple-500" size={18} />;
      case 'check': return <UserRoundCheck className="text-slate-500" size={18} />;
      default: return null;
    }
  };

  // Logic to decide which notifications to show
  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : n.unread === true
  );

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      
      <div className="flex-1 m-2 flex gap-4 overflow-hidden">
        
        {/* LEFT SIDE: Notification List */}
        <div className={`flex flex-col transition-all duration-300 ${selectedNote ? 'w-[40%]' : 'w-full'}`}>
          <div>
            <h1 className="text-3xl font-bold text-[#001F3F]">Notifications</h1>
          </div>

          <div className="flex justify-between items-center mb-4 px-1 border-b border-green-200 flex-shrink-0">
            <div className="flex gap-8 text-slate-500 text-sm font-bold pb-2">
              <span 
                onClick={() => setFilter('all')}
                className={`cursor-pointer transition-all ${filter === 'all' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-400'}`}
              >
                All
              </span>
              <span 
                onClick={() => setFilter('unread')}
                className={`cursor-pointer transition-all ${filter === 'unread' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-400'}`}
              >
                Unread ({notifications.filter(n => n.unread).length})
              </span>
            </div>
            <button onClick={markAllAsRead} className="text-slate-700 text-xs font-bold flex items-center gap-1">
              <CheckCheck size={16} /> Mark all as read
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {['Today', 'Yesterday'].map((group) => {
              const groupNotes = filteredNotifications.filter(n => n.group === group);
              
              // Only show the group header if there are notes in that group after filtering
              if (groupNotes.length === 0) return null;

              return (
                <div key={group} className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 ml-1">{group}</h3>
                  <div className="space-y-3">
                    {groupNotes.map((note) => (
                      <div 
                        key={note.id} 
                        onClick={() => { 
                          setSelectedNote(note); 
                          setNotifications(notifications.map(n => n.id === note.id ? {...n, unread: false} : n)); 
                        }}
                        className={`cursor-pointer rounded-2xl flex items-center justify-between p-4 shadow-sm border transition-all ${
                          selectedNote?.id === note.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-4 truncate">
                          <div className="flex-shrink-0">{getIcon(note.type)}</div>
                          <div className="truncate">
                            <p className={`text-slate-800 text-sm truncate ${note.unread ? 'font-bold' : ''}`}>{note.title}</p>
                            <p className="text-slate-400 text-[10px] mt-1 font-bold">{note.date}</p>
                          </div>
                        </div>
                        {note.unread && <div className="w-2.5 h-2.5 bg-sky-400 rounded-full flex-shrink-0 ml-4"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE: Detail View */}
        {selectedNote && (
          <div className="w-[60%] bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col h-full animate-in slide-in-from-right-4">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                {getIcon(selectedNote.type)}
                <h2 className="font-bold text-slate-800 text-lg">Message Detail</h2>
              </div>
              <button onClick={() => setSelectedNote(null)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              <p className="text-xs text-slate-400 font-bold uppercase mb-2">{selectedNote.date}</p>
              <h3 className="text-xl font-bold text-slate-900 mb-6">{selectedNote.title}</h3>
              <div className="bg-[#F8FAFC] p-6 rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
                {selectedNote.message}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};