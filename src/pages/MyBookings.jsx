import { useState, useEffect } from 'react';
import client from '../api/client';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, User } from 'lucide-react';

export default function MyBookings() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const res = await client.get(`/appointments/user/${user.id}`);
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-dark-900 overflow-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Background blobs */}
      <div className="absolute top-[-100px] right-[-150px] w-[400px] h-[400px] rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, rgba(255,107,43,0.6) 0%, transparent 70%)' }} />
      
      <Navbar />

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-12">
        <div className="mb-8 sm:mb-10 animate-fadeInUp">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark-50 mb-2">My Appointments</h1>
          <p className="text-dark-300 text-sm sm:text-base">View and manage your medical appointment history.</p>
        </div>

        <div className="glass-card overflow-hidden animate-fadeInUp-delay-1 p-2 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-dark-400 border-t-saffron-500 rounded-full animate-spin" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16 text-dark-300">
              <div className="flex flex-col items-center gap-3">
                <Calendar className="w-12 h-12 text-dark-400" />
                <span className="text-lg">No appointments found.</span>
                <p className="text-sm text-dark-400 max-w-sm">Use the Voice Assistant to easily book your first medical appointment!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-saffron-500/10 border border-saffron-500/20 flex items-center justify-center flex-shrink-0 text-saffron-500">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{apt.doctors?.name || 'Unknown Doctor'}</h3>
                      <p className="text-sm text-dark-300">Patient: {apt.patient_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-2 text-sm text-dark-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-saffron-500" />
                      <span>{new Date(apt.appointment_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-saffron-500" />
                      <span>{apt.start_time.substring(0, 5)} {apt.end_time ? `- ${apt.end_time.substring(0, 5)}` : ''}</span>
                    </div>
                  </div>

                  <div className="mt-2 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      apt.status === 'confirmed' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                      apt.status === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      'bg-dark-500/10 border-dark-500/20 text-dark-300'
                    }`}>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
