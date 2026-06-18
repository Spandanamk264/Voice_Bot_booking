import { useState, useEffect } from 'react';
import client from '../api/client';
import Navbar from '../components/Navbar';

const TABS = [
  { key: 'appointments', label: 'Appointments', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )},
  { key: 'doctors', label: 'Doctors', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )},
  { key: 'slots', label: 'Time Slots', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
];

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'appointments') {
        const res = await client.get('/appointments');
        setAppointments(res.data || []);
      } else if (activeTab === 'doctors') {
        const res = await client.get('/admin/doctors');
        setDoctors(res.data || []);
      } else if (activeTab === 'slots') {
        const res = await client.get('/admin/slots');
        setSlots(res.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Appointments', value: appointments.length, color: 'saffron' },
    { label: 'Active Doctors', value: doctors.length, color: 'blue' },
    { label: 'Available Slots', value: slots.length, color: 'green' },
  ];

  return (
    <div className="relative min-h-screen bg-dark-900 overflow-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Background blobs */}
      <div className="absolute top-[-100px] right-[-150px] w-[400px] h-[400px] rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, rgba(255,107,43,0.6) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 70%)' }} />

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10 animate-fadeInUp">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark-50 mb-2">Clinic Dashboard</h1>
          <p className="text-dark-300 text-sm sm:text-base">Manage doctors, time slots, and appointments.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 animate-fadeInUp-delay-1">
          {statCards.map((stat) => (
            <div key={stat.label} className="glass-card p-6">
              <p className="text-dark-300 text-xs font-semibold uppercase tracking-[0.08em] mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${
                stat.color === 'saffron' ? 'text-saffron-500' : stat.color === 'blue' ? 'text-accent-blue' : 'text-green-400'
              }`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 p-1 glass-card w-fit animate-fadeInUp-delay-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-saffron-500/[0.12] text-saffron-500'
                  : 'text-dark-300 hover:text-dark-100 hover:bg-white/[0.03]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="glass-card overflow-hidden animate-fadeInUp-delay-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-dark-400 border-t-saffron-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* APPOINTMENTS TABLE */}
              {activeTab === 'appointments' && (
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-16 text-dark-300">
                            <div className="flex flex-col items-center gap-3">
                              <svg className="w-10 h-10 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                              </svg>
                              <span>No appointments yet. Use the voice assistant to book one!</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        appointments.map((apt) => (
                          <tr key={apt.id}>
                            <td className="cell-primary">{apt.patient_name}</td>
                            <td>{apt.patient_phone || '—'}</td>
                            <td>{apt.patient_email || '—'}</td>
                            <td>{apt.doctors?.name || '—'}</td>
                            <td>{apt.appointment_date}</td>
                            <td>{apt.start_time}{apt.end_time ? ` – ${apt.end_time}` : ''}</td>
                            <td>
                              <span className={apt.status === 'confirmed' ? 'badge-confirmed' : 'badge-cancelled'}>
                                {apt.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* DOCTORS TABLE */}
              {activeTab === 'doctors' && (
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Specialty</th>
                        <th>Bio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-center py-16 text-dark-300">
                            <div className="flex flex-col items-center gap-3">
                              <svg className="w-10 h-10 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                              </svg>
                              <span>No doctors registered. Add doctors via the Supabase dashboard.</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        doctors.map((doc) => (
                          <tr key={doc.id}>
                            <td className="cell-primary">{doc.name}</td>
                            <td>{doc.specialties?.name || 'General'}</td>
                            <td className="max-w-xs truncate">{doc.bio || '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SLOTS TABLE */}
              {activeTab === 'slots' && (
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Day</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-16 text-dark-300">
                            <div className="flex flex-col items-center gap-3">
                              <svg className="w-10 h-10 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>No time slots configured. Add slots via the Supabase dashboard.</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        slots.map((slot) => (
                          <tr key={slot.id}>
                            <td className="cell-primary">{slot.doctors?.name || '—'}</td>
                            <td>{DAY_NAMES[slot.day_of_week] || slot.day_of_week}</td>
                            <td>{slot.start_time}</td>
                            <td>{slot.end_time}</td>
                            <td>
                              <span className={slot.is_active ? 'badge-confirmed' : 'badge-cancelled'}>
                                {slot.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-dark-400 text-xs">
            Sarvam Health AI · Enterprise Admin Console · All rights reserved
          </p>
        </div>
      </main>
    </div>
  );
}
